# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Static website for Eight38, an AI automation agency based in Cape Town. Pure HTML/CSS/JS — no frameworks, no build tools, no package.json.

## Running Locally

```bash
cd Website
python -m http.server 8080
# Open http://localhost:8080
```

The site uses absolute paths (`/css/styles.css`), so it must be served from a local web server — opening HTML files directly via `file://` will break asset loading.

## Deployment

Dockerised Nginx (see `Dockerfile`). Deployed to Easypanel from GitHub `WEYERSK/Eight38-Website`. Push to `main` triggers rebuild.

## Architecture

### No Build Step

Everything is hand-authored HTML/CSS/JS. There is no transpilation, bundling, or preprocessing. Edit files directly.

### Shared Header/Footer

Header and footer HTML is **duplicated across all 22+ pages** (static site limitation). Shared regions are marked:

```html
<!-- === SHARED HEADER START === -->
...
<!-- === SHARED HEADER END === -->
```

**When editing header or footer, you must update every HTML file.** Grep for the marker comments to find all instances.

### CSS Architecture (`css/styles.css`)

Single file, ~1,560 lines, organised in 20 numbered sections. Uses CSS custom properties in `:root` for the design system:

- **Backgrounds:** `--bg-primary` (#0a0a0a), `--bg-secondary`, `--bg-tertiary`, `--bg-card`
- **Text:** `--text-primary` (#f0f0f0), `--text-secondary`, `--text-muted`
- **Accent:** `--accent` (#0ea5e9), `--accent-hover`, `--accent-dark`
- **Fonts:** `--font-display` (Syne), `--font-body` (DM Sans), `--font-mono` (JetBrains Mono)

Class naming is BEM-lite: `hero-title`, `card--accent`, `btn--primary`, `faq-item.active`.

Responsive breakpoint is `768px` for mobile. Uses `clamp()` for fluid typography and spacing.

### JavaScript (`js/main.js`)

Single file, ~230 lines, vanilla ES6+. Initialises on DOMContentLoaded:

- `initMobileNav()` — hamburger toggle with slide-in overlay
- `initSmoothScroll()` — anchor links with header offset
- `initFaqAccordion()` — one-at-a-time expand, ARIA managed
- `initStickyHeader()` — IntersectionObserver on hero element
- `initForms()` — JSON POST to n8n webhook, honeypot check, validation
- `initShareButtons()` — Twitter/LinkedIn/email/copy share URLs
- `initScrollReveal()` — fade-in on scroll, respects `prefers-reduced-motion`
- `initActiveNav()` — highlights current section in nav

### Forms

All forms POST JSON to a single n8n webhook. Distinguished by hidden fields:

```html
<input type="hidden" name="form_type" value="contact">        <!-- or "lead_magnet" -->
<input type="hidden" name="resource" value="checklist-name">   <!-- on lead magnet forms -->
```

Honeypot field (`.form-hp`, hidden input named `website`) — if filled, JS fakes success and doesn't submit. n8n should also filter on this.

Webhook URL: hardcoded in `data-action` attribute on each `<form>`.

### Lead Magnets

Landing pages in `/resources/` capture email, then redirect to `/resources/thank-you.html?resource=<name>`. Thank-you page reads the URL parameter and shows the correct download link pointing to `/downloads/<name>.html`.

Download files in `/downloads/` are self-contained styled HTML (inline CSS, Google Fonts only). Blocked from search engines via `robots.txt`.

## Content Rules

- **British/South African English** throughout: customise, optimise, organisation, analyse, colour, centre
- **Brand voice:** conversational, approachable, no buzzwords (revolutionary, game-changing, seamless, cutting-edge)
- **Blog posts:** 1,400–1,600 words, SEO meta tags, share buttons, internal links, post-cta box
- **Copyright year** in footer: keep current

## Key Files

| File | Purpose |
|------|---------|
| `css/styles.css` | Entire design system |
| `js/main.js` | All interactivity |
| `sitemap.xml` | Update when adding/removing pages |
| `llms.txt` | Update when adding services or blog posts |
| `robots.txt` | `/downloads/` is blocked from crawlers |
| `Dockerfile` | Nginx Alpine static hosting config |
