/**
 * Timeline - Git-style career history visualization
 * Different visual styles per theme
 */

const Timeline = (() => {
    let timelineData = null;
    let scrollContainer = null;
    let section = null;
    let currentTheme = 'terminal';

    // Configuration
    const CONFIG = {
        startYear: 2017,
        endYear: new Date().getFullYear() + 2, // Extend 2 years into future for "ongoing" items
        yearWidth: 180, // pixels per year
        rowHeight: 60, // pixels per row
        padding: 100, // left/right padding
        nodeRadius: 8,
        lineWidth: 3
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
     * Get current theme
     */
    function getTheme() {
        return document.body.getAttribute('data-theme') || 'terminal';
    }

    /**
     * Parse year string to number
     */
    function parseYear(yearStr) {
        if (!yearStr) return new Date().getFullYear();
        const year = parseInt(yearStr);
        if (isNaN(year)) return new Date().getFullYear();
        return year;
    }

    /**
     * Check if item is ongoing
     */
    function isOngoing(item) {
        const endYear = item.endYear?.toLowerCase?.() || '';
        return !endYear || endYear === 'present' || endYear === "aujourd'hui" || endYear === 'ongoing';
    }

    /**
     * Calculate X position for a year
     */
    function yearToX(year) {
        return CONFIG.padding + (year - CONFIG.startYear) * CONFIG.yearWidth;
    }

    /**
     * Sort and assign visual lanes to items
     */
    function processItems(items) {
        const categoryOrder = { work: 0, project: 1, education: 2 };
        const sorted = [...items].sort((a, b) => {
            const yearDiff = parseYear(a.year) - parseYear(b.year);
            if (yearDiff !== 0) return yearDiff;
            return (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99);
        });

        const lanes = [];

        sorted.forEach(item => {
            const startYear = parseYear(item.year);
            const endYear = isOngoing(item) ? CONFIG.endYear : parseYear(item.endYear);

            let assignedLane = -1;
            for (let i = 0; i < lanes.length; i++) {
                if (lanes[i] < startYear) {
                    assignedLane = i;
                    lanes[i] = endYear;
                    break;
                }
            }

            if (assignedLane === -1) {
                assignedLane = lanes.length;
                lanes.push(endYear);
            }

            item._lane = assignedLane;
            item._startX = yearToX(startYear);
            item._endX = yearToX(endYear);
            item._startYear = startYear;
            item._endYear = endYear;
        });

        return { items: sorted, laneCount: lanes.length };
    }

    /**
     * Render year axis at top
     */
    function renderAxis() {
        const axis = document.getElementById('timeline-axis');
        if (!axis) return;

        const totalWidth = (CONFIG.endYear - CONFIG.startYear + 1) * CONFIG.yearWidth + CONFIG.padding * 2;
        axis.style.width = `${totalWidth}px`;

        let html = '';
        const currentYear = new Date().getFullYear();

        for (let year = CONFIG.startYear; year <= CONFIG.endYear; year++) {
            const x = yearToX(year);
            const isNow = year === currentYear;
            const isFuture = year > currentYear;

            html += `
                <div class="timeline-year ${isNow ? 'current' : ''} ${isFuture ? 'future' : ''}" style="left: ${x}px;">
                    <span class="timeline-year-label">${year}</span>
                    <div class="timeline-year-tick"></div>
                </div>
            `;
        }

        // Add "NOW" marker
        const nowX = yearToX(currentYear) + (CONFIG.yearWidth * (new Date().getMonth() / 12));
        html += `<div class="timeline-now-marker" style="left: ${nowX}px;"><span>NOW</span></div>`;

        axis.innerHTML = html;
    }

    /**
     * TERMINAL THEME - Git graph style
     */
    function renderGitGraph(items, laneCount) {
        const container = document.getElementById('timeline-lanes');
        const totalWidth = (CONFIG.endYear - CONFIG.startYear + 1) * CONFIG.yearWidth + CONFIG.padding * 2;
        const totalHeight = (laneCount + 1) * CONFIG.rowHeight + 40;

        container.style.width = `${totalWidth}px`;
        container.style.height = `${totalHeight}px`;

        // Create SVG for lines
        let svg = `<svg class="timeline-git-svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`;

        // Define glow filter
        svg += `
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
        `;

        // Main timeline trunk
        const trunkY = 30;
        svg += `<line class="git-trunk" x1="${CONFIG.padding}" y1="${trunkY}" x2="${totalWidth - CONFIG.padding}" y2="${trunkY}" />`;

        let html = '';

        items.forEach((item, index) => {
            const ongoing = isOngoing(item);
            const laneY = trunkY + (item._lane + 1) * CONFIG.rowHeight;
            const startX = item._startX;
            const endX = ongoing ? totalWidth - CONFIG.padding / 2 : item._endX;
            const categoryClass = item.category;

            // Branch down from trunk
            const branchPath = `M ${startX} ${trunkY} C ${startX} ${trunkY + 20}, ${startX} ${laneY - 20}, ${startX} ${laneY}`;
            svg += `<path class="git-branch git-${categoryClass}" d="${branchPath}" />`;

            // Horizontal line
            svg += `<line class="git-line git-${categoryClass}" x1="${startX}" y1="${laneY}" x2="${endX}" y2="${laneY}" />`;

            // Merge back (if not ongoing)
            if (!ongoing) {
                const mergePath = `M ${endX} ${laneY} C ${endX} ${laneY - 20}, ${endX} ${trunkY + 20}, ${endX} ${trunkY}`;
                svg += `<path class="git-branch git-${categoryClass}" d="${mergePath}" />`;
            }

            // Start node
            svg += `<circle class="git-node git-${categoryClass}" cx="${startX}" cy="${trunkY}" r="${CONFIG.nodeRadius}" filter="url(#glow)" />`;

            // End node
            if (!ongoing) {
                svg += `<circle class="git-node git-${categoryClass}" cx="${endX}" cy="${trunkY}" r="${CONFIG.nodeRadius}" filter="url(#glow)" />`;
            } else {
                svg += `<circle class="git-node git-${categoryClass} ongoing-node" cx="${endX}" cy="${laneY}" r="${CONFIG.nodeRadius - 2}" />`;
            }

            const dateRange = ongoing ? `${item.year} → ` : `${item.year} - ${item.endYear}`;
            const tags = item.tags?.slice(0, 3).map(t => `<span class="git-tag">${t}</span>`).join('') || '';

            html += `
                <div class="timeline-item git-item git-${categoryClass} ${ongoing ? 'ongoing' : ''}"
                     data-id="${item.id}"
                     data-category="${item.category}"
                     style="left: ${startX + 15}px; top: ${laneY - 18}px; width: ${Math.max(endX - startX - 30, 150)}px;">
                    <div class="git-commit-info">
                        <span class="git-hash">${item.id.substring(0, 7)}</span>
                        <span class="git-title">${item.title}</span>
                        <span class="git-author">${item.company}</span>
                    </div>
                    <div class="git-detail">
                        <div class="git-detail-header">
                            <span class="git-detail-hash">${item.id}</span>
                            <span class="git-detail-date">${dateRange}</span>
                        </div>
                        <h4 class="git-detail-title">${item.title}</h4>
                        <div class="git-detail-company">${item.company}</div>
                        <div class="git-detail-location">${item.location}</div>
                        <p class="git-detail-description">${item.description}</p>
                        <div class="git-detail-tags">${tags}</div>
                    </div>
                </div>
            `;
        });

        svg += '</svg>';
        container.innerHTML = svg + html;
    }

    /**
     * DEFAULT THEME - Modern floating cards
     */
    function renderModernCards(items, laneCount) {
        const container = document.getElementById('timeline-lanes');
        const totalWidth = (CONFIG.endYear - CONFIG.startYear + 1) * CONFIG.yearWidth + CONFIG.padding * 2;
        const totalHeight = (laneCount + 1) * (CONFIG.rowHeight + 20) + 60;

        container.style.width = `${totalWidth}px`;
        container.style.height = `${totalHeight}px`;

        let html = '';

        items.forEach((item) => {
            const ongoing = isOngoing(item);
            const laneY = 20 + item._lane * (CONFIG.rowHeight + 20);
            const startX = item._startX;
            const width = ongoing ? (yearToX(CONFIG.endYear) - startX) : (item._endX - startX);
            const dateRange = ongoing ? `${item.year} → Present` : `${item.year} - ${item.endYear}`;
            const tags = item.tags?.slice(0, 4).map(t => `<span class="modern-tag">${t}</span>`).join('') || '';

            html += `
                <div class="timeline-item modern-item ${item.category} ${ongoing ? 'ongoing' : ''}"
                     data-id="${item.id}"
                     data-category="${item.category}"
                     style="left: ${startX}px; top: ${laneY}px; width: ${Math.max(width, 200)}px;">
                    <div class="modern-card">
                        <div class="modern-card-accent"></div>
                        <div class="modern-card-content">
                            <div class="modern-card-header">
                                <span class="modern-card-category">${item.category}</span>
                                <span class="modern-card-date">${dateRange}</span>
                            </div>
                            <h4 class="modern-card-title">${item.title}</h4>
                            <div class="modern-card-company">${item.company}</div>
                        </div>
                        ${ongoing ? '<div class="modern-ongoing-indicator"></div>' : ''}
                    </div>
                    <div class="modern-detail">
                        <div class="modern-detail-header">
                            <h4>${item.title}</h4>
                            <span class="modern-detail-date">${dateRange}</span>
                        </div>
                        <div class="modern-detail-company">${item.company}</div>
                        <div class="modern-detail-location">${item.location}</div>
                        <p class="modern-detail-description">${item.description}</p>
                        <div class="modern-detail-tags">${tags}</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * BLUEPRINT THEME - Technical schematic
     */
    function renderBlueprint(items, laneCount) {
        const container = document.getElementById('timeline-lanes');
        const totalWidth = (CONFIG.endYear - CONFIG.startYear + 1) * CONFIG.yearWidth + CONFIG.padding * 2;
        const totalHeight = (laneCount + 1) * (CONFIG.rowHeight + 10) + 80;

        container.style.width = `${totalWidth}px`;
        container.style.height = `${totalHeight}px`;

        let svg = `<svg class="blueprint-svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`;
        let html = '';

        items.forEach((item, index) => {
            const ongoing = isOngoing(item);
            const laneY = 40 + item._lane * (CONFIG.rowHeight + 10);
            const startX = item._startX;
            const endX = ongoing ? totalWidth - CONFIG.padding / 2 : item._endX;
            const width = endX - startX;
            const dateRange = ongoing ? `${item.year} - ONGOING` : `${item.year} - ${item.endYear}`;

            // Dimension lines
            const dimY = laneY - 15;
            svg += `
                <g class="blueprint-dimension blueprint-${item.category}">
                    <line x1="${startX}" y1="${dimY}" x2="${startX}" y2="${dimY + 10}" />
                    <line x1="${endX}" y1="${dimY}" x2="${endX}" y2="${dimY + 10}" />
                    <line x1="${startX}" y1="${dimY + 5}" x2="${endX}" y2="${dimY + 5}" />
                    <polygon points="${startX},${dimY + 5} ${startX + 6},${dimY + 2} ${startX + 6},${dimY + 8}" />
                    <polygon points="${endX},${dimY + 5} ${endX - 6},${dimY + 2} ${endX - 6},${dimY + 8}" />
                </g>
            `;

            // Corner markers
            svg += `
                <g class="blueprint-corners blueprint-${item.category}">
                    <path d="M ${startX} ${laneY + 5} L ${startX} ${laneY} L ${startX + 5} ${laneY}" fill="none" />
                    <path d="M ${endX} ${laneY + 5} L ${endX} ${laneY} L ${endX - 5} ${laneY}" fill="none" />
                    <path d="M ${startX} ${laneY + CONFIG.rowHeight - 15} L ${startX} ${laneY + CONFIG.rowHeight - 10} L ${startX + 5} ${laneY + CONFIG.rowHeight - 10}" fill="none" />
                    <path d="M ${endX} ${laneY + CONFIG.rowHeight - 15} L ${endX} ${laneY + CONFIG.rowHeight - 10} L ${endX - 5} ${laneY + CONFIG.rowHeight - 10}" fill="none" />
                </g>
            `;

            const tags = item.tags?.slice(0, 3).map(t => `<span class="blueprint-tag">${t}</span>`).join('') || '';

            html += `
                <div class="timeline-item blueprint-item blueprint-${item.category} ${ongoing ? 'ongoing' : ''}"
                     data-id="${item.id}"
                     data-category="${item.category}"
                     style="left: ${startX + 2}px; top: ${laneY}px; width: ${width - 4}px;">
                    <div class="blueprint-card">
                        <div class="blueprint-card-number">${String(index + 1).padStart(2, '0')}</div>
                        <div class="blueprint-card-content">
                            <span class="blueprint-card-title">${item.title}</span>
                            <span class="blueprint-card-company">${item.company}</span>
                        </div>
                        <div class="blueprint-card-ref">${item.category.toUpperCase().substring(0, 3)}-${item.id.substring(0, 4)}</div>
                    </div>
                    <div class="blueprint-detail">
                        <div class="blueprint-detail-header">
                            <span class="blueprint-detail-ref">REF: ${item.id}</span>
                            <span class="blueprint-detail-date">${dateRange}</span>
                        </div>
                        <h4 class="blueprint-detail-title">${item.title}</h4>
                        <div class="blueprint-detail-company">${item.company} — ${item.location}</div>
                        <p class="blueprint-detail-description">${item.description}</p>
                        <div class="blueprint-detail-tags">${tags}</div>
                    </div>
                </div>
            `;
        });

        svg += '</svg>';
        container.innerHTML = svg + html;
    }

    /**
     * RETRO90S THEME - Windows 95 style
     */
    function renderRetro(items, laneCount) {
        const container = document.getElementById('timeline-lanes');
        const totalWidth = (CONFIG.endYear - CONFIG.startYear + 1) * CONFIG.yearWidth + CONFIG.padding * 2;
        const totalHeight = (laneCount + 1) * (CONFIG.rowHeight + 30) + 60;

        container.style.width = `${totalWidth}px`;
        container.style.height = `${totalHeight}px`;

        let html = '';
        html += `<div class="retro-road" style="width: ${totalWidth}px;"></div>`;

        const icons = { work: '💼', project: '🚀', education: '📚' };

        items.forEach((item) => {
            const ongoing = isOngoing(item);
            const laneY = 30 + item._lane * (CONFIG.rowHeight + 30);
            const startX = item._startX;
            const endX = ongoing ? totalWidth - CONFIG.padding / 2 : item._endX;
            const width = Math.max(endX - startX, 180);
            const dateRange = ongoing ? `${item.year} → ???` : `${item.year} - ${item.endYear}`;
            const tags = item.tags?.slice(0, 2).map(t => `<span class="retro-tag">${t}</span>`).join('') || '';

            html += `
                <div class="timeline-item retro-item retro-${item.category} ${ongoing ? 'ongoing' : ''}"
                     data-id="${item.id}"
                     data-category="${item.category}"
                     style="left: ${startX}px; top: ${laneY}px; width: ${width}px;">
                    <div class="retro-window">
                        <div class="retro-window-titlebar">
                            <span class="retro-window-icon">${icons[item.category] || '📁'}</span>
                            <span class="retro-window-title">${item.title.substring(0, 25)}${item.title.length > 25 ? '...' : ''}</span>
                            <div class="retro-window-buttons">
                                <span class="retro-btn">_</span>
                                <span class="retro-btn">□</span>
                                <span class="retro-btn">×</span>
                            </div>
                        </div>
                        <div class="retro-window-content">
                            <div class="retro-company">${item.company}</div>
                            <div class="retro-date">${dateRange}</div>
                        </div>
                        ${ongoing ? '<div class="retro-new-badge">NEW!</div>' : ''}
                    </div>
                    <div class="retro-detail">
                        <div class="retro-detail-titlebar">
                            <span>${item.title} - Details</span>
                            <span class="retro-close">×</span>
                        </div>
                        <div class="retro-detail-content">
                            <div class="retro-detail-icon">${icons[item.category] || '📁'}</div>
                            <div class="retro-detail-info">
                                <h4>${item.title}</h4>
                                <div class="retro-detail-company">${item.company}</div>
                                <div class="retro-detail-location">📍 ${item.location}</div>
                                <div class="retro-detail-date">📅 ${dateRange}</div>
                                <hr class="retro-hr">
                                <p>${item.description}</p>
                                <div class="retro-detail-tags">${tags}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * Render the complete timeline based on current theme
     */
    function render() {
        const container = document.getElementById('timeline-lanes');
        const axis = document.getElementById('timeline-axis');

        if (!container || !axis || !timelineData) return;

        currentTheme = getTheme();
        const { items, laneCount } = processItems(timelineData.items);

        renderAxis();

        switch (currentTheme) {
            case 'terminal':
                renderGitGraph(items, laneCount);
                break;
            case 'blueprint':
                renderBlueprint(items, laneCount);
                break;
            case 'retro90s':
                renderRetro(items, laneCount);
                break;
            default:
                renderModernCards(items, laneCount);
        }

        const subtitleEl = document.querySelector('.timeline-subtitle');
        if (subtitleEl && timelineData.sectionSubtitle) {
            subtitleEl.textContent = timelineData.sectionSubtitle;
        }

        initScrollBehavior();
    }

    /**
     * Initialize scroll-jacking behavior
     */
    function initScrollBehavior() {
        section = document.getElementById('timeline');
        scrollContainer = document.querySelector('.timeline-scroll-container');
        const scrollHint = document.querySelector('.timeline-scroll-hint');

        if (!section || !scrollContainer) return;

        const handleWheel = (e) => {
            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            const sectionTop = rect.top;
            const sectionBottom = rect.bottom;
            const inView = sectionTop < viewportHeight * 0.6 && sectionBottom > viewportHeight * 0.4;

            if (!inView) {
                section.classList.remove('scroll-locked');
                return;
            }

            const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            const currentScroll = scrollContainer.scrollLeft;

            const scrollingRight = e.deltaY > 0;
            const scrollingLeft = e.deltaY < 0;
            const atStart = currentScroll <= 0;
            const atEnd = currentScroll >= maxScroll - 1;

            if ((atStart && scrollingLeft) || (atEnd && scrollingRight)) {
                section.classList.remove('scroll-locked');
                return;
            }

            e.preventDefault();
            section.classList.add('scroll-locked');
            scrollContainer.scrollLeft += e.deltaY * 1.5;

            if (scrollHint) scrollHint.classList.add('hidden');
        };

        window.addEventListener('wheel', handleWheel, { passive: false });

        document.querySelectorAll('.timeline-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const wasActive = item.classList.contains('active');
                document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('active'));
                if (!wasActive) item.classList.add('active');
            });
        });

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
     * Refresh timeline
     */
    async function refresh() {
        await loadData();
        render();
    }

    return { init, refresh, loadData, render };
})();

window.Timeline = Timeline;
