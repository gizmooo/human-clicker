const strings = {
  en: {
    countdown: "starting in {n}… point the mouse at the target",
    started: "▶ target ({x}, {y}), limit {m} min. ESC — quit, Space — pause",
    quit: "\n🛑 ESC — quit",
    resume: "▶ resuming, timer reset",
    pause: "⏸ paused{why}. Space — resume",
    away: "mouse moved away",
    rest: "[{n}] resting {ms} ms",
    limit: "⏱ {m} min limit reached, quitting",
  },
  ru: {
    countdown: "старт через {n}… наведи мышь на цель",
    started: "▶ цель ({x}, {y}), лимит {m} мин. ESC — выход, Space — пауза",
    quit: "\n🛑 ESC — выход",
    resume: "▶ продолжаю, таймер сброшен",
    pause: "⏸ пауза{why}. Space — продолжить",
    away: "мышь увели",
    rest: "[{n}] передышка {ms} мс",
    limit: "⏱ лимит {m} мин истёк, выход",
  },
  es: {
    countdown: "inicio en {n}… apunta el ratón al objetivo",
    started: "▶ objetivo ({x}, {y}), límite {m} min. ESC — salir, Espacio — pausa",
    quit: "\n🛑 ESC — salir",
    resume: "▶ continuando, temporizador reiniciado",
    pause: "⏸ pausa{why}. Espacio — continuar",
    away: "el ratón se alejó",
    rest: "[{n}] descanso {ms} ms",
    limit: "⏱ límite de {m} min alcanzado, saliendo",
  },
  zh: {
    countdown: "{n} 秒后开始… 请将鼠标指向目标",
    started: "▶ 目标 ({x}, {y})，限时 {m} 分钟。ESC — 退出，空格 — 暂停",
    quit: "\n🛑 ESC — 退出",
    resume: "▶ 继续，计时器已重置",
    pause: "⏸ 已暂停{why}。空格 — 继续",
    away: "鼠标已移开",
    rest: "[{n}] 休息 {ms} 毫秒",
    limit: "⏱ 已到 {m} 分钟限时，退出",
  },
};

const pick = lang => strings[(lang || "").slice(0, 2)] || strings.en;
const systemLang = () => Intl.DateTimeFormat().resolvedOptions().locale.slice(0, 2);

// t(key, {vars}) — substitutes {name} from vars
const makeT = lang => {
  const s = pick(lang);
  return (key, vars = {}) => s[key].replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
};

module.exports = { makeT, systemLang, languages: Object.keys(strings) };

if (require.main === module) {
  const assert = require("assert");
  const keys = Object.keys(strings.en).sort().join();
  for (const l of Object.keys(strings)) assert.strictEqual(Object.keys(strings[l]).sort().join(), keys, `keys mismatch in ${l}`);
  assert.strictEqual(makeT("ru")("countdown", { n: 3 }), "старт через 3… наведи мышь на цель");
  assert.strictEqual(makeT("xx")("away"), "mouse moved away");
  assert.strictEqual(makeT("en")("pause", {}), "⏸ paused. Space — resume");
  console.log("ok", Object.keys(strings).join(", "));
}
