# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website (tomandrieu.com) - a static frontend with multiple switchable themes. No build system or package manager is used; serve the files directly with any static web server.

## Running Locally

```bash
# Using Python
python -m http.server 8000

# Using Node.js npx
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` (or `http://localhost:8000?theme=blueprint` to test a specific theme).

## Architecture

### Theme System

The site supports three visual themes that can be switched via URL query parameter (`?theme=terminal|blueprint|retro90s`) or the floating theme switcher button:

- **terminal** (default): Cyber-industrial hacker aesthetic with green terminal text, CRT effects
- **blueprint**: Architectural drawing aesthetic with technical annotations
- **retro90s**: GeoCities nostalgia with marquees, hit counters, under construction badges

Each theme has its own directory under `/themes/{theme-name}/` containing:
- `{theme-name}.css` - Theme-specific styles
- `{theme-name}.js` - Theme-specific JavaScript and card renderer

### Core Files

- `/js/theme-manager.js` - Handles theme loading, switching, URL params, localStorage persistence
- `/js/base.js` - Shared functionality: content loading, project rendering, carousels, scroll animations
- `/css/base.css` - Reset, shared layout, carousel base, animations
- `/index.html` - Single HTML page with all section markup; theme-specific elements hidden by default in CSS

### Data Files

- `/projects.json` - Array of portfolio projects with id, title, description, type, url, images, video, tags
- `/data/content.json` - Site metadata, hero text, about section specs, tech stack, contact/social links

### Adding a New Theme

1. Create `/themes/{new-theme}/` directory with CSS and JS files
2. Register the theme in `ThemeManager.THEMES` object in `/js/theme-manager.js`
3. Implement a card renderer function in the theme JS (see `renderTerminalCard` in terminal.js)
4. Call `PortfolioBase.renderProjects(projects, yourCardRenderer)` after loading projects
5. Theme-specific HTML elements in index.html are hidden by default; show them via your theme's CSS

### Key Patterns

- Theme JS files must call `PortfolioBase.initBase()` and `PortfolioBase.loadProjects()` to initialize
- Content elements use `data-content="path.to.value"` attributes for dynamic population from content.json
- GSAP + ScrollTrigger handles scroll animations (loaded from CDN)
- Carousels auto-initialize for any element with `.project-carousel` class
