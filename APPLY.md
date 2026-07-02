# Fix Pack 1 — Foundation: Reproducible Builds & Pydantic Unification

Every file in this pack was applied to a fresh clone of your repos and verified by
execution: the core SDK installs and reports v0.2.0, AquaGuard went from 4/5 to
**5/5 tests passing**, SoilGuard passes 8/8, and both import with **zero Pydantic
deprecation warnings**.

Apply in this exact order — everything downstream pins the tag created in Step 1.

---

## Step 1 — coastal-alpine-core (do this first)

```bash
cd coastal-alpine-core
git checkout -b fix/packaging-v0.2.0

# Replace pyproject.toml with the one in this pack, then:
git rm setup.py
git add pyproject.toml
git commit -m "fix(packaging): single source of truth in pyproject.toml, v0.2.0

- Remove setup.py (conflicted with pyproject: version 1.2.0 vs dynamic,
  deps requests/ollama vs PyJWT/cryptography, python >=3.10 vs >=3.9)
- Declare only the dependency actually imported: requests
- Add dev extras (pytest, pytest-asyncio) and pytest config"

git push -u origin fix/packaging-v0.2.0
# Merge the PR (or push straight to main if solo), then tag from main:
git checkout main && git pull
git tag -a v0.2.0 -m "v0.2.0: packaging consolidation, single pyproject source of truth"
git push origin v0.2.0
```

Sanity check before moving on:

```bash
pip install "coastal-alpine-core @ git+https://github.com/fivepanelhat/coastal-alpine-core.git@v0.2.0"
python3 -c "from importlib.metadata import version; print(version('coastal-alpine-core'))"
# must print: 0.2.0
```

---

## Step 2 — AquaGuard-Portal

Files to copy from this pack:

| Pack file                                   | Destination in repo               |
| ------------------------------------------- | --------------------------------- |
| AquaGuard-Portal/requirements.txt           | requirements.txt                  |
| AquaGuard-Portal/requirements-dev.txt       | requirements-dev.txt (new)        |
| AquaGuard-Portal/pytest.ini                 | pytest.ini (new)                  |
| AquaGuard-Portal/portal_core/config.py      | portal_core/config.py             |
| AquaGuard-Portal/compliance.py              | portal_schemas/compliance.py      |

```bash
cd AquaGuard-Portal
git checkout -b fix/pydantic-v2-and-pinning
# copy the five files in, then:
pip install -r requirements-dev.txt
python3 -m pytest tests/ -q        # expect: 5 passed
git add -A
git commit -m "fix: migrate to Pydantic v2, pin core SDK to v0.2.0, fix async test

- requirements: pydantic>=2.5 (code already ran on v2 in violation of the
  old <2.0 pin), paho-mqtt>=2.1 (1.x is EOL), opencv>=4.12 (CVE-2025-53644)
- config.py: @validator -> @field_validator (+@classmethod, mode='before')
- compliance.py: class Config -> model_config = ConfigDict(...)
- pytest.ini + pytest-asyncio: fixes test_compliance_record_export failure
- pin coastal-alpine-core @v0.2.0 for reproducible installs"
git push -u origin fix/pydantic-v2-and-pinning
```

## Step 3 — SoilGuard-Portal

Identical procedure with the SoilGuard-Portal/ files in this pack
(same five destinations). Expect **8 passed**.

## Step 4 — Blue-Moon-Portal

One file: `requirements.txt` (adds the coastal-alpine-core dependency that
`main.py` imports but the file never declared).

```bash
cd Blue-Moon-Portal
git checkout -b fix/declare-core-dependency
# copy requirements.txt in
git commit -am "fix: declare coastal-alpine-core (imported by main.py, pinned @v0.2.0)"
git push -u origin fix/declare-core-dependency
```

## Step 5 — Weaver

Two files: `requirements.txt` (pins core @v0.2.0) and `.env.example`
(OLLAMA_MODEL=gemma4:e4b — was gemma4:latest, the exact anti-pattern
AquaGuard's README warns against).

```bash
cd Weaver
git checkout -b fix/pin-core-and-model-tag
# copy both files in
git commit -am "fix: pin coastal-alpine-core @v0.2.0, pin OLLAMA_MODEL to gemma4:e4b"
git push -u origin fix/pin-core-and-model-tag
```

## Step 6 — Sting-Operation-AI

One file: `requirements.txt` (pins core @v0.2.0).

```bash
cd Sting-Operation-AI
git checkout -b fix/pin-core
# copy requirements.txt in
git commit -am "fix: pin coastal-alpine-core @v0.2.0 for reproducible installs"
git push -u origin fix/pin-core
```

---

## What this pack deliberately does NOT touch (Fix Pack 2)

- Blue-Moon's eight `class Config` blocks in portal_core/config.py
  (pydantic-settings migration to SettingsConfigDict — works today, just noisy)
- Extracting the drifting portal_core/ copies into coastal-alpine-core
- Sting's 62MB of committed model weights -> GitHub Release
- Front_Line_Whanau: LICENSE decision, nonce-based CSP, removing @prisma/client,
  self-hosting the Inter font, README Next 15 -> 16
- Hailo-8/8L/10H/10L global naming normalisation (needs your confirmation of
  what hardware is actually on the bench)
- v1.0.0 release tags + changelogs across the fleet
