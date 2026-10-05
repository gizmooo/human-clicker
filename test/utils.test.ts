import { describe, it, expect } from "vitest";
import { logNormal, rnd, moveSmooth, type Mouse } from "../src/utils.ts";

describe("logNormal", () => {
  const xs = Array.from({ length: 20000 }, () => logNormal(250, 0.25, [100, 600])).sort((a, b) => a - b);
  const med = xs[xs.length / 2]!;

  it("clusters around the median", () => expect(med).toBeCloseTo(250, -1));
  it("respects bounds", () => {
    expect(xs[0]).toBeGreaterThanOrEqual(100);
    expect(xs.at(-1)).toBeLessThanOrEqual(600);
  });
  it("has a longer right tail", () => expect(xs.at(-1)! - med).toBeGreaterThan(med - xs[0]!));
});

it("rnd stays within [a, b)", () => {
  for (let i = 0; i < 1000; i++) {
    const v = rnd(5, 15);
    expect(v).toBeGreaterThanOrEqual(5);
    expect(v).toBeLessThan(15);
  }
});

it("moveSmooth ends exactly at target and moves monotonically", async () => {
  const path: [number, number][] = [];
  let pos = { x: 0, y: 0 };
  const fake: Mouse = { getMousePos: () => pos, moveMouse: (x, y) => { path.push([x, y]); pos = { x, y }; } };
  await moveSmooth(fake, 40, -20);
  expect(path.at(-1)).toEqual([40, -20]);
  expect(path.length).toBeGreaterThanOrEqual(3);
  for (let i = 1; i < path.length; i++) {
    expect(path[i]![0]).toBeGreaterThanOrEqual(path[i - 1]![0]);
    expect(path[i]![1]).toBeLessThanOrEqual(path[i - 1]![1]);
  }
});
