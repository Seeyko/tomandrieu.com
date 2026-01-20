/**
 * Timeline - Git-style career history visualization
 * Unified git graph design for all themes with theme-specific styling
 */

const Timeline = (() => {
    let timelineData = null;
    let scrollContainer = null;
    let section = null;
    let currentTheme = 'terminal';

    // Configuration
    const CONFIG = {
        startYear: 2017,
        endYear: new Date().getFullYear() + 2,
        yearWidth: 200, // pixels per year
        rowHeight: 80, // pixels per row (increased for better spacing)
        padding: 120, // left/right padding
        nodeRadius: 10,
        lineWidth: 4,
        trunkY: 50, // Y position of main trunk
        branchRadius: 25 // radius for curved corners
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

        // Add "NOW" marker at current position in year
        const nowX = yearToX(currentYear) + (CONFIG.yearWidth * (new Date().getMonth() / 12));
        html += `<div class="timeline-now-marker" style="left: ${nowX}px;"><span>NOW</span></div>`;

        axis.innerHTML = html;
    }

    /**
     * Create SVG path for a rounded corner branch
     * Goes from trunk down to lane with smooth curves
     */
    function createBranchDownPath(startX, trunkY, laneY, radius) {
        const r = Math.min(radius, (laneY - trunkY) / 2);
        return `M ${startX} ${trunkY}
                L ${startX} ${trunkY + r}
                Q ${startX} ${trunkY + r * 2} ${startX + r} ${trunkY + r * 2}
                L ${startX + r} ${laneY}`;
    }

    /**
     * Create SVG path for merge back to trunk
     * Goes from lane up to trunk with smooth curves
     */
    function createMergeUpPath(endX, trunkY, laneY, radius) {
        const r = Math.min(radius, (laneY - trunkY) / 2);
        return `M ${endX - r} ${laneY}
                L ${endX - r} ${trunkY + r * 2}
                Q ${endX} ${trunkY + r * 2} ${endX} ${trunkY + r}
                L ${endX} ${trunkY}`;
    }

    /**
     * Unified Git Graph renderer for all themes
     */
    function renderGitGraph(items, laneCount) {
        const container = document.getElementById('timeline-lanes');
        const totalWidth = (CONFIG.endYear - CONFIG.startYear + 1) * CONFIG.yearWidth + CONFIG.padding * 2;
        const totalHeight = CONFIG.trunkY + (laneCount + 1) * CONFIG.rowHeight + 100;

        container.style.width = `${totalWidth}px`;
        container.style.height = `${totalHeight}px`;

        const trunkY = CONFIG.trunkY;
        const r = CONFIG.branchRadius;

        // Create SVG
        let svg = `<svg class="timeline-git-svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`;

        // Defs for filters and markers
        svg += `
            <defs>
                <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
                </filter>
            </defs>
        `;

        // Main trunk line
        svg += `<line class="git-trunk"
                      x1="${CONFIG.padding - 20}" y1="${trunkY}"
                      x2="${totalWidth - CONFIG.padding + 20}" y2="${trunkY}"
                      stroke-linecap="round"/>`;

        let html = '';

        items.forEach((item, index) => {
            const ongoing = isOngoing(item);
            const laneY = trunkY + (item._lane + 1) * CONFIG.rowHeight;
            const startX = item._startX;
            const endX = ongoing ? totalWidth - CONFIG.padding + 20 : item._endX;
            const categoryClass = item.category;

            // Branch path: trunk -> curve down -> horizontal -> (curve up if not ongoing)
            let branchPath = '';

            // Start: vertical down from trunk, then curve right
            branchPath += `M ${startX} ${trunkY}`;
            branchPath += ` L ${startX} ${laneY - r}`;
            branchPath += ` Q ${startX} ${laneY} ${startX + r} ${laneY}`;

            // Horizontal line along the lane
            if (ongoing) {
                // Continue to the right edge
                branchPath += ` L ${endX} ${laneY}`;
            } else {
                // Go to merge point
                branchPath += ` L ${endX - r} ${laneY}`;
                // Curve up to trunk
                branchPath += ` Q ${endX} ${laneY} ${endX} ${laneY - r}`;
                branchPath += ` L ${endX} ${trunkY}`;
            }

            svg += `<path class="git-branch git-${categoryClass}" d="${branchPath}"
                          stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;

            // Start node on trunk
            svg += `<circle class="git-node git-${categoryClass}"
                           cx="${startX}" cy="${trunkY}" r="${CONFIG.nodeRadius}"
                           filter="url(#glow)"/>`;

            // End node
            if (ongoing) {
                // Pulsing node at end of ongoing branch
                svg += `<circle class="git-node git-${categoryClass} git-node-ongoing"
                               cx="${endX}" cy="${laneY}" r="${CONFIG.nodeRadius - 2}"/>`;
            } else {
                // Merge node on trunk
                svg += `<circle class="git-node git-${categoryClass}"
                               cx="${endX}" cy="${trunkY}" r="${CONFIG.nodeRadius}"
                               filter="url(#glow)"/>`;
            }

            // Item card positioned along the branch
            const cardX = startX + r + 10;
            const cardWidth = Math.max((ongoing ? endX - 30 : endX - r - 10) - cardX, 180);
            const dateRange = ongoing ? `${item.year} → Present` : `${item.year} - ${item.endYear}`;
            const tags = item.tags?.slice(0, 3).map(t => `<span class="git-tag">${t}</span>`).join('') || '';

            html += `
                <div class="timeline-item git-item git-${categoryClass} ${ongoing ? 'ongoing' : ''}"
                     data-id="${item.id}"
                     data-category="${item.category}"
                     style="left: ${cardX}px; top: ${laneY - 22}px; width: ${cardWidth}px;">
                    <div class="git-commit-info">
                        <span class="git-hash">${item.id.substring(0, 7)}</span>
                        <span class="git-title">${item.title}</span>
                        <span class="git-author">${item.company}</span>
                        ${ongoing ? '<span class="git-ongoing-badge">CURRENT</span>' : ''}
                    </div>
                    <div class="git-detail">
                        <div class="git-detail-header">
                            <span class="git-detail-hash">${item.id}</span>
                            <span class="git-detail-date">${dateRange}</span>
                        </div>
                        <h4 class="git-detail-title">${item.title}</h4>
                        <div class="git-detail-meta">
                            <span class="git-detail-company">${item.company}</span>
                            <span class="git-detail-location">${item.location}</span>
                        </div>
                        <p class="git-detail-desc">${item.description}</p>
                        <div class="git-detail-tags">${tags}</div>
                    </div>
                </div>
            `;
        });

        svg += '</svg>';
        container.innerHTML = svg + html;
    }

    /**
     * Render the complete timeline
     */
    function render() {
        const container = document.getElementById('timeline-lanes');
        const axis = document.getElementById('timeline-axis');

        if (!container || !axis || !timelineData) return;

        currentTheme = getTheme();
        const { items, laneCount } = processItems(timelineData.items);

        renderAxis();

        // Use git graph for all themes
        renderGitGraph(items, laneCount);

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

        // Click to show/hide details
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
