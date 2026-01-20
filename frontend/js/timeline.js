/**
 * Timeline - Interactive chronological timeline with scroll animations
 * Renders career history with dual-track layout and expandable details
 */

const Timeline = (() => {
    let timelineData = null;
    let activeItem = null;
    let currentFilter = 'all';

    const hasGSAP = () => typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

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
     * Determine item side based on category
     * Work items go left, projects/education go right
     */
    function getItemSide(item) {
        return item.category === 'work' ? 'left' : 'right';
    }

    /**
     * Group items by year for year markers
     */
    function groupByYear(items) {
        const years = {};
        items.forEach(item => {
            const year = item.year;
            if (!years[year]) {
                years[year] = [];
            }
            years[year].push(item);
        });
        return years;
    }

    /**
     * Sort items chronologically (newest first)
     */
    function sortItems(items) {
        return [...items].sort((a, b) => {
            const yearA = parseInt(a.year);
            const yearB = parseInt(b.year);
            if (yearB !== yearA) return yearB - yearA;
            // Secondary sort: highlight items first
            if (a.highlight && !b.highlight) return -1;
            if (!a.highlight && b.highlight) return 1;
            return 0;
        });
    }

    /**
     * Render a single timeline item
     */
    function renderItem(item, index) {
        const side = getItemSide(item);
        const dateRange = item.endYear ? `${item.year} - ${item.endYear}` : item.year;
        const highlightClass = item.highlight ? 'highlight' : '';
        const categoryLabel = timelineData.categories[item.category] || item.category;

        const detailsList = item.details?.length
            ? `<ul class="timeline-details-list">
                ${item.details.map(d => `<li>${d}</li>`).join('')}
               </ul>`
            : '';

        const tags = item.tags?.length
            ? `<div class="timeline-tags">
                ${item.tags.map(t => `<span class="timeline-tag">${t}</span>`).join('')}
               </div>`
            : '';

        return `
            <div class="timeline-item ${side} ${highlightClass}"
                 data-id="${item.id}"
                 data-category="${item.category}"
                 data-year="${item.year}"
                 style="--delay: ${index * 0.1}s">
                <div class="timeline-node"></div>
                <div class="timeline-connector"></div>
                <div class="timeline-card">
                    <div class="timeline-card-header">
                        <span class="timeline-date">${dateRange}</span>
                        <span class="timeline-category">${categoryLabel}</span>
                    </div>
                    <h3 class="timeline-title">${item.title}</h3>
                    <div class="timeline-company">${item.company}</div>
                    <div class="timeline-location">${item.location}</div>
                    <p class="timeline-description">${item.description}</p>
                    <div class="timeline-details">
                        ${detailsList}
                        ${tags}
                    </div>
                    <div class="timeline-expand">
                        <span class="timeline-expand-text">Details</span>
                        <span class="timeline-expand-icon">▼</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render year marker
     */
    function renderYearMarker(year) {
        return `
            <div class="timeline-year-marker" data-year="${year}">
                <span class="timeline-year-label">${year}</span>
            </div>
        `;
    }

    /**
     * Render the complete timeline
     */
    function render(containerId = '#timeline-track') {
        const container = document.querySelector(containerId);
        if (!container || !timelineData) return;

        const sortedItems = sortItems(timelineData.items);
        const groupedByYear = groupByYear(sortedItems);
        const years = Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a));

        let html = '';
        let itemIndex = 0;

        years.forEach((year, yearIndex) => {
            // Add year marker
            if (yearIndex === 0 || years[yearIndex - 1] !== year) {
                html += renderYearMarker(year);
            }

            // Add items for this year
            groupedByYear[year].forEach(item => {
                html += renderItem(item, itemIndex++);
            });
        });

        container.innerHTML = html;

        // Update section title and subtitle
        const titleEl = document.querySelector('#timeline .section-title');
        const subtitleEl = document.querySelector('.timeline-subtitle');
        if (titleEl && timelineData.sectionTitle) {
            titleEl.textContent = timelineData.sectionTitle;
            titleEl.setAttribute('data-glitch', timelineData.sectionTitle);
        }
        if (subtitleEl && timelineData.sectionSubtitle) {
            subtitleEl.textContent = timelineData.sectionSubtitle;
        }

        // Initialize interactions
        initInteractions();
        initScrollAnimations();
    }

    /**
     * Initialize click/hover interactions
     */
    function initInteractions() {
        const items = document.querySelectorAll('.timeline-item');

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't toggle if clicking a link
                if (e.target.tagName === 'A') return;

                const isActive = item.classList.contains('active');

                // Remove active from all
                items.forEach(i => i.classList.remove('active'));

                // Toggle clicked item
                if (!isActive) {
                    item.classList.add('active');
                    activeItem = item.dataset.id;

                    // Scroll item into better view if needed
                    const rect = item.getBoundingClientRect();
                    if (rect.top < 100 || rect.bottom > window.innerHeight - 100) {
                        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                } else {
                    activeItem = null;
                }
            });
        });

        // Initialize filters
        initFilters();
    }

    /**
     * Initialize category filters
     */
    function initFilters() {
        const filters = document.querySelectorAll('.timeline-filter');
        const items = document.querySelectorAll('.timeline-item');

        filters.forEach(filter => {
            filter.addEventListener('click', () => {
                const category = filter.dataset.category;

                // Update active filter
                filters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                currentFilter = category;

                // Filter items
                items.forEach(item => {
                    const itemCategory = item.dataset.category;
                    const shouldShow = category === 'all' || itemCategory === category;

                    if (shouldShow) {
                        item.style.display = '';
                        item.classList.remove('filtered-out');
                    } else {
                        item.classList.add('filtered-out');
                        setTimeout(() => {
                            if (item.classList.contains('filtered-out')) {
                                item.style.display = 'none';
                            }
                        }, 300);
                    }
                });

                // Refresh ScrollTrigger if available
                if (hasGSAP()) {
                    setTimeout(() => ScrollTrigger.refresh(), 350);
                }
            });
        });
    }

    /**
     * Initialize scroll animations
     */
    function initScrollAnimations() {
        const items = document.querySelectorAll('.timeline-item');
        const yearMarkers = document.querySelectorAll('.timeline-year-marker');

        if (hasGSAP()) {
            // GSAP ScrollTrigger animations
            gsap.registerPlugin(ScrollTrigger);

            // Animate items
            items.forEach((item, i) => {
                const side = item.classList.contains('left') ? -50 : 50;

                gsap.fromTo(item,
                    { opacity: 0, x: side },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.6,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: item,
                            start: 'top bottom-=100',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            });

            // Animate year markers
            yearMarkers.forEach(marker => {
                gsap.fromTo(marker,
                    { opacity: 0, scale: 0.8 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.4,
                        ease: 'back.out(1.5)',
                        scrollTrigger: {
                            trigger: marker,
                            start: 'top bottom-=50',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            });

            // Scroll-based pinning effect for active item highlight
            ScrollTrigger.create({
                trigger: '.timeline-section',
                start: 'top center',
                end: 'bottom center',
                onUpdate: (self) => {
                    // Find the item closest to center of viewport
                    let closestItem = null;
                    let closestDistance = Infinity;

                    items.forEach(item => {
                        if (item.style.display === 'none') return;
                        const rect = item.getBoundingClientRect();
                        const center = rect.top + rect.height / 2;
                        const viewportCenter = window.innerHeight / 2;
                        const distance = Math.abs(center - viewportCenter);

                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestItem = item;
                        }
                    });

                    // Only apply scroll-based highlight if no item is manually active
                    if (!activeItem && closestItem && closestDistance < 200) {
                        items.forEach(i => i.classList.remove('scroll-focus'));
                        closestItem.classList.add('scroll-focus');
                    }
                }
            });

        } else {
            // Fallback: Intersection Observer
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            items.forEach(item => observer.observe(item));
            yearMarkers.forEach(marker => observer.observe(marker));
        }

        // Animate intro
        const intro = document.querySelector('.timeline-intro');
        if (intro) {
            if (hasGSAP()) {
                gsap.fromTo(intro,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        scrollTrigger: {
                            trigger: intro,
                            start: 'top bottom-=100',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            } else {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                        }
                    });
                }, { threshold: 0.1 });
                observer.observe(intro);
            }
        }
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
        activeItem = null;
        currentFilter = 'all';
        await loadData();
        render();

        // Reset filter buttons
        document.querySelectorAll('.timeline-filter').forEach(f => {
            f.classList.toggle('active', f.dataset.category === 'all');
        });
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
