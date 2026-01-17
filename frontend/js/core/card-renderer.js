/**
 * Card Renderer Module
 * Configurable rendering for project and blog cards
 */

const CardRenderer = (() => {
    /**
     * Create media content for project (carousel or single image/video)
     * @param {Object} project - Project data
     * @param {string} carouselId - Unique ID for carousel
     */
    function createMediaContent(project, carouselId) {
        if (project.images && project.images.length > 1) {
            const slidesHTML = project.images.map((img, i) => `
                <div class="carousel-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
                    <img src="${img}" alt="${project.title} - ${i + 1}" class="project-image" loading="lazy">
                </div>
            `).join('');

            const dotsHTML = project.images.map((_, i) => `
                <span class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
            `).join('');

            return `
                <div class="project-carousel" id="${carouselId}">
                    <div class="carousel-slides">
                        ${slidesHTML}
                    </div>
                    <button class="carousel-btn prev" aria-label="Previous">&#9668;</button>
                    <button class="carousel-btn next" aria-label="Next">&#9658;</button>
                    <div class="carousel-dots">${dotsHTML}</div>
                </div>
            `;
        }

        if (project.images && project.images.length === 1) {
            return `<img src="${project.images[0]}" alt="${project.title}" class="project-image" loading="lazy">`;
        }

        if (project.video) {
            return `
                <video class="project-video" autoplay muted loop playsinline>
                    <source src="${project.video}" type="video/mp4">
                </video>
            `;
        }

        return '';
    }

    /**
     * Default configuration for card rendering
     */
    const defaultConfig = {
        // Project card config
        project: {
            wrapperClass: 'project-card fade-in-up',
            showIndex: false,
            indexPrefix: '',
            indexPadding: 2,
            showType: false,
            typePrefix: '',
            typeSuffix: '',
            titlePrefix: '',
            tagWrapper: '{tag}',           // Use {tag} as placeholder
            showUrl: false,
            urlIcon: '&#8594;',
            headerTemplate: null,          // Custom header template function
            footerTemplate: null,          // Custom footer template function
            extraClasses: '',
            cornerDecorations: false,
            onRender: null                 // Callback after card is created
        },
        // Blog card config
        blog: {
            wrapperClass: 'blog-card fade-in-up',
            showIndex: false,
            indexPrefix: 'BLOG-',
            indexPadding: 2,
            titlePrefix: '',
            dateFormat: null,              // Custom date formatter
            showNewBadge: false,
            headerTemplate: null,          // Custom header template (e.g., titlebar)
            cornerDecorations: false,
            onRender: null
        }
    };

    /**
     * Merge config with defaults
     */
    function mergeConfig(config, defaults) {
        return {
            ...defaults,
            ...config,
            project: { ...defaults.project, ...config?.project },
            blog: { ...defaults.blog, ...config?.blog }
        };
    }

    /**
     * Format index with padding
     */
    function formatIndex(index, padding = 2) {
        return String(index + 1).padStart(padding, '0');
    }

    /**
     * Render a single project card
     * @param {Object} project - Project data
     * @param {number} index - Project index
     * @param {Object} config - Rendering configuration
     */
    function renderProjectCard(project, index, config = {}) {
        const cfg = { ...defaultConfig.project, ...config };
        const card = document.createElement('a');

        card.className = cfg.wrapperClass + (cfg.extraClasses ? ' ' + cfg.extraClasses : '');
        card.href = project.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

        if (cfg.animationDelay) {
            card.style.animationDelay = `${index * 0.1}s`;
        }

        if (cfg.tooltip) {
            card.setAttribute('data-tooltip', cfg.tooltip.replace('{title}', project.title));
        }

        const carouselId = `carousel-${project.id}`;
        const mediaContent = createMediaContent(project, carouselId);
        const indexFormatted = formatIndex(index, cfg.indexPadding);

        // Generate tags HTML
        const tagsHTML = project.tags
            .map(tag => `<span class="tag">${cfg.tagWrapper.replace('{tag}', tag)}</span>`)
            .join('');

        // Build header if configured
        let headerHTML = '';
        if (cfg.headerTemplate) {
            headerHTML = cfg.headerTemplate(project, indexFormatted);
        } else if (cfg.showIndex || cfg.showType) {
            headerHTML = `
                <div class="project-card-header">
                    ${cfg.showIndex ? `<span class="project-index">${cfg.indexPrefix}${indexFormatted}</span>` : ''}
                    ${cfg.showType ? `<span class="project-type">${cfg.typePrefix}${project.type}${cfg.typeSuffix}</span>` : ''}
                </div>
            `;
        }

        // Build URL section if configured
        let urlHTML = '';
        if (cfg.showUrl) {
            urlHTML = `
                <div class="project-link">
                    <span class="link-icon">${cfg.urlIcon}</span>
                    <span class="link-url">${cfg.urlText || project.url}</span>
                </div>
            `;
        }

        // Build footer if configured
        let footerHTML = '';
        if (cfg.footerTemplate) {
            footerHTML = cfg.footerTemplate(project, indexFormatted);
        }

        // Build corner decorations if configured
        let cornersHTML = '';
        if (cfg.cornerDecorations) {
            cornersHTML = `
                <div class="card-corner tl"></div>
                <div class="card-corner tr"></div>
                <div class="card-corner bl"></div>
                <div class="card-corner br"></div>
            `;
        }

        card.innerHTML = `
            ${headerHTML}
            <div class="project-media-container">
                ${cfg.showIndex && cfg.indexInMedia ? `<span class="project-index">${cfg.indexPrefix}${indexFormatted}</span>` : ''}
                ${mediaContent}
            </div>
            <div class="project-info">
                ${cfg.showType && cfg.typeInInfo ? `<span class="project-type">${project.type}</span>` : ''}
                <h3>${cfg.titlePrefix}${project.title}</h3>
                <p>${project.description}</p>
                <div class="tags">${tagsHTML}</div>
                ${urlHTML}
            </div>
            ${footerHTML}
            ${cornersHTML}
        `;

        // Call onRender callback if provided
        if (cfg.onRender) {
            cfg.onRender(card, project, index);
        }

        return card;
    }

    /**
     * Render a single blog card
     * @param {Object} article - Article data
     * @param {number} index - Article index
     * @param {Object} config - Rendering configuration
     */
    function renderBlogCard(article, index, config = {}) {
        const cfg = { ...defaultConfig.blog, ...config };
        const card = document.createElement('a');

        card.className = cfg.wrapperClass;
        if (!article.coverImage) {
            card.classList.add('no-image');
        }
        card.href = `/blog/${article.slug}/`;

        if (cfg.animationDelay) {
            card.style.animationDelay = `${index * 0.1}s`;
        }

        if (cfg.tooltip) {
            card.setAttribute('data-tooltip', cfg.tooltip.replace('{title}', article.title));
        }

        const indexFormatted = formatIndex(index, cfg.indexPadding);

        // Format date
        const date = cfg.dateFormat
            ? cfg.dateFormat(article.publishedAt)
            : ContentLoader.formatDate(article.publishedAt);

        // Image HTML
        const imageHTML = article.coverImage
            ? `<div class="blog-card-image"><img src="${article.coverImage}" alt="${article.title}" loading="lazy"></div>`
            : '';

        // Build header if configured (e.g., Windows titlebar)
        let headerHTML = '';
        if (cfg.headerTemplate) {
            headerHTML = cfg.headerTemplate(article, indexFormatted);
        }

        // Build index badge if configured
        let indexHTML = '';
        if (cfg.showIndex) {
            indexHTML = `<span class="blog-index">${cfg.indexPrefix}${indexFormatted}</span>`;
        }

        // Build corner decorations if configured
        let cornersHTML = '';
        if (cfg.cornerDecorations) {
            cornersHTML = `
                <div class="card-corner tl"></div>
                <div class="card-corner tr"></div>
                <div class="card-corner bl"></div>
                <div class="card-corner br"></div>
            `;
        }

        // New badge
        const newBadgeHTML = cfg.showNewBadge
            ? `<span class="blog-new-badge">NEW!</span>`
            : '';

        card.innerHTML = `
            ${headerHTML}
            ${imageHTML}
            <div class="blog-card-content">
                ${cfg.showIndex && !cfg.headerTemplate ? indexHTML : ''}
                <h3 class="blog-card-title">${cfg.titlePrefix}${article.title}</h3>
                <p class="blog-card-excerpt">${article.excerpt}</p>
                <div class="blog-card-meta">
                    <span class="blog-date">${cfg.dateWrapper ? cfg.dateWrapper.replace('{date}', date) : date}</span>
                    <span class="blog-reading-time">${cfg.readingTimePrefix || ''}${article.readingTime} min read</span>
                    ${newBadgeHTML}
                </div>
            </div>
            ${cornersHTML}
        `;

        // Call onRender callback if provided
        if (cfg.onRender) {
            cfg.onRender(card, article, index);
        }

        return card;
    }

    /**
     * Render projects to a grid element
     * @param {Array} projects - Array of project objects
     * @param {Object} config - Rendering configuration
     * @param {string} gridSelector - CSS selector for grid container
     */
    function renderProjects(projects, config = {}, gridSelector = '#projects-grid') {
        const grid = document.querySelector(gridSelector);
        if (!grid) return;

        // Hide loading
        const loading = grid.querySelector('.projects-grid-loading');
        if (loading) loading.style.display = 'none';

        // Clear and render
        grid.innerHTML = '';

        projects.forEach((project, index) => {
            const card = renderProjectCard(project, index, config);
            grid.appendChild(card);
        });

        console.log(`%c[OK] Rendered ${projects.length} project cards`, 'color: #33ff00;');
    }

    /**
     * Render blog cards to a grid element
     * @param {Array} articles - Array of article objects
     * @param {Object} config - Rendering configuration
     * @param {string} gridSelector - CSS selector for grid container
     */
    function renderBlogCards(articles, config = {}, gridSelector = '#blog-grid') {
        const grid = document.querySelector(gridSelector);
        if (!grid) return;

        // Hide loading
        const loading = grid.querySelector('.blog-grid-loading');
        if (loading) loading.style.display = 'none';

        // Clear and render
        grid.innerHTML = '';

        if (!articles || articles.length === 0) {
            grid.innerHTML = '<p class="no-articles">No articles yet. Check back soon!</p>';
            return;
        }

        articles.forEach((article, index) => {
            const card = renderBlogCard(article, index, config);
            grid.appendChild(card);
        });

        console.log(`%c[OK] Rendered ${articles.length} blog cards`, 'color: #33ff00;');
    }

    /**
     * Create a pre-configured renderer
     * @param {Object} config - Default configuration to use
     */
    function createRenderer(config = {}) {
        const mergedConfig = mergeConfig(config, defaultConfig);

        return {
            renderProjectCard: (project, index) => renderProjectCard(project, index, mergedConfig.project),
            renderBlogCard: (article, index) => renderBlogCard(article, index, mergedConfig.blog),
            renderProjects: (projects, gridSelector) => renderProjects(projects, mergedConfig.project, gridSelector),
            renderBlogCards: (articles, gridSelector) => renderBlogCards(articles, mergedConfig.blog, gridSelector),
            config: mergedConfig
        };
    }

    // Public API
    return {
        createMediaContent,
        renderProjectCard,
        renderBlogCard,
        renderProjects,
        renderBlogCards,
        createRenderer,
        defaultConfig
    };
})();

// Export for use in other modules
window.CardRenderer = CardRenderer;
