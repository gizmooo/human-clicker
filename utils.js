const sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd = (a, b) => a + Math.random() * (b - a);

// standard normal N(0,1), Box–Muller
const randn = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

// log-normal delay: clusters around median with rare long tails; sigma ~0.2-0.3
const logNormal = (median, sigma, [min, max] = [0, Infinity]) =>
  Math.min(max, Math.max(min, median * Math.exp(sigma * randn())));

// smooth ease-in-out move, step count depends on distance
async function moveSmooth(robot, x, y) {
  const from = robot.getMousePos();
  const dist = Math.hypot(x - from.x, y - from.y);
  const steps = Math.max(3, Math.round(dist / 4));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    robot.moveMouse(Math.round(from.x + (x - from.x) * e), Math.round(from.y + (y - from.y) * e));
    await sleep(rnd(4, 10));
  }
}

module.exports = { sleep, rnd, randn, logNormal, moveSmooth };

if (require.main === module) {
  const assert = require("assert");
  const xs = Array.from({ length: 20000 }, () => logNormal(250, 0.25, [100, 600])).sort((a, b) => a - b);
  const med = xs[xs.length / 2];
  assert(Math.abs(med - 250) < 10, `median ${med}`);
  assert(xs[0] >= 100 && xs.at(-1) <= 600, "clamp");
  assert(xs.at(-1) - med > med - xs[0], "right tail should be longer");
  console.log("ok, median", Math.round(med), "min", Math.round(xs[0]), "max", Math.round(xs.at(-1)));
}
