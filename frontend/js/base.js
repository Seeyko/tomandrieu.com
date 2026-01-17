/**
 * ═══════════════════════════════════════════════════════════════
 * BASE PORTFOLIO - Shared JavaScript Functionality
 *
 * This file now serves as a compatibility layer, delegating to
 * the new modular architecture in /js/core/
 *
 * Legacy themes can continue using PortfolioBase.* methods
 * New themes should use the core modules directly via ThemeInit
 * ═══════════════════════════════════════════════════════════════
 */

// ─── Legacy API for Backward Compatibility ───

/**
 * Load site content from JSON
 * @deprecated Use ContentLoader.loadContent() instead
 */
async function loadContent() {
    return ContentLoader.loadContent();
}

/**
 * Load projects from JSON
 * @deprecated Use ContentLoader.loadProjects() instead
 */
async function loadProjects() {
    return ContentLoader.loadProjects();
}

/**
 * Load articles from API
 * @deprecated Use ContentLoader.loadArticles() instead
 */
async function loadArticles(page = 1, limit = 6) {
    return ContentLoader.loadArticles(page, limit);
}

/**
 * Render projects to the grid
 * @deprecated Use CardRenderer.renderProjects() instead
 */
function renderProjects(projectsData, cardRenderer) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    // Hide loading
    const loading = grid.querySelector('.projects-grid-loading');
    if (loading) loading.style.display = 'none';

    // Clear and render
    grid.innerHTML = '';

    projectsData.forEach((project, index) => {
        const card = cardRenderer(project, index);
        grid.appendChild(card);
    });

    // Initialize carousels
    Carousel.initAll();

    // Initialize scroll animations
    ScrollEffects.animateProjectCards();

    console.log(`%c[OK] Rendered ${projectsData.length} project cards`, 'color: #33ff00;');
}

/**
 * Render blog section
 * @deprecated Use CardRenderer.renderBlogCards() instead
 */
function renderBlogSection(articlesData, cardRenderer) {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    // Hide loading
    const loading = grid.querySelector('.blog-grid-loading');
    if (loading) loading.style.display = 'none';

    // Clear and render
    grid.innerHTML = '';

    if (!articlesData || articlesData.length === 0) {
        grid.innerHTML = '<p class="no-articles">No articles yet. Check back soon!</p>';
        return;
    }

    articlesData.forEach((article, index) => {
        const card = cardRenderer(article, index);
        grid.appendChild(card);
    });

    // Initialize scroll animations for blog cards
    ScrollEffects.animateBlogCards();

    console.log(`%c[OK] Rendered ${articlesData.length} blog cards`, 'color: #33ff00;');
}

/**
 * Initialize carousels
 * @deprecated Use Carousel.initAll() instead
 */
function initCarousels() {
    return Carousel.initAll();
}

/**
 * Initialize scroll animations
 * @deprecated Use ScrollEffects.initAll() instead
 */
function initScrollAnimations() {
    return ScrollEffects.initAll();
}

/**
 * Initialize smooth scrolling
 * @deprecated Use ScrollEffects.initSmoothScroll() instead
 */
function initSmoothScroll() {
    return ScrollEffects.initSmoothScroll();
}

/**
 * Handle resize events
 * @deprecated Use ScrollEffects.initResizeHandler() instead
 */
function initResizeHandler() {
    return ScrollEffects.initResizeHandler();
}

/**
 * Initialize Konami code
 * @deprecated Use KonamiCode.init() instead
 */
function initKonamiCode(callback) {
    return KonamiCode.init(callback);
}

/**
 * Create media content for project
 * @deprecated Use CardRenderer.createMediaContent() instead
 */
function createMediaContent(project, carouselId) {
    return CardRenderer.createMediaContent(project, carouselId);
}

/**
 * Format date for display
 * @deprecated Use ContentLoader.formatDate() instead
 */
function formatDate(dateString) {
    return ContentLoader.formatDate(dateString);
}

/**
 * Initialize base functionality
 * @deprecated Use ThemeInit.init() instead
 */
async function initBase() {
    // Load and populate content
    await ContentLoader.loadAndPopulate();

    // Initialize shared effects
    ScrollEffects.initSmoothScroll();
    ScrollEffects.initResizeHandler();

    // Mark body as loaded
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
}

// ─── Export Legacy API ───
window.PortfolioBase = {
    // Data loading
    loadProjects,
    loadContent,
    loadArticles,

    // Rendering
    renderProjects,
    renderBlogSection,
    createMediaContent,

    // Effects
    initCarousels,
    initScrollAnimations,
    initSmoothScroll,
    initResizeHandler,
    initKonamiCode,

    // Utilities
    formatDate,
    initBase,

    // Getters for data (delegate to ContentLoader)
    get projects() { return ContentLoader.projects; },
    get content() { return ContentLoader.content; },
    get articles() { return ContentLoader.articles; }
};
