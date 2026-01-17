/**
 * Carousel - Image carousel with autoplay
 */

const Carousel = (() => {
    const AUTOPLAY_INTERVAL = 4000;

    function initCarousel(carousel, opts = {}) {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');

        if (slides.length <= 1) return null;

        let current = 0;
        let interval;
        const delay = opts.autoPlayDelay || AUTOPLAY_INTERVAL;

        const show = idx => {
            current = idx >= slides.length ? 0 : idx < 0 ? slides.length - 1 : idx;
            slides.forEach((s, i) => s.classList.toggle('active', i === current));
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        };

        const next = () => show(current + 1);
        const prev = () => show(current - 1);
        const start = () => { if (opts.autoPlay !== false) interval = setInterval(next, delay); };
        const stop = () => clearInterval(interval);
        const reset = () => { stop(); start(); };

        prevBtn?.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); prev(); reset(); });
        nextBtn?.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); next(); reset(); });
        dots.forEach((d, i) => d.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); show(i); reset(); }));

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        carousel.setAttribute('tabindex', '0');
        carousel.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') { prev(); reset(); }
            else if (e.key === 'ArrowRight') { next(); reset(); }
        });

        start();
        return { next, prev, goTo: show, stop, start, get currentIndex() { return current; } };
    }

    function initAll(opts = {}) {
        return [...document.querySelectorAll('.project-carousel')]
            .map(c => initCarousel(c, opts))
            .filter(Boolean);
    }

    return { init: initCarousel, initAll };
})();

window.Carousel = Carousel;
