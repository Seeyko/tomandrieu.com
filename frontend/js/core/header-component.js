/**
 * Header Component
 * Reusable header that can be used across all pages
 */

const HeaderComponent = (() => {
    /**
     * Navigation items configuration
     * Each item has: id, href (for home page), externalHref (for other pages), i18nKey, section
     */
    const NAV_ITEMS = [
        { id: 'projects', href: '#projects', externalHref: '/#projects', i18nKey: 'nav.projects', section: '01' },
        { id: 'about', href: '#about', externalHref: '/#about', i18nKey: 'nav.about', section: '02' },
        { id: 'history', href: '#timeline', externalHref: '/#timeline', i18nKey: 'nav.history', section: '03' },
        { id: 'blog', href: '/blog/', externalHref: '/blog/', i18nKey: 'nav.blog', section: '04' },
        { id: 'contact', href: '#contact', externalHref: '/#contact', i18nKey: 'nav.contact', section: '05' }
    ];

    /**
     * Default configuration
     */
    const defaultConfig = {
        // Which page we're on - determines link behavior
        isHomePage: true,
        // Which nav items to show (by id)
        showNavItems: ['projects', 'about', 'history', 'contact'],
        // Which nav item is active (by id)
        activeNavItem: null,
        // Additional CSS classes for the header
        headerClass: '',
        // Container to render the header into (selector or element)
        container: null
    };

    /**
     * Generate the header HTML
     * @param {Object} config - Configuration options
     * @returns {string} HTML string
     */
    function generateHTML(config = {}) {
        const opts = { ...defaultConfig, ...config };

        // Build nav items HTML
        const navItemsHTML = NAV_ITEMS
            .filter(item => opts.showNavItems.includes(item.id))
            .map(item => {
                const href = opts.isHomePage ? item.href : item.externalHref;
                const activeClass = opts.activeNavItem === item.id ? ' active' : '';
                const defaultText = item.i18nKey.split('.')[1];
                // Capitalize first letter
                const displayText = defaultText.charAt(0).toUpperCase() + defaultText.slice(1);

                return `
        <a href="${href}" class="nav-link${activeClass}" data-section="${item.section}">
          <span class="nav-prefix"></span>
          <span class="nav-text" data-i18n="${item.i18nKey}">${displayText}</span>
        </a>`;
            })
            .join('');

        // Brand link wrapper - only link on non-home pages
        const brandStart = opts.isHomePage
            ? '<div class="header-brand">'
            : '<div class="header-brand"><a href="/" class="brand-link">';
        const brandEnd = opts.isHomePage
            ? '</div>'
            : '</a></div>';

        // Build the full header HTML
        const headerClasses = ['header', opts.headerClass].filter(Boolean).join(' ');

        return `
  <header class="${headerClasses}">
    ${brandStart}
      <span class="brand-prefix"></span>
      <span class="brand-name" data-content="meta.name">TOM ANDRIEU</span>
      <span class="brand-suffix"></span>
    ${brandEnd}
    <div class="header-right">
      <nav class="nav" id="main-nav">${navItemsHTML}
      </nav>
      <!-- Theme and language switchers will be inserted here by JS -->
      <div class="header-controls" id="header-controls">
        <!-- Theme switcher and language switcher moved here on mobile -->
      </div>
      <!-- Mobile hamburger menu button -->
      <button class="hamburger-menu" id="hamburger-menu" aria-label="Toggle navigation menu" aria-expanded="false">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>
  </header>`;
    }

    /**
     * Render the header into a container
     * @param {Object} config - Configuration options
     * @returns {HTMLElement} The rendered header element
     */
    function render(config = {}) {
        const opts = { ...defaultConfig, ...config };

        // Find or create container
        let container = opts.container;
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }

        if (!container) {
            console.error('[HeaderComponent] Container not found');
            return null;
        }

        // Generate and insert HTML
        const html = generateHTML(opts);
        container.insertAdjacentHTML('afterbegin', html);

        // Return the header element
        return container.querySelector('.header');
    }

    /**
     * Initialize the header on the current page
     * Auto-detects page type and configures accordingly
     * @param {Object} overrides - Optional configuration overrides
     */
    function init(overrides = {}) {
        const path = window.location.pathname;

        // Detect page type
        const isHomePage = path === '/' || path === '/index.html' || path.endsWith('/index.html');
        const isBlogPage = path.startsWith('/blog');

        // Default config based on page
        let config = {
            isHomePage,
            container: '#main-content',
            ...overrides
        };

        // Page-specific defaults
        if (isHomePage) {
            config.showNavItems = config.showNavItems || ['projects', 'about', 'history', 'contact'];
        } else if (isBlogPage) {
            config.showNavItems = config.showNavItems || ['projects', 'about', 'blog', 'contact'];
            config.activeNavItem = config.activeNavItem || 'blog';
            config.headerClass = config.headerClass || 'blog-header';
        }

        return render(config);
    }

    // Public API
    return {
        init,
        render,
        generateHTML,
        NAV_ITEMS
    };
})();

// Export for use in other modules
window.HeaderComponent = HeaderComponent;

// Auto-initialize immediately (scripts are at end of body, so DOM is ready)
HeaderComponent.init();
