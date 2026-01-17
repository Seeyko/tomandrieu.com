/**
 * Content Loader Module
 * Loads JSON data and populates the DOM
 */

const ContentLoader = (() => {
    let siteContent = {};
    let projects = [];
    let articles = [];
    let loaded = { content: false, projects: false, articles: false };

    const getCurrentLang = () => window.LanguageManager?.currentLang || 'fr';

    async function loadContent() {
        if (loaded.content) return siteContent;

        const lang = getCurrentLang();
        const response = await fetch(`/data/${lang}/content.json`);
        if (!response.ok) throw new Error('Failed to fetch content');

        siteContent = await response.json();
        loaded.content = true;
        console.log(`%c[OK] Content loaded (${lang})`, 'color: #33ff00;');
        return siteContent;
    }

    function populateContent() {
        if (!siteContent || !Object.keys(siteContent).length) return;

        // Specs
        const specs = document.getElementById('about-specs');
        if (specs && siteContent.about?.specs) {
            specs.innerHTML = Object.entries(siteContent.about.specs)
                .map(([k, v]) => `<div class="spec-row"><span class="spec-key">${k.toUpperCase()}:</span><span class="spec-val">${v}</span></div>`)
                .join('');
        }

        // Tech stack
        const tech = document.getElementById('tech-grid');
        if (tech && siteContent.techStack) {
            tech.innerHTML = siteContent.techStack.map(t => `<span class="tech-tag">${t}</span>`).join('');
        }

        // Social links
        const social = document.getElementById('social-links');
        if (social && siteContent.contact?.social) {
            social.innerHTML = Object.entries(siteContent.contact.social)
                .map(([name, url]) => `<a href="${url}" class="social-btn" target="_blank" rel="noopener noreferrer"><span class="link-bracket">[</span><span>${name.toUpperCase()}</span><span class="link-bracket">]</span></a>`)
                .join('');
        }

        // Email
        const email = document.getElementById('email-link');
        if (email && siteContent.contact?.email) {
            email.href = `mailto:${siteContent.contact.email}`;
            const text = email.querySelector('.email-text');
            if (text) text.textContent = siteContent.contact.email.toUpperCase();
        }

        // Data-content elements
        document.querySelectorAll('[data-content]').forEach(el => {
            const value = Utils.getNestedValue(siteContent, el.dataset.content);
            if (value) {
                el.innerHTML = value
                    .replace(/<highlight>/g, '<span class="highlight">')
                    .replace(/<\/highlight>/g, '</span>');
            }
        });
    }

    async function loadAndPopulate() {
        if (window.LanguageManager && !LanguageManager.isLoaded) {
            await LanguageManager.init();
        }
        await loadContent();
        if (window.LanguageManager?.isLoaded) {
            LanguageManager.populateTranslations();
        }
        populateContent();
        return siteContent;
    }

    async function loadProjects() {
        if (loaded.projects) return projects;

        const lang = getCurrentLang();
        const response = await fetch(`/data/${lang}/projects.json`);
        if (!response.ok) throw new Error('Failed to fetch projects');

        projects = (await response.json()).map(p => ({
            ...p,
            images: p.images?.map(img => img.startsWith('/') ? img : `/assets/${img.replace('assets/', '')}`),
            video: p.video ? (p.video.startsWith('/') ? p.video : `/assets/${p.video.replace('assets/', '')}`) : null
        }));

        loaded.projects = true;
        console.log(`%c[OK] Loaded ${projects.length} projects (${lang})`, 'color: #33ff00;');
        return projects;
    }

    async function loadArticles(page = 1, limit = 6, lang = null) {
        const apiBase = Utils.getApiBaseUrl();
        const language = lang || getCurrentLang();

        try {
            const response = await fetch(`${apiBase}/api/articles?page=${page}&limit=${limit}&lang=${language}`);
            if (!response.ok) throw new Error('Failed to fetch articles');

            const data = await response.json();
            articles = (data.articles || []).map(a => ({
                ...a,
                coverImage: a.coverImage ? `${apiBase}${a.coverImage}` : null
            }));
            data.articles = articles;
            loaded.articles = true;
            console.log(`%c[OK] Loaded ${articles.length} articles (${language})`, 'color: #33ff00;');
            return data;
        } catch (err) {
            console.error('%c[ERR] API unavailable', 'color: #ff3333;');
            return { articles: [], pagination: { page: 1, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
        }
    }

    function formatDate(dateString) {
        if (window.LanguageManager?.isLoaded) {
            return LanguageManager.formatDate(dateString);
        }
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function resetCache() {
        siteContent = {};
        projects = [];
        articles = [];
        loaded = { content: false, projects: false, articles: false };
    }

    return {
        loadContent,
        loadAndPopulate,
        loadProjects,
        loadArticles,
        formatDate,
        resetCache,
        get content() { return siteContent; },
        get projects() { return projects; },
        get articles() { return articles; },
        get isLoaded() { return loaded.content; }
    };
})();

window.ContentLoader = ContentLoader;
