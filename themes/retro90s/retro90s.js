/**
 * ═══════════════════════════════════════════════════════════════
 * RETRO 90s / GEOCITIES PORTFOLIO - Theme JavaScript
 * "Welcome to 1997" - Playful interactions and authentic effects
 * ═══════════════════════════════════════════════════════════════
 */

console.log('%c[RETRO 90s] Welcome to 1997!', 'color: #FF00FF; font-size: 20px; font-family: "Comic Sans MS", cursive; text-shadow: 2px 2px 0 #FFFF00;');
console.log('%c♦♦♦ Best viewed with Netscape Navigator 4.0 at 800x600 ♦♦♦', 'color: #00FF00; font-size: 12px;');

// ─── Hit Counter ───
class HitCounter {
    constructor() {
        this.storageKey = 'retro_hit_counter';
        this.count = this.getCount();
        this.increment();
        this.render();
    }

    getCount() {
        try {
            return parseInt(localStorage.getItem(this.storageKey) || '1234', 10);
        } catch {
            return 1234;
        }
    }

    increment() {
        this.count++;
        try {
            localStorage.setItem(this.storageKey, this.count.toString());
        } catch {
            // localStorage not available
        }
    }

    render() {
        const counterEl = document.querySelector('.hit-counter-number');
        if (counterEl) {
            // Pad to 7 digits for that authentic look
            counterEl.textContent = String(this.count).padStart(7, '0');
        }
    }
}

// ─── Marquee Setup ───
function setupMarquee() {
    const marquee = document.querySelector('.retro-marquee .marquee-content');
    if (!marquee) return;

    // Duplicate content for seamless loop
    const content = marquee.innerHTML;
    marquee.innerHTML = content + content;
}

// ─── Retro Project Card Renderer ───
function renderRetroCard(project, index) {
    const card = document.createElement('a');
    card.className = 'project-card';
    card.href = project.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const carouselId = `carousel-${project.id}`;
    const mediaContent = PortfolioBase.createMediaContent(project, carouselId);
    const tagsHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    const indexFormatted = String(index + 1).padStart(2, '0');

    card.innerHTML = `
        <div class="project-titlebar">
            <span class="project-titlebar-text">${project.title}.exe</span>
            <div class="project-titlebar-buttons">
                <span class="titlebar-btn">_</span>
                <span class="titlebar-btn">□</span>
                <span class="titlebar-btn">×</span>
            </div>
        </div>
        <div class="project-media-container">
            <span class="project-index">#${indexFormatted}</span>
            ${mediaContent}
        </div>
        <div class="project-info">
            <span class="project-type">${project.type}</span>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="tags">${tagsHTML}</div>
            <div class="project-link">
                <span class="link-icon">→</span>
                <span class="link-url">Click here to visit!</span>
            </div>
        </div>
    `;

    // Add hover sound effect simulation (visual feedback)
    card.addEventListener('mouseenter', () => {
        card.style.cursor = 'pointer';
    });

    return card;
}

// ─── Cursor Trail Effect ───
class CursorTrail {
    constructor() {
        this.trails = [];
        this.maxTrails = 10;
        this.colors = ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#00FFFF', '#0080FF', '#FF00FF'];
        this.colorIndex = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.init();
    }

