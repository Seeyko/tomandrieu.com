/**
 * Carousel Module
 * Handles image carousel initialization and controls
 */

const Carousel = (() => {
    const DEFAULT_AUTOPLAY_INTERVAL = 4000;

    /**
     * Initialize a single carousel
     * @param {HTMLElement} carousel - Carousel element
     * @param {Object} options - Configuration options
     */
    function initCarousel(carousel, options = {}) {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');

        if (slides.length <= 1) return;

        let currentIndex = 0;
        let autoPlayInterval;
        const autoPlayDelay = options.autoPlayDelay || DEFAULT_AUTOPLAY_INTERVAL;

        function showSlide(index) {
            if (index >= slides.length) index = 0;
            if (index < 0) index = slides.length - 1;
            currentIndex = index;

            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        function nextSlide() {
            showSlide(currentIndex + 1);
        }

        function prevSlide() {
            showSlide(currentIndex - 1);
        }

        function startAutoPlay() {
            if (options.autoPlay === false) return;
            autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
        }

        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }

        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        // Navigation buttons
        prevBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
            resetAutoPlay();
        });

        nextBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
            resetAutoPlay();
        });

        // Dot navigation
        dots.forEach((dot, i) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showSlide(i);
                resetAutoPlay();
            });
        });

        // Pause on hover
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);

        // Keyboard navigation when focused
        carousel.setAttribute('tabindex', '0');
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                resetAutoPlay();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                resetAutoPlay();
            }
        });

        // Start autoplay
        startAutoPlay();

        // Return control interface
        return {
            next: nextSlide,
            prev: prevSlide,
            goTo: showSlide,
            stop: stopAutoPlay,
            start: startAutoPlay,
            get currentIndex() { return currentIndex; }
        };
    }

    /**
     * Initialize all carousels on the page
     * @param {Object} options - Configuration options for all carousels
     */
    function initAll(options = {}) {
        const carousels = document.querySelectorAll('.project-carousel');
        const instances = [];

        carousels.forEach(carousel => {
            const instance = initCarousel(carousel, options);
            if (instance) {
                instances.push(instance);
            }
        });

        return instances;
    }

    // Public API
    return {
        init: initCarousel,
        initAll
    };
})();

// Export for use in other modules
window.Carousel = Carousel;
