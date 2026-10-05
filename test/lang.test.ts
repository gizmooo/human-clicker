import { it, expect } from "vitest";
import { makeT, languages } from "../src/lang.ts";
import locales from "../src/locales.json" with { type: "json" };

it("every locale has the same keys as en", () => {
  const keys = Object.keys(locales.en).sort();
  for (const l of languages) expect(Object.keys(locales[l]).sort(), `keys in ${l}`).toEqual(keys);
});

it("substitutes placeholders", () => {
  expect(makeT("ru")("countdown", { n: 3 })).toBe("старт через 3… наведи мышь на цель");
  expect(makeT("en")("pause", {})).toBe("⏸ paused. Space — resume");
});

it("falls back to en for unknown or regional locales", () => {
  expect(makeT("xx")("away")).toBe("mouse moved away");
  expect(makeT("es-MX")("away")).toBe("el ratón se alejó");
  expect(makeT(undefined)("away")).toBe("mouse moved away");
});
