/**
 * Cursor Tracker Module
 * Configurable cursor tracking and display
 */

class CursorTracker {
    /**
     * Create a new cursor tracker
     * @param {Object} options - Configuration options
     * @param {string} options.mode - 'viewport' or 'page' coordinates
     * @param {string} options.cursorSelector - Selector for custom cursor element
     * @param {string} options.coordXSelector - Selector for X coordinate display
     * @param {string} options.coordYSelector - Selector for Y coordinate display
     * @param {number} options.smoothing - Smoothing factor (0-1, default 0.15)
     * @param {string} options.format - Display format, e.g., 'X:{x} Y:{y}'
     * @param {Function} options.onUpdate - Callback on position update
     */
    constructor(options = {}) {
        this.config = {
            mode: options.mode || 'viewport',
            cursorSelector: options.cursorSelector || '#custom-cursor',
            coordXSelector: options.coordXSelector || '#coord-x',
            coordYSelector: options.coordYSelector || '#coord-y',
            smoothing: options.smoothing || 0.15,
            format: options.format || null,
            onUpdate: options.onUpdate || null,
            offsetX: options.offsetX || 0,
            offsetY: options.offsetY || 0
        };

        // Position state
        this.currentX = 0;
        this.currentY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.viewportX = 0;
        this.viewportY = 0;

        // DOM elements
        this.cursorEl = null;
        this.coordXEl = null;
        this.coordYEl = null;

        this.animationFrame = null;
        this.isActive = false;

        this.init();
    }

    init() {
        // Get DOM elements
        this.cursorEl = document.querySelector(this.config.cursorSelector);
        this.coordXEl = document.querySelector(this.config.coordXSelector);
        this.coordYEl = document.querySelector(this.config.coordYSelector);

        // Bind event handlers
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.animate = this.animate.bind(this);

        // Add event listeners
        document.addEventListener('mousemove', this.handleMouseMove);

        if (this.config.mode === 'page') {
            window.addEventListener('scroll', this.handleScroll);
        }

        // Start animation loop
        this.isActive = true;
        this.animate();
    }

    handleMouseMove(e) {
        this.viewportX = e.clientX;
        this.viewportY = e.clientY;

        if (this.config.mode === 'page') {
            this.targetX = e.clientX + window.scrollX;
            this.targetY = e.clientY + window.scrollY;
        } else {
            this.targetX = e.clientX;
            this.targetY = e.clientY;
        }
    }

    handleScroll() {
        if (this.config.mode === 'page') {
            this.targetX = this.viewportX + window.scrollX;
            this.targetY = this.viewportY + window.scrollY;
        }
    }

    animate() {
        if (!this.isActive) return;

        // Apply smoothing
        this.currentX += (this.targetX - this.currentX) * this.config.smoothing;
        this.currentY += (this.targetY - this.currentY) * this.config.smoothing;

        // Update cursor element position
        if (this.cursorEl) {
            if (this.config.mode === 'viewport') {
                this.cursorEl.style.transform = `translate(${this.viewportX + this.config.offsetX}px, ${this.viewportY + this.config.offsetY}px)`;
            } else {
                this.cursorEl.style.left = `${this.viewportX}px`;
                this.cursorEl.style.top = `${this.viewportY}px`;
            }
        }

        // Update coordinate display
        const displayX = Math.round(this.currentX);
        const displayY = Math.round(this.currentY);

        if (this.coordXEl) {
            this.coordXEl.textContent = displayX;
        }
        if (this.coordYEl) {
            this.coordYEl.textContent = displayY;
        }

        // Call custom update callback
        if (this.config.onUpdate) {
            this.config.onUpdate({
                x: displayX,
                y: displayY,
                viewportX: this.viewportX,
                viewportY: this.viewportY
            });
        }

        this.animationFrame = requestAnimationFrame(this.animate);
    }

    /**
     * Get current position
     */
    getPosition() {
        return {
            x: Math.round(this.currentX),
            y: Math.round(this.currentY),
            viewportX: this.viewportX,
            viewportY: this.viewportY
        };
    }

    /**
     * Stop tracking
     */
    stop() {
        this.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        document.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('scroll', this.handleScroll);
    }

    /**
     * Resume tracking
     */
    resume() {
        if (!this.isActive) {
            this.isActive = true;
            document.addEventListener('mousemove', this.handleMouseMove);
            if (this.config.mode === 'page') {
                window.addEventListener('scroll', this.handleScroll);
            }
            this.animate();
        }
    }

    /**
     * Destroy instance and clean up
     */
    destroy() {
        this.stop();
        this.cursorEl = null;
        this.coordXEl = null;
        this.coordYEl = null;
    }
}

// Factory function for easier creation
CursorTracker.create = function(options) {
    return new CursorTracker(options);
};

// Export for use in other modules
window.CursorTracker = CursorTracker;
