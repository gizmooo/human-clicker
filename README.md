# Human Clicker 🐭

**Human-like auto-clicker and mouse macro for Windows, built on Node.js.** Log-normal delays, variable button hold, cursor jitter, periodic rests and smooth cursor motion: it clicks the way a hand on a mouse does, not the way a timer does.

[![CI](https://github.com/gizmooo/human-clicker/actions/workflows/ci.yml/badge.svg)](https://github.com/gizmooo/human-clicker/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform: Windows](https://img.shields.io/badge/platform-Windows-0078d4.svg)]()
[![Node >= 22.18](https://img.shields.io/badge/node-%3E%3D22.18-339933.svg)](https://nodejs.org)

[Русский](README.ru.md)

> **Disclaimer.** Most games forbid automation in their terms of service and may ban your account. This tool makes clicking look natural, it does not make it invisible. Use at your own risk.

Built for people who physically cannot click for long (RSI, limited mobility) and for idle and clicker games where auto-clicking is part of the genre.

## Why not a plain auto-clicker?

A plain clicker fires every N milliseconds into the same pixel. That pattern is trivial to spot, and it also looks nothing like a person. Human Clicker models the hand instead of the timer:

- **Log-normal delays.** Intervals between clicks are drawn from a log-normal distribution (Box–Muller transform). They cluster around a median with rare longer pauses, the same shape real reaction times have.
- **Variable button hold.** The time between mouse-down and mouse-up is different on every click.
- **Cursor jitter and shifts.** The cursor does not sit on one pixel forever. Every few clicks, and always after a rest, it shifts by a couple of pixels.
- **Rests.** Every few dozen clicks the clicker takes a short break, like a hand that pauses.
- **Smooth motion.** Cursor moves follow an ease-in-out curve instead of teleporting.

## Compared to other clickers

Popular open-source clickers (XClicker, oriash93/AutoClicker, clicker-rs) fire at a fixed or uniformly random interval into the current cursor position. Python libraries like HumanCursor model cursor paths well but are building blocks for Selenium scripts, not a tool you point and run. Human Clicker is the only one of these with log-normal timing, cursor shifts, rests, auto-pause when you grab the mouse, and window focus tracking, and it runs from a double-click on Windows.

## Features

- **Target from the mouse.** Point at what you want clicked, wait for the countdown, done. Fixed coordinates are available too.
- **Safety auto-pause.** Move the mouse away and the clicker pauses itself instead of fighting you for the cursor.
- **Window focus tracking.** Alt-Tab away and the clicker waits; it resumes by itself when the target window is active again.
- **Global hotkeys.** `Space` pauses and resumes, `Esc` quits, from any window.
- **Time limit.** Stops on its own after 60 minutes by default, so a forgotten clicker does not run all night.
- **Four UI languages.** English, Russian, Spanish, Chinese, picked from the system locale.
- **One-click launcher.** `start.cmd` checks Node, installs runtime dependencies and starts the clicker.

## Quick start

1. Install [Node.js](https://nodejs.org), 22.18 or newer, latest LTS recommended.
2. Download the project ([zip](https://github.com/gizmooo/human-clicker/archive/refs/heads/master.zip) or `git clone`) and unpack it.
3. Double-click **`start.cmd`**. It installs what is missing and launches the clicker.
4. You have 5 seconds to point the mouse at the target. Then it clicks until you press `Esc`.

From the console:

```
npm install
npm start                        # 60 min limit, language from system locale
npm start -- --max 30            # 30 min limit
npm start -- --lang en           # force language: en, ru, es, zh
npm start -- --help
```

`start.cmd --max 30` passes arguments through as well.

## Controls

| Key     | Action |
|---------|--------|
| `Space` | pause / resume (time limit resets) |
| `Esc`   | quit |

If you move the mouse more than 30 px away between clicks, the clicker pauses itself. `Space` resumes on the same target.

The target window is remembered after the first click. While another window is focused the clicker waits and resumes on its own when the target is back.

## Settings

Settings object in `src/clicker.ts`:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `fixedTarget` | `null` | `{x, y}` for fixed coordinates; `null` = mouse position at start |
| `startDelay` | 5 | seconds before start |
| `clickDelay` | 250 ms, σ 0.25, [150, 500] | interval between clicks: median, spread, bounds |
| `hold` | 70 ms, σ 0.3, [40, 150] | button hold time |
| `jitterPx` | 3 | position jitter ±px |
| `shiftEvery` | [5, 15] | clicks between cursor shifts; always after a rest |
| `restEvery` | [20, 50] | clicks between rests |
| `restMs` | [600, 1800] | rest duration, ms |
| `awayPx` | 30 | auto-pause threshold |
| `trackFocus` | `true` | pause while the target window is not focused |

The default profile is about 3–4 clicks per second. For a calmer one raise the `clickDelay` median to 350–450.

## Development

TypeScript runs directly on Node 22.18+ (built-in type stripping), no build step. Dev dependencies are only needed for type-checking and tests; `start.cmd` installs without them.

```
npm install          # with dev dependencies
npm test             # vitest
npm run typecheck    # tsc --noEmit
```

- `src/clicker.ts` — entry: CLI args, settings, hotkeys
- `src/engine.ts` — the click loop with injectable robot, clock and sleep
- `src/utils.ts` — `logNormal`, `moveSmooth`, `sleep`, `rnd`
- `src/lang.ts`, `src/locales.json` — UI strings. Add a language: new key in `locales.json`
- `test/` — tests
- `start.cmd` — Windows launcher

Native modules `robotjs`, `uiohook-napi` and `get-windows` ship prebuilt binaries for Windows. macOS and Linux are untested.

Planned features are tracked in [issues](https://github.com/gizmooo/human-clicker/issues).

## License

[MIT](LICENSE)
