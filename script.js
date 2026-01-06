/**
 * ═══════════════════════════════════════════════════════════════
 * TERMINAL CLI PORTFOLIO
 * "Cyber-Industrial Hacker" Aesthetic - JavaScript Controller
 * ═══════════════════════════════════════════════════════════════
 */

// ─── Fun ASCII Banner ───
console.log(`
%c╔═══════════════════════════════════════════════════════════════╗
║  ████████╗ ██████╗ ███╗   ███╗   ██████╗ ███████╗██╗   ██╗   ║
║  ╚══██╔══╝██╔═══██╗████╗ ████║   ██╔══██╗██╔════╝██║   ██║   ║
║     ██║   ██║   ██║██╔████╔██║   ██║  ██║█████╗  ██║   ██║   ║
║     ██║   ██║   ██║██║╚██╔╝██║   ██║  ██║██╔══╝  ╚██╗ ██╔╝   ║
║     ██║   ╚██████╔╝██║ ╚═╝ ██║   ██████╔╝███████╗ ╚████╔╝    ║
║     ╚═╝    ╚═════╝ ╚═╝     ╚═╝   ╚═════╝ ╚══════╝  ╚═══╝     ║
╚═══════════════════════════════════════════════════════════════╝
`, 'color: #33ff00; font-family: monospace;');

console.log('%c[SYSTEM] Terminal initialized...', 'color: #ffb000;');
console.log('%c[OK] Portfolio v3.0 loaded', 'color: #33ff00;');
console.log('%c[INFO] Type "help()" for easter eggs 🥚', 'color: #33ff00;');

// ─── Easter Egg Functions ───
window.help = function() {
    console.log(`
%c╔═══════════════════════════════════════╗
║         AVAILABLE COMMANDS            ║
╠═══════════════════════════════════════╣
║  matrix()    - Enter the Matrix       ║
║  party()     - 🎉 Party mode!         ║
║  hack()      - Hack the mainframe     ║
║  coffee()    - ☕ Refill coffee       ║
║  reset()     - Reset to default       ║
╚═══════════════════════════════════════╝
`, 'color: #33ff00; font-family: monospace;');
};

window.matrix = function() {
    document.documentElement.style.setProperty('--primary', '#00ff00');
    document.documentElement.style.setProperty('--secondary', '#003300');
    console.log('%c[SYSTEM] You are now in the Matrix...', 'color: #00ff00;');
    console.log('%c"There is no spoon." 🥄', 'color: #00ff00;');
};

window.party = function() {
    let colors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0077ff', '#7700ff'];
    let i = 0;
    const partyInterval = setInterval(() => {
        document.documentElement.style.setProperty('--primary', colors[i % colors.length]);
        i++;
        if (i > 30) {
            clearInterval(partyInterval);
            document.documentElement.style.setProperty('--primary', '#33ff00');
        }
    }, 100);
    console.log('%c🎉 PARTY MODE ACTIVATED! 🎉', 'color: #ff00ff; font-size: 20px;');
};

window.hack = function() {
    console.log('%c[SYSTEM] Initializing hack sequence...', 'color: #ffb000;');
    console.log('%c[████████████████████] 100%', 'color: #33ff00;');
    console.log('%c[SUCCESS] Access granted! Just kidding 😄', 'color: #33ff00;');
};

window.coffee = function() {
    console.log('%c☕ Coffee level restored to 100%!', 'color: #ffb000; font-size: 16px;');
    console.log('%c[OK] Developer productivity increased by 200%', 'color: #33ff00;');
};

window.reset = function() {
    document.documentElement.style.setProperty('--primary', '#33ff00');
    document.documentElement.style.setProperty('--secondary', '#ffb000');
    console.log('%c[SYSTEM] Colors reset to default', 'color: #33ff00;');
};

// ─── Project Data ───
let projects = [];
let loadingProjects = true;

