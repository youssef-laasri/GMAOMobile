@echo off
REM GMAO Application - Optimized APK Build Script for Windows
REM This script generates an optimized release APK for production

echo 🚀 Starting GMAO APK Build Process...

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root directory.
    exit /b 1
)

REM Step 1: Clean previous builds
echo [INFO] Cleaning previous builds...
cd android
call gradlew clean
cd ..

REM Step 2: Install dependencies
echo [INFO] Installing/updating dependencies...
call npm install

REM Step 3: Clear Metro cache
echo [INFO] Clearing Metro cache...
start /b npx react-native start --reset-cache
timeout /t 5 /nobreak >nul
taskkill /f /im node.exe >nul 2>&1

REM Step 4: Generate optimized bundle
echo [INFO] Generating optimized JavaScript bundle...
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/ --minify true --sourcemap-output android/app/src/main/assets/index.android.bundle.map

REM Step 5: Build release APK
echo [INFO] Building release APK...
cd android
call gradlew assembleRelease

REM Check if build was successful
if %errorlevel% equ 0 (
    echo [SUCCESS] APK build completed successfully!
    
    REM Find the generated APK
    for /f "delims=" %%i in ('dir /b /s "app\build\outputs\apk\release\*.apk" 2^>nul') do set APK_PATH=%%i
    
    if defined APK_PATH (
        REM Get APK size
        for %%i in ("%APK_PATH%") do set APK_SIZE=%%~zi
        
        echo [SUCCESS] APK Location: %APK_PATH%
        echo [SUCCESS] APK Size: %APK_SIZE% bytes
        
        REM Copy APK to project root with timestamp
        for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
        set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
        set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
        set "TIMESTAMP=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"
        
        set "FINAL_APK_NAME=GMAO_Release_%TIMESTAMP%.apk"
        copy "%APK_PATH%" "..\%FINAL_APK_NAME%"
        
        echo [SUCCESS] APK copied to project root as: %FINAL_APK_NAME%
        
        REM Display build summary
        echo.
        echo 📊 BUILD SUMMARY
        echo ==================
        echo ✅ APK Generated: %FINAL_APK_NAME%
        echo 📏 APK Size: %APK_SIZE% bytes
        echo 📍 Location: %cd%\..\%FINAL_APK_NAME%
        echo 🏗️  Build Type: Release (Optimized)
        echo 🔧 Minification: Enabled
        echo 📦 Resource Shrinking: Enabled
        echo 🏛️  Architectures: ARM only (reduced size)
        echo.
        
    ) else (
        echo [ERROR] APK file not found after build!
        exit /b 1
    )
) else (
    echo [ERROR] APK build failed!
    exit /b 1
)

cd ..

echo [SUCCESS] 🎉 Build process completed successfully!
echo [WARNING] Remember to test the APK on a device before distribution.

pause

