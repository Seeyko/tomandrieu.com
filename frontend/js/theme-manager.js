/**
 * ═══════════════════════════════════════════════════════════════
 * THEME MANAGER - Portfolio Theme Switching System
 * Uses query params (?theme=xxx) for theme selection
 * ═══════════════════════════════════════════════════════════════
 */

const ThemeManager = (function() {
    // Available themes configuration
    const THEMES = {
        default: {
            id: 'default',
            name: 'Default',
            description: 'Clean & Minimal',
            css: '/themes/default/default.css',
            js: '/themes/default/default.js',
            icon: '✦'
        },
        terminal: {
            id: 'terminal',
            name: 'Terminal CLI',
            description: 'Cyber-Industrial Hacker Aesthetic',
            css: '/themes/terminal/terminal.css',
            js: '/themes/terminal/terminal.js',
            icon: '💻'
        },
        blueprint: {
            id: 'blueprint',
            name: 'Blueprint',
            description: 'Technical Drawing Aesthetic',
            css: '/themes/blueprint/blueprint.css',
            js: '/themes/blueprint/blueprint.js',
            icon: '📐'
        },
        retro90s: {
            id: 'retro90s',
            name: 'Retro 90s',
            description: 'GeoCities Nostalgia Vibes',
            css: '/themes/retro90s/retro90s.css',
            js: '/themes/retro90s/retro90s.js',
            icon: '🌈'
        }
    };

    // Default theme
    const DEFAULT_THEME = 'default';
    
    // Storage key for persisting theme preference
    const STORAGE_KEY = 'portfolio_theme';

    // Current theme ID
    let currentThemeId = null;

    /**
     * Get theme from URL query param
     */
    function getThemeFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('theme');
    }

    /**
     * Get the currently saved theme from localStorage
     */
    function getSavedTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return DEFAULT_THEME;
        }
    }

    /**
     * Save the theme preference to localStorage
     */
    function saveTheme(themeId) {
        try {
            localStorage.setItem(STORAGE_KEY, themeId);
        } catch (e) {
            console.warn('Failed to save theme preference:', e);
        }
    }

    /**
     * Get theme configuration by ID
     */
    function getTheme(themeId) {
        return THEMES[themeId] || THEMES[DEFAULT_THEME];
    }

    /**
     * Get all available themes
     */
    function getAllThemes() {
        return Object.values(THEMES);
    }

    /**
     * Get current theme ID
     */
    function getCurrentThemeId() {
        return currentThemeId || getSavedTheme();
    }

    /**
     * Update URL with theme param without page reload
     */
    function updateURL(themeId) {
        const url = new URL(window.location);
        url.searchParams.set('theme', themeId);
        window.history.replaceState({}, '', url);
    }

    /**
     * Load theme CSS
     * Returns a Promise that resolves when CSS is loaded
     */
    function loadThemeCSS(theme) {
        return new Promise((resolve, reject) => {
            const cssLink = document.getElementById('theme-css');
            if (!cssLink) {
                reject(new Error('Theme CSS link element not found'));
                return;
            }

            // If already loaded with same href, resolve immediately
            if (cssLink.href && cssLink.href.endsWith(theme.css)) {
                resolve();
                return;
            }

            cssLink.onload = () => resolve();
            cssLink.onerror = () => reject(new Error(`Failed to load CSS: ${theme.css}`));
            cssLink.href = theme.css;
        });
    }

    /**
     * Hide loading screen and reveal content
     */
    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            // Remove from DOM after transition
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }
        document.body.classList.remove('loading');
    }

    /**
     * Load theme JS
     */
    function loadThemeJS(theme) {
        return new Promise((resolve, reject) => {
            // Remove existing theme script if any
            const existingScript = document.getElementById('theme-js');
            if (existingScript && existingScript.src) {
                existingScript.remove();
            }

            const script = document.createElement('script');
            script.id = 'theme-js';
            // Add cache-busting for development
            const cacheBuster = window.location.hostname === 'localhost' ? `?v=${Date.now()}` : '';
            script.src = theme.js + cacheBuster;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    /**
     * Apply theme to page
     */
    async function applyTheme(themeId) {
        const theme = getTheme(themeId);
        if (!theme) {
            console.error(`Theme "${themeId}" not found`);
            hideLoadingScreen();
            return;
        }

        // Update body data attribute
        document.body.dataset.theme = themeId;
        currentThemeId = themeId;

        try {
            // Load theme CSS and wait for it
            await loadThemeCSS(theme);
            console.log(`%c[THEME] CSS loaded: ${theme.css}`, 'color: #33ff00;');

            // Load theme translations (if LanguageManager is available)
            if (window.LanguageManager && LanguageManager.isLoaded) {
                await LanguageManager.loadThemeTranslations(themeId, LanguageManager.currentLang);
            }

            // Load theme JS
            await loadThemeJS(theme);
            console.log(`%c[THEME] Loaded: ${theme.name}`, 'color: #33ff00;');
        } catch (e) {
            console.error(`Failed to load theme: ${e}`);
        }

        // Update URL
        updateURL(themeId);

        // Save preference
        saveTheme(themeId);

        // Hide loading screen and reveal content
        hideLoadingScreen();
    }

    /**
     * Switch to a different theme
     */
    function switchTheme(themeId) {
        if (themeId === currentThemeId) return;
        
        // For a clean switch, we need to reload the page with new theme param
        const url = new URL(window.location);
        url.searchParams.set('theme', themeId);
        window.location.href = url.toString();
    }

    /**
     * Create theme switcher UI
     */
    function createThemeSwitcher() {
        // Don't create if already exists
        if (document.getElementById('theme-switcher-container')) return;

        const container = document.createElement('div');
        container.id = 'theme-switcher-container';
        container.className = 'theme-switcher';

        const themes = getAllThemes();
        const currentId = getCurrentThemeId();

        container.innerHTML = `
            <button class="theme-switcher-toggle" aria-label="Switch theme" title="Switch theme">
                🎨
            </button>
            <div class="theme-switcher-menu">
                ${themes.map(theme => `
                    <button 
                        class="theme-option ${theme.id === currentId ? 'active' : ''}" 
                        data-theme="${theme.id}"
                        title="${theme.description}"
                    >
                        <span class="theme-icon">${theme.icon}</span>
                        <span class="theme-name">${theme.name}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Add event listeners
        const toggle = container.querySelector('.theme-switcher-toggle');
        const menu = container.querySelector('.theme-switcher-menu');
        const options = container.querySelectorAll('.theme-option');

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
        });

        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const themeId = option.dataset.theme;
                switchTheme(themeId);
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', () => {
            menu.classList.remove('open');
        });

        // Insert after nav in header
        const nav = document.querySelector('.header .nav');
        if (nav) {
            nav.after(container);
        } else {
            // Fallback to header or body
            const header = document.querySelector('.header');
            if (header) {
                header.appendChild(container);
            } else {
                document.body.appendChild(container);
            }
        }
    }

    /**
     * Initialize theme manager
     */
    function init() {
        // Fallback timeout to hide loading screen in case of errors (3 seconds max)
        const loadingTimeout = setTimeout(() => {
            console.warn('[THEME] Loading timeout reached, forcing reveal');
            hideLoadingScreen();
        }, 3000);

        // Determine which theme to use (URL param > localStorage > default)
        const urlTheme = getThemeFromURL();
        const savedTheme = getSavedTheme();
        const themeToLoad = urlTheme || savedTheme;

        // Validate theme
        const validTheme = THEMES[themeToLoad] ? themeToLoad : DEFAULT_THEME;

        // Apply theme (this will hide loading screen when done)
        applyTheme(validTheme).then(() => {
            clearTimeout(loadingTimeout);
        });

        // Create theme switcher UI
        createThemeSwitcher();

        console.log(`%c[THEME MANAGER] Initialized with theme: ${validTheme}`, 'color: #00FFFF;');
    }

    // Public API
    return {
        THEMES,
        init,
        getSavedTheme,
        saveTheme,
        getTheme,
        getAllThemes,
        switchTheme,
        getCurrentThemeId,
        applyTheme
    };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ThemeManager.init);
} else {
    ThemeManager.init();
}

// Export
window.ThemeManager = ThemeManager;
