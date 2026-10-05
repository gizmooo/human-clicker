import { describe, it, expect } from "vitest";
import { createClicker, type Settings, type Robot } from "../src/engine.ts";
import { makeT } from "../src/lang.ts";

// deterministic settings: sigma 0 → exact medians, zero-width ranges, no jitter
const base: Settings = {
  fixedTarget: null, startDelay: 0,
  clickDelay: [100, 0, [100, 100]], hold: [50, 0, [50, 50]], jitterPx: 0,
  shiftEvery: [5, 5], restEvery: [1000, 1000], restMs: [500, 500], awayPx: 30, maxMs: 60_000,
};

function setup(over: Partial<Settings> = {}) {
  const logs: string[] = [], moves: [number, number][] = [], toggles: string[] = [], sleeps: number[] = [];
  let pos = { x: 100, y: 100 }, clock = 0, ups = 0, stopAfter = Infinity;
  let onSleep: (ms: number) => void = () => {};
  const robot: Robot = {
    getMousePos: () => pos,
    moveMouse: (x, y) => { moves.push([x, y]); pos = { x, y }; },
    mouseToggle: d => { toggles.push(d); if (d === "up" && ++ups >= stopAfter) clicker.stop(); },
  };
  const clicker = createClicker({ ...base, ...over }, {
    robot, t: makeT("en"), log: m => logs.push(m),
    sleep: async ms => { sleeps.push(ms); clock += ms; onSleep(ms); }, now: () => clock,
  });
  return {
    clicker, logs, moves, toggles, sleeps,
    ups: () => ups, clock: () => clock,
    setPos: (p: { x: number; y: number }) => { pos = p; },
    stopAfter: (n: number) => { stopAfter = n; },
    onSleep: (f: typeof onSleep) => { onSleep = f; },
  };
}

describe("start", () => {
  it("counts down and takes the target from the mouse position", async () => {
    const c = setup({ startDelay: 3 });
    c.stopAfter(1);
    await c.clicker.run();
    expect(c.logs.slice(0, 3)).toEqual([
      "starting in 3… point the mouse at the target",
      "starting in 2… point the mouse at the target",
      "starting in 1… point the mouse at the target",
    ]);
    expect(c.sleeps.slice(0, 3)).toEqual([1000, 1000, 1000]);
    expect(c.logs[3]).toBe("▶ target (100, 100), limit 1 min. ESC — quit, Space — pause");
  });

  it("uses fixedTarget when given", async () => {
    const c = setup({ fixedTarget: { x: 5, y: 7 } });
    c.stopAfter(1);
    await c.clicker.run();
    expect(c.logs[0]).toContain("target (5, 7)");
    expect(c.moves.at(-1)).toEqual([5, 7]);
  });
});

describe("clicking", () => {
  it("presses, holds, releases, then waits", async () => {
    const c = setup();
    c.stopAfter(3);
    expect(await c.clicker.run()).toBe("stopped");
    expect(c.toggles).toEqual(["down", "up", "down", "up", "down", "up"]);
    expect(c.sleeps).toEqual([50, 100, 50, 100, 50, 100]);
  });

  it("shifts the cursor on the first click and every shiftEvery clicks", async () => {
    const c = setup({ shiftEvery: [3, 3] });
    c.stopAfter(7);
    await c.clicker.run();
    expect(c.moves.length).toBe(3 * 3); // shifts at clicks 0, 3, 6; moveSmooth makes 3 steps each
  });

  it("applies jitter within ±jitterPx", async () => {
    const c = setup({ jitterPx: 3, shiftEvery: [1, 1] });
    c.stopAfter(30);
    await c.clicker.run();
    expect(c.moves.length).toBeGreaterThan(0);
    for (const [x, y] of c.moves) {
      expect(Math.abs(x - 100)).toBeLessThanOrEqual(3);
      expect(Math.abs(y - 100)).toBeLessThanOrEqual(3);
    }
  });

  it("rests after restEvery clicks and shifts right after", async () => {
    const c = setup({ restEvery: [2, 2], shiftEvery: [100, 100] });
    c.stopAfter(4);
    await c.clicker.run();
    expect(c.logs).toContain("[2] resting 500 ms");
    expect(c.logs).toContain("[4] resting 500 ms");
    expect(c.sleeps.filter(ms => ms === 500).length).toBe(2);
    expect(c.moves.length).toBe(6); // initial shift + shift after the first rest
  });
});

describe("pause", () => {
  it("auto-pauses when the mouse is moved away and resumes on toggle", async () => {
    const c = setup();
    c.stopAfter(3);
    c.onSleep(() => {
      if (c.ups() === 1 && c.toggles.length === 2) c.setPos({ x: 200, y: 100 });
      if (c.clicker.paused) c.clicker.toggle();
    });
    await c.clicker.run();
    expect(c.logs).toContain("⏸ paused: mouse moved away. Space — resume");
    expect(c.logs).toContain("▶ resuming, timer reset");
    expect(c.ups()).toBe(3);
  });

  it("ignores small movements below awayPx", async () => {
    const c = setup();
    c.stopAfter(3);
    c.onSleep(() => { if (c.ups() === 1) c.setPos({ x: 120, y: 110 }); });
    await c.clicker.run();
    expect(c.logs.some(l => l.includes("paused"))).toBe(false);
  });

  it("does not click while paused", async () => {
    const c = setup();
    c.stopAfter(4);
    let pauseTicks = 0, togglesAtPause = -1;
    c.onSleep(ms => {
      if (c.ups() === 2 && !c.clicker.paused && pauseTicks === 0) { c.clicker.toggle(); togglesAtPause = c.toggles.length; }
      if (ms === 100 && c.clicker.paused && ++pauseTicks === 5) {
        expect(c.toggles.length).toBe(togglesAtPause);
        c.clicker.toggle();
      }
    });
    await c.clicker.run();
    expect(pauseTicks).toBe(5);
    expect(c.ups()).toBe(4);
  });
});

describe("time limit", () => {
  it("quits when the limit is reached", async () => {
    const c = setup({ maxMs: 1000 });
    expect(await c.clicker.run()).toBe("limit");
    expect(c.logs.at(-1)).toContain("limit reached, quitting");
    expect(c.clock()).toBeGreaterThan(1000);
    expect(c.ups()).toBe(7); // 150 ms per click
  });

  it("resets the deadline on resume", async () => {
    const c = setup({ maxMs: 1000 });
    c.stopAfter(10); // 1500 ms of clicking, past the original deadline
    c.onSleep(() => {
      if (c.ups() === 5 && !c.logs.some(l => l.includes("resuming"))) { c.clicker.toggle(); c.clicker.toggle(); }
    });
    expect(await c.clicker.run()).toBe("stopped");
    expect(c.ups()).toBe(10);
  });
});
