/**
 * ═══════════════════════════════════════════════════════════════
 * ARCHITECTURAL BLUEPRINT PORTFOLIO
 * "The Master Plan" Aesthetic - JavaScript Controller
 * ═══════════════════════════════════════════════════════════════
 */

console.log('%c[BLUEPRINT] Portfolio Initialized', 'color: #00FFFF; font-family: monospace;');

// ─── Project Data ───
let projects = [];
let loadingProjects = true;
fetch('./projects.json').then(res => {
    if (!res.ok) {
        throw new Error('Failed to fetch projects');
    }
    return res.json();
}).then(data => {
    projects = data;
    renderProjects(projects);
    loadingProjects = false;
}).catch(err => {
    console.error(err);
    loadingProjects = false;
});

// ─── DOM Elements ───
const cursorCrosshair = document.getElementById('cursor-crosshair');
const coordX = document.getElementById('coord-x');
const coordY = document.getElementById('coord-y');

// ─── Cursor Crosshair Tracker ───
class CursorTracker {
    constructor() {
        this.cursorX = 0;
        this.cursorY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.init();
    }

    init() {
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.animate();
    }

    handleMouseMove(e) {
        this.targetX = e.clientX;
        this.targetY = e.clientY;
    }

    animate() {
        // Smooth interpolation
        this.cursorX += (this.targetX - this.cursorX) * 0.15;
        this.cursorY += (this.targetY - this.cursorY) * 0.15;

        if (cursorCrosshair) {
            cursorCrosshair.style.transform = `translate(${this.cursorX}px, ${this.cursorY}px)`;
        }

        if (coordX && coordY) {
            coordX.textContent = Math.round(this.cursorX);
            coordY.textContent = Math.round(this.cursorY);
        }

        requestAnimationFrame(this.animate.bind(this));
    }
}

// Initialize cursor tracker
const cursor = new CursorTracker();

// ─── Render Projects ───
function renderProjects(projectsData) {
    if (!loadingProjects) {
        const loading = document.querySelector('.projects-grid-loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    
    grid.innerHTML = '';

    projectsData.forEach((project, index) => {
        const card = document.createElement('a');
        card.className = 'project-card fade-in-up';
        card.href = project.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.style.animationDelay = `${index * 0.1}s`;

        // Create carousel for multiple images
        const carouselId = `carousel-${project.id}`;
        let mediaContent = '';
        
        if (project.images && project.images.length > 1) {
            // Multiple images - create carousel
            const slidesHTML = project.images.map((img, i) => `
                <div class="carousel-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
                    <img src="${img}" alt="${project.title} - ${i + 1}" class="project-image">
                </div>
            `).join('');
            
            const dotsHTML = project.images.map((_, i) => `
                <span class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
            `).join('');

            mediaContent = `
                <div class="project-carousel" id="${carouselId}">
                    <div class="carousel-slides">
                        ${slidesHTML}
                    </div>
                    <button class="carousel-btn prev" aria-label="Previous">◄</button>
                    <button class="carousel-btn next" aria-label="Next">►</button>
                    <div class="carousel-dots">${dotsHTML}</div>
                </div>
            `;
        } else if (project.images && project.images.length === 1) {
            // Single image
            mediaContent = `<img src="${project.images[0]}" alt="${project.title}" class="project-image">`;
        } else if (project.video) {
            // Video
            mediaContent = `
                <video class="project-video" autoplay muted loop playsinline>
                    <source src="${project.video}" type="video/mp4">
                </video>
            `;
        }

        // Create tags
        const tagsHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        // Format index
        const indexFormatted = String(index + 1).padStart(2, '0');

        card.innerHTML = `
            <div class="project-media-container">
                <span class="project-index">PRJ-${indexFormatted}</span>
                ${mediaContent}
            </div>
            <div class="project-info">
                <span class="project-type">${project.type}</span>
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="tags">${tagsHTML}</div>
                <div class="project-link">
                    <span class="link-icon">↗</span>
                    <span class="link-url">${project.url}</span>
                </div>
            </div>
            <div class="card-corner-bl"></div>
            <div class="card-corner-br"></div>
        `;

        grid.appendChild(card);
    });

    // Initialize carousels
    initCarousels();
    
    // Initialize scroll animations after rendering
    initScrollAnimations();
}

// ─── Initialize Carousels ───
function initCarousels() {
    document.querySelectorAll('.project-carousel').forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        let currentIndex = 0;
        let autoPlayInterval;

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

        // Button clicks - prevent link navigation
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

        // Dot clicks
        dots.forEach((dot, i) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showSlide(i);
                resetAutoPlay();
            });
        });

        // Auto-play
        function startAutoPlay() {
            autoPlayInterval = setInterval(nextSlide, 4000);
        }

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }

        // Pause on hover
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoPlayInterval);
        });

        carousel.addEventListener('mouseleave', () => {
            startAutoPlay();
        });

        startAutoPlay();
    });
}

