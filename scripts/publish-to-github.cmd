@echo off
setlocal
cd /d "%~dp0.."

where gh >nul 2>&1 || (echo GitHub CLI yok: winget install GitHub.cli & exit /b 1)

gh auth status >nul 2>&1
if errorlevel 1 (
  echo Once: gh auth login
  gh auth login --hostname github.com --git-protocol https --web
  exit /b 1
)

gh auth setup-git

gh repo view scngnr/nextflix >nul 2>&1
if errorlevel 1 (
  echo Fork olusturuluyor...
  gh repo fork Apestein/nextflix --fork-name nextflix
  if errorlevel 1 (
    echo Bos repo olusturuluyor...
    gh repo create nextflix --public --description "Canflix"
  )
)

git remote remove origin 2>nul
git remote add origin https://github.com/scngnr/nextflix.git

git push -u origin main
if errorlevel 1 (
  echo Push basarisiz.
  exit /b 1
)

echo.
echo Tamam: https://github.com/scngnr/nextflix
endlocal
