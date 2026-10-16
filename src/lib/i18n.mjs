import fs from 'node:fs';
import path from 'node:path';

export const LANGS = ['cs', 'en'];
export const DEFAULT_LANG = 'cs';

// "Zpět na {country}" + { country: 'Česko' } -> "Zpět na Česko"
export const fmt = (template, vars = {}) =>
  String(template).replace(/\{(\w+)\}/g, (match, key) => (key in vars ? vars[key] : match));

function flatten(value, prefix = '', out = {}) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) flatten(child, `${prefix}${prefix ? '.' : ''}${key}`, out);
  } else if (Array.isArray(value)) {
    out[prefix] = `[${value.length}]`;
    value.forEach((child, i) => flatten(child, `${prefix}.${i}`, out));
  } else {
    out[prefix] = typeof value;
  }
  return out;
}

// Načte src/i18n/<jazyk>.json a ověří, že všechny jazyky mají stejné klíče.
export function loadDictionaries(root) {
  const dict = {};
  for (const lang of LANGS) {
    dict[lang] = JSON.parse(fs.readFileSync(path.join(root, 'src', 'i18n', `${lang}.json`), 'utf8'));
  }
  const reference = flatten(dict[DEFAULT_LANG]);
  for (const lang of LANGS) {
    if (lang === DEFAULT_LANG) continue;
    const other = flatten(dict[lang]);
    const missing = Object.keys(reference).filter((k) => !(k in other));
    const extra = Object.keys(other).filter((k) => !(k in reference));
    if (missing.length || extra.length) {
      throw new Error(
        `Překlady ${lang}.json nesedí s ${DEFAULT_LANG}.json. Chybí: ${missing.join(', ') || '–'}. Navíc: ${extra.join(', ') || '–'}.`
      );
    }
  }
  return dict;
}

// Vybere text pro daný jazyk z objektu { cs: '…', en: '…' }.
export const pick = (value, lang) => (value && typeof value === 'object' ? value[lang] : value);
