/**
 * ═══════════════════════════════════════════════════════════════
 * RETRO 90s / GEOCITIES PORTFOLIO - Theme JavaScript
 * "Welcome to 1997" - MAXIMUM PLAYFULNESS EDITION
 * Now with 500% more interactions!
 * ═══════════════════════════════════════════════════════════════
 */

console.log('%c[RETRO 90s] Welcome to 1997!', 'color: #FF00FF; font-size: 20px; font-family: "Comic Sans MS", cursive; text-shadow: 2px 2px 0 #FFFF00;');
console.log('%c♦♦♦ Best viewed with Netscape Navigator 4.0 at 800x600 ♦♦♦', 'color: #00FF00; font-size: 12px;');

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
    card.setAttribute('data-tooltip', `Click to visit ${project.title}!`);

    const carouselId = `carousel-${project.id}`;
    const mediaContent = PortfolioBase.createMediaContent(project, carouselId);
    const tagsHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    const indexFormatted = String(index + 1).padStart(2, '0');

    card.innerHTML = `
        <div class="project-titlebar">
            <span class="project-titlebar-text">${project.title}.exe</span>
            <div class="project-titlebar-buttons">
                <span class="titlebar-btn" data-action="minimize">_</span>
                <span class="titlebar-btn" data-action="maximize">□</span>
                <span class="titlebar-btn" data-action="close">×</span>
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
        playVisualClick();
    });

    return card;
}

// ─── Retro Blog Card Renderer ───
function renderRetroBlogCard(article, index) {
    const card = document.createElement('a');
    card.className = 'blog-card';
    if (!article.coverImage) {
        card.classList.add('no-image');
    }
    card.href = `/blog/${article.slug}/`;
    card.setAttribute('data-tooltip', `Read: ${article.title}`);

    const indexFormatted = String(index + 1).padStart(2, '0');
    const date = PortfolioBase.formatDate(article.publishedAt);

    // Only show image container if there's a cover image
    const imageHTML = article.coverImage
        ? `<div class="blog-card-image"><img src="${article.coverImage}" alt="${article.title}" loading="lazy"></div>`
        : '';

    card.innerHTML = `
        <div class="project-titlebar blog-titlebar">
            <span class="project-titlebar-text">blog_post_${indexFormatted}.html</span>
            <div class="project-titlebar-buttons">
                <span class="titlebar-btn">_</span>
                <span class="titlebar-btn">□</span>
                <span class="titlebar-btn">×</span>
            </div>
        </div>
        ${imageHTML}
        <div class="blog-card-content">
            <span class="blog-index">POST #${indexFormatted}</span>
            <h3 class="blog-card-title">${article.title}</h3>
            <p class="blog-card-excerpt">${article.excerpt}</p>
            <div class="blog-card-meta">
                <span class="blog-date">${date}</span>
                <span class="blog-reading-time">${article.readingTime} min read</span>
                <span class="blog-new-badge">NEW!</span>
            </div>
        </div>
    `;

    return card;
}

// ─── Visual Click Feedback (simulates sound) ───
function playVisualClick() {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.05);
        pointer-events: none;
        z-index: 99998;
    `;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 50);
}

