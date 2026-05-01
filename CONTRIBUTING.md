# 🤝 Contributing to Tampermonkey Script Editor

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Coding Standards](#coding-standards)
- [AI Integration Guidelines](#ai-integration-guidelines)

---

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or yarn/pnpm)
- **Git**

### Setup

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/tampermonkey-script-editor.git
cd tampermonkey-script-editor

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔄 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation updates
- `refactor/` — Code refactoring
- `test/` — Test additions/changes
- `chore/` — Maintenance tasks

### 2. Make Changes

- Follow the [Coding Standards](#coding-standards)
- Write clear, self-documenting code
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run build to ensure no TypeScript errors
npm run build

# Test all features manually:
# - Script creation/editing
# - AI chat functionality
# - Import/Export
# - Bookmarks
# - Settings
```

### 4. Commit

```bash
git add .
git commit -m "feat: add your feature description"
```

See [Commit Message Guidelines](#commit-message-guidelines) below.

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

---

## 💬 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, etc. |
| `ci` | CI/CD changes |

### Examples

```bash
feat(ai): add Gemini Pro model support
fix(editor): resolve bookmark toggle issue
docs(readme): update installation instructions
refactor(hooks): simplify useScripts hook
style(toolbar): improve button hover states
```

---

## 🔍 Pull Request Process

1. **Update your branch** with the latest `main`:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure the build passes**:
   ```bash
   npm run build
   ```

3. **Fill out the PR template** completely

4. **Link related issues** using keywords:
   - `Fixes #123`
   - `Closes #456`
   - `Relates to #789`

5. **Wait for review** — maintainers will review within 48 hours

6. **Address feedback** and push updates

7. **Merge** — once approved, a maintainer will merge

---

## 🐛 Reporting Bugs

Before reporting, please:

1. Search existing issues to avoid duplicates
2. Test on the latest version
3. Try in an incognito/private window

### Bug Report Template

```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. Windows 11, macOS 14, Ubuntu 22.04]
- Browser: [e.g. Chrome 120, Firefox 121]
- Node Version: [e.g. 20.10.0]
- App Version: [e.g. 1.2.0]

**Additional Context**
Any other relevant information.
```

---

## 💡 Feature Requests

We love new ideas! To request a feature:

1. Check if it already exists or has been requested
2. Open a new issue with the `enhancement` label
3. Describe the feature and its use case
4. Explain why it would be valuable

### Feature Request Template

```markdown
**Feature Description**
A clear description of the proposed feature.

**Use Case**
Why is this feature needed? Who would benefit?

**Proposed Solution**
How do you envision this working?

**Alternatives Considered**
Any alternative approaches?

**Additional Context**
Mockups, examples, or references.
```

---

## 📝 Coding Standards

### TypeScript

- Use **strict TypeScript** settings
- Define interfaces in `src/types.ts`
- Avoid `any` — use proper types
- Export types explicitly

### React

- Use **functional components** with hooks
- Prefer `useCallback` and `useMemo` for performance
- Keep components focused and small
- Use meaningful prop names

### Styling

- Use **Tailwind CSS** utility classes
- Follow existing color scheme (`#0d0d0d`, `#1e1e1e`, `#8B6914`)
- Use consistent spacing (multiples of 4px)
- Dark theme first — all components must work in dark mode

### File Organization

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── services/       # API and external services
├── data/           # Static data and templates
├── types.ts        # Global TypeScript types
├── utils/          # Utility functions
└── App.tsx         # Root component
```

### Naming Conventions

- **Components**: PascalCase (`AIChatPanel.tsx`)
- **Hooks**: camelCase starting with `use` (`useScripts.ts`)
- **Services**: camelCase (`aiService.ts`)
- **Types/Interfaces**: PascalCase (`AISettings`, `ChatMessage`)
- **Constants**: UPPER_SNAKE_CASE

---

## 🤖 AI Integration Guidelines

When working on AI-related features:

### Adding New Models

1. Add the model to `modelRegistry` in `src/services/aiService.ts`
2. Add display name to `modelDisplayNames` in `src/components/AIChatPanel.tsx`
3. Update the provider mapping if needed
4. Test with actual API calls

### Provider Support

Currently supported providers:
- **OpenAI** (`https://api.openai.com`)
- **OpenRouter** (`https://openrouter.ai/api`)

To add a new provider:
1. Update the `provider` type in `src/types.ts`
2. Add endpoint logic in `aiService.ts`
3. Add headers configuration
4. Update settings UI

### API Key Handling

- **Never** log or expose API keys
- Store keys in `localStorage` only
- Allow users to clear keys easily
- Support both OpenAI and OpenRouter keys

---

## 🏷️ Issue Labels

| Label | Meaning |
|-------|---------|
| `bug` | Something isn't working |
| `enhancement` | New feature request |
| `documentation` | Docs improvement |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `question` | Question from user |
| `ai` | Related to AI Assistant |
| `ui/ux` | User interface/experience |
| `performance` | Performance-related |

---

## 🎉 Recognition

Contributors will be:
- Listed in the README acknowledgments
- Mentioned in release notes
- Added to the contributors graph

---

## 📞 Questions?

- Open a [GitHub Discussion](https://github.com/yourusername/tampermonkey-script-editor/discussions)
- Comment on an existing issue
- Reach out to maintainers

---

Thank you for contributing! 🚀
