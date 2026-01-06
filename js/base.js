/**
 * ═══════════════════════════════════════════════════════════════
 * BASE PORTFOLIO - Shared JavaScript Functionality
 * Common utilities, project loading, content loading, animations
 * ═══════════════════════════════════════════════════════════════
 */

// ─── Content Data ───
let siteContent = {};
let projects = [];
let loadingProjects = true;
let loadingContent = true;

/**
 * Load site content from JSON
 */
async function loadContent() {
    try {
        const response = await fetch('/data/content.json');
        if (!response.ok) throw new Error('Failed to fetch content');
        siteContent = await response.json();
        console.log('%c[OK] Site content loaded', 'color: #33ff00;');
        loadingContent = false;
        
        // Populate dynamic content
        populateContent();
        
        return siteContent;
    } catch (err) {
        console.error('%c[ERR] ' + err.message, 'color: #ff3333;');
        loadingContent = false;
        throw err;
    }
}

/**
 * Populate dynamic content from JSON
 */
function populateContent() {
    // Populate specs
    const specsContainer = document.getElementById('about-specs');
    if (specsContainer && siteContent.about?.specs) {
        specsContainer.innerHTML = Object.entries(siteContent.about.specs).map(([key, value]) => `
            <div class="spec-row">
                <span class="spec-key">${key.toUpperCase()}:</span>
                <span class="spec-val">${value}</span>
            </div>
        `).join('');
    }

    // Populate tech stack
    const techGrid = document.getElementById('tech-grid');
    if (techGrid && siteContent.techStack) {
        techGrid.innerHTML = siteContent.techStack.map(tech => `
            <span class="tech-tag">${tech}</span>
        `).join('');
    }

    // Populate social links
    const socialLinks = document.getElementById('social-links');
    if (socialLinks && siteContent.contact?.social) {
        socialLinks.innerHTML = Object.entries(siteContent.contact.social).map(([name, url]) => `
            <a href="${url}" class="social-btn" target="_blank" rel="noopener noreferrer">
                <span class="link-bracket">[</span>
                <span>${name.toUpperCase()}</span>
                <span class="link-bracket">]</span>
            </a>
        `).join('');
    }

    // Update email link
    const emailLink = document.getElementById('email-link');
    if (emailLink && siteContent.contact?.email) {
        emailLink.href = `mailto:${siteContent.contact.email}`;
        const emailText = emailLink.querySelector('.email-text');
        if (emailText) {
            emailText.textContent = siteContent.contact.email.toUpperCase();
        }
    }

    // Update elements with data-content attribute
    document.querySelectorAll('[data-content]').forEach(el => {
        const path = el.dataset.content;
        const value = getNestedValue(siteContent, path);
        if (value) {
            // Convert <highlight> tags to styled spans for safe innerHTML
            const processedValue = value.replace(/<highlight>/g, '<span class="highlight">')
                                         .replace(/<\/highlight>/g, '</span>');
            el.innerHTML = processedValue;
        }
    });
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        if (current && typeof current === 'object') {
            // Handle array notation like "hero.title.0"
            if (!isNaN(key)) {
                return current[parseInt(key)];
            }
            return current[key];
        }
        return undefined;
    }, obj);
}

/**
 * Fetch and load projects from JSON
 */
async function loadProjects() {
    try {
        const response = await fetch('/projects.json');
        if (!response.ok) throw new Error('Failed to fetch projects');
        projects = await response.json();
        
        // Fix asset paths to be absolute
        projects = projects.map(project => ({
            ...project,
            images: project.images?.map(img => img.startsWith('/') ? img : `/assets/${img.replace('assets/', '')}`),
            video: project.video ? (project.video.startsWith('/') ? project.video : `/assets/${project.video.replace('assets/', '')}`) : null
        }));
        
        console.log(`%c[OK] Loaded ${projects.length} projects`, 'color: #33ff00;');
        loadingProjects = false;
        return projects;
    } catch (err) {
        console.error('%c[ERR] ' + err.message, 'color: #ff3333;');
        loadingProjects = false;
        throw err;
    }
}

