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
     * Get current language code
     */
    function getCurrentLang() {
        return (window.LanguageManager?.currentLang) || 'fr';
    }

    /**
     * Load site content from language-specific JSON
     */
    async function loadContent() {
        if (isContentLoaded) return siteContent;

        const lang = getCurrentLang();
        try {
            // Try language-specific path first
            let response = await fetch(`/data/${lang}/content.json`);
            if (!response.ok) {
                // Fallback to default content.json
                response = await fetch('/data/content.json');
            }
            if (!response.ok) throw new Error('Failed to fetch content');
            siteContent = await response.json();
            isContentLoaded = true;
            console.log(`%c[OK] Site content loaded (lang: ${lang})`, 'color: #33ff00;');
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
     * Populate elements with data-i18n attribute from translations
     */
    function populateTranslations() {
        // Check if LanguageManager is available
        if (window.LanguageManager && LanguageManager.isLoaded) {
            LanguageManager.populateTranslations();
        }
    }

    /**
     * Load and populate content in one call
     * Initializes i18n first if LanguageManager is available
     */
    async function loadAndPopulate() {
        // Initialize language manager first (if available)
        if (window.LanguageManager && !LanguageManager.isLoaded) {
            await LanguageManager.init();
        }

        // Load legacy content.json (for non-translated data like URLs, emails)
        await loadContent();

        // Populate translations (data-i18n attributes)
        populateTranslations();

        // Populate legacy content (data-content attributes for non-translatable data)
        populateContent();

        return siteContent;
    }

    /**
     * Load projects from language-specific JSON
     */
    async function loadProjects() {
        if (isProjectsLoaded) return projects;

        const lang = getCurrentLang();
        try {
            // Try language-specific path first
            let response = await fetch(`/data/${lang}/projects.json`);
            if (!response.ok) {
                // Fallback to default projects.json
                response = await fetch('/data/projects.json');
            }
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
            console.log(`%c[OK] Loaded ${projects.length} projects (lang: ${lang})`, 'color: #33ff00;');
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
     * @param {string} lang - Language code (optional, defaults to current language)
     */
    async function loadArticles(page = 1, limit = 6, lang = null) {
        const apiBase = getApiBaseUrl();
        // Get language from LanguageManager if not specified
        const language = lang || (window.LanguageManager?.currentLang) || 'fr';

        try {
            const response = await fetch(`${apiBase}/api/articles?page=${page}&limit=${limit}&lang=${language}`);
            if (!response.ok) throw new Error('Failed to fetch articles from API');

            const data = await response.json();
            articles = (data.articles || []).map(article => ({
                ...article,
                coverImage: article.coverImage ? `${apiBase}${article.coverImage}` : null
            }));

            data.articles = articles;
            isArticlesLoaded = true;
            console.log(`%c[OK] Loaded ${articles.length} articles from API (lang: ${language})`, 'color: #33ff00;');
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
     * Format date for display using current locale
     * @param {string} dateString - ISO date string
     */
    function formatDate(dateString) {
        // Use LanguageManager's formatDate if available for locale-aware formatting
        if (window.LanguageManager && LanguageManager.isLoaded) {
            return LanguageManager.formatDate(dateString);
        }
        // Fallback to English
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Reset cache (useful when language changes)
     */
    function resetCache() {
        siteContent = {};
        projects = [];
        articles = [];
        isContentLoaded = false;
        isProjectsLoaded = false;
        isArticlesLoaded = false;
    }

    // Public API
    return {
        loadContent,
        loadAndPopulate,
        loadProjects,
        loadArticles,
        populateContent,
        populateTranslations,
        formatDate,
        getNestedValue,
        resetCache,
        get content() { return siteContent; },
        get projects() { return projects; },
        get articles() { return articles; },
        get isLoaded() { return isContentLoaded; }
    };
})();

// Export for use in other modules
window.ContentLoader = ContentLoader;
