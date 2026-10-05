# human-clicker

![CI](https://github.com/gizmooo/human-clicker/actions/workflows/ci.yml/badge.svg)

[Русский](README.ru.md)

Auto-clicker that behaves like a human: log-normal delays, position jitter, button hold time, occasional rests, smooth cursor moves.

> **Disclaimer.** Most games forbid automation in their terms of service and may ban your account. Use at your own risk.

## Requirements

- Node.js 22.18 or newer, latest LTS recommended: TypeScript runs natively, no build step
- Windows (native modules `robotjs` and `uiohook-napi`; macOS/Linux untested)

## Install

```
npm install
```

## Run

```
npm start                        # 60 min limit, language from system locale
npm start -- --max 30            # 30 min limit
npm start -- --lang en           # force language: en, ru, es, zh
```

Or double-click `start.cmd`: it checks for Node and dependencies, installs them if needed, and passes arguments through.

After launch you have 5 seconds to point the mouse at the target. The cursor position at that moment becomes the target.

## Controls

| Key     | Action |
|---------|--------|
| `Space` | pause / resume (time limit resets) |
| `Esc`   | quit |

Keys are captured globally, from any window.

If you move the mouse more than 30 px away between clicks, the clicker pauses itself. `Space` resumes on the same target.

## Settings

Settings object in `src/clicker.ts`:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `FIXED_TARGET` | `null` | `{x, y}` for fixed coordinates; `null` = mouse position at start |
| `START_DELAY` | 5 | seconds before start |
| `CLICK_DELAY` | 250 ms, σ 0.25, [150, 500] | interval between clicks: median, spread, bounds |
| `HOLD` | 70 ms, σ 0.3, [40, 150] | button hold time |
| `JITTER_PX` | 3 | position jitter ±px |
| `SHIFT_EVERY` | [5, 15] | clicks between cursor shifts; always after a rest |
| `REST_EVERY` | [20, 50] | clicks between rests |
| `REST_MS` | [600, 1800] | rest duration, ms |
| `AWAY_PX` | 30 | auto-pause threshold |

Delays are log-normal: clustered around the median with rare long tails. For a safer profile raise the `CLICK_DELAY` median to 350–450.

## Development

TypeScript runs directly on Node 22.18+ (built-in type stripping), no build step. Dev dependencies are only needed for type-checking; `start.cmd` installs without them.

```
npm install          # with dev dependencies
npm test             # vitest
npm run typecheck    # tsc --noEmit
```

## Files

- `src/clicker.ts` — entry: CLI args, settings, hotkeys
- `src/engine.ts` — the click loop with injectable robot, clock and sleep
- `src/utils.ts` — `logNormal`, `moveSmooth`, `sleep`, `rnd`
- `src/lang.ts`, `src/locales.json` — UI strings (en, ru, es, zh). Add a language: new key in `locales.json`
- `test/` — tests
- `start.cmd` — Windows launcher

## License

MIT
