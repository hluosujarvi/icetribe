# GitHub Copilot Instructions for Icetribe Hugo Website

## 🚨 CRITICAL WORKFLOW RULES

### 📚 ALWAYS Read Documentation First
**BEFORE any task, ALWAYS read both:**
1. **`README.md`** - Project overview and basic setup
2. **`TECHNICAL_README.md`** - Detailed technical documentation, architecture, and development guidelines

These files contain the most current and accurate information about the project structure, features, and implementation details.

### 🔍 Analysis vs Implementation Mode
- **When asked to "tutkia" (investigate), "analysoida" (analyze), "tarkistaa" (check), or "selvittää" (find out)**: 
  - **DO NOT make any changes**
  - Only read, search, and report findings
  - Provide comprehensive analysis and recommendations
  - Ask for explicit permission before implementing any changes

- **When asked to implement, create, fix, or modify**:
  - Proceed with changes after analysis
  - Always remind about documentation updates after changes

### 🚫 Git Policy - NO UNAUTHORIZED PUSHES
- **NEVER push, commit, or merge to git without explicit permission**
- **NEVER run**: `git push`, `git commit`, `git merge`, `git pull --rebase`, etc.
- **OK to run**: `git status`, `git log`, `git diff`, `git branch` (read-only operations)
- **When changes are made**: Always remind user to review changes and handle git operations manually

### 🌿 Branch Strategy for Major Changes
- **When user requests significant changes and we have a working branch**:
  - **ALWAYS suggest creating a new branch first**
  - Format: "Ehdotan uuden brangin luomista: `git checkout -b feature/[description]`"
  - Explain why branching is beneficial for the specific change
  - Wait for user confirmation before proceeding

### 📝 Documentation Reminder
**After ANY changes to code, structure, or features:**
Always remind user to update documentation:
```
⚠️ MUISTUTUS: Muutosten jälkeen päivitä dokumentaatio:
- README.md (jos muutokset vaikuttavat yleiseen käyttöön)
- TECHNICAL_README.md (jos muutokset vaikuttavat tekniseen toteutukseen)
- Commit-viestit ja changelog tarpeen mukaan
```

## Project Overview
This is **Icetribe**, a Finnish pop & rock cover band website built with Hugo static site generator. The site showcases the band's information, repertoire spanning 7 decades (1960s-2020s), news/blog posts, and contact details.

## Key Project Details
- **Language**: Finnish (fi-fi)
- **Framework**: Hugo v0.152.0+ Extended (with image processing)
- **Theme**: Ananke (direct copy, not submodule) 
- **Deployment**: GitHub Pages via GitHub Actions
- **Image Optimization**: Hero images via Hugo resources + WebP conversion (85% quality)
- **Social Media**: Facebook, Instagram, SoundCloud integration with GDPR compliance

## Architecture & File Structure

### Core Configuration
- **`hugo.toml`**: Main site configuration with Finnish language settings
- **Navigation menu**: 5 main sections (Etusivu, Tietoa, Soitossa, Uutiset, Yhteystiedot)
- **Hero Image Optimization**: Hugo resources processing with WebP conversion (1600px, 85% quality)
- **Cookie Management**: GDPR-compliant system with Google Analytics 4 consent integration

### Content Structure
```
content/
├── _index.md           # Homepage (Finnish: "Icetribe Pops. Icetribe Rocks!")
├── about.md            # Band info (Finnish: "Tietoa yhtyeestä") 
├── soitossa.md         # Song repertoire (Finnish: "Soitossa")
├── yhteystiedot.md     # Contact info (Finnish: "Yhteystiedot")
└── posts/              # Blog posts/news (Finnish: "Uutiset")
    └── [post-name]/    # Page Bundle structure
        ├── index.md    # Post content
        └── *.jpg       # Post images
```

### Image Management Strategy
**IMPORTANT: Always check TECHNICAL_README.md for current image optimization workflow**

1. **Hero Images**: Via Hugo resources processing (`assets/images/` → optimized WebP)
2. **Content Images**: `layouts/shortcodes/img.html` for responsive WebP conversion
3. **Static Images**: `static/images/` for non-processed assets

### Advanced Features
- **Hero Image Processing**: `layouts/partials/func/GetFeaturedImage.html` with Hugo resources
- **Cookie Consent System**: GDPR-compliant with Google Analytics 4 integration
- **SoundCloud Integration**: Consent-aware embedding with privacy controls
- **Comprehensive Testing**: Automated test suite for functionality validation

## Content Guidelines

### Language & Tone
- **Primary Language**: Finnish
- **Tone**: Friendly, energetic, professional but approachable
- **Target Audience**: Event organizers, music fans, all generations (covers 60s-2020s)

### Band Information
- **Location**: Tampere, Finland
- **Genre**: Pop & Rock covers
- **Repertoire**: 7 decades of hits (1960s-2020s)
- **Members**: 5 members (Tiina-vocals, Henry-drums, Tomi-bass, Kalle-keyboards, Jarmo-guitar)

### Content Types
1. **Band Info**: Professional but personal, emphasize experience and crowd engagement
2. **Repertoire**: Organized by decades, focus on recognizable hits
3. **News/Posts**: Gig reports, updates, behind-the-scenes content
4. **Contact**: Event booking focus, professional contact information

## Technical Implementation

### Image Optimization
```gohtml
{{< img src="image.jpg" alt="Description" >}}
```
- Automatically converts to WebP (85% quality)
- Creates responsive `<picture>` elements
- Falls back to JPEG for browser compatibility
- Lazy loading enabled

