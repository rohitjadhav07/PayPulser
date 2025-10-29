# PayPulse - Push to GitHub (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PayPulse - Push to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host ""
}

# Check if we have any commits
$hasCommits = git log --oneline -1 2>$null
if (-not $hasCommits) {
    Write-Host "Creating initial commit..." -ForegroundColor Yellow
    git add .
    git commit -m "Initial commit: PayPulse v1.0 - Offline-first Solana payment app"
    Write-Host ""
}

# Check if remote exists
$remoteExists = git remote -v | Select-String "origin"
if (-not $remoteExists) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Setup GitHub Remote" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $githubUser = Read-Host "Enter your GitHub username"
    $repoName = Read-Host "Enter repository name (default: paypulse)"
    if ([string]::IsNullOrWhiteSpace($repoName)) {
        $repoName = "paypulse"
    }
    
    Write-Host ""
    Write-Host "Adding remote: https://github.com/$githubUser/$repoName.git" -ForegroundColor Green
    git remote add origin "https://github.com/$githubUser/$repoName.git"
    Write-Host ""
}

# Get current branch
$currentBranch = git branch --show-current

Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow
Write-Host ""

# Rename to main if needed
if ($currentBranch -ne "main") {
    Write-Host "Renaming branch to main..." -ForegroundColor Yellow
    git branch -m main
    Write-Host ""
}

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Green
Write-Host "(You may need to enter your GitHub credentials)" -ForegroundColor Yellow
Write-Host "Use Personal Access Token as password!" -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Push Failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Repository doesn't exist on GitHub - Create it first at https://github.com/new" -ForegroundColor White
    Write-Host "2. Wrong credentials - Use Personal Access Token as password" -ForegroundColor White
    Write-Host "3. Remote has different history - Use force push (dangerous!)" -ForegroundColor White
    Write-Host ""
    
    $forcePush = Read-Host "Try force push? (yes/no)"
    if ($forcePush -eq "yes") {
        git push -u origin main --force
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your code should now be on GitHub!" -ForegroundColor Green
Write-Host ""
