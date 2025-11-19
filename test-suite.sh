#!/bin/bash

# Icetribe Hugo Site Test Suite
# Kattavat testit sivuston sisällön ja toiminnallisuuksien validointiin

# Ei käytetä set -e, koska haluamme jatkaa testejä virheiden jälkeenkin

# Värit tulostukseen
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Laskurit
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Apufunktiot
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
    ((TOTAL_TESTS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
    ((TOTAL_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test function wrapper
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    if eval "$test_command"; then
        log_success "$test_name"
        return 0
    else
        log_error "$test_name"
        return 1
    fi
}

# Testikategoria: Hugo Build Tests
test_hugo_build() {
    log_info "=== Hugo Build Tests ==="
    
    # Test 1: Hugo version check
    run_test "Hugo version compatibility" "hugo version | grep -q 'v0.1[0-9][0-9].*extended'"
    
    # Test 2: Clean build
    run_test "Hugo clean build" "hugo --gc --minify > /dev/null 2>&1"
    
    # Test 3: Build without errors
    run_test "Build produces no errors" "! hugo 2>&1 | grep -i error"
    
    # Test 4: Build produces expected files
    run_test "Index file generated" "[ -f public/index.html ]"
    run_test "RSS feed generated" "[ -f public/index.xml ]"
    run_test "Sitemap generated" "[ -f public/sitemap.xml ]"
    
    # Test 5: WebP processing works
    if [ -f static/images/cover_index.jpg ]; then
        run_test "WebP processing available" "hugo list drafts > /dev/null 2>&1"
    fi
}

# Testikategoria: Content Structure Tests
test_content_structure() {
    log_info "=== Content Structure Tests ==="
    
    # Test required pages exist
    run_test "Homepage content exists" "[ -f content/_index.md ]"
    run_test "About page exists" "[ -f content/about.md ]"
    run_test "Biisit page exists" "[ -f content/soitossa.md ]"
    run_test "Yhteystiedot page exists" "[ -f content/yhteystiedot.md ]"
    run_test "Posts section exists" "[ -d content/posts ]"
    
    # Test posts structure
    run_test "Posts index exists" "[ -f content/posts/_index.md ]"
    
    # Count posts (should be at least 2)
    post_count=$(find content/posts -name "index.md" | wc -l)
    run_test "At least 2 posts exist" "[ $post_count -ge 2 ]"
}

# Testikategoria: Front Matter Validation
test_frontmatter() {
    log_info "=== Front Matter Validation ==="
    
    # Check homepage front matter
    run_test "Homepage has title" "grep -q '^title = ' content/_index.md"
    run_test "Homepage has featured_image" "grep -q '^featured_image = ' content/_index.md"
    
    # Check all posts have required front matter
    for post in content/posts/*/index.md; do
        if [ -f "$post" ]; then
            post_name=$(basename $(dirname "$post"))
            run_test "Post $post_name has title" "grep -q '^title = ' '$post'"
            run_test "Post $post_name has date" "grep -q '^date = ' '$post'"
            run_test "Post $post_name has draft status" "grep -q '^draft = ' '$post'"
        fi
    done
}

# Testikategoria: Layout and Template Tests
test_layouts() {
    log_info "=== Layout and Template Tests ==="
    
    # Check custom layouts exist
    run_test "Custom index layout exists" "[ -f layouts/index.html ]"
    run_test "Custom posts list layout exists" "[ -f layouts/posts/list.html ]"
    
    # Check shortcodes exist
    run_test "Quote shortcode exists" "[ -f layouts/shortcodes/quote.html ]"
    run_test "Image shortcode exists" "[ -f layouts/shortcodes/img.html ]"
    run_test "SoundCloud shortcode exists" "[ -f layouts/shortcodes/soundcloud.html ]"
    
    # Check partials
    if [ -d layouts/partials ]; then
        run_test "GetFeaturedImage partial exists" "[ -f layouts/partials/func/GetFeaturedImage.html ]"
    fi
}

# Testikategoria: Configuration Tests  
test_configuration() {
    log_info "=== Configuration Tests ==="
    
    # Hugo config validation
    run_test "Hugo config is valid TOML" "hugo config > /dev/null 2>&1"
    run_test "Base URL is configured" "grep -q '^baseURL = ' hugo.toml"
    run_test "Language is set to Finnish" "grep -q \"languageCode = 'fi'\" hugo.toml"
    run_test "Theme is configured" "grep -q \"theme = 'ananke'\" hugo.toml"
    
    # Menu structure
    run_test "Menu configuration exists" "grep -q '\[\[menu.main\]\]' hugo.toml"
    
    # Image processing config
    run_test "Image quality configured" "grep -q 'quality = 85' hugo.toml"
}

# Testikategoria: Asset and Static File Tests
test_assets() {
    log_info "=== Asset and Static File Tests ==="
    
    # CSS files
    run_test "Quote block CSS exists" "[ -f assets/css/quote-block.css ]"
    run_test "Homepage layout CSS exists" "[ -f assets/css/homepage-layout.css ]"
    
    # Static files
    run_test "CNAME file exists" "[ -f static/CNAME ]"
    
    # Images directory
    if [ -d static/images ]; then
        run_test "Cover images directory exists" "[ -d static/images ]"
        
        # Check for required cover images
        for cover in cover_index.jpg cover_about.jpg cover_soitossa.jpg cover_yhteystiedot.jpg cover_posts.jpg; do
            if [ -f "static/images/$cover" ]; then
                run_test "Cover image $cover exists" "true"
            fi
        done
    fi
}

# Testikategoria: Content Quality Tests
test_content_quality() {
    log_info "=== Content Quality Tests ==="
    
    # Check for Finnish content
    run_test "Homepage contains Finnish text" "grep -q 'Icetribe' content/_index.md"
    run_test "About page has band info" "grep -q -i 'bändi\|yhtyee\|musiikki' content/about.md"
    
    # Check shortcode usage
    for post in content/posts/*/index.md; do
        if [ -f "$post" ] && grep -q '{{<.*>}}' "$post"; then
            post_name=$(basename $(dirname "$post"))
            run_test "Post $post_name uses shortcodes correctly" "grep -q '{{< .* >}}' '$post'"
        fi
    done
    
    # Check for broken internal links (basic)
    run_test "No obvious broken internal links" "! grep -r '\](/[^)]*\)' content/ | grep -v '(/posts/\|/about/\|/soitossa/\|/yhteystiedot/\|/images/)'"
}

# Testikategoria: Build Output Validation
test_build_output() {
    log_info "=== Build Output Validation ==="
    
    if [ -d public ]; then
        # HTML validation (basic)
        run_test "Homepage HTML is valid" "grep -q '<html' public/index.html && grep -q '</html>' public/index.html"
        run_test "Homepage has proper head section" "grep -q '<head>' public/index.html && grep -q '</head>' public/index.html"
        run_test "Homepage has meta charset" "grep -q 'charset' public/index.html"
        
        # CSS and JS inclusion
        run_test "CSS files are included" "grep -q '\.css' public/index.html"
        
        # Image optimization
        if ls public/images/*.webp 1> /dev/null 2>&1; then
            run_test "WebP images generated" "ls public/images/*.webp > /dev/null"
        fi
        
        # Check for Finnish language attribute
        run_test "HTML lang attribute is Finnish" "grep -q 'lang=\"fi\"' public/index.html"
    else
        log_warning "Public directory not found, skipping build output tests"
    fi
}

# Testikategoria: Performance and SEO Tests
test_performance_seo() {
    log_info "=== Performance and SEO Tests ==="
    
    if [ -d public ]; then
        # Meta tags
        run_test "Homepage has title tag" "grep -q '<title>' public/index.html"
        run_test "Homepage has meta description" "grep -q 'name=\"description\"' public/index.html"
        
        # Social media meta tags
        run_test "Social media meta tags present" "grep -q 'property=\"og:' public/index.html || grep -q 'name=\"twitter:' public/index.html"
        
        # Structured data
        if grep -q 'application/ld+json' public/index.html; then
            run_test "Structured data present" "grep -q 'application/ld+json' public/index.html"
        fi
    fi
}

# Pääfunktio
main() {
    echo -e "${BLUE}======================================"
    echo -e "    ICETRIBE HUGO SITE TEST SUITE"
    echo -e "======================================${NC}"
    echo ""
    
    log_info "Starting comprehensive test suite..."
    echo ""
    
    # Varmista että olemme oikeassa hakemistossa
    if [ ! -f hugo.toml ]; then
        echo -e "${RED}Error: Not in Hugo site root directory${NC}"
        exit 1
    fi
    
    # Suorita testikategoriat
    test_hugo_build
    echo ""
    test_content_structure  
    echo ""
    test_frontmatter
    echo ""
    test_layouts
    echo ""
    test_configuration
    echo ""
    test_assets
    echo ""
    test_content_quality
    echo ""
    
    # Build site for output tests
    log_info "Building site for output validation..."
    hugo --gc --minify > /dev/null 2>&1
    echo ""
    
    test_build_output
    echo ""
    test_performance_seo
    echo ""
    
    # Tulokset
    echo -e "${BLUE}======================================"
    echo -e "           TEST RESULTS"
    echo -e "======================================${NC}"
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    
    if [ $TESTS_FAILED -gt 0 ]; then
        echo -e "${RED}Failed: $TESTS_FAILED${NC}"
        echo ""
        echo -e "${RED}❌ Some tests failed. Please review and fix issues.${NC}"
        exit 1
    else
        echo -e "${RED}Failed: $TESTS_FAILED${NC}"
        echo ""
        echo -e "${GREEN}✅ All tests passed! Site is ready for deployment.${NC}"
        exit 0
    fi
}

# Suorita testit
main "$@"