### Page Bundle Structure (for posts)
```
content/posts/post-name/
├── index.md        # Post content
├── hero.jpg        # Featured image
└── content.jpg     # Content images
```

### Front Matter Standards
```yaml
+++
title = 'Finnish Title'
date = '2025-11-09'
draft = false
featured_image = 'image.jpg'  # For Page Bundles
# OR
featured_image = '/images/image.jpg'  # For static images
tags = ['keikka', 'uutiset']  # Finnish tags
+++
```

### Navigation Structure
- **Etusivu** (/) - Homepage
- **Tietoa** (/about/) - Band information  
- **Soitossa** (/soitossa/) - Repertoire *(Note: URL changed from /repertuaari/)*
- **Uutiset** (/posts/) - News/blog
- **Yhteystiedot** (/yhteystiedot/) - Contact

## Development Workflow

### Pre-Work Requirements
**MANDATORY: Before starting any work:**
1. Read `README.md` for project overview
2. Read `TECHNICAL_README.md` for technical details and current implementation status
3. Use semantic search to understand existing codebase
4. For major changes: propose new branch creation

### Local Development
```bash
hugo server --disableFastRender  # Full rebuilds for development
hugo server                      # Fast rebuilds for content editing
```

### Content Creation Workflow
1. **New Page**: Create `.md` file in `content/`
2. **New Post**: Create Page Bundle in `content/posts/[post-name]/`
3. **Hero Images**: Place in `assets/images/` for Hugo processing
4. **Content Images**: Use `{{< img src="image.jpg" alt="Description" >}}` shortcode
5. **Test locally**: Verify all functionality before changes

### Deployment & Testing
- **Automated Tests**: Run `./automated-test.sh` before committing
- **Hugo Extended**: Required for image processing
- **Build Verification**: Use `hugo --gc --minify` for production testing
- **Environment**: Europe/Helsinki timezone

## Code Patterns

### Hugo Shortcodes
```gohtml
{{< img src="concert.jpg" alt="Icetribe performing at venue" >}}
```

### Finnish Content Examples
```markdown
# Concert Report
Ensimmäinen keikkamme uudella kokoonpanolla soitettiin [venue]ssa!
Tunnelma oli käsin kosketeltava ja yleisö oli mukana alusta loppuun!

# Band Description  
Icetribe on Tamperelainen pop & rock -bilebändi, joka tuo seitsemän 
vuosikymmenen parhaat hitit nykyaikaan.
```

### Social Media Integration
```toml
[params.ananke.social.follow]
networks = ["facebook", "instagram", "soundcloud"]

[params.ananke.social.facebook]
profilelink = "https://www.facebook.com/Icetribe"
```

## Quality Standards

### Performance
- WebP images with 85% quality
- Lazy loading for all images  
- Minified CSS/JS in production
- Fast build times (<100ms locally)

### SEO & Accessibility  
- Descriptive alt text for all images
- Semantic HTML structure via Ananke theme
- Finnish language meta tags
- Mobile-responsive design

### Content Standards
- Professional but approachable Finnish
- Consistent date formats (YYYY-MM-DD)
- Tagged content for organization
- Regular updates for active blog section

## Troubleshooting

### Common Issues
1. **Images not showing**: Check file paths (`/images/` vs relative paths)
2. **Build failures**: Ensure Hugo Extended is installed
3. **WebP not working**: Verify Hugo version 0.151.0+ Extended
4. **Menu not updating**: Check `hugo.toml` menu configuration

### Development Commands
```bash
hugo server --disableFastRender  # Full rebuilds
hugo --gc --minify              # Production build
hugo version                    # Check Hugo Extended
```

## Troubleshooting

### Common Issues
1. **Images not showing**: Check file paths and verify TECHNICAL_README.md for current workflow
2. **Build failures**: Ensure Hugo Extended v0.152.0+ is installed
3. **Hero images not optimized**: Verify images are in `assets/images/` and referenced correctly
4. **Tests failing**: Run automated test suite and check for content validation issues

### Development Commands
```bash
hugo server --disableFastRender  # Full rebuilds
hugo --gc --minify              # Production build
hugo version                    # Check Hugo Extended
./automated-test.sh             # Run comprehensive tests
```

## Quality Standards & Contributing Guidelines

### Mandatory Workflow
1. **ALWAYS read documentation first** - README.md and TECHNICAL_README.md
2. **Analysis requests only analyze** - no implementation without permission
3. **No unauthorized git operations** - user handles all commits/pushes
4. **Branch for major changes** - suggest new branches for significant work
5. **Document changes** - remind to update docs after modifications

### Content & Code Standards
- **Finnish language quality** - maintain proper grammar and band terminology
- **Image optimization** - use current Hugo resources workflow (see TECHNICAL_README.md)
- **Testing requirements** - run automated tests before changes
- **Band branding** - energetic, professional, multi-generational appeal (1960s-2020s)
- **GDPR compliance** - maintain cookie consent and privacy features

### Technical Excellence
- **Hugo Extended compatibility** - verify image processing works
- **Performance optimization** - WebP conversion, lazy loading, fast builds
- **Accessibility standards** - proper alt text, semantic HTML, mobile responsive
- **Browser compatibility** - test WebP fallbacks and cross-browser functionality

This website represents a professional Finnish band with comprehensive musical coverage - maintain that quality and technical excellence in all contributions.

Remember: **Documentation first, analysis before changes, git safety, branch strategy, update reminders**
