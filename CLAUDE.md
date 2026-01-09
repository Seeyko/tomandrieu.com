# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website (tomandrieu.com) with a monorepo structure:
- `/frontend` - Static frontend with multiple switchable themes (no build system)
- `/backend` - (Future) Backend services

## Agent Collaboration

**IMPORTANT**: When working on this project, Claude agents must coordinate their work to avoid conflicts.

### Work Progress Tracking

1. Before starting work, check `WORK_IN_PROGRESS.md` to see what other agents are working on
2. Write your plan and current progress to `WORK_IN_PROGRESS.md` before making changes
3. Update the file as you progress, even if work is incomplete
4. Push the file regularly so other agents know what you're working on
5. When discovering new patterns, conventions, or important information, document them in this file

### WORK_IN_PROGRESS.md Format

```markdown
## Current Work

### [Agent Session ID or Timestamp]
**Status**: in_progress | completed | blocked
**Working on**: Brief description
**Files being modified**:
- file1.js
- file2.css

**Progress**:
- [x] Step 1
- [ ] Step 2

**Notes/Discoveries**:
- Any important findings
```

## Running Locally

```bash
cd frontend

# Using Python
python -m http.server 8000

# Using Node.js npx
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` (or `http://localhost:8000?theme=blueprint` to test a specific theme).

## Architecture

### Project Structure

```
/
├── frontend/           # Static frontend files
│   ├── assets/         # Images, fonts, etc.
│   ├── css/            # Stylesheets
│   ├── data/           # JSON data files
│   ├── js/             # JavaScript files
│   ├── themes/         # Theme-specific files
│   └── index.html      # Main HTML file
├── nginx/              # Nginx configuration
├── Dockerfile          # Frontend container
├── docker-compose.yml  # Docker orchestration
└── CLAUDE.md           # This file
```

### Theme System

The site supports three visual themes that can be switched via URL query parameter (`?theme=terminal|blueprint|retro90s`) or the floating theme switcher button:

- **terminal** (default): Cyber-industrial hacker aesthetic with green terminal text, CRT effects
- **blueprint**: Architectural drawing aesthetic with technical annotations
- **retro90s**: GeoCities nostalgia with marquees, hit counters, under construction badges

Each theme has its own directory under `/frontend/themes/{theme-name}/` containing:
- `{theme-name}.css` - Theme-specific styles
- `{theme-name}.js` - Theme-specific JavaScript and card renderer

### Core Files

- `/frontend/js/theme-manager.js` - Handles theme loading, switching, URL params, localStorage persistence
- `/frontend/js/base.js` - Shared functionality: content loading, project rendering, carousels, scroll animations
- `/frontend/css/base.css` - Reset, shared layout, carousel base, animations
- `/frontend/index.html` - Single HTML page with all section markup; theme-specific elements hidden by default in CSS

### Data Files

- `/frontend/data/projects.json` - Array of portfolio projects with id, title, description, type, url, images, video, tags
- `/frontend/data/content.json` - Site metadata, hero text, about section specs, tech stack, contact/social links

### Adding a New Theme

1. Create `/frontend/themes/{new-theme}/` directory with CSS and JS files
2. Register the theme in `ThemeManager.THEMES` object in `/frontend/js/theme-manager.js`
3. Implement a card renderer function in the theme JS (see `renderTerminalCard` in terminal.js)
4. Call `PortfolioBase.renderProjects(projects, yourCardRenderer)` after loading projects
5. Theme-specific HTML elements in index.html are hidden by default; show them via your theme's CSS

### Key Patterns

- Theme JS files must call `PortfolioBase.initBase()` and `PortfolioBase.loadProjects()` to initialize
- Content elements use `data-content="path.to.value"` attributes for dynamic population from content.json
- GSAP + ScrollTrigger handles scroll animations (loaded from CDN)
- Carousels auto-initialize for any element with `.project-carousel` class

## Git Workflow

- Always commit and push directly to the `main` branch
- Never create feature branches or custom branches
- Do not create pull requests; push commits directly to main
