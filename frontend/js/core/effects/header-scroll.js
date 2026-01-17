/**
 * Header Scroll Effect Module
 * Configurable header styling on scroll
 */

const HeaderScroll = (() => {
    let isInitialized = false;
    let scrollHandler = null;

    /**
     * Initialize header scroll effect
     * @param {Object} config - Configuration options
     * @param {string} config.selector - Header element selector
     * @param {number} config.threshold - Scroll threshold in pixels
     * @param {Object} config.normalStyles - Styles when at top
     * @param {Object} config.scrolledStyles - Styles when scrolled
     * @param {Function} config.onScroll - Custom scroll callback
     */
    function init(config = {}) {
        const defaults = {
            selector: '.header',
            threshold: 50,
            normalStyles: {},
            scrolledStyles: {},
            onScroll: null
        };

        const options = { ...defaults, ...config };
        const header = document.querySelector(options.selector);

        if (!header) {
            console.warn(`[HeaderScroll] Element "${options.selector}" not found`);
            return;
        }

        // Clean up previous handler if reinitializing
        if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler);
        }

        scrollHandler = () => {
            const currentScroll = window.scrollY;
            const isScrolled = currentScroll > options.threshold;

            // Apply appropriate styles
            const styles = isScrolled ? options.scrolledStyles : options.normalStyles;

            Object.entries(styles).forEach(([property, value]) => {
                // Convert camelCase to kebab-case for CSS properties
                const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
                header.style[property] = value;
            });

            // Toggle scrolled class
            header.classList.toggle('scrolled', isScrolled);

            // Call custom callback if provided
            if (options.onScroll) {
                options.onScroll({
                    scrollY: currentScroll,
                    isScrolled,
                    header
                });
            }
        };

        // Attach scroll listener
        window.addEventListener('scroll', scrollHandler, { passive: true });

        // Run once to set initial state
        scrollHandler();

        isInitialized = true;
    }

    /**
     * Remove scroll effect
     */
    function destroy() {
        if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler);
            scrollHandler = null;
        }
        isInitialized = false;
    }

    /**
     * Pre-configured themes
     */
    const presets = {
        // Terminal theme preset
        terminal: {
            threshold: 50,
            normalStyles: {
                background: 'var(--bg-terminal, transparent)',
                borderBottomColor: 'var(--border, transparent)',
                boxShadow: 'none'
            },
            scrolledStyles: {
                background: 'rgba(10, 10, 10, 0.98)',
                borderBottomColor: 'var(--primary, #33ff00)',
                boxShadow: '0 0 20px rgba(51, 255, 0, 0.1)'
            }
        },

        // Blueprint theme preset
        blueprint: {
            threshold: 100,
            normalStyles: {
                background: 'linear-gradient(to bottom, #003366, transparent)',
                backdropFilter: 'blur(5px)',
                borderBottom: 'none'
            },
            scrolledStyles: {
                background: 'rgba(0, 34, 68, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }
        },

        // Default/clean theme preset
        default: {
            threshold: 50,
            normalStyles: {
                boxShadow: 'none'
            },
            scrolledStyles: {
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }
        }
    };

    /**
     * Initialize with a preset
     * @param {string} presetName - Name of the preset
     * @param {Object} overrides - Optional overrides
     */
    function usePreset(presetName, overrides = {}) {
        const preset = presets[presetName];
        if (!preset) {
            console.warn(`[HeaderScroll] Preset "${presetName}" not found`);
            return;
        }

        init({
            ...preset,
            ...overrides,
            normalStyles: { ...preset.normalStyles, ...overrides.normalStyles },
            scrolledStyles: { ...preset.scrolledStyles, ...overrides.scrolledStyles }
        });
    }

    // Public API
    return {
        init,
        destroy,
        usePreset,
        presets,
        get isInitialized() { return isInitialized; }
    };
})();

// Export for use in other modules
window.HeaderScroll = HeaderScroll;