// ─── Rainbow Cursor Trail Effect ───
class CursorTrail {
    constructor() {
        this.trails = [];
        this.maxTrails = 12;
        this.colors = ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#00FFFF', '#0080FF', '#FF00FF'];
        this.colorIndex = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.shapes = ['■', '●', '★', '♦', '▲'];
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
                font-size: 12px;
                font-family: Arial, sans-serif;
                opacity: 0;
                text-shadow: 1px 1px 0 #000;
                transform: translate(-50%, -50%);
            `;
            trail.textContent = this.shapes[i % this.shapes.length];
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
            const colorIndex = Math.floor(this.colorIndex + i) % this.colors.length;

            trail.el.style.left = trail.x + 'px';
            trail.el.style.top = trail.y + 'px';
            trail.el.style.opacity = opacity * 0.8;
            trail.el.style.color = this.colors[colorIndex];
            trail.el.style.transform = `translate(-50%, -50%) scale(${1 - i * 0.05}) rotate(${i * 15}deg)`;
        });

        // Cycle colors
        this.colorIndex = (this.colorIndex + 0.05) % this.colors.length;

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
        const colors = ['#FFFF00', '#FF00FF', '#00FFFF', '#FF0000', '#00FF00', '#FF8000'];
        const sparkleCount = 12;
        const shapes = ['★', '✦', '♦', '●', '■'];

        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            sparkle.className = 'sparkle';
            sparkle.textContent = shape;
            sparkle.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                left: ${e.clientX}px;
                top: ${e.clientY}px;
                font-size: ${10 + Math.random() * 10}px;
                color: ${colors[Math.floor(Math.random() * colors.length)]};
                text-shadow: 1px 1px 0 #000;
            `;
            document.body.appendChild(sparkle);

            const angle = (i / sparkleCount) * Math.PI * 2;
            const velocity = 80 + Math.random() * 120;
            const endX = Math.cos(angle) * velocity;
            const endY = Math.sin(angle) * velocity;
            const rotation = Math.random() * 720 - 360;

            sparkle.animate([
                { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 1 },
                { transform: `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) scale(0) rotate(${rotation}deg)`, opacity: 0 }
            ], {
                duration: 600 + Math.random() * 400,
                easing: 'cubic-bezier(0, 0.5, 0.5, 1)'
            }).onfinish = () => sparkle.remove();
        }
    }
}

// ─── Flying Geometric Shapes ───
class FlyingShapes {
    constructor() {
        this.shapes = ['■', '●', '▲', '★', '♦', '◆'];
        this.colors = ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#0000FF'];
        this.init();
    }

    init() {
        // Create initial shapes
        for (let i = 0; i < 6; i++) {
            this.createShape(i * 3);
        }
    }

    createShape(delay = 0) {
        const shape = document.createElement('div');
        shape.className = 'flying-shape';
        const shapeChar = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const size = 16 + Math.random() * 24;
        const startY = Math.random() * 80 + 10;

        shape.textContent = shapeChar;
        shape.style.cssText = `
            position: fixed;
            top: ${startY}vh;
            left: -50px;
            font-size: ${size}px;
            color: ${color};
            pointer-events: none;
            z-index: 0;
            text-shadow: 2px 2px 0 rgba(0,0,0,0.3);
            animation: fly-across ${15 + Math.random() * 15}s linear infinite;
            animation-delay: ${delay}s;
        `;

        document.body.appendChild(shape);

        // Remove and recreate after animation
        setTimeout(() => {
            shape.remove();
            this.createShape();
        }, (15 + delay) * 1000);
    }
}

// ─── Windows 95 Style Tooltips ───
class RetroTooltips {
    constructor() {
        this.tooltip = null;
        this.init();
    }

    init() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'retro-tooltip';
        document.body.appendChild(this.tooltip);

