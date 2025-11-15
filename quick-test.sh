#!/bin/bash

# Quick test script for development
# Suorittaa nopeat perusvalidaatiot

set -e

# Värit
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧪 Running quick development tests...${NC}"

# 1. Hugo syntax check
echo -n "Hugo config validation... "
if hugo config > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# 2. Content structure check
echo -n "Content structure check... "
if [ -f content/_index.md ] && [ -f content/about.md ] && [ -d content/posts ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# 3. Layout files check
echo -n "Layout files check... "
if [ -f layouts/index.html ] && [ -f layouts/shortcodes/quote.html ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# 4. Quick build test
echo -n "Quick build test... "
if hugo --gc > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All quick tests passed!${NC}"
echo -e "${YELLOW}💡 Run './test-suite.sh' for comprehensive testing${NC}"