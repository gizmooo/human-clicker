import locales from "./locales.json" with { type: "json" };

export type Lang = keyof typeof locales;
export type Key = keyof (typeof locales)["en"];
export const languages = Object.keys(locales) as Lang[];

const pick = (lang?: string) => locales[(lang ?? "").slice(0, 2) as Lang] ?? locales.en;
export const systemLang = () => Intl.DateTimeFormat().resolvedOptions().locale.slice(0, 2);

// t(key, {vars}) — substitutes {name} from vars
export const makeT = (lang?: string) => {
  const s = pick(lang);
  return (key: Key, vars: Record<string, string | number> = {}) =>
    s[key].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
};
