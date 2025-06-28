#!/bin/bash

# Tony Assistant Production Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Tony Assistant Production Deployment"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Creating from template..."
    if [ -f "env.production.example" ]; then
        cp env.production.example .env.production
        print_success "Created .env.production from template"
        print_warning "Please edit .env.production with your MongoDB credentials before continuing"
        exit 1
    else
        print_error "env.production.example not found. Please create .env.production manually"
        exit 1
    fi
fi

# Check if MongoDB URI is configured
if ! grep -q "REACT_APP_MONGODB_URI=" .env.production || grep -q "your_username" .env.production; then
    print_error "MongoDB URI not configured in .env.production"
    print_warning "Please update .env.production with your real MongoDB credentials"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js 16+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version: $(node --version)"

# Install dependencies
print_status "Installing dependencies..."
npm install

# Run tests
print_status "Running tests..."
npm test -- --watchAll=false --passWithNoTests

# Build for production
print_status "Building for production..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    print_error "Build failed - build directory not found"
    exit 1
fi

print_success "Production build completed successfully"

# Check build size
BUILD_SIZE=$(du -sh build | cut -f1)
print_status "Build size: $BUILD_SIZE"

# Ask for deployment method
echo ""
echo "Choose deployment method:"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) Manual upload"
echo "4) Test locally only"
read -p "Enter your choice (1-4): " DEPLOY_CHOICE

case $DEPLOY_CHOICE in
    1)
        print_status "Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            print_status "Installing Vercel CLI..."
            npm install -g vercel
        fi
        vercel --prod
        print_success "Deployed to Vercel successfully!"
        ;;
    2)
        print_status "Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            print_status "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod --dir=build
        print_success "Deployed to Netlify successfully!"
        ;;
    3)
        print_status "Manual deployment"
        print_warning "Please upload the 'build' folder to your web server"
        print_status "Build files are ready in the 'build' directory"
        ;;
    4)
        print_status "Testing locally..."
        if ! command -v serve &> /dev/null; then
            print_status "Installing serve..."
            npm install -g serve
        fi
        print_success "Starting local server..."
        print_status "Open http://localhost:3000 to test your application"
        serve -s build -l 3000
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_success "Deployment process completed!"
print_status "Don't forget to:"
echo "  - Configure environment variables in your deployment platform"
echo "  - Set up SSL/HTTPS"
echo "  - Configure monitoring and alerts"
echo "  - Test all features in production"
echo ""
print_status "For detailed instructions, see PRODUCTION_DEPLOYMENT.md" 