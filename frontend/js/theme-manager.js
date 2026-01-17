/**
 * Theme Manager - Portfolio theme switching system
 */

const ThemeManager = (() => {
    const THEMES = {
        default: { id: 'default', name: 'Default', description: 'Clean & Minimal', css: '/themes/default/default.css', js: '/themes/default/default.js', icon: '✦' },
        terminal: { id: 'terminal', name: 'Terminal CLI', description: 'Cyber-Industrial Hacker Aesthetic', css: '/themes/terminal/terminal.css', js: '/themes/terminal/terminal.js', icon: '💻' },
        blueprint: { id: 'blueprint', name: 'Blueprint', description: 'Technical Drawing Aesthetic', css: '/themes/blueprint/blueprint.css', js: '/themes/blueprint/blueprint.js', icon: '📐' },
        retro90s: { id: 'retro90s', name: 'Retro 90s', description: 'GeoCities Nostalgia Vibes', css: '/themes/retro90s/retro90s.css', js: '/themes/retro90s/retro90s.js', icon: '🌈' }
    };

    const DEFAULT_THEME = 'default';
    const STORAGE_KEY = 'portfolio_theme';
    let currentThemeId = null;

    const getFromURL = () => new URLSearchParams(window.location.search).get('theme');
    const getSaved = () => { try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME; } catch { return DEFAULT_THEME; } };
    const save = id => { try { localStorage.setItem(STORAGE_KEY, id); } catch {} };

    function hideLoading() {
        const el = document.getElementById('loading-screen');
        if (el) { el.classList.add('hidden'); setTimeout(() => el.remove(), 500); }
        document.body.classList.remove('loading');
    }

    async function loadCSS(theme) {
        const link = document.getElementById('theme-css');
        if (!link) throw new Error('Theme CSS link not found');
        if (link.href?.endsWith(theme.css)) return;
        return new Promise((res, rej) => { link.onload = res; link.onerror = rej; link.href = theme.css; });
    }

    async function loadJS(theme) {
        document.getElementById('theme-js')?.remove();
        const script = document.createElement('script');
        script.id = 'theme-js';
        script.src = theme.js + (window.location.hostname === 'localhost' ? `?v=${Date.now()}` : '');
        return new Promise((res, rej) => { script.onload = res; script.onerror = rej; document.body.appendChild(script); });
    }

    async function apply(themeId) {
        const theme = THEMES[themeId] || THEMES[DEFAULT_THEME];
        document.body.dataset.theme = themeId;
        currentThemeId = themeId;

        try {
            await loadCSS(theme);
            if (window.LanguageManager?.isLoaded) await LanguageManager.loadThemeTranslations(themeId, LanguageManager.currentLang);
            await loadJS(theme);
            console.log(`%c[THEME] Loaded: ${theme.name}`, 'color: #33ff00;');
        } catch (e) {
            console.error('Failed to load theme:', e);
        }

        const url = new URL(window.location);
        url.searchParams.set('theme', themeId);
        window.history.replaceState({}, '', url);
        save(themeId);
        hideLoading();
    }

    function switchTheme(id) {
        if (id === currentThemeId) return;
        const url = new URL(window.location);
        url.searchParams.set('theme', id);
        window.location.href = url.toString();
    }

    function createSwitcher() {
        if (document.getElementById('theme-switcher-container')) return;

        const container = document.createElement('div');
        container.id = 'theme-switcher-container';
        container.className = 'theme-switcher';
        container.innerHTML = `
            <button class="theme-switcher-toggle" aria-label="Switch theme">🎨</button>
            <div class="theme-switcher-menu">
                ${Object.values(THEMES).map(t => `
                    <button class="theme-option ${t.id === currentThemeId ? 'active' : ''}" data-theme="${t.id}" title="${t.description}">
                        <span class="theme-icon">${t.icon}</span>
                        <span class="theme-name">${t.name}</span>
                    </button>
                `).join('')}
            </div>
        `;

        const toggle = container.querySelector('.theme-switcher-toggle');
        const menu = container.querySelector('.theme-switcher-menu');

        toggle.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('open'); });
        container.querySelectorAll('.theme-option').forEach(o => o.addEventListener('click', e => { e.stopPropagation(); switchTheme(o.dataset.theme); }));
        document.addEventListener('click', () => menu.classList.remove('open'));

        const target = document.querySelector('.header .nav') || document.querySelector('.header');
        target ? target.after?.(container) || target.appendChild(container) : document.body.appendChild(container);
    }

    function init() {
        const timeout = setTimeout(() => { console.warn('[THEME] Timeout'); hideLoading(); }, 3000);
        const themeId = THEMES[getFromURL() || getSaved()] ? (getFromURL() || getSaved()) : DEFAULT_THEME;
        apply(themeId).then(() => clearTimeout(timeout));
        createSwitcher();
    }

    return { init, switchTheme, getCurrentThemeId: () => currentThemeId || getSaved() };
})();

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', ThemeManager.init)
    : ThemeManager.init();

window.ThemeManager = ThemeManager;
