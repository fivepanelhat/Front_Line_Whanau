# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.2.x   | ✅ Current          |
| < 0.2   | ❌ Not supported    |

## Reporting a Vulnerability

The **Front Line Families Support Hub NZ** handles sensitive personal, health, and financial data. We take security extremely seriously.

### How to Report

**Do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following:

1. **GitHub Security Advisories**: Use the [Security tab](https://github.com/fivepanelhat/Front_Line_Whanau/security/advisories) to create a private advisory.
2. **Email**: Contact the maintainers directly (see repository profile).

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgement**: Within 48 hours
- **Initial assessment**: Within 5 business days
- **Fix release**: As soon as practical, with a security advisory

## Security Architecture

### Client-Side Encryption

- All sensitive data (journal entries, vault documents) is encrypted **client-side** using the **Web Crypto API**
- **AES-256-GCM** encryption with PBKDF2 key derivation
- Encryption keys are derived from user passphrases — they never leave the browser
- The server never sees plaintext sensitive data

### Consent Model

- **Explicit informed consent** is required before any data processing
- Consent is **granular** — users control each data scope independently
- Full **audit trail** of all consent decisions
- Consent can be **revoked** at any time

### Data Sovereignty

- **Client-side first** architecture — data stays on the user's device by default
- Server-side storage is opt-in with explicit consent
- Aligned with **Te Mana Raraunga** (Māori Data Sovereignty) principles
- Compliant with the **Privacy Act 2020** and **Health Information Privacy Code 2020**

### Infrastructure

- **HTTPS** enforced for all connections
- **Content Security Policy** headers
- **Dependency auditing** via automated CI/CD security scans
- Regular **npm audit** checks
- No third-party analytics or tracking without consent

## Responsible Disclosure

We follow a **responsible disclosure** model. Please allow us reasonable time to address vulnerabilities before public disclosure.

We are grateful to security researchers who help keep whānau data safe. Contributors who report valid vulnerabilities will be acknowledged (with permission) in our security advisories.

---

> *Kia kaha, kia māia, kia manawanui — Be strong, be brave, be steadfast.*