/**
 * Render projects to the grid
 * @param {Array} projectsData - Array of project objects
 * @param {Function} cardRenderer - Theme-specific card renderer function
 */
function renderProjects(projectsData, cardRenderer) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    // Hide loading
    const loading = grid.querySelector('.projects-grid-loading');
    if (loading) loading.style.display = 'none';

    // Clear and render
    grid.innerHTML = '';

    projectsData.forEach((project, index) => {
        const card = cardRenderer(project, index);
        grid.appendChild(card);
    });

    // Initialize carousels
    initCarousels();

    // Initialize scroll animations
    initScrollAnimations();

    console.log(`%c[OK] Rendered ${projectsData.length} project cards`, 'color: #33ff00;');
}

/**
 * Initialize image carousels
 */
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

        dots.forEach((dot, i) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showSlide(i);
                resetAutoPlay();
            });
        });

        function startAutoPlay() {
            autoPlayInterval = setInterval(nextSlide, 4000);
        }

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }

        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoPlayInterval);
        });

        carousel.addEventListener('mouseleave', () => {
            startAutoPlay();
        });

        startAutoPlay();
    });
}

/**
 * Initialize scroll animations using GSAP or fallback
 */
function initScrollAnimations() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Animate project cards
        gsap.utils.toArray('.project-card').forEach((card, i) => {
            gsap.fromTo(card,
                { opacity: 0, y: 50, scale: 0.98 },
                {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top bottom-=100',
                        end: 'top center',
                        toggleActions: 'play none none reverse'
                    },
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
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
                    duration: 0.5,
                    ease: 'power2.out'
                }
            );
        });

        // Animate about/contact cards
        gsap.utils.toArray('.about-card, .contact-card').forEach(el => {
            gsap.fromTo(el,
                { opacity: 0, y: 30 },
                {
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom-=100',
                        toggleActions: 'play none none reverse'
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: 'power3.out'
                }
            );
        });

    } else {
        // Fallback: simple intersection observer
        const fadeElements = document.querySelectorAll('.fade-in-up, .about-card, .contact-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        fadeElements.forEach(el => observer.observe(el));
    }
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

/**
 * Handle window resize (refresh ScrollTrigger if needed)
 */
function initResizeHandler() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        }, 250);
    });
}

// ─── Konami Code Easter Egg (Common) ───
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
let konamiCallback = null;

function initKonamiCode(callback) {
    konamiCallback = callback;
    document.addEventListener('keydown', handleKonamiCode);
}

function handleKonamiCode(e) {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }

    if (konamiCode.join(',') === konamiSequence.join(',')) {
        if (konamiCallback) {
            konamiCallback();
        }
    }
}

/**
 * Create media content for project (carousel or single image/video)
 */
function createMediaContent(project, carouselId) {
    let mediaContent = '';

    if (project.images && project.images.length > 1) {
        const slidesHTML = project.images.map((img, i) => `
            <div class="carousel-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
                <img src="${img}" alt="${project.title} - ${i + 1}" class="project-image" loading="lazy">
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
        mediaContent = `<img src="${project.images[0]}" alt="${project.title}" class="project-image" loading="lazy">`;
    } else if (project.video) {
        mediaContent = `
            <video class="project-video" autoplay muted loop playsinline>
                <source src="${project.video}" type="video/mp4">
            </video>
        `;
    }

    return mediaContent;
}

/**
 * Initialize base functionality (call from theme scripts)
 */
async function initBase() {
    // Load content first
    await loadContent();
    
    initSmoothScroll();
    initResizeHandler();
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
}

// Export for use in theme scripts
window.PortfolioBase = {
    loadProjects,
    loadContent,
    renderProjects,
    initCarousels,
    initScrollAnimations,
    initSmoothScroll,
    initResizeHandler,
    initKonamiCode,
    initBase,
    createMediaContent,
    get projects() { return projects; },
    get content() { return siteContent; }
};
