# Contributing to Nexora Cloud Platform

First off, thank you for taking the time to contribute! 🎉

This document outlines the process for contributing to the Nexora Cloud Platform.

## 🚀 Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/platform.git
   cd platform
   ```
3. **Add upstream** remote:
   ```bash
   git remote add upstream https://github.com/nexora-cloud/platform.git
   ```
4. **Install dependencies**:
   ```bash
   bun install
   ```
5. **Setup the database**:
   ```bash
   cp .env.example .env
   npx prisma generate
   npx prisma db push
   bun run scripts/seed.ts
   ```
6. **Start the dev server**:
   ```bash
   bun run dev
   ```

## 🌿 Branching Strategy

We use a feature-branch workflow:

- `main` — Production-ready code (protected)
- `develop` — Integration branch for upcoming release
- `feat/*` — New features (e.g., `feat/audit-log-export`)
- `fix/*` — Bug fixes (e.g., `fix/websocket-reconnect`)
- `docs/*` — Documentation improvements
- `chore/*` — Maintenance, dependency updates
- `release/*` — Release preparation

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Code style (formatting, no logic change)
- `refactor` — Code refactoring
- `test` — Test additions/changes
- `chore` — Build, CI, tooling
- `perf` — Performance improvements
- `security` — Security fixes
- `ci` — CI/CD changes

### Examples

```
feat(monitoring): add webhook alert channel support
fix(realtime): resolve socket.io reconnection on network drop
docs(readme): update Docker deployment instructions
chore(deps): bump next from 16.0.0 to 16.1.0
```

## ✅ Code Quality

All contributions must:

1. **Pass linting**: `bun run lint` (zero errors)
2. **Use TypeScript** strict mode
3. **Follow existing patterns** — check similar files for conventions
4. **Include comments** for complex logic
5. **Not introduce new dependencies** without justification

## 🧪 Testing

- Add tests for new features (when test infrastructure is in place)
- Manually test UI changes across mobile/desktop
- Verify dark/light mode works
- Check the Console for errors/warnings

## 🔄 Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make your changes** and commit them following the convention above

3. **Push to your fork**:
   ```bash
   git push origin feat/your-feature
   ```

4. **Open a Pull Request** to `develop` branch with:
   - Clear description of changes
   - Linked issues (`Fixes #123`)
   - Screenshots for UI changes
   - Testing instructions

5. **Address review feedback** — push additional commits (do not squash until merge)

6. **CI must pass** — all checks in the CI workflow must be green

7. **A maintainer will review** and merge

## 🎨 Code Style

### TypeScript

- Use `interface` for object shapes
- Use `type` for unions/intersections
- Prefer named exports over default exports
- Use `const` assertions for literal types

### React

- Use function components (no class components)
- Use hooks for state and side effects
- Prefer `'use client'` directive at top of file for client components
- Use `'use server'` for server actions
- Extract reusable logic into custom hooks

### Styling

- Use Tailwind CSS utility classes
- Follow shadcn/ui patterns for new components
- No inline styles unless dynamic
- Test both light and dark mode

## 🐛 Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) when creating an issue.

## ✨ Requesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) when suggesting new functionality.

## 📦 Releasing

Releases are managed by maintainers:

1. Create a release branch from `develop`: `release/v1.2.0`
2. Update version, changelog, docs
3. Open PR to `main`
4. After merge, tag the release: `git tag v1.2.0 && git push --tags`
5. GitHub Actions automatically builds and publishes Docker images

## 💬 Questions?

- Open a [GitHub Discussion](https://github.com/nexora-cloud/platform/discussions)
- Join our [Discord](https://discord.gg/nexora)
- Email: support@nexora.app

Thank you for contributing! 🙏
