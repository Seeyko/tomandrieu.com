/**
 * Language Switcher UI Component
 * Provides a dropdown to switch between languages
 */

const LanguageSwitcher = (() => {
    let container = null;

    /**
     * Create the language switcher UI
     */
    function create() {
        // Don't create if already exists
        if (document.getElementById('language-switcher')) {
            return;
        }

        const currentLang = LanguageManager.currentLang;
        const langs = LanguageManager.SUPPORTED_LANGS;

        container = document.createElement('div');
        container.id = 'language-switcher';
        container.className = 'language-switcher';

        container.innerHTML = `
            <button class="language-switcher-toggle" aria-label="Switch language" title="Switch language">
                <span class="lang-current">${currentLang.toUpperCase()}</span>
                <span class="lang-arrow">&#9662;</span>
            </button>
            <div class="language-switcher-menu">
                ${langs.map(lang => `
                    <button
                        class="language-option ${lang === currentLang ? 'active' : ''}"
                        data-lang="${lang}"
                        title="${LanguageManager.getLanguageName(lang)}"
                    >
                        <span class="lang-flag">${lang === 'en' ? 'EN' : 'FR'}</span>
                        <span class="lang-name">${LanguageManager.getLanguageName(lang)}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Add event listeners
        const toggle = container.querySelector('.language-switcher-toggle');
        const menu = container.querySelector('.language-switcher-menu');
        const options = container.querySelectorAll('.language-option');

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
        });

        options.forEach(option => {
            option.addEventListener('click', async (e) => {
                e.stopPropagation();
                const langCode = option.dataset.lang;

                // Update UI immediately
                toggle.querySelector('.lang-current').textContent = langCode.toUpperCase();
                options.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                menu.classList.remove('open');

                // Switch language and reload page
                await LanguageManager.setLanguage(langCode);

                // Reload page to fully apply translations
                // This is simpler than dynamically updating all content
                window.location.reload();
            });
        });

        // Close menu on outside click
        document.addEventListener('click', () => {
            menu.classList.remove('open');
        });

        // Insert into page
        insertSwitcher();
    }

    /**
     * Insert the switcher into the page
     */
    function insertSwitcher() {
        if (!container) return;

        // Try to insert next to theme switcher
        const themeSwitcher = document.getElementById('theme-switcher-container');
        if (themeSwitcher) {
            themeSwitcher.after(container);
            return;
        }

        // Fallback: insert in header
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(container);
            return;
        }

        // Last resort: append to body
        document.body.appendChild(container);
    }

    /**
     * Update the switcher display (e.g., after language change)
     */
    function update() {
        if (!container) return;

        const currentLang = LanguageManager.currentLang;
        const toggle = container.querySelector('.lang-current');
        const options = container.querySelectorAll('.language-option');

        if (toggle) {
            toggle.textContent = currentLang.toUpperCase();
        }

        options.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.lang === currentLang);
        });
    }

    /**
     * Initialize the language switcher
     */
    function init() {
        create();

        // Listen for external language changes
        window.addEventListener('languageChanged', update);
    }

    // Public API
    return {
        init,
        create,
        update
    };
})();

// Export for global use
window.LanguageSwitcher = LanguageSwitcher;
