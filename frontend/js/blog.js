/**
 * ═══════════════════════════════════════════════════════════════
 * BLOG PAGE - Handles listing and article views
 * ═══════════════════════════════════════════════════════════════
 */

// ─── State ───
let currentPage = 1;
const ITEMS_PER_PAGE = 6;

/**
 * Get the API base URL from config
 * Uses window.APP_CONFIG.API_URL set by config.js
 */
function getApiBaseUrl() {
    // Use config if available, otherwise fall back to same-origin
    if (window.APP_CONFIG && window.APP_CONFIG.API_URL) {
        return window.APP_CONFIG.API_URL;
    }
    // Fallback: same-origin (relative paths)
    return '';
}

/**
 * Check if running in local development mode
 */
function isLocalDev() {
    return window.location.hostname === 'localhost' && window.location.port === '8000';
}

/**
 * Get current view type and slug from URL
 */
function getViewFromURL() {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    // Check path-based slug first (works for both local dev and production)
    const match = path.match(/^\/blog\/([^\/]+)\/?$/);
    if (match && match[1]) {
        return { view: 'article', slug: match[1] };
    }

    // Fallback: check for slug query param
    const slugParam = params.get('slug');
    if (slugParam) {
        return { view: 'article', slug: slugParam };
    }

    // Check for page param
    const page = parseInt(params.get('page')) || 1;

    return { view: 'listing', page };
}

/**
 * Fetch article by slug
 */
async function fetchArticle(slug) {
    const apiBase = getApiBaseUrl();
    try {
        const response = await fetch(`${apiBase}/api/articles/${slug}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error('Failed to fetch article');
        }
        const data = await response.json();
        // Fix coverImage path - prepend API base URL for local development
        if (data.article && data.article.coverImage) {
            data.article.coverImage = `${apiBase}${data.article.coverImage}`;
        }
        return data.article;
    } catch (err) {
        console.error('%c[ERR] ' + err.message, 'color: #ff3333;');
        return null;
    }
}

/**
 * Fetch paginated articles
 */
async function fetchArticles(page = 1, limit = ITEMS_PER_PAGE) {
    const apiBase = getApiBaseUrl();
    try {
        const response = await fetch(`${apiBase}/api/articles?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch articles');
        const data = await response.json();
        // Fix coverImage paths - prepend API base URL for local development
        if (data.articles) {
            data.articles = data.articles.map(article => ({
                ...article,
                coverImage: article.coverImage ? `${apiBase}${article.coverImage}` : null
            }));
        }
        return data;
    } catch (err) {
        console.error('%c[ERR] ' + err.message, 'color: #ff3333;');
        return { articles: [], pagination: { page: 1, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
    }
}

/**
 * Render article list
 */
function renderArticleList(articles) {
    const container = document.getElementById('blog-list');
    if (!container) return;

    // Hide loading
    const loading = container.querySelector('.blog-list-loading');
    if (loading) loading.style.display = 'none';

    if (!articles || articles.length === 0) {
        container.innerHTML = '<p class="no-articles">No articles yet. Check back soon!</p>';
        return;
    }

    container.innerHTML = articles.map((article, index) => {
        const date = formatDate(article.publishedAt);
        // Always use clean URLs (dev server supports URL rewriting)
        const articleUrl = `/blog/${article.slug}/`;
        return `
            <a href="${articleUrl}" class="blog-list-card fade-in-up" style="animation-delay: ${index * 0.1}s">
                <div class="blog-list-card-image">
                    ${article.coverImage
                        ? `<img src="${article.coverImage}" alt="${article.title}" loading="lazy">`
                        : '<div class="blog-list-card-placeholder"></div>'}
                </div>
                <div class="blog-list-card-content">
                    <h2 class="blog-list-card-title">${article.title}</h2>
                    <p class="blog-list-card-excerpt">${article.excerpt}</p>
                    <div class="blog-list-card-meta">
                        <span class="blog-list-date">${date}</span>
                        <span class="meta-separator">|</span>
                        <span class="blog-list-reading-time">${article.readingTime} min read</span>
                    </div>
                </div>
            </a>
        `;
    }).join('');

    // Trigger animations
    initListAnimations();
}

/**
 * Render pagination controls
 */
function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    if (!container || pagination.totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    const { page, totalPages, hasNext, hasPrev } = pagination;
    const baseUrl = '/blog/';

    let html = '<div class="pagination-controls">';

    // Previous button
    if (hasPrev) {
        html += `<a href="${baseUrl}?page=${page - 1}" class="pagination-btn prev" data-page="${page - 1}">&larr; Prev</a>`;
    } else {
        html += `<span class="pagination-btn prev disabled">&larr; Prev</span>`;
    }

    // Page numbers
    html += '<div class="pagination-numbers">';
    for (let i = 1; i <= totalPages; i++) {
        if (i === page) {
            html += `<span class="pagination-num active">${i}</span>`;
        } else {
            html += `<a href="${baseUrl}?page=${i}" class="pagination-num" data-page="${i}">${i}</a>`;
        }
    }
    html += '</div>';

    // Next button
    if (hasNext) {
        html += `<a href="${baseUrl}?page=${page + 1}" class="pagination-btn next" data-page="${page + 1}">Next &rarr;</a>`;
    } else {
        html += `<span class="pagination-btn next disabled">Next &rarr;</span>`;
    }

    html += '</div>';
    container.innerHTML = html;

    // Add click handlers for SPA-like navigation
    container.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const newPage = parseInt(link.dataset.page);
            navigateToPage(newPage);
        });
    });
}

