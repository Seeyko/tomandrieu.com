/**
 * ═══════════════════════════════════════════════════════════════
 * DEFAULT THEME - Clean & Minimal
 * Uses new modular architecture with ThemeInit
 * ═══════════════════════════════════════════════════════════════
 */

// Theme configuration
const defaultThemeConfig = {
    name: 'Default',

    // Card rendering configuration
    cards: {
        wrapperClass: 'project-card fade-in-up',
        showIndex: false,
        showType: false,
        tagWrapper: '{tag}',
        showUrl: false
    },

    // Blog card configuration (inherits from cards)
    blogCards: {
        wrapperClass: 'blog-card fade-in-up',
        showIndex: false
    },

    // Header scroll effect
    headerScroll: 'default',

    // Konami code easter egg
    konami: handleKonami,

    // Theme-specific effects
    initEffects: initDefaultEffects,

    // Ready callback
    onReady: () => {
        console.log('%c✦ Default theme loaded', 'color: #0f766e;');
    }
};

// ─── Theme-Specific Effects ───
function initDefaultEffects() {
    initRevealAnimation();
}

// ─── Smooth Reveal Animation ───
function initRevealAnimation() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe cards and sections after a short delay to allow rendering
    setTimeout(() => {
        document.querySelectorAll('.project-card, .about-card, .contact-card').forEach((el) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(el);
        });
    }, 100);
}

// ─── Konami Code Handler ───
function handleKonami() {
    console.log('%c You found the easter egg!', 'color: #0f766e; font-size: 16px;');

    // Subtle color shift
    document.documentElement.style.setProperty('--accent', '#6366f1');
    document.documentElement.style.setProperty('--accent-hover', '#818cf8');

    setTimeout(() => {
        document.documentElement.style.setProperty('--accent', '#0f766e');
        document.documentElement.style.setProperty('--accent-hover', '#0d9488');
    }, 5000);
}

// ─── Export Blog Card Renderer ───
// Create a renderer for blog.js to use
ThemeInit.exportBlogRenderer((article, index) => {
    return CardRenderer.renderBlogCard(article, index, defaultThemeConfig.blogCards);
});

// ─── Initialize Theme ───
ThemeInit.whenReady(() => {
    ThemeInit.init(defaultThemeConfig);
});
