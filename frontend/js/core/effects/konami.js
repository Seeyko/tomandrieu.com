/**
 * Konami Code Module
 * Detects the Konami code and triggers callbacks
 */

const KonamiCode = (() => {
    // Konami sequence: Up Up Down Down Left Right Left Right B A
    const SEQUENCE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

    let inputBuffer = [];
    let callback = null;
    let isActive = false;
    let keydownHandler = null;

    /**
     * Handle keydown event
     */
    function handleKeydown(e) {
        inputBuffer.push(e.keyCode);

        // Keep buffer at sequence length
        if (inputBuffer.length > SEQUENCE.length) {
            inputBuffer.shift();
        }

        // Check for match
        if (inputBuffer.length === SEQUENCE.length &&
            inputBuffer.every((code, i) => code === SEQUENCE[i])) {

            // Clear buffer
            inputBuffer = [];

            // Trigger callback
            if (callback) {
                callback();
            }

            console.log('%c[KONAMI] Code activated!', 'color: #ffb000; font-size: 14px;');
        }
    }

    /**
     * Initialize Konami code detection
     * @param {Function} onActivate - Callback when code is entered
     */
    function init(onActivate) {
        if (isActive) {
            destroy();
        }

        callback = onActivate;
        keydownHandler = handleKeydown;
        document.addEventListener('keydown', keydownHandler);
        isActive = true;
    }

    /**
     * Remove Konami code detection
     */
    function destroy() {
        if (keydownHandler) {
            document.removeEventListener('keydown', keydownHandler);
            keydownHandler = null;
        }
        inputBuffer = [];
        callback = null;
        isActive = false;
    }

    /**
     * Set a new callback
     * @param {Function} onActivate - New callback function
     */
    function setCallback(onActivate) {
        callback = onActivate;
    }

    /**
     * Reset the input buffer
     */
    function reset() {
        inputBuffer = [];
    }

    // Public API
    return {
        init,
        destroy,
        setCallback,
        reset,
        get isActive() { return isActive; },
        get sequence() { return [...SEQUENCE]; }
    };
})();

// Export for use in other modules
window.KonamiCode = KonamiCode;
