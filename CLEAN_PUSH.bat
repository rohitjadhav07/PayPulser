@echo off
echo ========================================
echo   PayPulse - Clean Push to GitHub
echo   (Excludes node_modules)
echo ========================================
echo.

REM Initialize git if needed
if not exist .git (
    echo Initializing Git repository...
    git init
    echo.
)

REM Make sure .gitignore is correct
echo Checking .gitignore...
findstr /C:"node_modules/" .gitignore >nul
if errorlevel 1 (
    echo Adding node_modules to .gitignore...
    echo node_modules/ >> .gitignore
    echo.
)

REM Remove node_modules from git if already added
echo Removing node_modules from git cache...
git rm -r --cached mobile/node_modules 2>nul
git rm -r --cached node_modules 2>nul
echo.

REM Add all files (respecting .gitignore)
echo Adding files to git...
git add .
echo.

REM Show what will be committed
echo Files to be committed:
git status --short
echo.

REM Count files
for /f %%i in ('git status --short ^| find /c /v ""') do set FILE_COUNT=%%i
echo Total files: %FILE_COUNT%
echo.

REM Check if node_modules is included
git status --short | findstr "node_modules" >nul
if not errorlevel 1 (
    echo.
    echo ========================================
    echo   WARNING: node_modules detected!
    echo ========================================
    echo.
    echo node_modules is still being tracked.
    echo This should not happen. Stopping.
    echo.
    pause
    exit /b 1
)

echo ✓ node_modules is NOT included - Good!
echo.

REM Commit
echo Creating commit...
git commit -m "Initial commit: PayPulse v1.0 (without node_modules)"
echo.

REM Setup remote
git remote -v | findstr origin >nul
if errorlevel 1 (
    echo ========================================
    echo   Setup GitHub Remote
    echo ========================================
    echo.
    echo Enter your GitHub username:
    set /p GITHUB_USER="Username: "
    echo.
    echo Enter repository name (default: paypulse):
    set /p REPO_NAME="Repo name: "
    if "%REPO_NAME%"=="" set REPO_NAME=paypulse
    
    echo.
    echo Adding remote: https://github.com/%GITHUB_USER%/%REPO_NAME%.git
    git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
    echo.
)

REM Rename to main
git branch -M main
echo.

REM Push
echo ========================================
echo   Pushing to GitHub...
echo ========================================
echo.
echo Use Personal Access Token as password!
echo Get it from: https://github.com/settings/tokens
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo Push failed. Try force push? (Y/N)
    choice /c YN /n
    if errorlevel 2 goto :end
    if errorlevel 1 (
        git push -u origin main --force
    )
)

:end
echo.
echo ========================================
echo   Done!
echo ========================================
echo.
echo Your code is on GitHub WITHOUT node_modules!
echo.
pause
