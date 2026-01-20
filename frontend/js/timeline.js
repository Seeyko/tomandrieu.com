/**
 * Timeline - Horizontal timeline with scroll-jacking
 * Displays career history as period bars positioned by year
 */

const Timeline = (() => {
    let timelineData = null;
    let scrollContainer = null;
    let isScrollLocked = false;
    let section = null;

    // Configuration
    const CONFIG = {
        startYear: 2017,
        endYear: new Date().getFullYear() + 1,
        yearWidth: 150, // pixels per year
        rowHeight: 52, // pixels per row (item height + gap)
        padding: 60, // left/right padding
        laneGap: 8 // gap between items in same lane
    };

    /**
     * Load timeline data based on current language
     */
    async function loadData() {
        const lang = window.LanguageManager?.currentLang || 'en';
        try {
            const response = await fetch(`/data/${lang}/timeline.json`);
            if (!response.ok) throw new Error('Failed to load timeline data');
            timelineData = await response.json();
            return timelineData;
        } catch (err) {
            console.error('[Timeline] Failed to load data:', err);
            return null;
        }
    }

    /**
     * Parse year string to number
     */
    function parseYear(yearStr) {
        if (!yearStr) return CONFIG.endYear;
        const year = parseInt(yearStr);
        if (isNaN(year)) return CONFIG.endYear; // "Present", "Aujourd'hui", etc.
        return year;
    }

    /**
     * Check if item is ongoing
     */
    function isOngoing(item) {
        const endYear = item.endYear?.toLowerCase();
        return !endYear || endYear === 'present' || endYear === "aujourd'hui" || endYear === 'ongoing';
    }

    /**
     * Calculate X position for a year
     */
    function yearToX(year) {
        return CONFIG.padding + (year - CONFIG.startYear) * CONFIG.yearWidth;
    }

    /**
     * Calculate width for a period
     */
    function periodToWidth(startYear, endYear) {
        const start = parseYear(startYear);
        const end = parseYear(endYear);
        return Math.max((end - start) * CONFIG.yearWidth, CONFIG.yearWidth * 0.5);
    }

    /**
     * Assign lanes to items to avoid overlap
     * Items are sorted by start year, then assigned to first available lane
     */
    function assignLanes(items) {
        // Sort by start year
        const sorted = [...items].sort((a, b) => parseYear(a.year) - parseYear(b.year));

        // Track end positions for each lane
        const lanes = [];

        sorted.forEach(item => {
            const startX = yearToX(parseYear(item.year));
            const endX = startX + periodToWidth(item.year, item.endYear);

            // Find first lane where item fits
            let assignedLane = -1;
            for (let i = 0; i < lanes.length; i++) {
                if (lanes[i] <= startX - CONFIG.laneGap) {
                    assignedLane = i;
                    lanes[i] = endX;
                    break;
                }
            }

            // Create new lane if needed
            if (assignedLane === -1) {
                assignedLane = lanes.length;
                lanes.push(endX);
            }

            item._lane = assignedLane;
            item._startX = startX;
            item._width = endX - startX;
        });

        return { items: sorted, laneCount: lanes.length };
    }

    /**
     * Render year axis
     */
    function renderAxis() {
        const axis = document.getElementById('timeline-axis');
        if (!axis) return;

        const totalWidth = (CONFIG.endYear - CONFIG.startYear + 1) * CONFIG.yearWidth + CONFIG.padding * 2;
        axis.style.width = `${totalWidth}px`;

        let html = '';
        for (let year = CONFIG.startYear; year <= CONFIG.endYear; year++) {
            const x = yearToX(year);
            html += `
                <div class="timeline-year" style="left: ${x}px;">
                    <div class="timeline-year-tick"></div>
                    <span class="timeline-year-label">${year}</span>
                </div>
            `;
        }

        axis.innerHTML = html;
    }

    /**
     * Render a single timeline item
     */
    function renderItem(item) {
        const ongoing = isOngoing(item);
        const startYear = parseYear(item.year);
        const endYear = parseYear(item.endYear);
        const dateRange = ongoing ? `${item.year} - Present` : `${item.year} - ${item.endYear}`;

        const highlightClass = item.highlight ? 'highlight' : '';
        const ongoingClass = ongoing ? 'ongoing' : '';

        const tags = item.tags?.length
            ? item.tags.map(t => `<span class="timeline-detail-tag">${t}</span>`).join('')
            : '';

        return `
            <div class="timeline-item ${highlightClass} ${ongoingClass}"
                 data-id="${item.id}"
                 data-category="${item.category}"
                 style="left: ${item._startX}px; width: ${item._width}px; top: ${item._lane * CONFIG.rowHeight}px;">
                <div class="timeline-bar">
                    <div class="timeline-bar-content">
                        <span class="timeline-bar-title">${item.title}</span>
                        <span class="timeline-bar-company">${item.company}</span>
                    </div>
                </div>
                <div class="timeline-detail">
                    <div class="timeline-detail-header">
                        <span class="timeline-detail-title">${item.title}</span>
                        <span class="timeline-detail-date">${dateRange}</span>
                    </div>
                    <div class="timeline-detail-company">${item.company}</div>
                    <div class="timeline-detail-location">${item.location}</div>
                    <p class="timeline-detail-description">${item.description}</p>
                    <div class="timeline-detail-tags">${tags}</div>
                </div>
            </div>
        `;
    }

    /**
     * Render the complete timeline
     */
    function render() {
        const lanes = document.getElementById('timeline-lanes');
        const axis = document.getElementById('timeline-axis');

        if (!lanes || !axis || !timelineData) return;

        // Assign lanes to items
        const { items, laneCount } = assignLanes(timelineData.items);

        // Calculate total dimensions
        const totalWidth = (CONFIG.endYear - CONFIG.startYear + 1) * CONFIG.yearWidth + CONFIG.padding * 2;
        const totalHeight = laneCount * CONFIG.rowHeight;

        // Set container dimensions
        lanes.style.width = `${totalWidth}px`;
        lanes.style.height = `${totalHeight}px`;

        // Render axis
        renderAxis();

        // Render items
        lanes.innerHTML = items.map(item => renderItem(item)).join('');

        // Update section subtitle
        const subtitleEl = document.querySelector('.timeline-subtitle');
        if (subtitleEl && timelineData.sectionSubtitle) {
            subtitleEl.textContent = timelineData.sectionSubtitle;
        }

        // Initialize scroll behavior
        initScrollBehavior();
    }

    /**
     * Initialize scroll-jacking behavior
     * Converts vertical scroll to horizontal scroll when timeline is in view
     */
    function initScrollBehavior() {
        section = document.getElementById('timeline');
        scrollContainer = document.querySelector('.timeline-scroll-container');
        const scrollHint = document.querySelector('.timeline-scroll-hint');

        if (!section || !scrollContainer) return;

        // Handle wheel events
        const handleWheel = (e) => {
            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Check if section is in viewport center area
            const sectionTop = rect.top;
            const sectionBottom = rect.bottom;
            const inView = sectionTop < viewportHeight * 0.6 && sectionBottom > viewportHeight * 0.4;

            if (!inView) {
                isScrollLocked = false;
                section.classList.remove('scroll-locked');
                return;
            }

            // Calculate scroll boundaries
            const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            const currentScroll = scrollContainer.scrollLeft;

            // Determine if we should capture the scroll
            const scrollingRight = e.deltaY > 0;
            const scrollingLeft = e.deltaY < 0;
            const atStart = currentScroll <= 0;
            const atEnd = currentScroll >= maxScroll - 1;

            // Don't capture if at boundaries and scrolling in that direction
            if ((atStart && scrollingLeft) || (atEnd && scrollingRight)) {
                isScrollLocked = false;
                section.classList.remove('scroll-locked');
                return;
            }

            // Capture scroll and convert to horizontal
            e.preventDefault();
            isScrollLocked = true;
            section.classList.add('scroll-locked');

            // Apply horizontal scroll with multiplier for smoother feel
            const scrollAmount = e.deltaY * 1.5;
            scrollContainer.scrollLeft += scrollAmount;

            // Hide scroll hint after first scroll
            if (scrollHint && !scrollHint.classList.contains('hidden')) {
                scrollHint.classList.add('hidden');
            }
        };

        // Add wheel listener with passive: false to allow preventDefault
        window.addEventListener('wheel', handleWheel, { passive: false });

        // Touch handling for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        let isTouchScrolling = false;

        scrollContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isTouchScrolling = false;
        }, { passive: true });

        scrollContainer.addEventListener('touchmove', (e) => {
            if (!isTouchScrolling) {
                const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
                const deltaY = Math.abs(e.touches[0].clientY - touchStartY);

                // If horizontal movement is greater, it's a horizontal scroll
                if (deltaX > deltaY && deltaX > 10) {
                    isTouchScrolling = true;
                }
            }
        }, { passive: true });

        // Click to pin item
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const wasActive = item.classList.contains('active');

                // Remove active from all
                document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('active'));

                // Toggle clicked item
                if (!wasActive) {
                    item.classList.add('active');
                }
            });
        });

        // Click outside to deselect
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.timeline-item')) {
                document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('active'));
            }
        });
    }

    /**
     * Main initialization
     */
    async function init() {
        console.log('%c[Timeline] Initializing...', 'color: #ffb000;');

        const data = await loadData();
        if (!data) {
            console.error('[Timeline] No data loaded');
            return;
        }

        render();

        console.log('%c[Timeline] Ready', 'color: #33ff00;');
    }

    /**
     * Refresh timeline (e.g., after language change)
     */
    async function refresh() {
        await loadData();
        render();
    }

    // Public API
    return {
        init,
        refresh,
        loadData,
        render
    };
})();

// Export for global access
window.Timeline = Timeline;
