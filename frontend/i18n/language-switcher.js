/**
 * Language Switcher UI - Dropdown to switch languages
 */

const LanguageSwitcher = (() => {
    let container = null;

    function create() {
        if (document.getElementById('language-switcher')) return;

        const lang = LanguageManager.currentLang;
        const langs = LanguageManager.SUPPORTED_LANGS;

        container = document.createElement('div');
        container.id = 'language-switcher';
        container.className = 'language-switcher';
        container.innerHTML = `
            <button class="language-switcher-toggle" aria-label="Switch language">
                <span class="lang-current">${lang.toUpperCase()}</span>
                <span class="lang-arrow">&#9662;</span>
            </button>
            <div class="language-switcher-menu">
                ${langs.map(l => `
                    <button class="language-option ${l === lang ? 'active' : ''}" data-lang="${l}">
                        <span class="lang-flag">${l.toUpperCase()}</span>
                        <span class="lang-name">${LanguageManager.getLanguageName(l)}</span>
                    </button>
                `).join('')}
            </div>
        `;

        const toggle = container.querySelector('.language-switcher-toggle');
        const menu = container.querySelector('.language-switcher-menu');

        toggle.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('open'); });

        container.querySelectorAll('.language-option').forEach(opt => {
            opt.addEventListener('click', async e => {
                e.stopPropagation();
                const code = opt.dataset.lang;
                toggle.querySelector('.lang-current').textContent = code.toUpperCase();
                container.querySelectorAll('.language-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                menu.classList.remove('open');
                await LanguageManager.setLanguage(code);
                window.location.reload();
            });
        });

        document.addEventListener('click', () => menu.classList.remove('open'));

        // Insert next to theme switcher or in header
        const target = document.getElementById('theme-switcher-container') || document.querySelector('.header');
        target ? target.after?.(container) || target.appendChild(container) : document.body.appendChild(container);
    }

    function init() {
        create();
        window.addEventListener('languageChanged', () => {
            if (!container) return;
            const lang = LanguageManager.currentLang;
            container.querySelector('.lang-current').textContent = lang.toUpperCase();
            container.querySelectorAll('.language-option').forEach(o =>
                o.classList.toggle('active', o.dataset.lang === lang)
            );
        });
    }

    return { init };
})();

window.LanguageSwitcher = LanguageSwitcher;
