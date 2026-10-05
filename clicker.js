const robot = require("robotjs");
const { uIOhook, UiohookKey } = require("uiohook-napi");
const { parseArgs } = require("util");
const { sleep, rnd, logNormal, moveSmooth } = require("./utils");
const { makeT, systemLang } = require("./lang");

// ================= SETTINGS =================
const FIXED_TARGET = null;        // {x: 500, y: 400} — fixed coordinates; null = mouse position at start
const START_DELAY = 5;            // seconds before start, to point the mouse
const CLICK_DELAY = [250, 0.25, [150, 500]]; // median ms, spread, [min, max] — ~3-4 clicks/sec
const HOLD = [70, 0.3, [40, 150]];           // button hold, same params
const JITTER_PX = 3;              // position jitter ±px
const SHIFT_EVERY = [5, 15];      // clicks between cursor shifts (always after a rest)
const REST_EVERY = [20, 50];      // clicks between rests
const REST_MS = [600, 1800];      // rest duration
const AWAY_PX = 30;               // mouse moved further — auto-pause
// ============================================

const { values: args } = parseArgs({ options: {
  max: { type: "string", default: "60" },   // --max <minutes>, timer resets on pause
  lang: { type: "string" },                 // --lang en|ru|es|zh, default: system locale
} });
const MAX_MS = Number(args.max) * 60_000;
const t = makeT(args.lang || systemLang());

let paused = false, deadline = 0;
const pause = why => { paused = true; console.log(t("pause", { why: why ? ": " + why : "" })); };

uIOhook.on("keydown", e => {
  if (e.keycode === UiohookKey.Escape) { console.log(t("quit")); uIOhook.stop(); process.exit(0); }
  if (e.keycode === UiohookKey.Space) {
    if (paused) { paused = false; deadline = Date.now() + MAX_MS; console.log(t("resume")); }
    else pause();
  }
});
uIOhook.start();

(async () => {
  for (let i = START_DELAY; i > 0; i--) { console.log(t("countdown", { n: i })); await sleep(1000); }
  const target = FIXED_TARGET || robot.getMousePos();
  deadline = Date.now() + MAX_MS;
  console.log(t("started", { x: target.x, y: target.y, m: args.max }));

  let clicks = 0, nextRest = rnd(...REST_EVERY), nextShift = 0, lastPos = robot.getMousePos();
  while (true) {
    if (paused) { await sleep(100); lastPos = robot.getMousePos(); continue; }
    if (Date.now() > deadline) { console.log(t("limit", { m: args.max })); uIOhook.stop(); process.exit(0); }

    const cur = robot.getMousePos();
    if (Math.hypot(cur.x - lastPos.x, cur.y - lastPos.y) > AWAY_PX) { pause(t("away")); continue; }

    if (clicks >= nextShift) {
      await moveSmooth(robot, target.x + Math.round(rnd(-JITTER_PX, JITTER_PX)), target.y + Math.round(rnd(-JITTER_PX, JITTER_PX)));
      nextShift = clicks + rnd(...SHIFT_EVERY);
    }
    robot.mouseToggle("down");
    await sleep(logNormal(...HOLD));
    robot.mouseToggle("up");
    lastPos = robot.getMousePos();

    if (++clicks >= nextRest) {
      const rest = rnd(...REST_MS);
      console.log(t("rest", { n: clicks, ms: Math.round(rest) }));
      await sleep(rest);
      nextRest = clicks + rnd(...REST_EVERY);
      nextShift = clicks; // hand moved during the rest
    }
    await sleep(logNormal(...CLICK_DELAY));
  }
})();
