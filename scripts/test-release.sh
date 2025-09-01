#!/bin/bash

# Release Testing Script
set -e

echo "🧪 Testing Release Process..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test version generation
echo "1. Testing version generation..."

# Test without tags
VERSION_NO_TAG=$(git describe --tags --match "v[0-9]*" --dirty --always 2>/dev/null || echo "no-tag")
echo "   Version without tags: $VERSION_NO_TAG"

# Create test tag
TEST_TAG="v0.1.0-test-$(date +%s)"
git tag "$TEST_TAG"
print_status "Created test tag: $TEST_TAG"

# Test with tag
VERSION_WITH_TAG=$(git describe --tags --match "v[0-9]*" --dirty --always)
echo "   Version with tag: $VERSION_WITH_TAG"

# Test build process
echo "2. Testing build process..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Check version injection
echo "3. Checking version injection..."
if [ -f "dist/index.html" ]; then
    if grep -q "SEC_O_SIMPLE_VERSION" dist/index.html; then
        INJECTED_VERSION=$(grep "SEC_O_SIMPLE_VERSION" dist/index.html | head -1)
        print_status "Version injection working: $INJECTED_VERSION"
    else
        print_error "Version not found in built HTML"
        exit 1
    fi
else
    print_error "Built index.html not found"
    exit 1
fi

# Check package.json version
echo "4. Checking package.json version..."
PACKAGE_VERSION=$(node -p "require('./package.json').version")
echo "   Package.json version: v$PACKAGE_VERSION"

# Cleanup
echo "5. Cleaning up..."
git tag -d "$TEST_TAG" > /dev/null 2>&1
print_status "Removed test tag: $TEST_TAG"

echo ""
echo "Release process test completed successfully!"
echo ""
echo "Summary:"
echo "   - Version generation: Working"
echo "   - Build process: Working" 
echo "   - Version injection: Working"
echo "   - Package version: v$PACKAGE_VERSION"
echo ""
echo "To create a real release:"
echo "   1. Update package.json version: npm version patch|minor|major"
echo "   2. Create and push tag: git tag vX.Y.Z && git push origin vX.Y.Z"
echo "   3. GitHub Actions will create the release automatically"