        document.addEventListener('mouseover', this.handleMouseOver.bind(this));
        document.addEventListener('mouseout', this.handleMouseOut.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    handleMouseOver(e) {
        const target = e.target.closest('[data-tooltip]');
        if (target) {
            this.tooltip.textContent = target.dataset.tooltip;
            this.tooltip.classList.add('visible');
        }
    }

    handleMouseOut(e) {
        const target = e.target.closest('[data-tooltip]');
        if (target) {
            this.tooltip.classList.remove('visible');
        }
    }

    handleMouseMove(e) {
        if (this.tooltip.classList.contains('visible')) {
            this.tooltip.style.left = e.clientX + 15 + 'px';
            this.tooltip.style.top = e.clientY + 15 + 'px';
        }
    }
}

// ─── Clippy Helper ───
class ClippyHelper {
    constructor() {
        this.messages = [
            { text: "It looks like you're browsing a portfolio! Need help?", action: "contact" },
            { text: "Wow, these projects look amazing!", action: "projects" },
            { text: "Have you tried clicking on a project?", action: "projects" },
            { text: "Want to get in touch? Click below!", action: "contact" },
            { text: "This site is best viewed at 800x600!", action: null },
            { text: "Press ↑↑↓↓←→←→BA for a surprise!", action: null },
            { text: "Remember to bookmark this page!", action: null },
            { text: "Did you know? This site uses JavaScript!", action: null },
            { text: "Check out what I can do!", action: "about" },
            { text: "The colors! The bevels! So 90s!", action: null },
            { text: "Want to learn more about me?", action: "about" },
            { text: "Links turn red when you hover. Cool, right?", action: null }
        ];
        this.currentMessage = 0;
        this.isVisible = true;
        this.container = null;
        this.clickCount = 0;
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.className = 'retro-clippy show-speech';
        this.container.innerHTML = `
            <div class="clippy-container">
                <div class="clippy-speech">
                    <span class="clippy-message">${this.messages[0].text}</span>
                    <div class="clippy-buttons">
                        <button class="clippy-action">Let's go!</button>
                        <button class="clippy-dismiss">×</button>
                    </div>
                </div>
                <div class="clippy-body">
                    <svg class="clippy-svg" viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
                        <!-- Paperclip body -->
                        <path class="clippy-wire" d="M30 95 L30 75 Q30 55 15 55 Q5 55 5 45 L5 20 Q5 5 20 5 L40 5 Q55 5 55 20 L55 60 Q55 75 40 75 L35 75"
                              fill="none" stroke="#666" stroke-width="6" stroke-linecap="round"/>
                        <path class="clippy-wire-inner" d="M30 95 L30 75 Q30 55 15 55 Q5 55 5 45 L5 20 Q5 5 20 5 L40 5 Q55 5 55 20 L55 60 Q55 75 40 75 L35 75"
                              fill="none" stroke="#999" stroke-width="4" stroke-linecap="round"/>
                        <!-- Eyes -->
                        <ellipse class="clippy-eye-bg" cx="20" cy="30" rx="8" ry="10" fill="white" stroke="#333" stroke-width="1"/>
                        <ellipse class="clippy-eye-bg" cx="44" cy="30" rx="8" ry="10" fill="white" stroke="#333" stroke-width="1"/>
                        <circle class="clippy-pupil clippy-pupil-left" cx="22" cy="32" r="4" fill="#333"/>
                        <circle class="clippy-pupil clippy-pupil-right" cx="46" cy="32" r="4" fill="#333"/>
                        <!-- Eyebrows -->
                        <path class="clippy-eyebrow" d="M12 20 Q20 16 28 20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
                        <path class="clippy-eyebrow" d="M36 20 Q44 16 52 20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
            </div>
        `;

        document.body.appendChild(this.container);

        // Action button - scrolls to relevant section
        this.container.querySelector('.clippy-action').addEventListener('click', (e) => {
            e.stopPropagation();
            const currentMsg = this.messages[this.currentMessage];
            if (currentMsg.action) {
                const section = document.getElementById(currentMsg.action);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                    this.showExcitedAnimation();
                }
            } else {
                // Default action: scroll to contact
                const contact = document.getElementById('contact');
                if (contact) {
                    contact.scrollIntoView({ behavior: 'smooth' });
                    this.showExcitedAnimation();
                }
            }
            this.container.classList.remove('show-speech');
            setTimeout(() => this.showNextMessage(), 3000);
        });

        // Dismiss button
        this.container.querySelector('.clippy-dismiss').addEventListener('click', (e) => {
            e.stopPropagation();
            this.container.classList.remove('show-speech');
            setTimeout(() => this.showNextMessage(), 15000);
        });

        // Click on Clippy body for easter egg
        this.container.querySelector('.clippy-body').addEventListener('click', () => {
            this.clickCount++;

            if (this.clickCount >= 5) {
                // Easter egg: Clippy does a spin!
                this.showEasterEgg();
                this.clickCount = 0;
            } else if (!this.container.classList.contains('show-speech')) {
                this.showNextMessage();
                this.container.classList.add('show-speech');
            }
        });

        // Auto-cycle messages
        this.startMessageCycle();

        // Add eye tracking
        this.initEyeTracking();
    }

    showNextMessage() {
        this.currentMessage = (this.currentMessage + 1) % this.messages.length;
        const messageEl = this.container.querySelector('.clippy-message');
        const actionBtn = this.container.querySelector('.clippy-action');
        const currentMsg = this.messages[this.currentMessage];

        if (messageEl) {
            messageEl.textContent = currentMsg.text;
        }

        // Update button text based on action
        if (actionBtn) {
            if (currentMsg.action === 'contact') {
                actionBtn.textContent = "Let's talk!";
            } else if (currentMsg.action === 'projects') {
                actionBtn.textContent = "Show me!";
            } else if (currentMsg.action === 'about') {
                actionBtn.textContent = "Tell me more!";
            } else {
                actionBtn.textContent = "Cool!";
            }
        }
    }

