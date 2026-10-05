export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
export const rnd = (a: number, b: number) => a + Math.random() * (b - a);

// standard normal N(0,1), Box–Muller
export const randn = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

// log-normal delay: clusters around median with rare long tails; sigma ~0.2-0.3
export const logNormal = (median: number, sigma: number, [min, max]: readonly [number, number] = [0, Infinity]) =>
  Math.min(max, Math.max(min, median * Math.exp(sigma * randn())));

export type Mouse = { getMousePos(): { x: number; y: number }; moveMouse(x: number, y: number): void };

// smooth ease-in-out move, step count depends on distance
export async function moveSmooth(robot: Mouse, x: number, y: number) {
  const from = robot.getMousePos();
  const dist = Math.hypot(x - from.x, y - from.y);
  const steps = Math.max(3, Math.round(dist / 4));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    robot.moveMouse(Math.round(from.x + (x - from.x) * e), Math.round(from.y + (y - from.y) * e));
    await sleep(rnd(4, 10));
  }
}
