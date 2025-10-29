@echo off
echo ========================================
echo   PayPulse - Fix and Push to GitHub
echo ========================================
echo.

REM Check current status
echo Checking git status...
git status
echo.

REM Check if we have commits
git log --oneline -1 2>nul
if errorlevel 1 (
    echo No commits found. Creating initial commit...
    git add .
    git commit -m "Initial commit: PayPulse v1.0 - Offline-first Solana payment app"
    echo.
)

REM Check if remote exists
git remote -v | findstr origin >nul
if errorlevel 1 (
    echo.
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

REM Get current branch name
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i

echo Current branch: %CURRENT_BRANCH%
echo.

REM If not on main, rename to main
if not "%CURRENT_BRANCH%"=="main" (
    echo Renaming branch to main...
    git branch -m main
    echo.
)

REM Push to GitHub
echo Pushing to GitHub...
echo (You may need to enter your GitHub credentials)
echo Use Personal Access Token as password!
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo   Push Failed - Try Force Push?
    echo ========================================
    echo.
    echo This will overwrite remote if it exists.
    echo Press Y to force push, N to cancel:
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
pause