fetch('./projects.json')
    .then(res => {
        if (!res.ok) throw new Error('Failed to fetch projects');
        return res.json();
    })
    .then(data => {
        projects = data;
        console.log(`%c[OK] Loaded ${projects.length} projects`, 'color: #33ff00;');
        renderProjects(projects);
        loadingProjects = false;
    })
    .catch(err => {
        console.error('%c[ERR] ' + err.message, 'color: #ff3333;');
        loadingProjects = false;
    });

// ─── DOM Elements ───
const cursorBlock = document.getElementById('cursor-block');
const heroTyped = document.getElementById('hero-typed');

// ─── Cursor Block Tracker ───
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
        this.cursorX += (this.targetX - this.cursorX) * 0.15;
        this.cursorY += (this.targetY - this.cursorY) * 0.15;

        if (cursorBlock) {
            cursorBlock.style.transform = `translate(${this.cursorX + 10}px, ${this.cursorY - 10}px)`;
        }

        requestAnimationFrame(this.animate.bind(this));
    }
}

// Initialize cursor tracker
const cursor = new CursorTracker();

// ─── Typewriter Effect ───
class Typewriter {
    constructor(element, texts, speed = 80) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;
        
        if (this.element) {
            this.type();
        }
    }

    type() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }

        let delay = this.isDeleting ? this.speed / 2 : this.speed;

        if (!this.isDeleting && this.charIndex === currentText.length) {
            delay = 2000; // Pause at end
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            delay = 500; // Pause before next text
        }

        setTimeout(() => this.type(), delay);
    }
}

// Initialize typewriter with fun messages
const heroMessages = [
    'echo "Hello, World!"',
    'npm run create-awesome-stuff',
    'git commit -m "made it better"',
    'sudo make me a sandwich',
    'while(true) { code(); coffee(); }',
    './build-dreams.sh --with-passion',
    'grep -r "bugs" . | rm -rf',
];

// Delay typewriter start
setTimeout(() => {
    new Typewriter(heroTyped, heroMessages, 60);
}, 1000);

