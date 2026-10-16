import fs from 'node:fs';
import path from 'node:path';
import { LANGS } from './i18n.mjs';

export const CATEGORIES = ['mhd', 'rail', 'bus', 'taxi', 'micro', 'nav'];
export const APP_STATUSES = ['verified', 'partial', 'broken', 'pending'];
export const TRI = ['yes', 'no', 'unknown'];
export const COUNTRY_STATUSES = ['pilot', 'soon'];
const STORE_KEYS = ['ios', 'android', 'web'];

function fail(file, message) {
  throw new Error(`${file}: ${message}`);
}

function requireText(file, where, value) {
  if (!value || typeof value !== 'object') fail(file, `${where} musí být objekt { ${LANGS.join(', ')} }`);
  for (const lang of LANGS) {
    if (typeof value[lang] !== 'string' || !value[lang].trim()) fail(file, `${where}.${lang} chybí nebo je prázdné`);
  }
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`${file}: neplatný JSON (${error.message})`);
  }
}

function validateApp(file, app, index) {
  const where = `apps[${index}]`;
  if (!/^[a-z0-9-]+$/.test(app.id || '')) fail(file, `${where}.id musí obsahovat jen malá písmena, čísla a pomlčky`);
  if (!app.name) fail(file, `${where}.name chybí (${app.id})`);
  if (!CATEGORIES.includes(app.category)) fail(file, `${where}.category „${app.category}“ není z ${CATEGORIES.join('|')} (${app.id})`);
  requireText(file, `${where}.description (${app.id})`, app.description);
  if (app.summary !== undefined) requireText(file, `${where}.summary (${app.id})`, app.summary);
  if (app.source !== undefined) requireText(file, `${where}.source (${app.id})`, app.source);
  if (!APP_STATUSES.includes(app.status)) fail(file, `${where}.status „${app.status}“ není z ${APP_STATUSES.join('|')} (${app.id})`);
  if (app.status !== 'pending' && !/^\d{4}-\d{2}-\d{2}$/.test(app.verifiedAt || '')) {
    fail(file, `${where}: aplikace se stavem ${app.status} musí mít verifiedAt ve tvaru RRRR-MM-DD (${app.id})`);
  }
  if (app.verifiedAt !== null && app.verifiedAt !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(app.verifiedAt)) {
    fail(file, `${where}.verifiedAt musí být null nebo RRRR-MM-DD (${app.id})`);
  }
  const req = app.requires || {};
  for (const key of ['localPhone', 'foreignCard', 'offline']) {
    if (!TRI.includes(req[key])) fail(file, `${where}.requires.${key} musí být ${TRI.join('|')} (${app.id})`);
  }
  if (req.languages !== null && !Array.isArray(req.languages)) fail(file, `${where}.requires.languages musí být null nebo pole (${app.id})`);
  if (app.stores !== null && app.stores !== undefined) {
    for (const [key, url] of Object.entries(app.stores)) {
      if (!STORE_KEYS.includes(key)) fail(file, `${where}.stores.${key}: povoleno je ${STORE_KEYS.join(', ')} (${app.id})`);
      if (url !== null && !/^https:\/\//.test(url)) fail(file, `${where}.stores.${key} musí být null nebo adresa začínající https:// (${app.id})`);
    }
  }
  if (app.kit !== undefined && ![1, 2, 3].includes(app.kit)) fail(file, `${where}.kit musí být 1, 2 nebo 3 (${app.id})`);
}

function validateCountry(file, expectedCode, country) {
  if (country.code !== expectedCode) fail(file, `code „${country.code}“ nesedí s názvem souboru „${expectedCode}“`);
  if (!/^[a-z]{2}$/.test(country.code)) fail(file, 'code musí být dvoupísmenný kód malými písmeny');
  if (typeof country.order !== 'number') fail(file, 'order musí být číslo');
  if (!COUNTRY_STATUSES.includes(country.status)) fail(file, `status „${country.status}“ není z ${COUNTRY_STATUSES.join('|')}`);
  for (const key of ['name', 'nameIn', 'capital', 'flagLabel']) requireText(file, key, country[key]);
  if (!Array.isArray(country.apps) || !country.apps.length) fail(file, 'apps musí být neprázdné pole');
  const ids = new Set();
  const kits = new Set();
  country.apps.forEach((app, i) => {
    validateApp(file, app, i);
    if (ids.has(app.id)) fail(file, `duplicitní id aplikace „${app.id}“`);
    ids.add(app.id);
    if (app.kit !== undefined) {
      if (kits.has(app.kit)) fail(file, `kit ${app.kit} je použit u více aplikací`);
      kits.add(app.kit);
    }
  });
}

function validateGuide(file, guide) {
  requireText(file, 'intro', guide.intro);
  if (!Array.isArray(guide.steps) || !guide.steps.length) fail(file, 'steps musí být neprázdné pole');
  guide.steps.forEach((step, i) => {
    requireText(file, `steps[${i}].title`, step.title);
    requireText(file, `steps[${i}].text`, step.text);
    if (step.image !== null && step.image !== undefined) {
      if (typeof step.image !== 'string') fail(file, `steps[${i}].image musí být null nebo cesta k souboru`);
      requireText(file, `steps[${i}].imageAlt`, step.imageAlt);
    }
  });
}

// Načte content/countries/*.json a content/guides/<země>/<aplikace>.json a zkontroluje je.
export function loadContent(root) {
  const countriesDir = path.join(root, 'content', 'countries');
  const guidesDir = path.join(root, 'content', 'guides');

  const countries = fs
    .readdirSync(countriesDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => {
      const file = path.join('content', 'countries', name);
      const country = readJson(path.join(root, file));
      validateCountry(file, name.replace(/\.json$/, ''), country);
      return country;
    })
    .sort((a, b) => a.order - b.order);

  const byCode = Object.fromEntries(countries.map((c) => [c.code, c]));
  const guides = {};

  if (fs.existsSync(guidesDir)) {
    for (const code of fs.readdirSync(guidesDir)) {
      const dir = path.join(guidesDir, code);
      if (!fs.statSync(dir).isDirectory()) continue;
      if (!byCode[code]) fail(path.join('content', 'guides', code), 'složka nepatří žádné zemi z content/countries');
      for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.json'))) {
        const appId = name.replace(/\.json$/, '');
        const file = path.join('content', 'guides', code, name);
        if (!byCode[code].apps.some((a) => a.id === appId)) fail(file, `aplikace „${appId}“ není v content/countries/${code}.json`);
        const guide = readJson(path.join(root, file));
        validateGuide(file, guide);
        guides[`${code}/${appId}`] = guide;
      }
    }
  }

  return { countries, byCode, guides };
}

// Aplikace v „balíčku před příjezdem“ seřazené podle pole kit.
export const kitApps = (country) => country.apps.filter((a) => a.kit).sort((a, b) => a.kit - b.kit);

// Kategorie, které mají v zemi aspoň jednu aplikaci, v pořadí CATEGORIES.
export const usedCategories = (country) => CATEGORIES.filter((c) => country.apps.some((a) => a.category === c));
