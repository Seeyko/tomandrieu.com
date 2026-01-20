/**
 * Theme Initialization - Standard pattern for all themes
 */

const ThemeInit = (() => {
    let isInitialized = false;

    async function init(config = {}) {
        const name = config.name || 'Theme';
        console.log(`%c[${name.toUpperCase()}] Initializing...`, 'color: #ffb000;');

        try {
            await ContentLoader.loadAndPopulate();

            const projects = await ContentLoader.loadProjects();
            CardRenderer.renderProjects(projects, config.cards || {}, '#projects-grid');
            Carousel.initAll();

            ScrollEffects.initAll();
            ScrollEffects.initResizeHandler();
            ScrollEffects.initSmoothScroll();

            // Initialize Timeline
            if (window.Timeline) {
                await Timeline.init();
            }

            const articles = await ContentLoader.loadArticles(1, 3);
            if (articles.articles?.length) {
                CardRenderer.renderBlogCards(articles.articles, config.blogCards || config.cards || {}, '#blog-grid');
                ScrollEffects.animateBlogCards();
            }

            if (config.cursor) new CursorTracker(config.cursor);

            if (config.headerScroll) {
                typeof config.headerScroll === 'string'
                    ? HeaderScroll.usePreset(config.headerScroll)
                    : HeaderScroll.init(config.headerScroll);
            }

            if (config.konami) KonamiCode.init(config.konami);
            if (config.initEffects) config.initEffects();
            if (window.LanguageSwitcher) LanguageSwitcher.init();

            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
            isInitialized = true;

            config.onReady?.();
            console.log(`%c[${name.toUpperCase()}] Ready`, 'color: #33ff00;');
        } catch (err) {
            console.error(`%c[${name.toUpperCase()}] Failed:`, 'color: #ff3333;', err);
            throw err;
        }
    }

    function exportBlogRenderer(renderer) {
        window.ThemeBlogCardRenderer = renderer;
    }

    function whenReady(fn) {
        document.readyState === 'loading'
            ? document.addEventListener('DOMContentLoaded', fn)
            : fn();
    }

    return {
        init,
        exportBlogRenderer,
        whenReady,
        get isInitialized() { return isInitialized; }
    };
})();

window.ThemeInit = ThemeInit;
