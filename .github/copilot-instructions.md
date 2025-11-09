# GitHub Copilot Instructions for Icetribe Hugo Website

## Project Overview
This is **Icetribe**, a Finnish pop & rock cover band website built with Hugo static site generator. The site showcases the band's information, repertoire spanning 7 decades (1960s-2020s), news/blog posts, and contact details.

## Key Project Details
- **Language**: Finnish (fi-fi)
- **Framework**: Hugo v0.151.0+ Extended
- **Theme**: Ananke (direct copy, not submodule)
- **Deployment**: GitHub Pages via GitHub Actions
- **Image Optimization**: Automatic WebP conversion with 85% quality
- **Social Media**: Facebook, Instagram, SoundCloud integration

## Architecture & File Structure

### Core Configuration
- **`hugo.toml`**: Main site configuration with Finnish language settings
- **Navigation menu**: 5 main sections (Etusivu, Tietoa, Soitossa, Uutiset, Yhteystiedot)
- **WebP optimization**: Enabled for all images with quality=85, max width varies by usage

### Content Structure
```
content/
├── _index.md           # Homepage (Finnish: "Icetribe Pops. Icetribe Rocks!")
├── about.md            # Band info (Finnish: "Tietoa yhtyeestä")
├── repertuaari.md      # Song repertoire (Finnish: "Soitossa")
├── yhteystiedot.md     # Contact info (Finnish: "Yhteystiedot")
└── posts/              # Blog posts/news (Finnish: "Uutiset")
    └── [post-name]/    # Page Bundle structure
        ├── index.md    # Post content
        └── *.jpg       # Post images
```

### Image Management
**Two approaches:**
1. **Site-level images**: `static/images/` → Referenced as `/images/filename.jpg`
2. **Post images**: Page Bundle `content/posts/[post-name]/` → Referenced as `filename.jpg`

### Custom Features
- **WebP Shortcode**: `layouts/shortcodes/img.html` for optimized responsive images
- **Featured Images**: WebP optimization via `layouts/partials/func/GetFeaturedImage.html`
- **Social Media**: Custom SoundCloud integration (missing from Ananke theme)

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
- **Soitossa** (/repertuaari/) - Repertoire
- **Uutiset** (/posts/) - News/blog
- **Yhteystiedot** (/yhteystiedot/) - Contact

## Development Workflow

### Local Development
```bash
hugo server  # Starts dev server at localhost:1313
```

### Content Creation
1. **New Page**: Create `.md` file in `content/`
2. **New Post**: Create Page Bundle in `content/posts/[post-name]/`
3. **Add Images**: Place in appropriate directory (static/images or page bundle)
4. **Use Shortcode**: `{{< img src="image.jpg" alt="Description" >}}`

### Deployment
- **Automatic**: Push to `main` branch triggers GitHub Actions
- **Hugo Extended**: Required for WebP processing
- **Build Time**: ~37ms locally, ~2-5 minutes on GitHub Pages
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

## Contributing Guidelines

When working on this project:
1. **Respect the Finnish language** - maintain proper Finnish grammar and terminology
2. **Follow Page Bundle pattern** for new posts with images
3. **Test WebP optimization** - verify images are properly converted
4. **Maintain band branding** - energetic, professional, multi-generational appeal
5. **Update README.md** when adding new features or changing structure
6. **Use semantic commit messages** in Finnish or English
7. **Test locally** before pushing to ensure proper Hugo Extended functionality

This website represents a professional Finnish band with 7 decades of musical coverage - maintain that quality and breadth in all contributions.
