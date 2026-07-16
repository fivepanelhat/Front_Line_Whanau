#!/usr/bin/env python3
"""
Front Line Whanau - Release Preflight (adapted from Aether / legacy hub).

Run from the Front_Line_Whanau repo root before any tag/push/release:
 python scripts/flw_release_preflight.py --version 0.4.0

Exit code 0 = safe to release. Any other exit code = STOP.

This script enforces the same 7-point validation as Aether's release-preflight
but adapted for a Next.js / TypeScript web platform:
 - Uses package.json for version agreement (single source of truth)
 - Retains strong sensitive-file scanning (extended for health/community context)
 - Enforces monotonic releases and clean trees
 - Runs `npm run validate` (type-check + lint + unit coverage)

Cultural note: Prevents accidental publication of documents that could affect
whanau trust, iwi relationships, or contain draft clinical/cultural guidance.
"""

import argparse
import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

# Sensitive patterns - extend with community/health-specific terms as needed
SENSITIVE_PATTERNS = [
 r"investor", r"valuation", r"financial", r"one[-_]?pager", r"board[-_]?pack",
 r"term[-_]?sheet", r"credential", r"secret", r"\.env$", r"\.pem$", r"\.key$",
 r"api[-_]?key", r"password", r"funding[-_]?deck",
 # Hub-specific additions (draft clinical pathways, internal partner lists, etc.)
 r"clinical[-_]?pathway", r"internal[-_]?partner", r"draft[-_]?guidance",
 r"whanau[-_]?data", r"preterm[-_]?pilot", r"marae[-_]?deployment",
]

PASS = " [PASS]"
FAIL = " [FAIL]"
WARN = " [WARN]"


def sh(cmd: list) -> str:
 return subprocess.run(cmd, capture_output=True, text=True, check=False).stdout.strip()


def parse_semver(tag: str):
 m = re.match(r"^v?(\d+)\.(\d+)\.(\d+)$", tag.strip())
 return tuple(int(x) for x in m.groups()) if m else None


def check_visibility(remote_url: str) -> bool:
 """Returns True if the repo is public (or unknown - treated as public for safety)."""
 m = re.search(r"github\.com[:/]([^/]+)/([^/.]+)", remote_url)
 if not m:
 print(f"{WARN} Could not parse GitHub remote; treating repo as PUBLIC for safety.")
 return True
 owner, repo = m.groups()
 try:
 req = urllib.request.Request(
 f"https://api.github.com/repos/{owner}/{repo}",
 headers={"Accept": "application/vnd.github+json"},
 )
 with urllib.request.urlopen(req, timeout=10) as resp:
 data = json.loads(resp.read().decode())
 private = bool(data.get("private", False))
 print(f"{PASS} Remote visibility: {'PRIVATE' if private else 'PUBLIC'} ({owner}/{repo})")
 return not private
 except Exception as e:
 if "404" in str(e):
 print(f"{PASS} Remote not visible unauthenticated - treating as PRIVATE.")
 return False
 print(f"{WARN} Visibility check failed ({e}); treating repo as PUBLIC for safety.")
 return True


def get_package_version() -> str | None:
 pkg_path = Path("package.json")
 if not pkg_path.exists():
 return None
 try:
 data = json.loads(pkg_path.read_text(encoding="utf-8"))
 return data.get("version")
 except Exception:
 return None


