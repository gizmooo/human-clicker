# Changelog

## [1.0.0] - 2026-10-05

### Added
- Human-like clicking: log-normal delays, button hold time, cursor jitter and periodic shifts, rests, smooth moves
- Target taken from the mouse position after a 5-second countdown, or fixed coordinates
- `Space` to pause/resume, `Esc` to quit, keys captured globally
- Auto-pause when the mouse is moved away from the target
- Time limit (`--max`, default 60 min), timer resets on resume
- UI strings in English, Russian, Spanish and Chinese, picked from the system locale or `--lang`
- `start.cmd` for Windows: checks Node version, installs runtime dependencies, passes arguments through
- TypeScript on Node's built-in type stripping, no build step
- Vitest suites for the click engine, utilities and translations
- CI on GitHub Actions: Windows, Node 22 / 24 / 26
