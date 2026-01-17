/**
 * Theme Initialization Module
 * Standard initialization pattern for all themes
 */

const ThemeInit = (() => {
    let isInitialized = false;

    /**
     * Initialize a theme with configuration
     * @param {Object} config - Theme configuration
     * @param {string} config.name - Theme name for logging
     * @param {Object} config.cards - Card renderer configuration
     * @param {Object} config.blogCards - Blog card renderer configuration
     * @param {Object} config.cursor - Cursor tracker configuration (optional)
     * @param {Object|string} config.headerScroll - Header scroll config or preset name
     * @param {Function} config.konami - Konami code callback (optional)
     * @param {Function} config.initEffects - Custom theme effects initializer
     * @param {Function} config.onReady - Callback when theme is ready
     */
    async function init(config = {}) {
        const themeName = config.name || 'Theme';
        console.log(`%c[${themeName.toUpperCase()}] Initializing...`, 'color: #ffb000;');

        try {
            // 1. Load and populate content
            await ContentLoader.loadAndPopulate();

            // 2. Set up card renderer
            const cardConfig = config.cards || {};
            const blogCardConfig = config.blogCards || cardConfig;

            // 3. Load and render projects
            const projects = await ContentLoader.loadProjects();
            CardRenderer.renderProjects(projects, cardConfig, '#projects-grid');

            // 4. Initialize carousels
            Carousel.initAll();

            // 5. Initialize scroll effects
            ScrollEffects.initAll();
            ScrollEffects.initResizeHandler();
            ScrollEffects.initSmoothScroll();

            // 6. Load and render blog articles
            const articlesData = await ContentLoader.loadArticles(1, 3);
            if (articlesData.articles && articlesData.articles.length > 0) {
                CardRenderer.renderBlogCards(articlesData.articles, blogCardConfig, '#blog-grid');
                ScrollEffects.animateBlogCards();
            }

            // 7. Initialize cursor tracker if configured
            if (config.cursor) {
                new CursorTracker(config.cursor);
            }

            // 8. Initialize header scroll effect
            if (config.headerScroll) {
                if (typeof config.headerScroll === 'string') {
                    HeaderScroll.usePreset(config.headerScroll);
                } else {
                    HeaderScroll.init(config.headerScroll);
                }
            }

            // 9. Initialize Konami code if callback provided
            if (config.konami) {
                KonamiCode.init(config.konami);
            }

            // 10. Run custom theme effects
            if (config.initEffects) {
                config.initEffects();
            }

            // 11. Initialize language switcher UI (if available)
            if (window.LanguageSwitcher) {
                LanguageSwitcher.init();
            }

            // 12. Mark body as loaded
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');

            isInitialized = true;

            // 13. Call onReady callback
            if (config.onReady) {
                config.onReady();
            }

            console.log(`%c[${themeName.toUpperCase()}] Ready`, 'color: #33ff00;');

        } catch (error) {
            console.error(`%c[${themeName.toUpperCase()}] Initialization failed:`, 'color: #ff3333;', error);
            throw error;
        }

        return {
            isInitialized: true,
            config
        };
    }

    /**
     * Simple initialization for themes that just need defaults
     * @param {string} themeName - Theme name
     * @param {Function} customEffects - Optional custom effects function
     */
    async function initSimple(themeName, customEffects = null) {
        return init({
            name: themeName,
            cards: {},
            headerScroll: 'default',
            initEffects: customEffects
        });
    }

    /**
     * Export blog card renderer for external use (e.g., blog.js)
     * @param {Function} renderer - Blog card renderer function
     */
    function exportBlogRenderer(renderer) {
        window.ThemeBlogCardRenderer = renderer;
    }

    /**
     * Create a bound renderer function for external use
     * @param {Object} config - Card configuration
     */
    function createBlogRendererExport(config = {}) {
        return (article, index) => CardRenderer.renderBlogCard(article, index, config);
    }

    /**
     * Run initialization when DOM is ready
     * @param {Function} initFn - Initialization function
     */
    function whenReady(initFn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initFn);
        } else {
            initFn();
        }
    }

    // Public API
    return {
        init,
        initSimple,
        exportBlogRenderer,
        createBlogRendererExport,
        whenReady,
        get isInitialized() { return isInitialized; }
    };
})();

// Export for use in other modules
window.ThemeInit = ThemeInit;
