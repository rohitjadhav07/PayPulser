@echo off
echo ========================================
echo   Fix node_modules Upload Issue
echo ========================================
echo.

echo Step 1: Checking .gitignore...
type .gitignore | findstr "node_modules"
if errorlevel 1 (
    echo Adding node_modules to .gitignore...
    echo node_modules/ >> .gitignore
)
echo.

echo Step 2: Removing node_modules from git cache...
git rm -r --cached mobile/node_modules 2>nul
if errorlevel 1 (
    echo node_modules not in git yet - Good!
) else (
    echo node_modules removed from git cache
)
echo.

echo Step 3: Committing changes...
git add .gitignore
git commit -m "Fix: Exclude node_modules from git"
echo.

echo ========================================
echo   Done!
echo ========================================
echo.
echo node_modules will NOT be uploaded now.
echo You can safely push to GitHub.
echo.
pause
