/**
 * Booking Widget for tomandrieu.com
 * Allows visitors to book time slots with calendar integration
 */

const BookingWidget = {
  apiUrl: '/api', // Will be proxied in dev, direct in prod
  container: null,
  state: {
    step: 'duration', // duration | date | time | form | confirmation
    duration: null,
    selectedDate: null,
    selectedSlot: null,
    availableDates: [],
    slots: [],
    settings: null,
    visitorTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },

  async init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Booking widget container #${containerId} not found`);
      return;
    }

    // Detect API URL based on environment
    if (window.location.hostname === 'localhost') {
      this.apiUrl = 'http://localhost:3000/api';
    }

    try {
      // Load settings from API
      this.state.settings = await this.fetchSettings();
      this.render();
    } catch (error) {
      console.error('Failed to initialize booking widget:', error);
      this.renderError('Unable to load booking system. Please try again later.');
    }
  },

  async fetchSettings() {
    const response = await fetch(`${this.apiUrl}/slots/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  async fetchAvailableDates(duration) {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (this.state.settings?.maxAdvanceDays || 60));

    const params = new URLSearchParams({
      start: today.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      duration: duration.toString(),
    });

    const response = await fetch(`${this.apiUrl}/slots/dates?${params}`);
    if (!response.ok) throw new Error('Failed to fetch available dates');
    return response.json();
  },

  async fetchSlots(date, duration) {
    const params = new URLSearchParams({
      date,
      duration: duration.toString(),
      timezone: this.state.visitorTimezone,
    });

    const response = await fetch(`${this.apiUrl}/slots?${params}`);
    if (!response.ok) throw new Error('Failed to fetch slots');
    return response.json();
  },

  async createBooking(bookingData) {
    const response = await fetch(`${this.apiUrl}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create booking');
    }

    return response.json();
  },

  render() {
    switch (this.state.step) {
      case 'duration':
        this.renderDurationStep();
        break;
      case 'date':
        this.renderDateStep();
        break;
      case 'time':
        this.renderTimeStep();
        break;
      case 'form':
        this.renderFormStep();
        break;
      case 'confirmation':
        this.renderConfirmationStep();
        break;
    }
  },

  renderDurationStep() {
    const durations = this.state.settings?.allowedDurations || [15, 30, 60];

    this.container.innerHTML = `
      <div class="booking-widget">
        <div class="booking-header">
          <h3>Book a Meeting</h3>
          <p>Select meeting duration</p>
        </div>
        <div class="booking-durations">
          ${durations.map(d => `
            <button class="duration-btn" data-duration="${d}">
              <span class="duration-time">${d}</span>
              <span class="duration-label">minutes</span>
            </button>
          `).join('')}
        </div>
        <div class="booking-timezone">
          <span>Your timezone: ${this.state.visitorTimezone}</span>
        </div>
      </div>
    `;

    this.container.querySelectorAll('.duration-btn').forEach(btn => {
      btn.addEventListener('click', () => this.selectDuration(parseInt(btn.dataset.duration)));
    });
  },

  async selectDuration(duration) {
    this.state.duration = duration;
    this.state.step = 'date';

    this.container.innerHTML = '<div class="booking-loading">Loading available dates...</div>';

    try {
      this.state.availableDates = await this.fetchAvailableDates(duration);
      this.render();
    } catch (error) {
      console.error('Error fetching dates:', error);
      this.renderError('Failed to load available dates. Please try again.');
    }
  },

  renderDateStep() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    this.container.innerHTML = `
      <div class="booking-widget">
        <div class="booking-header">
          <button class="back-btn" data-step="duration">&larr; Back</button>
          <h3>Select a Date</h3>
          <p>${this.state.duration} minute meeting</p>
        </div>
        <div class="booking-calendar" id="booking-calendar"></div>
      </div>
    `;

    this.renderCalendar(currentYear, currentMonth);

    this.container.querySelector('.back-btn').addEventListener('click', () => {
      this.state.step = 'duration';
      this.render();
    });
  },

  renderCalendar(year, month) {
    const calendarEl = document.getElementById('booking-calendar');
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const monthLength = lastDay.getDate();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const availableSet = new Set(this.state.availableDates);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = `
      <div class="calendar-nav">
        <button class="cal-nav-btn" id="prev-month">&lt;</button>
        <span class="cal-month-year">${monthNames[month]} ${year}</span>
        <button class="cal-nav-btn" id="next-month">&gt;</button>
      </div>
      <div class="calendar-grid">
        <div class="cal-header">Sun</div>
        <div class="cal-header">Mon</div>
        <div class="cal-header">Tue</div>
        <div class="cal-header">Wed</div>
        <div class="cal-header">Thu</div>
        <div class="cal-header">Fri</div>
        <div class="cal-header">Sat</div>
    `;

    // Empty cells before first day
    for (let i = 0; i < startingDay; i++) {
      html += '<div class="cal-day empty"></div>';
    }

    // Days of the month
    for (let day = 1; day <= monthLength; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isPast = date < today;
      const isAvailable = availableSet.has(dateStr);

      let classes = 'cal-day';
      if (isPast) classes += ' past';
      else if (isAvailable) classes += ' available';
      else classes += ' unavailable';

      html += `<div class="${classes}" data-date="${dateStr}">${day}</div>`;
    }

    html += '</div>';
    calendarEl.innerHTML = html;

    // Event listeners
    calendarEl.querySelectorAll('.cal-day.available').forEach(dayEl => {
      dayEl.addEventListener('click', () => this.selectDate(dayEl.dataset.date));
    });

    calendarEl.querySelector('#prev-month').addEventListener('click', () => {
      const newMonth = month === 0 ? 11 : month - 1;
      const newYear = month === 0 ? year - 1 : year;
      this.renderCalendar(newYear, newMonth);
    });

    calendarEl.querySelector('#next-month').addEventListener('click', () => {
      const newMonth = month === 11 ? 0 : month + 1;
      const newYear = month === 11 ? year + 1 : year;
      this.renderCalendar(newYear, newMonth);
    });
  },

  async selectDate(dateStr) {
    this.state.selectedDate = dateStr;
    this.state.step = 'time';

    this.container.innerHTML = '<div class="booking-loading">Loading available times...</div>';

    try {
      this.state.slots = await this.fetchSlots(dateStr, this.state.duration);
      this.render();
    } catch (error) {
      console.error('Error fetching slots:', error);
      this.renderError('Failed to load available times. Please try again.');
    }
  },

  renderTimeStep() {
    const dateObj = new Date(this.state.selectedDate + 'T12:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    this.container.innerHTML = `
      <div class="booking-widget">
        <div class="booking-header">
          <button class="back-btn" data-step="date">&larr; Back</button>
          <h3>Select a Time</h3>
          <p>${formattedDate}</p>
        </div>
        <div class="booking-slots">
          ${this.state.slots.length === 0
            ? '<p class="no-slots">No available times for this date</p>'
            : this.state.slots.map(slot => {
                const time = new Date(slot.start).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                });
                return `<button class="slot-btn" data-slot='${JSON.stringify(slot)}'>${time}</button>`;
              }).join('')
          }
        </div>
      </div>
    `;

    this.container.querySelector('.back-btn').addEventListener('click', () => {
      this.state.step = 'date';
      this.render();
    });

    this.container.querySelectorAll('.slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.selectedSlot = JSON.parse(btn.dataset.slot);
        this.state.step = 'form';
        this.render();
      });
    });
  },

  renderFormStep() {
    const dateObj = new Date(this.state.selectedDate + 'T12:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    const time = new Date(this.state.selectedSlot.start).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    this.container.innerHTML = `
      <div class="booking-widget">
        <div class="booking-header">
          <button class="back-btn" data-step="time">&larr; Back</button>
          <h3>Your Details</h3>
          <p>${formattedDate} at ${time}</p>
        </div>
        <form class="booking-form" id="booking-form">
          <div class="form-group">
            <label for="visitor-name">Your Name</label>
            <input type="text" id="visitor-name" name="visitorName" required placeholder="John Doe">
          </div>
          <div class="form-group">
            <label for="visitor-email">Email Address</label>
            <input type="email" id="visitor-email" name="visitorEmail" required placeholder="john@example.com">
          </div>
          <div class="form-group">
            <label for="notes">What would you like to discuss? (optional)</label>
            <textarea id="notes" name="notes" rows="3" placeholder="Brief description of the meeting topic..."></textarea>
          </div>
          <button type="submit" class="submit-btn">Confirm Booking</button>
        </form>
      </div>
    `;

    this.container.querySelector('.back-btn').addEventListener('click', () => {
      this.state.step = 'time';
      this.render();
    });

    this.container.querySelector('#booking-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.submitBooking(e.target);
    });
  },

  async submitBooking(form) {
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Booking...';

    const formData = new FormData(form);

    try {
      const booking = await this.createBooking({
        visitorName: formData.get('visitorName'),
        visitorEmail: formData.get('visitorEmail'),
        startTime: this.state.selectedSlot.start,
        duration: this.state.duration,
        timezone: this.state.visitorTimezone,
        notes: formData.get('notes') || undefined,
      });

      this.state.booking = booking;
      this.state.step = 'confirmation';
      this.render();
    } catch (error) {
      console.error('Booking error:', error);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Booking';
      alert(error.message || 'Failed to create booking. Please try again.');
    }
  },

  renderConfirmationStep() {
    const dateObj = new Date(this.state.booking.startTime);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    this.container.innerHTML = `
      <div class="booking-widget booking-confirmation">
        <div class="confirmation-icon">&#10003;</div>
        <h3>Booking Confirmed!</h3>
        <p>Your meeting has been scheduled.</p>
        <div class="confirmation-details">
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Duration:</strong> ${this.state.duration} minutes</p>
        </div>
        <p class="confirmation-note">
          A confirmation email has been sent to <strong>${this.state.booking.visitorEmail}</strong>
        </p>
        <button class="new-booking-btn">Book Another Meeting</button>
      </div>
    `;

    this.container.querySelector('.new-booking-btn').addEventListener('click', () => {
      this.state = {
        ...this.state,
        step: 'duration',
        duration: null,
        selectedDate: null,
        selectedSlot: null,
        slots: [],
        booking: null,
      };
      this.render();
    });
  },

  renderError(message) {
    this.container.innerHTML = `
      <div class="booking-widget booking-error">
        <div class="error-icon">!</div>
        <p>${message}</p>
        <button class="retry-btn">Try Again</button>
      </div>
    `;

    this.container.querySelector('.retry-btn').addEventListener('click', () => {
      this.state.step = 'duration';
      this.render();
    });
  },
};

// Export for use in theme files
window.BookingWidget = BookingWidget;
