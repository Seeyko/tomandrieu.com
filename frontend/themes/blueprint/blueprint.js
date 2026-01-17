/**
 * ═══════════════════════════════════════════════════════════════
 * BLUEPRINT PORTFOLIO - Theme JavaScript
 * "The Master Plan" Aesthetic
 * Uses new modular architecture with ThemeInit
 * ═══════════════════════════════════════════════════════════════
 */

console.log('%c[BLUEPRINT] Portfolio Initialized', 'color: #00FFFF; font-family: monospace;');

// Theme configuration
const blueprintThemeConfig = {
    name: 'Blueprint',

    // Card rendering configuration
    cards: {
        wrapperClass: 'project-card fade-in-up',
        showIndex: true,
        indexPrefix: 'PRJ-',
        indexPadding: 2,
        indexInMedia: true,  // Show index inside media container
        showType: true,
        typeInInfo: true,    // Show type in info section
        tagWrapper: '{tag}',
        showUrl: true,
        urlIcon: '&#8599;',  // ↗
        cornerDecorations: true,
        animationDelay: true
    },

    // Blog card configuration
    blogCards: {
        wrapperClass: 'blog-card fade-in-up',
        showIndex: true,
        indexPrefix: 'BLOG-',
        indexPadding: 2,
        cornerDecorations: true,
        animationDelay: true
    },

    // Cursor tracker configuration
    cursor: {
        mode: 'page',
        cursorSelector: '#custom-cursor',
        coordXSelector: '#coord-x',
        coordYSelector: '#coord-y',
        smoothing: 0.15
    },

    // Header scroll effect
    headerScroll: 'blueprint',

    // Konami code easter egg
    konami: handleKonami,

    // Theme-specific effects
    initEffects: initBlueprintEffects,

    // Ready callback
    onReady: () => {
        console.log('%c[BLUEPRINT] All systems operational', 'color: #00FF00;');
    }
};

// ─── Theme-Specific Effects ───
function initBlueprintEffects() {
    initSVGAnimations();
    initParallax();
    initCardEffects();
}

// ─── SVG Line Drawing Animation ───
function initSVGAnimations() {
    const svgPaths = document.querySelectorAll('.frame-line, .dim-line');

    svgPaths.forEach(path => {
        if (path.getTotalLength) {
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
        }
    });
}

// ─── Blueprint Grid Parallax ───
function initParallax() {
    const overlay = document.getElementById('theme-overlay');
    if (!overlay) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                overlay.style.transform = `translateY(${scrollY * 0.1}px)`;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ─── Project Card Hover Effects (3D Tilt) ───
function initCardEffects() {
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.project-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check if mouse is near the card
            const isNear = x >= -50 && x <= rect.width + 50 &&
                          y >= -50 && y <= rect.height + 50;

            if (isNear) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 30;
                const rotateY = (centerX - x) / 30;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            } else {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            }
        });
    });
}

// ─── Konami Code Handler ───
function handleKonami() {
    document.body.style.setProperty('--accent-cyan', '#FFD700');
    document.body.style.setProperty('--accent-redline', '#00FF00');
    console.log('%c KONAMI CODE ACTIVATED!', 'color: #FFD700; font-size: 20px;');

    setTimeout(() => {
        document.body.style.setProperty('--accent-cyan', '#00FFFF');
        document.body.style.setProperty('--accent-redline', '#FF3333');
    }, 5000);
}

// ─── Export Blog Card Renderer ───
ThemeInit.exportBlogRenderer((article, index) => {
    return CardRenderer.renderBlogCard(article, index, blueprintThemeConfig.blogCards);
});

// ─── Initialize Theme ───
ThemeInit.whenReady(() => {
    ThemeInit.init(blueprintThemeConfig);
});