    showExcitedAnimation() {
        const body = this.container.querySelector('.clippy-body');
        body.style.animation = 'none';
        body.offsetHeight; // Trigger reflow
        body.style.animation = 'clippy-excited 0.5s ease-in-out';
    }

    showEasterEgg() {
        const body = this.container.querySelector('.clippy-body');
        body.style.animation = 'none';
        body.offsetHeight; // Trigger reflow
        body.style.animation = 'clippy-spin 1s ease-in-out';

        // Show special message
        const messageEl = this.container.querySelector('.clippy-message');
        if (messageEl) {
            messageEl.textContent = "Wheee! You found a secret! 🎉";
        }
        this.container.classList.add('show-speech');
    }

    initEyeTracking() {
        document.addEventListener('mousemove', (e) => {
            const leftPupil = this.container.querySelector('.clippy-pupil-left');
            const rightPupil = this.container.querySelector('.clippy-pupil-right');

            if (!leftPupil || !rightPupil) return;

            const rect = this.container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            const distance = Math.min(2, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 100);

            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;

            leftPupil.setAttribute('cx', 22 + offsetX);
            leftPupil.setAttribute('cy', 32 + offsetY);
            rightPupil.setAttribute('cx', 46 + offsetX);
            rightPupil.setAttribute('cy', 32 + offsetY);
        });
    }

