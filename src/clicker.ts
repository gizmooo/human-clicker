import robot from "robotjs";
import { uIOhook, UiohookKey } from "uiohook-napi";
import { parseArgs } from "node:util";
import { createClicker } from "./engine.ts";
import { makeT, systemLang } from "./lang.ts";

const { values: args } = parseArgs({ options: {
  max: { type: "string", default: "60" },   // --max <minutes>, timer resets on pause
  lang: { type: "string" },                 // --lang en|ru|es|zh, default: system locale
} });
const t = makeT(args.lang ?? systemLang());

// ================= SETTINGS =================
const clicker = createClicker({
  fixedTarget: null,                   // {x: 500, y: 400} — fixed coordinates; null = mouse position at start
  startDelay: 5,                       // seconds before start, to point the mouse
  clickDelay: [250, 0.25, [150, 500]], // median ms, spread, [min, max] — ~3-4 clicks/sec
  hold: [70, 0.3, [40, 150]],          // button hold, same params
  jitterPx: 3,                         // position jitter ±px
  shiftEvery: [5, 15],                 // clicks between cursor shifts (always after a rest)
  restEvery: [20, 50],                 // clicks between rests
  restMs: [600, 1800],                 // rest duration
  awayPx: 30,                          // mouse moved further — auto-pause
  maxMs: Number(args.max) * 60_000,
}, { robot, t });
// ============================================

const exit = (msg?: string) => { if (msg) console.log(msg); uIOhook.stop(); process.exit(0); };

uIOhook.on("keydown", e => {
  if (e.keycode === UiohookKey.Escape) exit(t("quit"));
  if (e.keycode === UiohookKey.Space) clicker.toggle();
});
uIOhook.start();

await clicker.run();
exit();
