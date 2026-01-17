/**
 * Core Utilities Module
 * Shared utility functions used across modules
 */

const Utils = (() => {
    /**
     * Get nested value from object using dot notation
     * Supports array indices: "hero.title.0" or "items.2.name"
     * @param {Object} obj - Source object
     * @param {string} path - Dot-notation path
     * @returns {*} The nested value or undefined
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
     * Get the API base URL from config
     * @returns {string} API base URL or empty string
     */
    function getApiBaseUrl() {
        if (window.APP_CONFIG && window.APP_CONFIG.API_URL) {
            return window.APP_CONFIG.API_URL;
        }
        return '';
    }

    // Public API
    return {
        getNestedValue,
        getApiBaseUrl
    };
})();

// Export for global use
window.Utils = Utils;