    startMessageCycle() {
        setInterval(() => {
            if (this.container.classList.contains('show-speech')) {
                this.showNextMessage();
            }
        }, 8000);
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
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

    // Add click to toggle message
    construction.addEventListener('click', () => {
        const inner = construction.querySelector('.under-construction-inner');
        if (inner) {
            const messages = [
                'SITE UNDER CONSTRUCTION!',
                'COMING SOON!',
                'WORK IN PROGRESS!',
                'PARDON OUR DUST!',
                'MORE FEATURES COMING!'
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            inner.textContent = randomMessage;
        }
    });
}

// ─── Tech Tag Color Cycling ───
function initTechTagColors() {
    const colors = ['#0000FF', '#00AA00', '#800080', '#FF0000', '#008080', '#FF8000'];
    const tags = document.querySelectorAll('.tech-tag');

    tags.forEach((tag, i) => {
        tag.setAttribute('data-tooltip', `I know ${tag.textContent}!`);

        tag.addEventListener('mouseenter', () => {
            tag.style.background = colors[i % colors.length];
            tag.style.color = '#FFFFFF';
            tag.style.textShadow = '1px 1px 0 #000';
        });
        tag.addEventListener('mouseleave', () => {
            tag.style.background = '';
            tag.style.color = '';
            tag.style.textShadow = '';
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
        min-width: 350px;
    `;

    alertBox.innerHTML = `
        <div style="background: linear-gradient(to right, #000080, #1084D0); color: white; padding: 4px 8px; font-weight: bold; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span>🎮 Secret Message</span>
            <span style="cursor: pointer;" id="close-secret">×</span>
        </div>
        <div style="padding: 20px; text-align: center;">
            <p style="font-size: 14px; margin-bottom: 16px;">
                🎉 CONGRATULATIONS! 🎉<br><br>
                <span style="font-family: 'Comic Sans MS', cursive; color: #FF00FF; font-size: 16px;">
                    You found the secret!
                </span><br><br>
                <span style="font-size: 12px; color: #808080;">
                    Enjoy the rainbow mode for 10 seconds!
                </span>
            </p>
            <button id="retro-alert-ok" style="
                background: #C0C0C0;
                border: 2px solid;
                border-color: #FFFFFF #808080 #808080 #FFFFFF;
                padding: 6px 32px;
                font-family: inherit;
                cursor: pointer;
                font-weight: bold;
                font-size: 12px;
            ">COOL!</button>
        </div>
    `;

    document.body.appendChild(alertBox);

    const closeAlert = () => alertBox.remove();
    document.getElementById('retro-alert-ok').addEventListener('click', closeAlert);
    document.getElementById('close-secret').addEventListener('click', closeAlert);

    // Add rainbow mode
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

            const action = btn.dataset.action;
            const card = btn.closest('.project-card');

            // Create a mini flash effect
            btn.style.background = '#FFFFFF';
            setTimeout(() => {
                btn.style.background = '';
            }, 100);

            // Fun actions based on button
            if (action === 'close' && card) {
                card.style.transition = 'transform 0.3s, opacity 0.3s';
                card.style.transform = 'scale(0.9)';
                card.style.opacity = '0.5';
                setTimeout(() => {
                    card.style.transform = '';
                    card.style.opacity = '';
                }, 500);
            } else if (action === 'maximize' && card) {
                card.style.transition = 'transform 0.2s';
                card.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 200);
            } else if (action === 'minimize' && card) {
                card.style.transition = 'transform 0.2s';
                card.style.transform = 'scaleY(0.1)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 300);
            }
        });
    });
}

// ─── Animate Color Squares ───
function initColorSquares() {
    const squares = document.querySelectorAll('.color-square');
    const sounds = ['boop!', 'beep!', 'click!', 'pop!', 'ding!', 'wow!'];

    squares.forEach((square, i) => {
        square.setAttribute('data-tooltip', sounds[i] || 'click!');

        square.addEventListener('mouseenter', () => {
            square.style.transform = 'scale(1.3) rotate(10deg)';
            square.style.zIndex = '10';
        });
        square.addEventListener('mouseleave', () => {
            square.style.transform = '';
            square.style.zIndex = '';
        });
        square.addEventListener('click', (e) => {
            e.preventDefault();
            // Create a burst of that color
            for (let j = 0; j < 6; j++) {
                const burst = document.createElement('div');
                burst.style.cssText = `
                    position: fixed;
                    left: ${e.clientX}px;
                    top: ${e.clientY}px;
                    width: 10px;
                    height: 10px;
                    background: ${getComputedStyle(square).backgroundColor};
                    pointer-events: none;
                    z-index: 10000;
                `;
                document.body.appendChild(burst);

                const angle = (j / 6) * Math.PI * 2;
                const velocity = 60;
                burst.animate([
                    { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                    { transform: `translate(calc(-50% + ${Math.cos(angle) * velocity}px), calc(-50% + ${Math.sin(angle) * velocity}px)) scale(0)`, opacity: 0 }
                ], { duration: 400 }).onfinish = () => burst.remove();
            }
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
        box-shadow: 0 0 5px currentColor;
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
        height: 26px;
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

    const statusPanel = (content, flex = 0, id = '') => `
        <div ${id ? `id="${id}"` : ''} style="
            background: #C0C0C0;
            border: 1px solid;
            border-color: #808080 #FFFFFF #FFFFFF #808080;
            padding: 2px 8px;
            flex: ${flex};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            height: 18px;
            display: flex;
            align-items: center;
        ">${content}</div>
    `;

    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    statusBar.innerHTML = `
        ${statusPanel('Ready', 1, 'status-message')}
        ${statusPanel('<span id="status-coords">x: 0, y: 0</span>')}
        ${statusPanel('<span id="status-time">${time}</span>')}
    `;

    document.body.appendChild(statusBar);

    // Update coordinates on mouse move
    document.addEventListener('mousemove', (e) => {
        const coords = document.getElementById('status-coords');
        if (coords) {
            coords.textContent = `x: ${e.clientX}, y: ${e.clientY}`;
        }
    });

    // Update time every minute
    setInterval(() => {
        const timeEl = document.getElementById('status-time');
        if (timeEl) {
            const now = new Date();
            timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
    }, 60000);

    // Update status message on section scroll
    const sections = ['hero', 'projects', 'about', 'contact'];
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const messageEl = document.getElementById('status-message');
                if (messageEl) {
                    const sectionName = entry.target.id || entry.target.className.split(' ')[0];
                    messageEl.innerHTML = `Viewing: ${sectionName.toUpperCase()}`;
                }
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => {
        const el = document.getElementById(section) || document.querySelector(`.${section}`);
        if (el) observer.observe(el);
    });

    // Add padding to body for status bar
    document.body.style.paddingBottom = '26px';
}

// ─── Add Awards Badges ───
function initAwardsBadges() {
    const contactCard = document.querySelector('.contact-card .card-body');
    if (!contactCard) return;

    const awards = document.createElement('div');
    awards.className = 'retro-awards';
    awards.innerHTML = `
        <div class="award-badge" data-tooltip="Best Site of 1997!">
            <span class="award-icon">🏆</span>
            <span>Best Site 1997</span>
        </div>
        <div class="award-badge" data-tooltip="5 Star Rating!">
            <span class="award-icon">⭐</span>
            <span>5 Star Site</span>
        </div>
        <div class="award-badge" data-tooltip="Hot Pick of the Week!">
            <span class="award-icon">🔥</span>
            <span>Hot Pick</span>
        </div>
        <div class="award-badge" data-tooltip="Cool Site Award!">
            <span class="award-icon">❄️</span>
            <span>Cool Site</span>
        </div>
    `;

    contactCard.appendChild(awards);
}

// ─── Add Webring Navigation ───
function initWebring() {
    const footer = document.querySelector('.footer-content');
    if (!footer) return;

    const webring = document.createElement('div');
    webring.className = 'retro-webring';
    webring.innerHTML = `
        <button class="webring-btn" data-tooltip="Previous site in the ring">◄ Prev</button>
        <div class="webring-text">
            <span class="webring-logo">🌐</span>
            Creative Dev WebRing
        </div>
        <button class="webring-btn" data-tooltip="Next site in the ring">Next ►</button>
    `;

    // Insert before footer info
    const footerInfo = footer.querySelector('.footer-info-row');
    if (footerInfo) {
        footer.insertBefore(webring, footerInfo);
    } else {
        footer.insertBefore(webring, footer.firstChild);
    }

    // Add click handlers with fun messages
    webring.querySelectorAll('.webring-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const messages = [
                "There's only one site in this webring... this one!",
                "You've reached the end of the internet!",
                "404: More sites not found!",
                "Coming soon: More awesome sites!",
                "This is the best site in the ring!"
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            const statusEl = document.getElementById('status-message');
            if (statusEl) {
                statusEl.innerHTML = randomMessage;
            }
        });
    });
}

// ─── Secret Double-Click Easter Egg ───
function initSecretDoubleClick() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;

    heroTitle.addEventListener('dblclick', () => {
        // Make the title do a flip
        heroTitle.style.transition = 'transform 0.6s ease-in-out';
        heroTitle.style.transform = 'rotateY(360deg)';
        setTimeout(() => {
            heroTitle.style.transform = '';
        }, 600);
    });
}

// ─── Hover Effects on Section Titles ───
function initSectionTitleEffects() {
    document.querySelectorAll('.section-title').forEach(title => {
        title.addEventListener('mouseenter', () => {
            title.classList.add('fire-text');
        });
        title.addEventListener('mouseleave', () => {
            title.classList.remove('fire-text');
        });
    });
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

    // Load and render blog articles preview (latest 3)
    PortfolioBase.loadArticles(1, 3).then(data => {
        if (data.articles && data.articles.length > 0) {
            PortfolioBase.renderBlogSection(data.articles, renderRetroBlogCard);
        }
    });

    // Setup marquee
    setupMarquee();

    // Initialize visual effects
    new CursorTrail();
    new SparkleEffect();
    new FlyingShapes();
    new RetroTooltips();
    new ClippyHelper();

    // Initialize animations
    initBounceOnScroll();
    initConstructionWobble();
    initTechTagColors();
    initBlinkBadges();
    initColorSquares();
    initScrollProgress();
    initStatusBar();
    initAwardsBadges();
    initWebring();
    initSecretDoubleClick();
    initSectionTitleEffects();

    // Initialize konami code
    PortfolioBase.initKonamiCode(handleKonami);

    console.log('%c[RETRO 90s] All systems GO! 🚀', 'color: #FFFF00; font-size: 16px;');
    console.log('%c[TIP] Try the Konami Code: ↑↑↓↓←→←→BA', 'color: #00FFFF;');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRetroTheme);
} else {
    initRetroTheme();
}