// ─── Scroll Animations ───
function initScrollAnimations() {
    // Register GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Animate project cards
        gsap.utils.toArray('.project-card').forEach((card, i) => {
            gsap.fromTo(card,
                {
                    opacity: 0,
                    y: 60,
                    scale: 0.98
                },
                {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top bottom-=100',
                        end: 'top center',
                        toggleActions: 'play none none reverse',
                        scrub: false
                    },
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                    delay: i * 0.05
                }
            );
        });

        // Animate section headers
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
                    duration: 0.6,
                    ease: 'power2.out'
                }
            );
        });

        // Animate about card
        const aboutCard = document.querySelector('.about .blueprint-card');
        if (aboutCard) {
            gsap.fromTo(aboutCard,
                { opacity: 0, y: 40 },
                {
                    scrollTrigger: {
                        trigger: aboutCard,
                        start: 'top bottom-=100',
                        toggleActions: 'play none none reverse'
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out'
                }
            );
        }

        // Animate contact frame
        const contactFrame = document.querySelector('.contact-frame');
        if (contactFrame) {
            gsap.fromTo(contactFrame,
                { opacity: 0, scale: 0.95 },
                {
                    scrollTrigger: {
                        trigger: contactFrame,
                        start: 'top bottom-=100',
                        toggleActions: 'play none none reverse'
                    },
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: 'power3.out'
                }
            );
        }
    } else {
        // Fallback: simple intersection observer
        const fadeElements = document.querySelectorAll('.fade-in-up');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        fadeElements.forEach(el => observer.observe(el));
    }
}

// ─── SVG Line Drawing Animation ───
function initSVGAnimations() {
    const svgPaths = document.querySelectorAll('.frame-line, .dim-line');
    
    svgPaths.forEach(path => {
        if (path.getTotalLength) {
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
        }
    });
}

// ─── Smooth Scroll for Navigation ───
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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

// ─── Blueprint Grid Parallax ───
function initParallax() {
    const grid = document.querySelector('.blueprint-grid');
    if (!grid) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                grid.style.transform = `translateY(${scrollY * 0.1}px)`;
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ─── Header Scroll Effect ───
function initHeaderEffect() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 100) {
            header.style.background = 'rgba(0, 34, 68, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        } else {
            header.style.background = 'linear-gradient(to bottom, #003366, transparent)';
            header.style.backdropFilter = 'blur(5px)';
            header.style.borderBottom = 'none';
        }

        lastScroll = currentScroll;
    });
}

// ─── Project Card Hover Effects ───
function initCardEffects() {
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.project-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check if mouse is near the card
            const isNear = x >= -50 && x <= rect.width + 50 && 
                          y >= -50 && y <= rect.height + 50;

            if (isNear) {
                // Calculate rotation based on mouse position
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 30;
                const rotateY = (centerX - x) / 30;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            } else {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            }
        });
    });
}

// ─── Typing Effect for Hero ───
function initTypingEffect() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;

    const text = subtitle.textContent;
    subtitle.innerHTML = '';

    // Delay to let other animations finish
    setTimeout(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                if (text[i] === '*') {
                    subtitle.innerHTML += `<span class="annotation-mark">*</span>`;
                } else {
                    subtitle.innerHTML += text[i];
                }
                i++;
            } else {
                clearInterval(interval);
            }
        }, 50);
    }, 2000);
}

// ─── Add Blueprint Corner Markers ───
function addCornerMarkers() {
    document.querySelectorAll('.project-card').forEach(card => {
        // Create bottom-left corner
        const blCorner = document.createElement('div');
        blCorner.className = 'corner-marker bl';
        blCorner.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20">
                <line x1="0" y1="10" x2="20" y2="10" stroke="var(--accent-cyan)" stroke-width="1"/>
                <line x1="10" y1="0" x2="10" y2="20" stroke="var(--accent-cyan)" stroke-width="1"/>
            </svg>
        `;

        // Create bottom-right corner
        const brCorner = document.createElement('div');
        brCorner.className = 'corner-marker br';
        brCorner.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20">
                <line x1="0" y1="10" x2="20" y2="10" stroke="var(--accent-cyan)" stroke-width="1"/>
                <line x1="10" y1="0" x2="10" y2="20" stroke="var(--accent-cyan)" stroke-width="1"/>
            </svg>
        `;

        // Style corner markers
        [blCorner, brCorner].forEach(corner => {
            corner.style.cssText = `
                position: absolute;
                width: 20px;
                height: 20px;
                opacity: 0.6;
                pointer-events: none;
            `;
        });

        blCorner.style.bottom = '-1px';
        blCorner.style.left = '-1px';
        brCorner.style.bottom = '-1px';
        brCorner.style.right = '-1px';

        card.appendChild(blCorner);
        card.appendChild(brCorner);
    });
}

// ─── Initialize Everything ───
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c[BLUEPRINT] DOM Ready - Initializing modules...', 'color: #00FFFF;');
    
    // Render projects first
    renderProjects(projects);
    
    // Add corner markers to cards
    addCornerMarkers();
    
    // Initialize all modules
    initSmoothScroll();
    initParallax();
    initHeaderEffect();
    initCardEffects();
    initSVGAnimations();
    
    // Mark body as loaded
    document.body.classList.add('loaded');
    
    console.log('%c[BLUEPRINT] All systems operational', 'color: #00FF00;');
});

// ─── Handle Window Resize ───
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Refresh scroll triggers if GSAP is loaded
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }, 250);
});

// ─── Easter Egg: Konami Code ───
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        document.body.style.setProperty('--accent-cyan', '#FFD700');
        document.body.style.setProperty('--accent-redline', '#00FF00');
        console.log('%c🎮 KONAMI CODE ACTIVATED!', 'color: #FFD700; font-size: 20px;');
    }
});
