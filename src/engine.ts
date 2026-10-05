import { sleep as realSleep, rnd, logNormal, moveSmooth, type Mouse } from "./utils.ts";
import type { Key } from "./lang.ts";

export type Robot = Mouse & { mouseToggle(dir: "down" | "up"): void };
export type Delay = readonly [median: number, sigma: number, bounds: readonly [number, number]];
export type Range = readonly [number, number];
export type Point = { x: number; y: number };

export type Settings = {
  fixedTarget: Point | null; // fixed coordinates; null = mouse position at start
  startDelay: number;        // seconds before start, to point the mouse
  clickDelay: Delay;         // interval between clicks
  hold: Delay;               // button hold
  jitterPx: number;          // position jitter ±px
  shiftEvery: Range;         // clicks between cursor shifts (always after a rest)
  restEvery: Range;          // clicks between rests
  restMs: Range;             // rest duration
  awayPx: number;            // mouse moved further — auto-pause
  maxMs: number;             // time limit, timer resets on resume
};

export type Deps = {
  robot: Robot;
  t: (key: Key, vars?: Record<string, string | number>) => string;
  log?: (msg: string) => void;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
};

export function createClicker(s: Settings, { robot, t, log = console.log, sleep = realSleep, now = Date.now }: Deps) {
  let paused = false, stopped = false, deadline = 0;
  const minutes = s.maxMs / 60_000;

  const pause = (why = "") => { paused = true; log(t("pause", { why: why && ": " + why })); };
  const resume = () => { paused = false; deadline = now() + s.maxMs; log(t("resume")); };
  const toggle = () => (paused ? resume() : pause());
  const stop = () => { stopped = true; };
  const jitter = () => Math.round(rnd(-s.jitterPx, s.jitterPx));

  async function run(): Promise<"limit" | "stopped"> {
    for (let i = s.startDelay; i > 0; i--) { log(t("countdown", { n: i })); await sleep(1000); }
    const target = s.fixedTarget ?? robot.getMousePos();
    deadline = now() + s.maxMs;
    log(t("started", { x: target.x, y: target.y, m: minutes }));

    let clicks = 0, nextRest = rnd(...s.restEvery), nextShift = 0, lastPos = robot.getMousePos();
    while (!stopped) {
      if (paused) { await sleep(100); lastPos = robot.getMousePos(); continue; }
      if (now() > deadline) { log(t("limit", { m: minutes })); return "limit"; }

      const cur = robot.getMousePos();
      if (Math.hypot(cur.x - lastPos.x, cur.y - lastPos.y) > s.awayPx) { pause(t("away")); continue; }

      if (clicks >= nextShift) {
        await moveSmooth(robot, target.x + jitter(), target.y + jitter());
        nextShift = clicks + rnd(...s.shiftEvery);
      }
      robot.mouseToggle("down");
      await sleep(logNormal(...s.hold));
      robot.mouseToggle("up");
      lastPos = robot.getMousePos();

      if (++clicks >= nextRest) {
        const rest = rnd(...s.restMs);
        log(t("rest", { n: clicks, ms: Math.round(rest) }));
        await sleep(rest);
        nextRest = clicks + rnd(...s.restEvery);
        nextShift = clicks; // hand moved during the rest
      }
      await sleep(logNormal(...s.clickDelay));
    }
    return "stopped";
  }

  return { run, pause, resume, toggle, stop, get paused() { return paused; } };
}
