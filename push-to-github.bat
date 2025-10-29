@echo off
echo ========================================
echo   PayPulse - Push to GitHub
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo Initializing Git repository...
    git init
    echo.
)

REM Add all files
echo Adding files to Git...
git add .
echo.

REM Commit
echo Enter commit message (or press Enter for default):
set /p COMMIT_MSG="Message: "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Update PayPulse project

echo Committing changes...
git commit -m "%COMMIT_MSG%"
echo.

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

REM Set main branch
echo Setting main branch...
git branch -M main
echo.

REM Push to GitHub
echo Pushing to GitHub...
echo (You may need to enter your GitHub credentials)
echo.
git push -u origin main

echo.
echo ========================================
echo   Done!
echo ========================================
echo.
echo Your code is now on GitHub!
echo.
pause