    init() {
        // Create trail elements
        for (let i = 0; i < this.maxTrails; i++) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                width: 8px;
                height: 8px;
                border-radius: 0;
                opacity: 0;
                transition: none;
            `;
            document.body.appendChild(trail);
            this.trails.push({
                el: trail,
                x: 0,
                y: 0,
                age: 0
            });
        }

        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.animate();
    }

    handleMouseMove(e) {
        this.lastX = e.clientX;
        this.lastY = e.clientY;
    }

    animate() {
        // Shift trails
        for (let i = this.trails.length - 1; i > 0; i--) {
            this.trails[i].x = this.trails[i - 1].x;
            this.trails[i].y = this.trails[i - 1].y;
        }

        // Update first trail to cursor position
        this.trails[0].x = this.lastX;
        this.trails[0].y = this.lastY;

        // Update trail positions and colors
        this.trails.forEach((trail, i) => {
            const opacity = 1 - (i / this.maxTrails);
            const size = 8 - (i * 0.5);
            const colorIndex = (this.colorIndex + i) % this.colors.length;

            trail.el.style.left = trail.x + 'px';
            trail.el.style.top = trail.y + 'px';
            trail.el.style.width = size + 'px';
            trail.el.style.height = size + 'px';
            trail.el.style.opacity = opacity * 0.7;
            trail.el.style.backgroundColor = this.colors[colorIndex];
            trail.el.style.boxShadow = `0 0 ${size}px ${this.colors[colorIndex]}`;
        });

        // Cycle colors
        this.colorIndex = (this.colorIndex + 0.1) % this.colors.length;

        requestAnimationFrame(this.animate.bind(this));
    }
}

// ─── Sparkle Effect on Click ───
class SparkleEffect {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('click', this.createSparkle.bind(this));
    }

    createSparkle(e) {
        const colors = ['#FFFF00', '#FF00FF', '#00FFFF', '#FF0000', '#00FF00'];
        const sparkleCount = 8;

        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                left: ${e.clientX}px;
                top: ${e.clientY}px;
                width: 6px;
                height: 6px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border: 1px solid #000;
            `;
            document.body.appendChild(sparkle);

            const angle = (i / sparkleCount) * Math.PI * 2;
            const velocity = 100 + Math.random() * 100;
            const endX = Math.cos(angle) * velocity;
            const endY = Math.sin(angle) * velocity;

            sparkle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${endX}px, ${endY}px) scale(0)`, opacity: 0 }
            ], {
                duration: 500,
                easing: 'ease-out'
            }).onfinish = () => sparkle.remove();
        }
    }
}

// ─── Bounce Animation on Scroll ───
function initBounceOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('bounce-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-title, .about-card, .contact-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });

    // Add bounce animation styles
    const style = document.createElement('style');
    style.textContent = `
        .bounce-in {
            animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        @keyframes bounceIn {
            0% { opacity: 0; transform: translateY(30px) scale(0.95); }
            60% { opacity: 1; transform: translateY(-10px) scale(1.02); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// ─── Random "Under Construction" GIF Wobble ───
function initConstructionWobble() {
    const construction = document.querySelector('.under-construction');
    if (!construction) return;

    setInterval(() => {
        construction.style.transform = `rotate(${Math.random() * 6 - 3}deg)`;
    }, 2000);
}

// ─── Tech Tag Color Cycling ───
function initTechTagColors() {
    const colors = ['#0000FF', '#00AA00', '#800080', '#FF0000', '#008080'];
    const tags = document.querySelectorAll('.tech-tag');

    tags.forEach((tag, i) => {
        tag.addEventListener('mouseenter', () => {
            tag.style.background = colors[i % colors.length];
            tag.style.color = '#FFFFFF';
        });
        tag.addEventListener('mouseleave', () => {
            tag.style.background = '';
            tag.style.color = '';
        });
    });
}

// ─── Easter Egg: Konami Code ───
function handleKonami() {
    console.log('%c🎮 CHEAT CODE ACTIVATED!', 'color: #FFFF00; font-size: 24px; background: #000080; padding: 10px;');

    // Create retro alert box
    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 99999;
        background: #C0C0C0;
        border: 2px solid;
        border-color: #FFFFFF #808080 #808080 #FFFFFF;
        padding: 0;
        box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
        font-family: "MS Sans Serif", Tahoma, sans-serif;
        min-width: 300px;
    `;

    alertBox.innerHTML = `
        <div style="background: linear-gradient(to right, #000080, #1084D0); color: white; padding: 4px 8px; font-weight: bold; font-size: 12px;">
            Secret Message
        </div>
        <div style="padding: 16px; text-align: center;">
            <p style="font-size: 14px; margin-bottom: 16px;">
                🎉 You found the secret! 🎉<br><br>
                <span style="font-family: 'Comic Sans MS', cursive; color: #FF00FF;">
                    Thanks for visiting my portfolio!
                </span>
            </p>
            <button id="retro-alert-ok" style="
                background: #C0C0C0;
                border: 2px solid;
                border-color: #FFFFFF #808080 #808080 #FFFFFF;
                padding: 4px 24px;
                font-family: inherit;
                cursor: pointer;
                font-weight: bold;
            ">OK</button>
        </div>
    `;

    document.body.appendChild(alertBox);

    document.getElementById('retro-alert-ok').addEventListener('click', () => {
        alertBox.remove();
    });

    // Add rainbow mode temporarily
    document.body.style.animation = 'rainbow-bg 2s linear infinite';
    const rainbowStyle = document.createElement('style');
    rainbowStyle.id = 'konami-rainbow';
    rainbowStyle.textContent = `
        @keyframes rainbow-bg {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(rainbowStyle);

    setTimeout(() => {
        document.body.style.animation = '';
        rainbowStyle.remove();
    }, 10000);
}

// ─── Random Blink Effect for "NEW" Badges ───
function initBlinkBadges() {
    const badges = document.querySelectorAll('.retro-badge');
    badges.forEach((badge, i) => {
        // Stagger the blink timing
        badge.style.animationDelay = `${i * 0.2}s`;
    });
}

// ─── Window Title Bar Button Effects ───
function initTitlebarButtons() {
    document.querySelectorAll('.titlebar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Create a mini flash effect
            btn.style.background = '#FFFFFF';
            setTimeout(() => {
                btn.style.background = '';
            }, 100);
        });
    });
}

// ─── Animate Color Squares ───
function initColorSquares() {
    const squares = document.querySelectorAll('.color-square');
    squares.forEach((square, i) => {
        square.addEventListener('mouseenter', () => {
            square.style.transform = 'scale(1.3) rotate(10deg)';
            square.style.zIndex = '10';
        });
        square.addEventListener('mouseleave', () => {
            square.style.transform = '';
            square.style.zIndex = '';
        });
    });
}

// ─── Scroll Progress Bar (very 90s!) ───
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 4px;
        width: 0%;
        background: linear-gradient(to right, #FF0000, #FF8000, #FFFF00, #00FF00, #00FFFF, #0080FF, #FF00FF);
        z-index: 10001;
        transition: width 0.1s linear;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

// ─── Add Status Bar at Bottom ───
function initStatusBar() {
    const statusBar = document.createElement('div');
    statusBar.className = 'retro-status-bar';
    statusBar.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 24px;
        background: #C0C0C0;
        border-top: 2px solid;
        border-color: #FFFFFF #808080 #808080 #FFFFFF;
        display: flex;
        align-items: center;
        padding: 0 4px;
        gap: 4px;
        font-family: "MS Sans Serif", Tahoma, sans-serif;
        font-size: 11px;
        z-index: 1000;
    `;

    const statusPanel = (content, flex = 0) => `
        <div style="
            background: #C0C0C0;
            border: 1px solid;
            border-color: #808080 #FFFFFF #FFFFFF #808080;
            padding: 2px 8px;
            flex: ${flex};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        ">${content}</div>
    `;

    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    statusBar.innerHTML = `
        ${statusPanel('Ready', 1)}
        ${statusPanel('<span id="status-coords">x: 0, y: 0</span>')}
        ${statusPanel(time)}
    `;

    document.body.appendChild(statusBar);

    // Update coordinates on mouse move
    document.addEventListener('mousemove', (e) => {
        const coords = document.getElementById('status-coords');
        if (coords) {
            coords.textContent = `x: ${e.clientX}, y: ${e.clientY}`;
        }
    });

    // Add padding to body for status bar
    document.body.style.paddingBottom = '24px';
}

// ─── "You Are Visitor #" Animation ───
function animateHitCounter() {
    const counter = document.querySelector('.hit-counter-number');
    if (!counter) return;

    const finalValue = parseInt(counter.textContent, 10);
    let currentValue = 0;
    const duration = 2000;
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for more dramatic effect
        const easeOut = 1 - Math.pow(1 - progress, 3);

        currentValue = Math.floor(easeOut * finalValue);
        counter.textContent = String(currentValue).padStart(7, '0');

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    // Start animation after a delay
    setTimeout(() => requestAnimationFrame(animate), 500);
}

// ─── Initialize Retro Theme ───
async function initRetroTheme() {
    console.log('%c[RETRO 90s] Initializing radical effects...', 'color: #00FF00;');

    // Initialize base and load content
    await PortfolioBase.initBase();

    // Load and render projects with retro card renderer
    PortfolioBase.loadProjects().then(projects => {
        PortfolioBase.renderProjects(projects, renderRetroCard);
        initTitlebarButtons();
    });

    // Initialize hit counter
    new HitCounter();
    animateHitCounter();

    // Setup marquee
    setupMarquee();

    // Initialize visual effects
    new CursorTrail();
    new SparkleEffect();

    // Initialize animations
    initBounceOnScroll();
    initConstructionWobble();
    initTechTagColors();
    initBlinkBadges();
    initColorSquares();
    initScrollProgress();
    initStatusBar();

    // Initialize konami code
    PortfolioBase.initKonamiCode(handleKonami);

    console.log('%c[RETRO 90s] All systems GO! 🚀', 'color: #FFFF00; font-size: 16px;');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRetroTheme);
} else {
    initRetroTheme();
}
