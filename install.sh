#!/usr/bin/env bash
# Front_Line_Whanau - dual-platform installer (Linux / macOS)
# Requires: Node.js 22+ and npm 10+
# From clone: ./install.sh
set -euo pipefail

info() { printf '\033[36m[front-line-whanau]\033[0m %s\n' "$1"; }
warn() { printf '\033[33m[front-line-whanau]\033[0m %s\n' "$1"; }
err() { printf '\033[31m[front-line-whanau]\033[0m %s\n' "$1" >&2; }

if [[ ! -f package.json ]]; then
 err "Run from Front_Line_Whanau repository root (package.json missing)."
 exit 1
fi

if ! command -v node >/dev/null 2>&1; then
 err "Node.js 22+ is required. Install from https://nodejs.org or via nvm/fnm."
 exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
 err "npm is required (ships with Node.js)."
 exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
info "Using Node $(node -v)"
if [[ "$NODE_MAJOR" -lt 22 ]]; then
 err "Node.js 22+ required (found $(node -v))."
 exit 1
fi

info "Installing npm dependencies"
npm install

info "Type-check (non-fatal)"
npm run type-check || warn "type-check reported issues (non-fatal for install)."

echo
info "Done. Next:"
echo " npm run dev # local Next.js"
echo " npm run build # production build"
echo " npm run validate # lint + tests"
