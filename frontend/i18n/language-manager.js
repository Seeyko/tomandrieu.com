/**
 * Language Manager Module
 * Handles internationalization for the portfolio website
 *
 * Features:
 * - Language detection: URL param > localStorage > browser > default
 * - Translation loading: Base translations + theme-specific translations
 * - Dynamic language switching with event emission
 */

const LanguageManager = (() => {
    // Configuration
    const SUPPORTED_LANGS = ['en', 'fr'];
    const DEFAULT_LANG = 'fr';
    const STORAGE_KEY = 'portfolio_lang';

    // Private state
    let currentLang = DEFAULT_LANG;
    let translations = {};
    let themeTranslations = {};
    let isLoaded = false;

    /**
     * Detect language from URL param > localStorage > browser > default
     */
    function detectLanguage() {
        // 1. Check URL parameter
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang');
        if (urlLang && SUPPORTED_LANGS.includes(urlLang)) {
            return urlLang;
        }

        // 2. Check localStorage
        try {
            const savedLang = localStorage.getItem(STORAGE_KEY);
            if (savedLang && SUPPORTED_LANGS.includes(savedLang)) {
                return savedLang;
            }
        } catch (e) {
            // localStorage not available
        }

        // 3. Check browser language
        const browserLang = navigator.language?.split('-')[0];
        if (browserLang && SUPPORTED_LANGS.includes(browserLang)) {
            return browserLang;
        }

        // 4. Default
        return DEFAULT_LANG;
    }

    /**
     * Get nested value from object using dot notation
     * @param {Object} obj - Source object
     * @param {string} path - Dot-notation path (e.g., "hero.title.0")
     */
    function getNestedValue(obj, path) {
        if (!obj || !path) return undefined;
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
     * Load base translations for a language
     * @param {string} langCode - Language code (en/fr)
     */
    async function loadTranslations(langCode) {
        try {
            const response = await fetch(`/i18n/locales/${langCode}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${langCode}`);
            }
            translations = await response.json();
            console.log(`%c[i18n] Loaded base translations: ${langCode}`, 'color: #33ff00;');
            return translations;
        } catch (err) {
            console.error(`%c[i18n] ${err.message}`, 'color: #ff3333;');
            // Fallback to empty translations
            translations = {};
            throw err;
        }
    }

    /**
     * Load theme-specific translations
     * @param {string} themeId - Theme identifier (terminal, retro90s, blueprint, default)
     * @param {string} langCode - Language code (en/fr)
     */
    async function loadThemeTranslations(themeId, langCode) {
        try {
            const response = await fetch(`/i18n/themes/${themeId}/${langCode}.json`);
            if (!response.ok) {
                throw new Error(`No theme translations for ${themeId}/${langCode}`);
            }
            themeTranslations = await response.json();
            console.log(`%c[i18n] Loaded theme translations: ${themeId}/${langCode}`, 'color: #33ff00;');
            return themeTranslations;
        } catch (err) {
            // Theme translations are optional
            console.log(`%c[i18n] No theme translations for ${themeId}`, 'color: #888;');
            themeTranslations = {};
            return themeTranslations;
        }
    }

    /**
     * Get translation by key with optional parameter interpolation
     * Tries theme translations first, then falls back to base translations
     * @param {string} key - Dot-notation key (e.g., "ui.loading")
     * @param {Object} params - Parameters for interpolation (e.g., { name: "Tom" })
     */
    function t(key, params = {}) {
        // Try theme translations first, then base translations
        let value = getNestedValue(themeTranslations, key) || getNestedValue(translations, key);

        // If not found, return the key itself
        if (value === undefined) {
            console.warn(`%c[i18n] Missing translation: ${key}`, 'color: #ffb000;');
            return key;
        }

        // Handle arrays (return as-is)
        if (Array.isArray(value)) {
            return value;
        }

        // Interpolate parameters: {name} -> params.name
        if (params && typeof value === 'string') {
            Object.keys(params).forEach(param => {
                value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
            });
        }

        return value;
    }

    /**
     * Update URL with language parameter (without page reload)
     * @param {string} langCode - Language code
     */
    function updateURL(langCode) {
        const url = new URL(window.location);
        url.searchParams.set('lang', langCode);
        window.history.replaceState({}, '', url);
    }

    /**
     * Save language preference to localStorage
     * @param {string} langCode - Language code
     */
    function saveLanguage(langCode) {
        try {
            localStorage.setItem(STORAGE_KEY, langCode);
        } catch (e) {
            // localStorage not available
        }
    }

    /**
     * Populate all elements with data-i18n attribute
     */
    function populateTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const value = t(key);

            if (value && typeof value === 'string') {
                // Process <highlight> tags to styled spans
                const processedValue = value
                    .replace(/<highlight>/g, '<span class="highlight">')
                    .replace(/<\/highlight>/g, '</span>');
                el.innerHTML = processedValue;
            }
        });
    }

    /**
     * Initialize the language manager
     * @returns {Promise<string>} The detected/loaded language code
     */
    async function init() {
        currentLang = detectLanguage();

        try {
            await loadTranslations(currentLang);
        } catch (err) {
            // If requested language fails, try default
            if (currentLang !== DEFAULT_LANG) {
                console.log(`%c[i18n] Falling back to ${DEFAULT_LANG}`, 'color: #ffb000;');
                currentLang = DEFAULT_LANG;
                await loadTranslations(DEFAULT_LANG);
            }
        }

        saveLanguage(currentLang);
        updateURL(currentLang);

        // Update HTML lang attribute
        document.documentElement.lang = currentLang;

        isLoaded = true;
        console.log(`%c[i18n] Language initialized: ${currentLang}`, 'color: #33ff00;');

        return currentLang;
    }

    /**
     * Switch to a different language
     * @param {string} langCode - Target language code
     * @returns {Promise<void>}
     */
    async function setLanguage(langCode) {
        if (!SUPPORTED_LANGS.includes(langCode)) {
            console.warn(`%c[i18n] Unsupported language: ${langCode}`, 'color: #ffb000;');
            return;
        }

        if (langCode === currentLang) {
            return;
        }

        currentLang = langCode;
        await loadTranslations(langCode);

        // Reload theme translations if a theme is active
        const themeId = window.ThemeManager?.getCurrentThemeId?.();
        if (themeId) {
            await loadThemeTranslations(themeId, langCode);
        }

        saveLanguage(langCode);
        updateURL(langCode);
        document.documentElement.lang = langCode;

        // Emit event for other modules to react
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { lang: langCode }
        }));

        console.log(`%c[i18n] Language changed to: ${langCode}`, 'color: #33ff00;');
    }

    /**
     * Get language display name
     * @param {string} langCode - Language code
     */
    function getLanguageName(langCode) {
        const names = {
            'en': 'English',
            'fr': 'Francais'
        };
        return names[langCode] || langCode;
    }

    /**
     * Format date according to current language
     * @param {string} dateString - ISO date string
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        const locale = currentLang === 'fr' ? 'fr-FR' : 'en-US';
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Public API
    return {
        // Initialization
        init,
        setLanguage,
        loadThemeTranslations,

        // Translation
        t,
        populateTranslations,
        formatDate,

        // Getters
        get currentLang() { return currentLang; },
        get isLoaded() { return isLoaded; },
        getLanguageName,

        // Constants
        SUPPORTED_LANGS,
        DEFAULT_LANG
    };
})();

// Export for global use
window.LanguageManager = LanguageManager;
