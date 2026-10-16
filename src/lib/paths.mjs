// Adresy stránek a souborů. Na Vercelu je web v kořeni domény, BASE je tedy prázdné.
// Pro hostování v podadresáři (např. GitHub Pages) se nastaví proměnná EZWAY_BASE=/ezway-web.

import { LANGS } from './i18n.mjs';

export const BASE = (process.env.EZWAY_BASE || '').replace(/\/+$/, '');

// page('cs', 'cz') -> /cs/cz/      page() -> /
export function page(...parts) {
  const clean = parts.filter(Boolean);
  return `${BASE}/${clean.join('/')}${clean.length ? '/' : ''}`;
}

// asset('images/flags/cz.svg') -> /images/flags/cz.svg
export function asset(path) {
  return `${BASE}/${String(path).replace(/^\/+/, '')}`;
}

// Cesta souboru uvnitř složky dist pro danou stránku: pageFile('cs', 'cz') -> cs/cz/index.html
export function pageFile(...parts) {
  const clean = parts.filter(Boolean);
  return `${clean.join('/')}${clean.length ? '/' : ''}index.html`;
}

// Adresy stejné stránky ve všech jazycích: alternates('cz') -> { cs: '/cs/cz/', en: '/en/cz/' }
export const alternates = (...parts) => Object.fromEntries(LANGS.map((lang) => [lang, page(lang, ...parts)]));
