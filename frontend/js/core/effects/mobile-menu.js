/**
 * Mobile Menu Module
 * Handles hamburger menu toggle and mobile navigation
 */

const MobileMenu = (() => {
    let isInitialized = false;
    let hamburger = null;
    let nav = null;
    let headerControls = null;
    let observer = null;

    /**
     * Initialize mobile menu
     */
    function init() {
        hamburger = document.getElementById('hamburger-menu');
        nav = document.getElementById('main-nav');
        headerControls = document.getElementById('header-controls');

        if (!hamburger || !nav) {
            console.warn('[MobileMenu] Required elements not found');
            return;
        }

        // Watch for theme and language switchers being added
        watchForSwitchers();

        // Toggle menu on hamburger click
        hamburger.addEventListener('click', toggle);

        // Close menu when clicking a nav link
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', close);
        });

        // Close menu when clicking outside
        document.addEventListener('click', handleOutsideClick);

        // Handle window resize
        window.addEventListener('resize', handleResize);

        isInitialized = true;
    }

    /**
     * Watch for theme and language switchers to be added to the DOM
     */
    function watchForSwitchers() {
        // Try to move immediately if already present
        moveControlsForMobile();

        // Watch for new elements being added
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;

        observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    moveControlsForMobile();
                }
            }
        });

        observer.observe(headerRight, { childList: true });
    }

    /**
     * Move theme and language switchers to header controls for mobile layout
     */
    function moveControlsForMobile() {
        const themeSwitcher = document.querySelector('.theme-switcher');
        const langSwitcher = document.querySelector('.language-switcher');

        if (headerControls) {
            // Move switchers to header controls (theme first, then language)
            if (themeSwitcher && !headerControls.contains(themeSwitcher)) {
                headerControls.appendChild(themeSwitcher);
            }
            if (langSwitcher && !headerControls.contains(langSwitcher)) {
                headerControls.appendChild(langSwitcher);
            }
        }
    }

    /**
     * Toggle mobile menu open/close
     */
    function toggle() {
        const isOpen = nav.classList.toggle('mobile-open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);

        // Prevent body scroll when menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    /**
     * Close mobile menu
     */
    function close() {
        nav.classList.remove('mobile-open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    /**
     * Open mobile menu
     */
    function open() {
        nav.classList.add('mobile-open');
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Handle clicks outside the menu
     */
    function handleOutsideClick(e) {
        if (!nav.classList.contains('mobile-open')) return;

        const isClickInside = nav.contains(e.target) ||
                              hamburger.contains(e.target) ||
                              e.target.closest('.theme-switcher') ||
                              e.target.closest('.language-switcher');

        if (!isClickInside) {
            close();
        }
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        // Close menu if window is resized to desktop width
        if (window.innerWidth > 768) {
            close();
        }
    }

    /**
     * Check if menu is open
     */
    function isOpen() {
        return nav?.classList.contains('mobile-open') || false;
    }

    /**
     * Destroy the mobile menu
     */
    function destroy() {
        if (hamburger) {
            hamburger.removeEventListener('click', toggle);
        }
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        document.removeEventListener('click', handleOutsideClick);
        window.removeEventListener('resize', handleResize);
        close();
        isInitialized = false;
    }

    // Public API
    return {
        init,
        toggle,
        open,
        close,
        destroy,
        isOpen,
        get isInitialized() { return isInitialized; }
    };
})();

// Export for use in other modules
window.MobileMenu = MobileMenu;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    MobileMenu.init();
});
