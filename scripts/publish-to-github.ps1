# Canflix -> GitHub (fork + push)
# Once: gh auth login  (browser)  then: .\scripts\publish-to-github.ps1

$ErrorActionPreference = "Stop"
$RepoOwner = "scngnr"
$RepoName = "nextflix"
$Upstream = "Apestein/nextflix"

$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
  Write-Host "GitHub CLI yok. Kurulum: winget install GitHub.cli" -ForegroundColor Red
  exit 1
}

$auth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "GitHub'a giris yapilmamis. Calistirin: gh auth login" -ForegroundColor Yellow
  gh auth login --hostname github.com --git-protocol https --web
  exit 1
}

gh auth setup-git
Write-Host "Git credential helper: gh" -ForegroundColor Green

Set-Location $PSScriptRoot\..

$exists = gh repo view "${RepoOwner}/${RepoName}" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Fork olusturuluyor: ${Upstream} -> ${RepoOwner}/${RepoName} ..." -ForegroundColor Cyan
  gh repo fork $Upstream --fork-name $RepoName --remote=false
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Fork basarisiz; bos public repo olusturuluyor ..." -ForegroundColor Yellow
    gh repo create $RepoName --public --description "Canflix - Netflix clone with Drive library" --remote=false
  }
}

git remote remove origin 2>$null
git remote add origin "https://github.com/${RepoOwner}/${RepoName}.git"
if (-not (git remote get-url upstream 2>$null)) {
  git remote add upstream "https://github.com/${Upstream}.git"
}

$status = git status --porcelain
if ($status) {
  git add -A
  git commit -m "Canflix sync: latest local changes"
}

Write-Host "Push: origin main ..." -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "Tamam: https://github.com/${RepoOwner}/${RepoName}" -ForegroundColor Green
