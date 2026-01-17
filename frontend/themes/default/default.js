/**
 * ═══════════════════════════════════════════════════════════════
 * DEFAULT THEME - Clean & Minimal JavaScript
 * Simple, effective, content-focused
 * ═══════════════════════════════════════════════════════════════
 */

// ─── Console Banner ───
console.log('%c✦ Tom Andrieu - Portfolio', 'color: #0f766e; font-size: 14px; font-weight: 600;');
console.log('%cClean & minimal theme loaded', 'color: #78716c;');

// ─── Default Card Renderer ───
function renderDefaultCard(project, index) {
    const card = document.createElement('a');
    card.className = 'project-card fade-in-up';
    card.href = project.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const carouselId = `carousel-${project.id}`;
    const mediaContent = PortfolioBase.createMediaContent(project, carouselId);
    const tagsHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

    card.innerHTML = `
        <div class="project-media-container">
            ${mediaContent}
        </div>
        <div class="project-info">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="tags">${tagsHTML}</div>
        </div>
    `;

    return card;
}

// ─── Default Blog Card Renderer ───
function renderDefaultBlogCard(article, index) {
    const card = document.createElement('a');
    card.className = 'blog-card fade-in-up';
    if (!article.coverImage) {
        card.classList.add('no-image');
    }
    card.href = `/blog/${article.slug}/`;

    const date = PortfolioBase.formatDate(article.publishedAt);

    // Only show image container if there's a cover image
    const imageHTML = article.coverImage
        ? `<div class="blog-card-image"><img src="${article.coverImage}" alt="${article.title}" loading="lazy"></div>`
        : '';

    card.innerHTML = `
        ${imageHTML}
        <div class="blog-card-content">
            <h3 class="blog-card-title">${article.title}</h3>
            <p class="blog-card-excerpt">${article.excerpt}</p>
            <div class="blog-card-meta">
                <span class="blog-date">${date}</span>
                <span class="blog-reading-time">${article.readingTime} min read</span>
            </div>
        </div>
    `;

    return card;
}

// ─── Header Scroll Effect ───
function initHeaderEffect() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            header.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });
}

// ─── Smooth Reveal Animation ───
function initRevealAnimation() {
    // Simple intersection observer for fade-in effects
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

    // Observe cards and sections
    document.querySelectorAll('.project-card, .about-card, .contact-card').forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// ─── Konami Code Handler (Simple easter egg) ───
function handleKonami() {
    console.log('%c🎉 You found the easter egg!', 'color: #0f766e; font-size: 16px;');

    // Subtle color shift
    document.documentElement.style.setProperty('--accent', '#6366f1');
    document.documentElement.style.setProperty('--accent-hover', '#818cf8');

    setTimeout(() => {
        document.documentElement.style.setProperty('--accent', '#0f766e');
        document.documentElement.style.setProperty('--accent-hover', '#0d9488');
    }, 5000);
}

// ─── Initialize Default Theme ───
async function initDefaultTheme() {
    console.log('%cInitializing default theme...', 'color: #78716c;');

    // Initialize base and load content
    await PortfolioBase.initBase();

    // Load and render projects with default card renderer
    PortfolioBase.loadProjects().then((projects) => {
        PortfolioBase.renderProjects(projects, renderDefaultCard);

        // Initialize reveal animations after render
        setTimeout(initRevealAnimation, 100);
    });

    // Load and render blog articles preview (latest 3)
    PortfolioBase.loadArticles(1, 3).then(data => {
        if (data.articles && data.articles.length > 0) {
            PortfolioBase.renderBlogSection(data.articles, renderDefaultBlogCard);
            // Initialize reveal animations for blog cards
            setTimeout(initRevealAnimation, 100);
        }
    });

    // Initialize header effect
    initHeaderEffect();

    // Initialize konami code
    PortfolioBase.initKonamiCode(handleKonami);

    console.log('%c✓ Default theme ready', 'color: #0f766e;');
}

// Export blog card renderer for use by blog.js
window.ThemeBlogCardRenderer = renderDefaultBlogCard;

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDefaultTheme);
} else {
    initDefaultTheme();
}
