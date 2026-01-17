/**
 * Scroll Effects Module
 * Handles scroll-triggered animations using GSAP or fallback
 */

const ScrollEffects = (() => {
    let isInitialized = false;

    /**
     * Check if GSAP and ScrollTrigger are available
     */
    function hasGSAP() {
        return typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    }

    /**
     * Initialize GSAP ScrollTrigger plugin
     */
    function initGSAP() {
        if (hasGSAP()) {
            gsap.registerPlugin(ScrollTrigger);
        }
    }

    /**
     * Animate elements using GSAP
     * @param {string} selector - CSS selector for elements
     * @param {Object} options - Animation options
     */
    function animateWithGSAP(selector, options = {}) {
        const defaults = {
            from: { opacity: 0, y: 50, scale: 0.98 },
            to: { opacity: 1, y: 0, scale: 1 },
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.05,
            start: 'top bottom-=100',
            end: 'top center',
            toggleActions: 'play none none reverse'
        };

        const config = { ...defaults, ...options };

        gsap.utils.toArray(selector).forEach((el, i) => {
            gsap.fromTo(el, config.from, {
                scrollTrigger: {
                    trigger: el,
                    start: config.start,
                    end: config.end,
                    toggleActions: config.toggleActions
                },
                ...config.to,
                duration: config.duration,
                ease: config.ease,
                delay: i * config.stagger
            });
        });
    }

    /**
     * Fallback animation using Intersection Observer
     * @param {string} selector - CSS selector for elements
     * @param {Object} options - Animation options
     */
    function animateWithObserver(selector, options = {}) {
        const defaults = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
            initialStyles: {
                opacity: '0',
                transform: 'translateY(30px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease'
            },
            visibleStyles: {
                opacity: '1',
                transform: 'translateY(0)'
            }
        };

        const config = { ...defaults, ...options };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    Object.entries(config.visibleStyles).forEach(([prop, value]) => {
                        entry.target.style[prop] = value;
                    });
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: config.threshold,
            rootMargin: config.rootMargin
        });

        document.querySelectorAll(selector).forEach(el => {
            Object.entries(config.initialStyles).forEach(([prop, value]) => {
                el.style[prop] = value;
            });
            observer.observe(el);
        });

        return observer;
    }

    /**
     * Animate project cards
     */
    function animateProjectCards() {
        if (hasGSAP()) {
            animateWithGSAP('.project-card', {
                from: { opacity: 0, y: 50, scale: 0.98 },
                duration: 0.6,
                stagger: 0.05
            });
        } else {
            animateWithObserver('.project-card');
        }
    }

    /**
     * Animate blog cards
     */
    function animateBlogCards() {
        if (hasGSAP()) {
            animateWithGSAP('.blog-card', {
                from: { opacity: 0, y: 30, scale: 0.98 },
                duration: 0.5,
                stagger: 0.1
            });
        } else {
            animateWithObserver('.blog-card');
        }
    }

    /**
     * Animate section headers
     */
    function animateSectionHeaders() {
        if (hasGSAP()) {
            gsap.utils.toArray('.section-header').forEach(header => {
                gsap.fromTo(header,
                    { opacity: 0, x: -30 },
                    {
                        scrollTrigger: {
                            trigger: header,
                            start: 'top bottom-=50',
                            toggleActions: 'play none none reverse'
                        },
                        opacity: 1,
                        x: 0,
                        duration: 0.5,
                        ease: 'power2.out'
                    }
                );
            });
        } else {
            animateWithObserver('.section-header', {
                initialStyles: {
                    opacity: '0',
                    transform: 'translateX(-30px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease'
                },
                visibleStyles: {
                    opacity: '1',
                    transform: 'translateX(0)'
                }
            });
        }
    }

    /**
     * Animate about and contact cards
     */
    function animateInfoCards() {
        if (hasGSAP()) {
            animateWithGSAP('.about-card, .contact-card', {
                from: { opacity: 0, y: 30 },
                duration: 0.7
            });
        } else {
            animateWithObserver('.about-card, .contact-card');
        }
    }

    /**
     * Initialize all scroll animations
     */
    function initAll() {
        if (isInitialized) return;

        initGSAP();
        animateProjectCards();
        animateSectionHeaders();
        animateInfoCards();

        isInitialized = true;
    }

    /**
     * Handle window resize - refresh ScrollTrigger
     */
    function initResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (hasGSAP()) {
                    ScrollTrigger.refresh();
                }
            }, 250);
        });
    }

    /**
     * Initialize smooth scrolling for navigation links
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Public API
    return {
        initGSAP,
        animateWithGSAP,
        animateWithObserver,
        animateProjectCards,
        animateBlogCards,
        animateSectionHeaders,
        animateInfoCards,
        initAll,
        initResizeHandler,
        initSmoothScroll,
        hasGSAP
    };
})();

// Export for use in other modules
window.ScrollEffects = ScrollEffects;
