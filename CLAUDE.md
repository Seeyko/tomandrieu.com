# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website (tomandrieu.com) with a monorepo structure:
- `/frontend` - Static frontend with multiple switchable themes (no build system)
- `/backend` - (Future) Backend services

## Agent Collaboration

**IMPORTANT**: When working on this project, Claude agents must coordinate their work to avoid conflicts.

### Work Progress Tracking

Each agent creates their own work file in `/.claude/work/` to avoid merge conflicts:

1. Before starting work, check `/.claude/work/` for other agents' files
2. Create your own file: `/.claude/work/{timestamp}-{description}.md`
3. Update your file as you progress, even if work is incomplete
4. Push your file regularly so other agents know what you're working on
5. Delete your file when work is merged (or mark as completed)

### Work File Format

Filename: `YYYY-MM-DD-HHMMSS-short-description.md`

```markdown
# {Short Description}

**Status**: in_progress | completed | blocked
**Branch**: `feature/branch-name`
**Started**: YYYY-MM-DD HH:MM

## Task
Brief description of what you're working on.

## Files Being Modified
- file1.js
- file2.css

## Progress
- [x] Step 1
- [ ] Step 2

## Notes/Discoveries
- Any important findings for other agents
```

## Testing Requirements

**CRITICAL: ALWAYS test code changes in the browser before considering work complete.**

After making any frontend changes:
1. Start a local server (see commands below)
2. Open Chrome browser using the Claude in Chrome plugin
3. Navigate to `http://localhost:8000` and visually verify changes work
4. Test different themes if theme-related changes were made (`?theme=terminal`, `?theme=blueprint`, `?theme=retro90s`)
5. Check the browser console for any JavaScript errors

Never rely solely on code review - always verify visually in the browser.

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
├── .claude/
│   └── work/           # Agent work-in-progress files
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

**CRITICAL: `main` branch is production. NEVER push directly to `main`.**

### Branch Workflow

1. Always create a feature branch for your work:
   ```bash
   git checkout -b feature/short-description
   ```
2. Make commits on your feature branch
3. Push your branch to remote:
   ```bash
   git push -u origin feature/short-description
   ```
4. Create a merge request (pull request) when work is complete
5. Wait for review and approval before merging

### Branch Naming

- `feature/` - New features (e.g., `feature/add-backend-api`)
- `fix/` - Bug fixes (e.g., `fix/carousel-animation`)
- `refactor/` - Code refactoring (e.g., `refactor/theme-system`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)

### Commit Messages

**IMPORTANT: Do NOT add Claude signature or Co-Authored-By lines to commits.** This breaks the user's commit signature verification.

## Autonomous Development

Claude is configured for autonomous development with browser testing capabilities.

### Available Agents

Located in `/.claude/agents/`:

- **test-validator.md**: Browser testing agent that validates changes in Chrome
- **code-reviewer.md**: Code review agent for security and quality checks

### Browser Testing URLs

| Environment | URL |
|-------------|-----|
| Local Dev | `http://localhost:8000` |
| Production | `https://tomandrieu.com` |

Theme-specific testing:
- Terminal: `http://localhost:8000?theme=terminal`
- Blueprint: `http://localhost:8000?theme=blueprint`
- Retro90s: `http://localhost:8000?theme=retro90s`

### Development Workflow

1. **Before coding**: Read relevant files, understand existing patterns
2. **While coding**: Follow existing code style, no over-engineering
3. **After coding**:
   - Start local server: `python -m http.server 8000` (from /frontend)
   - Test in browser using Claude in Chrome
   - Check console for errors
   - Test all themes if theme-related
4. **Before committing**: Run code review checks
5. **Create PR**: Never push directly to main

### Permissions Configured

The following are pre-approved in `.claude/settings.local.json`:
- Git operations (checkout, add, commit, push, branch, etc.)
- Local server commands (python http.server, npx serve)
- GitHub CLI (gh)
- Chrome browser automation (mcp__claude-in-chrome__*)
