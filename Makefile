# Icetribe Hugo Site - Makefile
# Helpottaa kehitystä ja testien suorittamista

.PHONY: help test quick-test build serve clean deploy install

# Default target
help:
	@echo "Icetribe Hugo Site - Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  serve        - Start Hugo development server"
	@echo "  build        - Build site for production"
	@echo "  clean        - Clean generated files"
	@echo ""
	@echo "Testing:"
	@echo "  quick-test   - Run quick development tests"
	@echo "  test         - Run comprehensive test suite"
	@echo "  test-ci      - Run tests in CI mode"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy       - Deploy to GitHub Pages"
	@echo ""
	@echo "Setup:"
	@echo "  install      - Install dependencies and setup"

# Development commands
serve:
	@echo "🚀 Starting Hugo development server..."
	hugo server --disableFastRender

build:
	@echo "🏗️  Building site for production..."
	hugo --gc --minify

clean:
	@echo "🧹 Cleaning generated files..."
	rm -rf public/
	rm -rf resources/

# Testing commands
quick-test:
	@echo "🧪 Running quick development tests..."
	./quick-test.sh

test: build
	@echo "🔍 Running comprehensive test suite..."
	./test-suite.sh

test-ci:
	@echo "🤖 Running tests in CI mode..."
	hugo --gc --minify
	./test-suite.sh

# Deployment
deploy: test
	@echo "🚢 Deploying to GitHub Pages..."
	git add .
	git commit -m "Deploy: $(shell date '+%Y-%m-%d %H:%M:%S')" || true
	git push origin main

# Setup
install:
	@echo "📦 Setting up Icetribe Hugo site..."
	@if ! command -v hugo &> /dev/null; then \
		echo "❌ Hugo not found. Please install Hugo Extended v0.100+"; \
		exit 1; \
	fi
	@echo "✅ Hugo found: $(shell hugo version)"
	@echo "🔧 Making test scripts executable..."
	chmod +x test-suite.sh quick-test.sh
	@echo "✅ Setup complete!"

# Pre-commit hook setup
setup-hooks:
	@echo "🎣 Setting up git hooks..."
	echo '#!/bin/bash\nmake quick-test' > .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit
	@echo "✅ Pre-commit hook installed"

# Development workflow helpers
dev: quick-test serve

check: quick-test

# Backup current state
backup:
	@echo "💾 Creating backup..."
	git add .
	git commit -m "Backup: $(shell date '+%Y-%m-%d %H:%M:%S')" || true
	git push origin $(shell git branch --show-current)

# Show current status
status:
	@echo "📊 Icetribe Site Status:"
	@echo "  Git branch: $(shell git branch --show-current)"
	@echo "  Last commit: $(shell git log -1 --format='%h %s')"
	@echo "  Hugo version: $(shell hugo version)"
	@echo "  Content files: $(shell find content -name '*.md' | wc -l) markdown files"
	@echo "  Posts: $(shell find content/posts -name 'index.md' | wc -l) posts"
	@echo "  Build size: $(shell [ -d public ] && du -sh public | cut -f1 || echo 'not built')"