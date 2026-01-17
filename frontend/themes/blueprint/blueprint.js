/**
 * ═══════════════════════════════════════════════════════════════
 * ARCHITECTURAL BLUEPRINT PORTFOLIO - Theme JavaScript
 * "The Master Plan" Aesthetic - Theme-specific effects
 * ═══════════════════════════════════════════════════════════════
 */

console.log('%c[BLUEPRINT] Portfolio Initialized', 'color: #00FFFF; font-family: monospace;');

// ─── DOM Elements ───
const customCursor = document.getElementById('custom-cursor');
const coordX = document.getElementById('coord-x');
const coordY = document.getElementById('coord-y');

// ─── Cursor Crosshair Tracker ───
class CursorTracker {
    constructor() {
        this.cursorX = 0;
        this.cursorY = 0;
        this.targetX = 0;
        this.targetY = 0;
        // Store viewport position for the visual cursor
        this.viewportX = 0;
        this.viewportY = 0;
        this.init();
    }

    init() {
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('scroll', this.handleScroll.bind(this));
        this.animate();
    }

    handleMouseMove(e) {
        // Store viewport position for the visual cursor
        this.viewportX = e.clientX;
        this.viewportY = e.clientY;
        // Update target with full page coordinates (viewport + scroll)
        this.targetX = e.clientX + window.scrollX;
        this.targetY = e.clientY + window.scrollY;
    }

    handleScroll() {
        // Update coordinates when scrolling (even without mouse movement)
        this.targetX = this.viewportX + window.scrollX;
        this.targetY = this.viewportY + window.scrollY;
    }

    animate() {
        // Smooth interpolation for coordinates
        this.cursorX += (this.targetX - this.cursorX) * 0.15;
        this.cursorY += (this.targetY - this.cursorY) * 0.15;

        // Visual cursor stays at viewport position
        if (customCursor) {
            customCursor.style.left = `${this.viewportX}px`;
            customCursor.style.top = `${this.viewportY}px`;
        }

        // Coordinates display full page position
        if (coordX && coordY) {
            coordX.textContent = Math.round(this.cursorX);
            coordY.textContent = Math.round(this.cursorY);
        }

        requestAnimationFrame(this.animate.bind(this));
    }
}

// ─── Blueprint Card Renderer ───
function renderBlueprintCard(project, index) {
    const card = document.createElement('a');
    card.className = 'project-card fade-in-up';
    card.href = project.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.style.animationDelay = `${index * 0.1}s`;

    const carouselId = `carousel-${project.id}`;
    const mediaContent = PortfolioBase.createMediaContent(project, carouselId);
    const tagsHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    const indexFormatted = String(index + 1).padStart(2, '0');

    card.innerHTML = `
        <div class="project-media-container">
            <span class="project-index">PRJ-${indexFormatted}</span>
            ${mediaContent}
        </div>
        <div class="project-info">
            <span class="project-type">${project.type}</span>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="tags">${tagsHTML}</div>
            <div class="project-link">
                <span class="link-icon">↗</span>
                <span class="link-url">${project.url}</span>
            </div>
        </div>
        <div class="card-corner tl"></div>
        <div class="card-corner tr"></div>
        <div class="card-corner bl"></div>
        <div class="card-corner br"></div>
    `;

    return card;
}

// ─── Blueprint Blog Card Renderer ───
function renderBlueprintBlogCard(article, index) {
    const card = document.createElement('a');
    card.className = 'blog-card fade-in-up';
    if (!article.coverImage) {
        card.classList.add('no-image');
    }
    card.href = `/blog/${article.slug}/`;
    card.style.animationDelay = `${index * 0.1}s`;

    const indexFormatted = String(index + 1).padStart(2, '0');
    const date = PortfolioBase.formatDate(article.publishedAt);

    // Only show image container if there's a cover image
    const imageHTML = article.coverImage
        ? `<div class="blog-card-image"><img src="${article.coverImage}" alt="${article.title}" loading="lazy"></div>`
        : '';

    card.innerHTML = `
        ${imageHTML}
        <div class="blog-card-content">
            <span class="blog-index">BLOG-${indexFormatted}</span>
            <h3 class="blog-card-title">${article.title}</h3>
            <p class="blog-card-excerpt">${article.excerpt}</p>
            <div class="blog-card-meta">
                <span class="blog-date">${date}</span>
                <span class="blog-reading-time">${article.readingTime} min read</span>
            </div>
        </div>
        <div class="card-corner tl"></div>
        <div class="card-corner tr"></div>
        <div class="card-corner bl"></div>
        <div class="card-corner br"></div>
    `;

    return card;
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
    });
}

// ─── Header Scroll Effect ───
function initHeaderEffect() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 100) {
            header.style.background = 'rgba(0, 34, 68, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        } else {
            header.style.background = 'linear-gradient(to bottom, #003366, transparent)';
            header.style.backdropFilter = 'blur(5px)';
            header.style.borderBottom = 'none';
        }
    });
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
    console.log('%c🎮 KONAMI CODE ACTIVATED!', 'color: #FFD700; font-size: 20px;');
    
    setTimeout(() => {
        document.body.style.setProperty('--accent-cyan', '#00FFFF');
        document.body.style.setProperty('--accent-redline', '#FF3333');
    }, 5000);
}

// ─── Initialize Blueprint Theme ───
async function initBlueprintTheme() {
    console.log('%c[BLUEPRINT] DOM Ready - Initializing modules...', 'color: #00FFFF;');

    // Initialize cursor tracker
    new CursorTracker();

    // Initialize base and load content
    await PortfolioBase.initBase();

    // Load and render projects with blueprint card renderer
    PortfolioBase.loadProjects().then(projects => {
        PortfolioBase.renderProjects(projects, renderBlueprintCard);
    });

    // Load and render blog articles preview (latest 3)
    PortfolioBase.loadArticles(1, 3).then(data => {
        if (data.articles && data.articles.length > 0) {
            PortfolioBase.renderBlogSection(data.articles, renderBlueprintBlogCard);
        }
    });

    // Initialize theme-specific effects
    initSVGAnimations();
    initParallax();
    initHeaderEffect();
    initCardEffects();

    // Initialize konami code
    PortfolioBase.initKonamiCode(handleKonami);

    console.log('%c[BLUEPRINT] All systems operational', 'color: #00FF00;');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlueprintTheme);
} else {
    initBlueprintTheme();
}
