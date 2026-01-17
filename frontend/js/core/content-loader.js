/**
 * Content Loader Module
 * Handles loading data from JSON files and populating the DOM
 */

const ContentLoader = (() => {
    // Private state
    let siteContent = {};
    let projects = [];
    let articles = [];
    let isContentLoaded = false;
    let isProjectsLoaded = false;
    let isArticlesLoaded = false;

    /**
     * Get nested value from object using dot notation
     * @param {Object} obj - Source object
     * @param {string} path - Dot-notation path (e.g., "hero.title.0")
     */
    function getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            if (current && typeof current === 'object') {
                if (!isNaN(key)) {
                    return current[parseInt(key)];
                }
                return current[key];
            }
            return undefined;
        }, obj);
    }

    /**
     * Get the API base URL from config
     */
    function getApiBaseUrl() {
        if (window.APP_CONFIG && window.APP_CONFIG.API_URL) {
            return window.APP_CONFIG.API_URL;
        }
        return '';
    }

    /**
     * Load site content from JSON
     */
    async function loadContent() {
        if (isContentLoaded) return siteContent;

        try {
            const response = await fetch('/data/content.json');
            if (!response.ok) throw new Error('Failed to fetch content');
            siteContent = await response.json();
            isContentLoaded = true;
            console.log('%c[OK] Site content loaded', 'color: #33ff00;');
            return siteContent;
        } catch (err) {
            console.error('%c[ERR] ' + err.message, 'color: #ff3333;');
            throw err;
        }
    }

    /**
     * Populate dynamic content from loaded JSON
     */
    function populateContent() {
        if (!siteContent || Object.keys(siteContent).length === 0) {
            console.warn('[WARN] No content to populate');
            return;
        }

        // Populate specs
        const specsContainer = document.getElementById('about-specs');
        if (specsContainer && siteContent.about?.specs) {
            specsContainer.innerHTML = Object.entries(siteContent.about.specs)
                .map(([key, value]) => `
                    <div class="spec-row">
                        <span class="spec-key">${key.toUpperCase()}:</span>
                        <span class="spec-val">${value}</span>
                    </div>
                `).join('');
        }

        // Populate tech stack
        const techGrid = document.getElementById('tech-grid');
        if (techGrid && siteContent.techStack) {
            techGrid.innerHTML = siteContent.techStack
                .map(tech => `<span class="tech-tag">${tech}</span>`)
                .join('');
        }

        // Populate social links
        const socialLinks = document.getElementById('social-links');
        if (socialLinks && siteContent.contact?.social) {
            socialLinks.innerHTML = Object.entries(siteContent.contact.social)
                .map(([name, url]) => `
                    <a href="${url}" class="social-btn" target="_blank" rel="noopener noreferrer">
                        <span class="link-bracket">[</span>
                        <span>${name.toUpperCase()}</span>
                        <span class="link-bracket">]</span>
                    </a>
                `).join('');
        }

        // Update email link
        const emailLink = document.getElementById('email-link');
        if (emailLink && siteContent.contact?.email) {
            emailLink.href = `mailto:${siteContent.contact.email}`;
            const emailText = emailLink.querySelector('.email-text');
            if (emailText) {
                emailText.textContent = siteContent.contact.email.toUpperCase();
            }
        }

        // Update elements with data-content attribute
        document.querySelectorAll('[data-content]').forEach(el => {
            const path = el.dataset.content;
            const value = getNestedValue(siteContent, path);
            if (value) {
                // Convert <highlight> tags to styled spans
                const processedValue = value
                    .replace(/<highlight>/g, '<span class="highlight">')
                    .replace(/<\/highlight>/g, '</span>');
                el.innerHTML = processedValue;
            }
        });
    }

    /**
     * Load and populate content in one call
     */
    async function loadAndPopulate() {
        await loadContent();
        populateContent();
        return siteContent;
    }

    /**
     * Load projects from JSON
     */
    async function loadProjects() {
        if (isProjectsLoaded) return projects;

        try {
            const response = await fetch('/data/projects.json');
            if (!response.ok) throw new Error('Failed to fetch projects');
            projects = await response.json();

            // Normalize asset paths
            projects = projects.map(project => ({
                ...project,
                images: project.images?.map(img =>
                    img.startsWith('/') ? img : `/assets/${img.replace('assets/', '')}`
                ),
                video: project.video
                    ? (project.video.startsWith('/') ? project.video : `/assets/${project.video.replace('assets/', '')}`)
                    : null
            }));

            isProjectsLoaded = true;
            console.log(`%c[OK] Loaded ${projects.length} projects`, 'color: #33ff00;');
            return projects;
        } catch (err) {
            console.error('%c[ERR] ' + err.message, 'color: #ff3333;');
            throw err;
        }
    }

    /**
     * Load articles from API
     * @param {number} page - Page number (default 1)
     * @param {number} limit - Items per page (default 6)
     */
    async function loadArticles(page = 1, limit = 6) {
        const apiBase = getApiBaseUrl();
        try {
            const response = await fetch(`${apiBase}/api/articles?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch articles from API');

            const data = await response.json();
            articles = (data.articles || []).map(article => ({
                ...article,
                coverImage: article.coverImage ? `${apiBase}${article.coverImage}` : null
            }));

            data.articles = articles;
            isArticlesLoaded = true;
            console.log(`%c[OK] Loaded ${articles.length} articles from API`, 'color: #33ff00;');
            return data;
        } catch (err) {
            console.error('%c[ERR] API unavailable: ' + err.message, 'color: #ff3333;');
            console.warn('%c[WARN] Make sure the backend is running', 'color: #ffb000;');
            return {
                articles: [],
                pagination: { page: 1, limit: 6, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
            };
        }
    }

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Public API
    return {
        loadContent,
        loadAndPopulate,
        loadProjects,
        loadArticles,
        populateContent,
        formatDate,
        getNestedValue,
        get content() { return siteContent; },
        get projects() { return projects; },
        get articles() { return articles; },
        get isLoaded() { return isContentLoaded; }
    };
})();

// Export for use in other modules
window.ContentLoader = ContentLoader;