// ─── Render Projects ───
function renderProjects(projectsData) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    // Hide loading
    const loading = document.querySelector('.projects-grid-loading');
    if (loading) loading.style.display = 'none';

    grid.innerHTML = '';

    projectsData.forEach((project, index) => {
        const card = document.createElement('a');
        card.className = 'project-card fade-in-up';
        card.href = project.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

        // Create carousel for multiple images
        const carouselId = `carousel-${project.id}`;
        let mediaContent = '';

        if (project.images && project.images.length > 1) {
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
            mediaContent = `<img src="${project.images[0]}" alt="${project.title}" class="project-image">`;
        } else if (project.video) {
            mediaContent = `
                <video class="project-video" autoplay muted loop playsinline>
                    <source src="${project.video}" type="video/mp4">
                </video>
            `;
        }

        // Create tags
        const tagsHTML = project.tags.map(tag => `<span class="tag">[ ${tag} ]</span>`).join('');

        // Format index
        const indexFormatted = String(index + 1).padStart(2, '0');

        card.innerHTML = `
            <div class="project-card-header">
                <span class="project-index">PRJ-${indexFormatted}</span>
                <span class="project-type">// ${project.type}</span>
            </div>
            <div class="project-media-container">
                ${mediaContent}
            </div>
            <div class="project-info">
                <h3>> ${project.title}</h3>
                <p>${project.description}</p>
                <div class="tags">${tagsHTML}</div>
                <div class="project-link">
                    <span class="link-icon">→</span>
                    <span>${project.url}</span>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });

    // Initialize carousels
    initCarousels();

    // Initialize scroll animations
    initScrollAnimations();

    console.log(`%c[OK] Rendered ${projectsData.length} project cards`, 'color: #33ff00;');
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

// ─── Scroll Animations ───
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

        // Animate terminal windows
        gsap.utils.toArray('.terminal-window').forEach(window => {
            gsap.fromTo(window,
                { opacity: 0, y: 30 },
                {
                    scrollTrigger: {
                        trigger: window,
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
        const fadeElements = document.querySelectorAll('.fade-in-up, .terminal-window');
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

// ─── Smooth Scroll for Navigation ───
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

// ─── Header Scroll Effect ───
function initHeaderEffect() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            header.style.background = 'rgba(10, 10, 10, 0.98)';
            header.style.borderBottomColor = 'var(--primary)';
            header.style.boxShadow = '0 0 20px rgba(51, 255, 0, 0.1)';
        } else {
            header.style.background = 'var(--bg-terminal)';
            header.style.borderBottomColor = 'var(--border)';
            header.style.boxShadow = 'none';
        }
    });
}

// ─── Glitch Effect on Hover ───
function initGlitchEffect() {
    document.querySelectorAll('.glitch').forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.classList.add('glitching');
        });
        el.addEventListener('mouseleave', () => {
            el.classList.remove('glitching');
        });
    });
}

// ─── Random Glitch Effect ───
function randomGlitch() {
    const elements = document.querySelectorAll('.glitch');
    if (elements.length === 0) return;

    setInterval(() => {
        if (Math.random() > 0.95) { // 5% chance every interval
            const randomEl = elements[Math.floor(Math.random() * elements.length)];
            randomEl.classList.add('glitching');
            setTimeout(() => randomEl.classList.remove('glitching'), 200);
        }
    }, 2000);
}

// ─── Loading Spinner Animation ───
function initLoadingSpinner() {
    const spinner = document.querySelector('.loading-spinner');
    if (!spinner) return;

    const frames = '⣾⣽⣻⢿⡿⣟⣯⣷';
    let i = 0;

    setInterval(() => {
        spinner.textContent = frames[i];
        i = (i + 1) % frames.length;
    }, 100);
}

// ─── Fun Random Terminal Messages ───
function initRandomMessages() {
    const messages = [
        '[INFO] Coffee break recommended in 30 minutes',
        '[INFO] Remember to stretch! 🧘',
        '[OK] All systems nominal',
        '[INFO] Fun fact: This site runs on creativity',
        '[INFO] You found a hidden message! 🎉',
        '[OK] Matrix stability at 100%',
        '[INFO] Keep being awesome!',
    ];

    setInterval(() => {
        if (Math.random() > 0.8) { // 20% chance
            const msg = messages[Math.floor(Math.random() * messages.length)];
            console.log(`%c${msg}`, 'color: #33ff00;');
        }
    }, 30000); // Every 30 seconds
}

// ─── Keyboard Shortcuts ───
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search (easter egg)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            console.log('%c[SYSTEM] Search not implemented... yet! 🔍', 'color: #ffb000;');
        }

        // Konami Code
        handleKonamiCode(e.keyCode);
    });
}

// ─── Konami Code Easter Egg ───
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

function handleKonamiCode(keyCode) {
    konamiCode.push(keyCode);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }

    if (konamiCode.join(',') === konamiSequence.join(',')) {
        console.log('%c🎮 KONAMI CODE ACTIVATED! 🎮', 'color: #ffb000; font-size: 20px;');
        document.documentElement.style.setProperty('--primary', '#ffb000');
        document.documentElement.style.setProperty('--secondary', '#ff3333');
        
        // Reset after 5 seconds
        setTimeout(() => {
            document.documentElement.style.setProperty('--primary', '#33ff00');
            document.documentElement.style.setProperty('--secondary', '#ffb000');
        }, 5000);
    }
}

// ─── Initialize Everything ───
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c[SYSTEM] DOM Ready - Initializing modules...', 'color: #ffb000;');

    initSmoothScroll();
    initHeaderEffect();
    initGlitchEffect();
    initLoadingSpinner();
    initRandomMessages();
    initKeyboardShortcuts();
    randomGlitch();

    // Mark body as loaded
    document.body.classList.add('loaded');

    console.log('%c[OK] All systems operational ✓', 'color: #33ff00;');
    console.log('%c[TIP] Open console and type help() for fun commands!', 'color: #ffb000;');
});

// ─── Handle Window Resize ───
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }, 250);
});
