# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-15

### ✨ Added

#### Core Editor
- Monaco Editor integration (VS Code engine)
- Full JavaScript/TypeScript syntax highlighting
- Tampermonkey metadata block highlighting
- IntelliSense and auto-completion
- Code folding and minimap
- Bracket matching and line bookmarks
- Format document functionality
- Collapse/Expand functions

#### AI Assistant
- Multi-provider AI support (OpenAI, OpenRouter)
- 9 AI models: GPT 5.4 CODEX, GEMINI PRO/MEDIUM/FLASH, CLAUDE OPUS/SONNET/HAIKU, GPT-4o, GPT-4o Mini
- Streaming AI responses with markdown rendering
- Smart script context awareness
- Quick Actions: Debug, Optimize, Explain, Improve Code
- File attachments (photos, code files, PDFs, CSVs)
- One-click code apply from AI responses
- Chat history persistence

#### Script Management
- Create, edit, duplicate, delete userscripts
- Enable/disable scripts toggle
- Import `.user.js` files
- Export scripts as `.user.js`
- Search and filter scripts
- Persistent localStorage storage

#### Metadata Editor
- Visual form for all Tampermonkey metadata fields
- Auto-sync metadata block with code
- Support for @match, @include, @exclude, @grant, @run-at

#### UI/UX
- Professional dark theme matching Tampermonkey native
- Tampermonkey logo and branding
- Menu bar (File, Edit, Selection, Find, GoTo, Developer)
- Status bar with script info
- Tab bar with script tabs
- Icon sidebar with tooltips
- Responsive animations with Framer Motion

#### Bookmarks
- Click line numbers to toggle bookmarks
- Block selection + click for range bookmarks
- Selection persistence after bookmarking
- Per-script bookmark storage

### 🛠️ Technical
- React 19 with TypeScript
- Vite build system
- Tailwind CSS styling
- Single-file build output
- CI/CD with GitHub Actions

## [0.9.0] - 2025-01-10

### ✨ Added
- Initial project setup
- Basic Monaco Editor integration
- Script list sidebar
- Simple metadata editor

### 🐛 Fixed
- Various UI alignment issues
- Editor scrollbar styling

---

## Release Notes Template

```
## [X.Y.Z] - YYYY-MM-DD

### ✨ Added
- New features

### 🐛 Fixed
- Bug fixes

### 🔄 Changed
- Changes to existing functionality

### 🗑️ Removed
- Removed features

### ⚡ Performance
- Performance improvements
```
