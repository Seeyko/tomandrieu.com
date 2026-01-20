/**
 * GitTimeline - Horizontal git-style career visualization
 *
 * Renders career history as a git graph with:
 * - Main trunk (horizontal timeline)
 * - Branches for each job/project (down, horizontal, merge back up)
 * - Commits on branches
 * - CDK-style overlay popups for details
 */
const GitTimeline = (() => {
    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════
    let data = null;
    let overlay = null;
    let activeCommit = null;
    let scrollContainer = null;

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════
    const CONFIG = {
        // Dimensions
        yearWidth: 180,          // Pixels per year
        laneHeight: 50,          // Height per branch lane (compact)
        trunkY: 40,              // Y position of main trunk
        padding: { left: 100, right: 100 },

        // Node sizes
        commitRadius: 8,
        trunkNodeRadius: 10,

        // Branch curves
        curveRadius: 20,
        lineWidth: 3,

        // Colors by type
        colors: {
            work: '#33ff00',
            project: '#ff6b6b',
            education: '#4ecdc4',
            trunk: 'rgba(255, 255, 255, 0.3)'
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // DATA LOADING
    // ═══════════════════════════════════════════════════════════════

    /**
     * Load git history data based on current language
     */
    async function loadData() {
        const lang = window.LanguageManager?.currentLang || 'en';
        try {
            const response = await fetch(`/data/${lang}/git-history.json`);
            if (!response.ok) throw new Error('Failed to load git history');
            data = await response.json();
            return data;
        } catch (err) {
            console.error('[GitTimeline] Failed to load data:', err);
            return null;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // DATE UTILITIES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Parse date string (YYYY-MM or "ongoing") to year decimal
     */
    function parseDate(dateStr) {
        if (!dateStr || dateStr === 'ongoing') return null;
        const [year, month] = dateStr.split('-').map(Number);
        return year + (month - 1) / 12;
    }

    /**
     * Convert year decimal to X position
     */
    function yearToX(year) {
        const startYear = data?.config?.startYear || 2017;
        return CONFIG.padding.left + (year - startYear) * CONFIG.yearWidth;
    }

    /**
     * Check if branch is ongoing
     */
    function isOngoing(branch) {
        return branch.endDate === 'ongoing';
    }

    // ═══════════════════════════════════════════════════════════════
    // LANE ASSIGNMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * Assign lanes to branches to prevent overlap
     * Reuses lanes when a branch ends before another begins
     * Returns branches with _lane property assigned
     */
    function assignLanes(branches) {
        // Sort by start date
        const sorted = [...branches].sort((a, b) => {
            return parseDate(a.startDate) - parseDate(b.startDate);
        });

        // Lane end times and usage count tracker
        const laneEnds = [];
        const laneUsageCount = []; // Track how many times each lane has been used
        const endYear = data?.config?.endYear || new Date().getFullYear() + 2;

        sorted.forEach(branch => {
            const start = parseDate(branch.startDate);
            const end = isOngoing(branch) ? endYear + 1 : parseDate(branch.endDate);

            // Find first available lane (reuse if previous branch ended)
            let lane = -1;
            for (let i = 0; i < laneEnds.length; i++) {
                if (laneEnds[i] < start) {
                    lane = i;
                    break;
                }
            }

            // Create new lane if needed
            if (lane === -1) {
                lane = laneEnds.length;
                laneEnds.push(0);
                laneUsageCount.push(0);
            }

            laneEnds[lane] = end;
            branch._lane = lane;
            branch._lanePosition = laneUsageCount[lane]; // 0, 1, 2... for alternating positions
            laneUsageCount[lane]++;
            branch._startX = yearToX(start);
            branch._endX = isOngoing(branch) ? null : yearToX(end);
        });

        return { branches: sorted, laneCount: laneEnds.length };
    }

    // ═══════════════════════════════════════════════════════════════
    // SVG RENDERING
    // ═══════════════════════════════════════════════════════════════

    /**
     * Create SVG element with attributes
     */
    function createSvgElement(tag, attrs = {}) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(attrs).forEach(([key, value]) => {
            el.setAttribute(key, value);
        });
        return el;
    }

    /**
     * Generate branch path with smooth S-curve bezier transitions
     * Uses cubic bezier (C command) for smoother curves than quadratic (Q)
     */
    function createBranchPath(branch, laneY, totalWidth) {
        const startX = branch._startX;
        const trunkY = CONFIG.trunkY;
        const r = CONFIG.curveRadius;
        const ongoing = isOngoing(branch);
        const endX = ongoing ? totalWidth - CONFIG.padding.right : branch._endX;

        // Calculate vertical distance for smooth S-curve
        const verticalDist = laneY - trunkY;
        const curveControl = Math.min(r * 1.5, verticalDist * 0.4);

        let path = '';

        // Start: S-curve from trunk down to lane
        path += `M ${startX} ${trunkY}`;
        // Cubic bezier: C x1 y1, x2 y2, x y
        // Control point 1: straight down from start
        // Control point 2: from end point, going up
        path += ` C ${startX} ${trunkY + curveControl}, ${startX + r} ${laneY - curveControl}, ${startX + r} ${laneY}`;

        // Horizontal line along lane
        if (ongoing) {
            // Ongoing: go to the end
            path += ` L ${endX} ${laneY}`;
        } else {
            // Completed: go to merge point
            path += ` L ${endX - r} ${laneY}`;

            // S-curve from lane back up to trunk
            path += ` C ${endX - r} ${laneY - curveControl}, ${endX} ${trunkY + curveControl}, ${endX} ${trunkY}`;
        }

        return path;
    }

    /**
     * Render the complete SVG graph
     */
    function renderSvg(container, branches, laneCount) {
        const startYear = data?.config?.startYear || 2017;
        const endYear = data?.config?.endYear || new Date().getFullYear() + 2;
        const totalWidth = CONFIG.padding.left + CONFIG.padding.right +
                          (endYear - startYear + 1) * CONFIG.yearWidth;
        const totalHeight = CONFIG.trunkY + (laneCount + 1) * CONFIG.laneHeight + 50;

        // Create SVG
        const svg = createSvgElement('svg', {
            class: 'git-timeline-svg',
            width: totalWidth,
            height: totalHeight,
            viewBox: `0 0 ${totalWidth} ${totalHeight}`
        });

        // Defs for glow filter
        const defs = createSvgElement('defs');
        defs.innerHTML = `
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        `;
        svg.appendChild(defs);

        // Main trunk line
        const trunk = createSvgElement('line', {
            class: 'git-trunk',
            x1: CONFIG.padding.left - 30,
            y1: CONFIG.trunkY,
            x2: totalWidth - CONFIG.padding.right + 30,
            y2: CONFIG.trunkY,
            stroke: CONFIG.colors.trunk,
            'stroke-width': CONFIG.lineWidth,
            'stroke-linecap': 'round'
        });
        svg.appendChild(trunk);

        // Draw branches (reverse order for z-index)
        [...branches].reverse().forEach(branch => {
            const laneY = CONFIG.trunkY + (branch._lane + 1) * CONFIG.laneHeight;
            const color = CONFIG.colors[branch.type] || CONFIG.colors.work;
            const ongoing = isOngoing(branch);

            // Branch path
            const pathD = createBranchPath(branch, laneY, totalWidth);
            const path = createSvgElement('path', {
                class: `git-branch git-branch-${branch.type}`,
                d: pathD,
                stroke: color,
                'stroke-width': CONFIG.lineWidth,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                fill: 'none'
            });
            svg.appendChild(path);

            // Start node on trunk
            const startNode = createSvgElement('circle', {
                class: `git-node git-node-${branch.type}`,
                cx: branch._startX,
                cy: CONFIG.trunkY,
                r: CONFIG.trunkNodeRadius,
                fill: color,
                filter: 'url(#glow)'
            });
            svg.appendChild(startNode);

            // End node: on trunk if merged, on lane if ongoing
            if (ongoing) {
                const endX = totalWidth - CONFIG.padding.right;
                const endNode = createSvgElement('circle', {
                    class: `git-node git-node-ongoing git-node-${branch.type}`,
                    cx: endX,
                    cy: laneY,
                    r: CONFIG.commitRadius,
                    fill: color
                });
                svg.appendChild(endNode);
            } else {
                const endNode = createSvgElement('circle', {
                    class: `git-node git-node-${branch.type}`,
                    cx: branch._endX,
                    cy: CONFIG.trunkY,
                    r: CONFIG.trunkNodeRadius,
                    fill: color,
                    filter: 'url(#glow)'
                });
                svg.appendChild(endNode);
            }
        });

        container.appendChild(svg);
        return { totalWidth, totalHeight };
    }

    // ═══════════════════════════════════════════════════════════════
    // COMMIT MARKERS (HTML)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Render compact commit markers for each branch
     * Shows only hash + title pill to prevent overlap
     * Full details appear in overlay on hover (in fixed corner position)
     */
    function renderCommitCards(container, branches, totalWidth) {
        branches.forEach(branch => {
            const laneY = CONFIG.trunkY + (branch._lane + 1) * CONFIG.laneHeight;
            const color = CONFIG.colors[branch.type] || CONFIG.colors.work;
            const ongoing = isOngoing(branch);

            branch.commits.forEach((commit, idx) => {
                // Position commits along the branch
                // First commit near start, subsequent commits spaced along
                const commitX = branch._startX + CONFIG.curveRadius + 10 + (idx * 120);

                const marker = document.createElement('div');
                marker.className = `git-commit-marker git-commit-${branch.type} ${ongoing ? 'ongoing' : ''}`;
                marker.dataset.branchId = branch.id;
                //Do not show hash for the first one
                //marker.dataset.commitHash = commit.hash;
                marker.style.left = `${commitX}px`;
                marker.style.top = `${laneY - 14}px`;
                marker.style.setProperty('--branch-color', color);

                // Format date range
                const startYear = branch.startDate.split('-')[0];
                const endYear = ongoing ? 'Present' : branch.endDate.split('-')[0];
                const dateRange = `${startYear} - ${endYear}`;

                // Compact marker: format depends on branch type
                // For projects: "Role - Project Name" (e.g., "Fondateur - Skoolbook")
                // For work/education: just the title
                let displayTitle;
                if (branch.type === 'project') {
                    displayTitle = `${commit.details.title} - ${commit.details.company}`;
                } else {
                    displayTitle = commit.details.title;
                }

                marker.innerHTML = `
                    <!-- Do not show for first one <span class="marker-hash">${commit.hash.substring(0, 7)}</span>-->
                    <span class="marker-title">${displayTitle}</span>
                    ${ongoing ? '<span class="marker-badge">●</span>' : ''}
                `;

                // Store data for overlay
                marker.dataset.title = commit.details.title;
                marker.dataset.company = commit.details.company;
                marker.dataset.location = commit.details.location;
                marker.dataset.description = commit.details.description;
                marker.dataset.tags = JSON.stringify(commit.details.tags);
                marker.dataset.dateRange = dateRange;
                //Do not show hash for the first one
                //marker.dataset.hash = commit.hash;

                container.appendChild(marker);
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // YEAR AXIS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Render year markers
     */
    function renderYearAxis(container) {
        const startYear = data?.config?.startYear || 2017;
        const endYear = data?.config?.endYear || new Date().getFullYear() + 2;
        const currentYear = new Date().getFullYear();
        const totalWidth = CONFIG.padding.left + CONFIG.padding.right +
                          (endYear - startYear + 1) * CONFIG.yearWidth;

        const axis = document.createElement('div');
        axis.className = 'git-timeline-axis';
        axis.style.width = `${totalWidth}px`;

        for (let year = startYear; year <= endYear; year++) {
            const x = yearToX(year);
            const isCurrent = year === currentYear;
            const isFuture = year > currentYear;

            const marker = document.createElement('div');
            marker.className = `git-year-marker ${isCurrent ? 'current' : ''} ${isFuture ? 'future' : ''}`;
            marker.style.left = `${x}px`;
            marker.innerHTML = `
                <span class="git-year-label">${year}</span>
                <div class="git-year-tick"></div>
            `;
            axis.appendChild(marker);
        }

        // NOW marker
        const nowX = yearToX(currentYear) + (CONFIG.yearWidth * (new Date().getMonth() / 12));
        const nowMarker = document.createElement('div');
        nowMarker.className = 'git-now-marker';
        nowMarker.style.left = `${nowX}px`;
        nowMarker.innerHTML = '<span>NOW</span>';
        axis.appendChild(nowMarker);

        container.appendChild(axis);
    }

    // ═══════════════════════════════════════════════════════════════
    // CDK-STYLE OVERLAY
    // ═══════════════════════════════════════════════════════════════

    /**
     * Create overlay element (appended to body)
     */
    function createOverlay() {
        if (overlay) overlay.remove();

        overlay = document.createElement('div');
        overlay.className = 'git-timeline-overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <div class="overlay-header">
                    <span class="overlay-hash"></span>
                    <span class="overlay-date"></span>
                </div>
                <h4 class="overlay-title"></h4>
                <div class="overlay-meta">
                    <span class="overlay-company"></span>
                    <span class="overlay-location"></span>
                </div>
                <p class="overlay-description"></p>
                <div class="overlay-tags"></div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    /**
     * Show overlay for a commit marker
     * Positions in a fixed corner (top-right of viewport) to not obstruct navigation
     */
    function showOverlay(card) {
        if (!overlay) createOverlay();

        // Populate content
        overlay.querySelector('.overlay-hash').textContent = card.dataset.hash;
        overlay.querySelector('.overlay-date').textContent = card.dataset.dateRange;
        overlay.querySelector('.overlay-title').textContent = card.dataset.title;
        overlay.querySelector('.overlay-company').textContent = card.dataset.company;
        overlay.querySelector('.overlay-location').textContent = card.dataset.location;
        overlay.querySelector('.overlay-description').textContent = card.dataset.description;

        const tags = JSON.parse(card.dataset.tags || '[]');
        overlay.querySelector('.overlay-tags').innerHTML =
            tags.map(t => `<span class="overlay-tag">${t}</span>`).join('');

        // Get branch type for styling
        const branchType = card.className.match(/git-commit-(\w+)/)?.[1] || 'work';

        // Fixed position: top-right corner of viewport
        overlay.className = `git-timeline-overlay active git-overlay-${branchType} fixed-corner`;
        overlay.style.top = '100px';
        overlay.style.right = '20px';
        overlay.style.left = 'auto';

        activeCommit = card;
    }

    /**
     * Hide overlay
     */
    function hideOverlay() {
        if (overlay) {
            overlay.classList.remove('active');
        }
        activeCommit = null;
    }

    // ═══════════════════════════════════════════════════════════════
    // EVENT HANDLING
    // ═══════════════════════════════════════════════════════════════

    /**
     * Set up all event listeners
     */
    function setupEvents() {
        // Commit marker hover/click
        document.querySelectorAll('.git-commit-marker').forEach(marker => {
            marker.addEventListener('mouseenter', () => showOverlay(marker));
            marker.addEventListener('mouseleave', (e) => {
                if (!overlay?.contains(e.relatedTarget)) {
                    hideOverlay();
                }
            });
            marker.addEventListener('click', (e) => {
                e.stopPropagation();
                if (activeCommit === marker && overlay?.classList.contains('active')) {
                    hideOverlay();
                } else {
                    showOverlay(marker);
                }
            });
        });

        // Overlay hover
        if (overlay) {
            overlay.addEventListener('mouseleave', hideOverlay);
        }

        // Click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.git-commit-marker') && !e.target.closest('.git-timeline-overlay')) {
                hideOverlay();
            }
        });

        // Update overlay position on scroll
        scrollContainer?.addEventListener('scroll', () => {
            if (activeCommit && overlay?.classList.contains('active')) {
                showOverlay(activeCommit);
            }
        });

        // Scroll-jacking for horizontal scroll
        setupScrollJacking();
    }

    /**
     * Horizontal scroll-jacking when timeline is in view
     */
    function setupScrollJacking() {
        const section = document.getElementById('timeline');
        const viewport = document.querySelector('.git-timeline-viewport');

        if (!section || !scrollContainer || !viewport) return;

        window.addEventListener('wheel', (e) => {
            const rect = viewport.getBoundingClientRect();
            const vh = window.innerHeight;

            // Active when viewport is in view
            const inView = rect.top <= vh * 0.3 && rect.bottom > vh * 0.2;

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
        }, { passive: false });
    }

    // ═══════════════════════════════════════════════════════════════
    // MAIN RENDER
    // ═══════════════════════════════════════════════════════════════

    /**
     * Render the complete timeline
     */
    function render() {
        const lanesContainer = document.getElementById('git-timeline-lanes');
        const axisContainer = document.getElementById('git-timeline-axis');
        scrollContainer = document.querySelector('.git-timeline-scroll');

        if (!lanesContainer || !axisContainer || !data) {
            console.error('[GitTimeline] Missing containers or data');
            return;
        }

        // Clear containers
        lanesContainer.innerHTML = '';
        axisContainer.innerHTML = '';

        // Process branches
        const { branches, laneCount } = assignLanes(data.branches);

        // Render year axis
        renderYearAxis(axisContainer);

        // Render SVG graph
        const { totalWidth, totalHeight } = renderSvg(lanesContainer, branches, laneCount);

        // Set container dimensions
        lanesContainer.style.width = `${totalWidth}px`;
        lanesContainer.style.height = `${totalHeight}px`;

        // Render commit cards
        renderCommitCards(lanesContainer, branches, totalWidth);

        // Update subtitle
        const subtitle = document.querySelector('.git-timeline-subtitle');
        if (subtitle && data.config?.subtitle) {
            subtitle.textContent = data.config.subtitle;
        }

        // Create overlay and setup events
        createOverlay();
        setupEvents();

        console.log('%c[GitTimeline] Rendered', 'color: #33ff00');
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    /**
     * Initialize the timeline
     */
    async function init() {
        console.log('%c[GitTimeline] Initializing...', 'color: #ffb000');

        const loaded = await loadData();
        if (!loaded) {
            console.error('[GitTimeline] No data loaded');
            return;
        }

        render();
        console.log('%c[GitTimeline] Ready', 'color: #33ff00');
    }

    /**
     * Refresh (reload data and re-render)
     */
    async function refresh() {
        await loadData();
        render();
    }

    return { init, refresh, render };
})();

// Export to window
window.GitTimeline = GitTimeline;
