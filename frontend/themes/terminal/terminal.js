/**
 * ═══════════════════════════════════════════════════════════════
 * TERMINAL CLI PORTFOLIO - Theme JavaScript
 * "Cyber-Industrial Hacker" Aesthetic - Theme-specific effects
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

// ─── DOM Elements ───
const customCursor = document.getElementById('custom-cursor');
const coordX = document.getElementById('coord-x');
const coordY = document.getElementById('coord-y');
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

        if (customCursor) {
            customCursor.style.transform = `translate(${this.cursorX + 10}px, ${this.cursorY - 10}px)`;
        }

        requestAnimationFrame(this.animate.bind(this));
    }
}

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

// ─── Terminal Card Renderer ───
function renderTerminalCard(project, index) {
    const card = document.createElement('a');
    card.className = 'project-card fade-in-up';
    card.href = project.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const carouselId = `carousel-${project.id}`;
    const mediaContent = PortfolioBase.createMediaContent(project, carouselId);
    const tagsHTML = project.tags.map(tag => `<span class="tag">[ ${tag} ]</span>`).join('');
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

    return card;
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
    document.querySelectorAll('.section-title').forEach(el => {
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
    const elements = document.querySelectorAll('.section-title');
    if (elements.length === 0) return;

    setInterval(() => {
        if (Math.random() > 0.95) {
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
        if (Math.random() > 0.8) {
            const msg = messages[Math.floor(Math.random() * messages.length)];
            console.log(`%c${msg}`, 'color: #33ff00;');
        }
    }, 30000);
}

// ─── Keyboard Shortcuts ───
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            console.log('%c[SYSTEM] Search not implemented... yet! 🔍', 'color: #ffb000;');
        }
    });
}

// ─── Konami Code Handler ───
function handleKonami() {
    console.log('%c🎮 KONAMI CODE ACTIVATED! 🎮', 'color: #ffb000; font-size: 20px;');
    document.documentElement.style.setProperty('--primary', '#ffb000');
    document.documentElement.style.setProperty('--secondary', '#ff3333');
    
    setTimeout(() => {
        document.documentElement.style.setProperty('--primary', '#33ff00');
        document.documentElement.style.setProperty('--secondary', '#ffb000');
    }, 5000);
}

// ─── Initialize Terminal Theme ───
async function initTerminalTheme() {
    console.log('%c[SYSTEM] DOM Ready - Initializing Terminal modules...', 'color: #ffb000;');

    // Initialize cursor tracker
    new CursorTracker();

    // Initialize typewriter
    const heroMessages = [
        'echo "Hello, World!"',
        'npm run create-awesome-stuff',
        'git commit -m "made it better"',
        'sudo make me a sandwich',
        'while(true) { code(); coffee(); }',
        './build-dreams.sh --with-passion',
        'grep -r "bugs" . | rm -rf',
    ];

    setTimeout(() => {
        new Typewriter(heroTyped, heroMessages, 60);
    }, 1000);

    // Initialize base and load content
    await PortfolioBase.initBase();

    // Load and render projects with terminal card renderer
    PortfolioBase.loadProjects().then(projects => {
        PortfolioBase.renderProjects(projects, renderTerminalCard);
    });

    // Initialize theme-specific effects
    initHeaderEffect();
    initGlitchEffect();
    initLoadingSpinner();
    initRandomMessages();
    initKeyboardShortcuts();
    randomGlitch();

    // Initialize konami code
    PortfolioBase.initKonamiCode(handleKonami);

    console.log('%c[OK] All systems operational ✓', 'color: #33ff00;');
    console.log('%c[TIP] Open console and type help() for fun commands!', 'color: #ffb000;');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTerminalTheme);
} else {
    initTerminalTheme();
}