/**
 * Navigate to a page (updates URL and re-renders)
 */
async function navigateToPage(page) {
    currentPage = page;
    window.history.pushState({}, '', `/blog/?page=${page}`);

    const data = await fetchArticles(page);
    renderArticleList(data.articles);
    renderPagination(data.pagination);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Render article detail view
 */
function renderArticle(article) {
    // Hide listing, show article
    document.getElementById('blog-listing').style.display = 'none';
    document.getElementById('article-view').style.display = 'block';

    // Update page title
    document.title = `${article.title} - Tom Andrieu`;

    // Populate content
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-date').textContent = formatDate(article.publishedAt);
    document.getElementById('article-reading-time').textContent = `${article.readingTime} min read`;
    document.getElementById('article-content').innerHTML = article.content;

    // Cover image
    const coverContainer = document.getElementById('article-cover');
    if (article.coverImage) {
        coverContainer.innerHTML = `<img src="${article.coverImage}" alt="${article.title}" class="article-cover-img">`;
        coverContainer.style.display = 'block';
    } else {
        coverContainer.style.display = 'none';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    console.log(`%c[OK] Article loaded: ${article.title}`, 'color: #33ff00;');
}

/**
 * Show 404 not found view
 */
function showNotFound() {
    const container = document.getElementById('blog-list');
    if (container) {
        container.innerHTML = `
            <div class="not-found">
                <h2>Article Not Found</h2>
                <p>Sorry, the article you're looking for doesn't exist.</p>
                <a href="/blog/" class="back-link">&larr; Back to Blog</a>
            </div>
        `;
    }
    document.getElementById('pagination').innerHTML = '';
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Initialize animations for list items
 */
function initListAnimations() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.utils.toArray('.blog-list-card').forEach((card, i) => {
            gsap.fromTo(card,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    delay: i * 0.1,
                    ease: 'power3.out'
                }
            );
        });
    }
}

/**
 * Initialize blog page
 */
async function initBlog() {
    const { view, slug, page } = getViewFromURL();

    if (view === 'article' && slug) {
        // Load single article
        const article = await fetchArticle(slug);
        if (article) {
            renderArticle(article);
        } else {
            showNotFound();
        }
    } else {
        // Load article listing
        currentPage = page || 1;
        const data = await fetchArticles(currentPage);
        renderArticleList(data.articles);
        renderPagination(data.pagination);
    }

    // Remove loading state
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');

    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
}

// Handle browser back/forward
window.addEventListener('popstate', () => {
    const { view, slug, page } = getViewFromURL();

    if (view === 'article' && slug) {
        fetchArticle(slug).then(article => {
            if (article) {
                renderArticle(article);
            } else {
                showNotFound();
            }
        });
    } else {
        document.getElementById('blog-listing').style.display = 'block';
        document.getElementById('article-view').style.display = 'none';
        document.title = 'Blog - Tom Andrieu';

        fetchArticles(page || 1).then(data => {
            renderArticleList(data.articles);
            renderPagination(data.pagination);
        });
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlog);
} else {
    initBlog();
}
