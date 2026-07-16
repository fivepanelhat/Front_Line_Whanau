# Contributing to Front Line Whanau

Thank you for your interest in contributing to the **Front Line Families Support Hub NZ**. Your mahi helps whanau during one of the most challenging periods of their lives.

---

## Our Values in Contribution

All contributions must align with the project's core values:

- **Rangatiratanga & Whanau Sovereignty** - User control over data and decisions
- **Kaitiakitanga** - Responsible guardianship of sensitive information
- **Equity & Active Protection** - Reducing disparities, protecting vulnerable whanau
- **Inclusivity** - Welcoming all backgrounds, cultures, and family structures
- **Cultural Safety** - Respecting Te Tiriti o Waitangi and Maori data sovereignty
- **Practitioner Protection** - Balanced support for professionals

---

## How to Contribute

### 1. Reporting Bugs

Use the [Bug Report](../.github/ISSUE_TEMPLATE/bug_report.md) template. Include:

- Steps to reproduce
- Expected vs actual behaviour
- Browser and OS details
- Screenshots if applicable

### 2. Suggesting Features

Use the [Feature Request](../.github/ISSUE_TEMPLATE/feature_request.md) template. Consider:

- How does this help whanau?
- Does it align with our values?
- Are there privacy implications?

### 3. Code Contributions

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following the code standards below
4. **Test your changes**: `npm run test && npm run lint && npm run type-check`
5. **Commit** with clear messages: `git commit -m "feat: add consent revocation flow"`
6. **Push** and open a **Pull Request**

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: New feature
fix: Bug fix
docs: Documentation only
style: Formatting (no code change)
refactor: Code restructure (no feature change)
test: Adding or updating tests
chore: Build, tooling, or dependency changes
```

---

## Code Standards

- **TypeScript** - Strict mode. No `any` types unless absolutely necessary.
- **Tailwind CSS v3** - Use the project's design system tokens. No arbitrary values where a token exists.
- **Privacy-first** - Never log, transmit, or store user data without explicit consent.
- **Accessibility** - Semantic HTML, ARIA labels, keyboard navigation.
- **Testing** - Unit tests for utilities and logic. E2E tests for user flows.

---

## Cultural Safety Guidelines

When contributing content or copy:

- Use **te reo Maori** terms correctly. If unsure, ask or reference [Te Aka Dictionary](https://maoridictionary.co.nz/).
- Ensure **macrons** (tohuto) are used correctly: a, e, i, o, u.
- Respect **tikanga Maori** - do not use cultural concepts out of context.
- The platform serves **all families** - avoid assumptions about ethnicity, culture, or family structure.

---

## Development Setup

```bash
# Clone and install
git clone https://github.com/fivepanelhat/Front_Line_Whanau.git
cd Front_Line_Whanau
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Type check
npm run type-check
```

---

## Questions?

Open a [Discussion](https://github.com/fivepanelhat/Front_Line_Whanau/discussions) or reach out to the maintainers.

> *He waka eke noa - We are all in this together.*
