# Front_Line_Whanau — dual-platform installer (Windows / PowerShell)
# Requires: Node.js 22+ and npm 10+
# From clone: powershell -ExecutionPolicy Bypass -File .\install.ps1

$ErrorActionPreference = "Stop"

function Info($m) { Write-Host "[front-line-whanau] $m" -ForegroundColor Cyan }
function Warn($m) { Write-Host "[front-line-whanau] $m" -ForegroundColor Yellow }
function Fail($m) { Write-Host "[front-line-whanau] $m" -ForegroundColor Red; exit 1 }
function Require-Ok([string]$Step) {
    if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) {
        Fail "$Step failed (exit code $LASTEXITCODE)"
    }
}

if (-not (Test-Path "package.json")) {
    Fail "Run this script from the Front_Line_Whanau repository root (package.json missing)."
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Fail "Node.js 22+ is required. Install from https://nodejs.org (LTS 22+) and re-run."
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Fail "npm is required (ships with Node.js)."
}

$nodeVer = & node -v
Info "Using Node $nodeVer"
& node -e "const m=process.versions.node.split('.')[0]|0; process.exit(m>=22?0:1)"
if ($LASTEXITCODE -ne 0) { Fail "Node.js 22+ required (found $nodeVer)" }

Info "Installing npm dependencies"
npm install
Require-Ok "npm install"

Info "Type-check"
npm run type-check
if ($LASTEXITCODE -ne 0) { Warn "type-check reported issues (non-fatal for install)." }

Write-Host ""
Info "Done. Next:"
Write-Host "    npm run dev      # local Next.js"
Write-Host "    npm run build    # production build"
Write-Host "    npm run validate # lint + tests"