def main() -> int:
 parser = argparse.ArgumentParser(description="Front Line Whanau release preflight")
 parser.add_argument("--version", required=True, help="Intended release version, e.g. 0.4.0")
 parser.add_argument("--allow-untracked", action="append", default=[],
 help="Explicitly acknowledge an untracked path (repeatable)")
 parser.add_argument("--skip-tests", action="store_true", help="Skip the test run (not recommended)")
 args = parser.parse_args()

 intended = args.version.lstrip("v")
 intended_semver = parse_semver(intended)
 failures = 0

 print(f"\n=== FRONT LINE WHANAU - RELEASE PREFLIGHT v{intended} ===\n")
 print("Adapted from Aether release-preflight (ported from whanau-preterm-support-hub)")
 print("Te Mana Raraunga & kaitiakitanga guardrails active\n")

 if not intended_semver:
 print(f"{FAIL} '{args.version}' is not valid semver (X.Y.Z).")
 return 1

 # --- 1. Visibility ---
 remote_url = sh(["git", "remote", "get-url", "origin"])
 is_public = check_visibility(remote_url)

 # --- 2. Sensitive files ---
 untracked = [l for l in sh(["git", "ls-files", "--others", "--exclude-standard"]).splitlines() if l]
 staged = [l for l in sh(["git", "diff", "--cached", "--name-only"]).splitlines() if l]
 candidates = set(untracked) | set(staged)
 sensitive_hits = sorted(
 f for f in candidates
 if any(re.search(p, f, re.IGNORECASE) for p in SENSITIVE_PATTERNS)
 )
 if sensitive_hits and is_public:
 print(f"{FAIL} Sensitive-looking files present in a PUBLIC repo:")
 for f in sensitive_hits:
 print(f" - {f}")
 print(" Move to a private location or add to .gitignore before releasing.")
 print(" This protects whanau trust and iwi relationships (kaitiakitanga).")
 failures += 1
 elif sensitive_hits:
 print(f"{WARN} Sensitive-looking files present (repo is private): {sensitive_hits}")
 else:
 print(f"{PASS} No sensitive filenames among untracked/staged files.")

 # --- 3. Tag collision ---
 sh(["git", "fetch", "--tags", "--quiet"])
 existing_tags = [t for t in sh(["git", "tag", "-l"]).splitlines() if t]
 for candidate_tag in (f"v{intended}", intended):
 if candidate_tag in existing_tags:
 print(f"{FAIL} Tag '{candidate_tag}' already exists. Choose the next version; never move published tags.")
 failures += 1
 break
 else:
 print(f"{PASS} Tag v{intended} does not exist locally or on the fetched remote.")

 # --- 4. Monotonic version ---
 semver_tags = [(t, parse_semver(t)) for t in existing_tags]
 higher = [t for t, sv in semver_tags if sv and sv >= intended_semver]
 if higher:
 print(f"{FAIL} Existing tag(s) {higher} are >= v{intended}. Releases must be monotonic.")
 failures += 1
 else:
 print(f"{PASS} v{intended} is greater than all {len([s for _, s in semver_tags if s])} existing semver tags.")

 # --- 5. Version file agreement (package.json for Hub) ---
 pkg_version = get_package_version()
 if pkg_version == intended:
 print(f"{PASS} package.json version == {intended}.")
 else:
 print(f"{FAIL} package.json says '{pkg_version}' but releasing v{intended}. Fix package.json first.")
 failures += 1

 # --- 6. Clean tree ---
 status_lines = sh(["git", "status", "--porcelain"]).splitlines()
 unstaged = [l for l in status_lines if l and len(l) > 1 and l[1] != ' ' and not l.startswith("??")]
 unacknowledged = [f for f in untracked if f not in args.allow_untracked]
 if unstaged:
 print(f"{FAIL} Unstaged modifications present:")
 for l in unstaged[:10]:
 print(f" {l}")
 failures += 1
 elif unacknowledged:
 print(f"{FAIL} Untracked files not acknowledged (pass --allow-untracked for each intended file):")
 for f in unacknowledged[:10]:
 print(f" - {f}")
 failures += 1
 else:
 print(f"{PASS} Working tree clean; all untracked files acknowledged.")

 # --- 7. Tests ---
 if args.skip_tests:
 print(f"{WARN} Tests skipped by flag.")
 else:
 # For Next.js we run the test script from package.json
 print("Running tests via npm test (or pnpm/yarn)...")
 test_cmd = ["npm.cmd" if sys.platform == "win32" else "npm", "run", "validate"]
 result = subprocess.run(test_cmd, capture_output=True, text=True)
 if result.returncode == 0:
 print(f"{PASS} All tests passed.")
 else:
 print(f"{FAIL} Tests failed. See output above.")
 print(result.stdout[-2000:] if result.stdout else "")
 print(result.stderr[-2000:] if result.stderr else "")
 failures += 1

 print("\n" + "=" * 60)
 if failures == 0:
 print(f"{PASS} PREFLIGHT PASSED - Safe to proceed with release v{intended}")
 print("Remember: Human confirmation (HITL) is still required before git tag/push.")
 return 0
 else:
 print(f"{FAIL} PREFLIGHT FAILED - {failures} issue(s) must be resolved before release.")
 return 1


if __name__ == "__main__":
 sys.exit(main())
