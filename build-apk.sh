#!/bin/bash

# GMAO Application - Optimized APK Build Script
# This script generates an optimized release APK for production

echo "🚀 Starting GMAO APK Build Process..."

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Step 1: Clean previous builds
print_status "Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Step 2: Install dependencies
print_status "Installing/updating dependencies..."
npm install

# Step 3: Clear Metro cache
print_status "Clearing Metro cache..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 5
kill $METRO_PID 2>/dev/null || true

# Step 4: Generate optimized bundle
print_status "Generating optimized JavaScript bundle..."
npx react-native bundle \
    --platform android \
    --dev false \
    --entry-file index.js \
    --bundle-output android/app/src/main/assets/index.android.bundle \
    --assets-dest android/app/src/main/res/ \
    --minify true \
    --sourcemap-output android/app/src/main/assets/index.android.bundle.map

# Step 5: Build release APK
print_status "Building release APK..."
cd android
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    print_success "APK build completed successfully!"
    
    # Find the generated APK
    APK_PATH=$(find app/build/outputs/apk/release -name "*.apk" | head -1)
    
    if [ -n "$APK_PATH" ]; then
        # Get APK size
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        
        print_success "APK Location: $APK_PATH"
        print_success "APK Size: $APK_SIZE"
        
        # Copy APK to project root with timestamp
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        FINAL_APK_NAME="GMAO_Release_${TIMESTAMP}.apk"
        cp "$APK_PATH" "../$FINAL_APK_NAME"
        
        print_success "APK copied to project root as: $FINAL_APK_NAME"
        
        # Display build summary
        echo ""
        echo "📊 BUILD SUMMARY"
        echo "=================="
        echo "✅ APK Generated: $FINAL_APK_NAME"
        echo "📏 APK Size: $APK_SIZE"
        echo "📍 Location: $(pwd)/../$FINAL_APK_NAME"
        echo "🏗️  Build Type: Release (Optimized)"
        echo "🔧 Minification: Enabled"
        echo "📦 Resource Shrinking: Enabled"
        echo "🏛️  Architectures: ARM only (reduced size)"
        echo ""
        
    else
        print_error "APK file not found after build!"
        exit 1
    fi
else
    print_error "APK build failed!"
    exit 1
fi

cd ..

print_success "🎉 Build process completed successfully!"
print_warning "Remember to test the APK on a device before distribution."

