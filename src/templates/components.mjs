import { html, raw } from '../lib/html.mjs';
import { page, asset } from '../lib/paths.mjs';
import { fmt, pick } from '../lib/i18n.mjs';

const ICONS = {
  logo: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h5.5"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
  'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  wave: '<path d="M4 12c2-4 4-4 8 0s6 4 8 0"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5M12 17h.01"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  checklist: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  'circle-check': '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
  doc: '<path d="M4 4h12l4 4v12H4z"/><path d="M8 12h8M8 16h8"/>'
};

export function icon(name, { size = 18, sw = 2.2 } = {}) {
  if (!ICONS[name]) throw new Error(`Neznámá ikona: ${name}`);
  return raw(
    `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`
  );
}

const STATUS_ICON = { verified: 'check', partial: 'wave', broken: 'x', pending: 'clock' };
const TRI_ICON = { yes: 'check', no: 'x', unknown: 'help' };

export const statusChip = (t, status) =>
  html`<span class="chip chip--${status}">${icon(STATUS_ICON[status], { size: 14, sw: 2.4 })}${t.status[status]}</span>`;

// Hodnota ano / ne / neznámé s ikonou.
export const triValue = (t, value) =>
  html`<span class="kv__val">${icon(TRI_ICON[value], { size: 16 })}${t.tri[value]}</span>`;

export const categoryChip = (t, category) => html`<span class="chip chip--sm">${t.category[category]}</span>`;

// Náhled země: fotka z public/images/countries nebo záložní vlajka.
export function preview(ctx, lang, country) {
  const t = ctx.dict[lang];
  const p = ctx.preview[country.code];
  const alt =
    p.kind === 'photo' ? fmt(t.preview.photo, { capital: pick(country.capital, lang) }) : pick(country.flagLabel, lang);
  return html`<img src="${asset(p.src)}" alt="${alt}" width="600" height="400" loading="lazy" decoding="async">`;
}

export function countryCard(ctx, lang, country) {
  const t = ctx.dict[lang];
  const pilot = country.status === 'pilot';
  return html`<a class="country-card ${pilot && 'country-card--pilot'}" href="${page(lang, country.code)}">
    <div class="country-card__preview">${preview(ctx, lang, country)}</div>
    <span class="chip country-card__tag ${pilot && 'chip--accent'}">${pilot ? t.home.pilot : t.home.soon}</span>
    <span class="country-card__name">${pick(country.name, lang)}</span>
    <span class="country-card__capital">${icon('pin', { size: 16 })}${pick(country.capital, lang)}</span>
    <span class="country-card__open">${pilot ? t.home.openPilot : t.home.openSoon}${icon('arrow-right')}</span>
  </a>`;
}

const reqLine = (t, label, value) =>
  html`<div>${icon(TRI_ICON[value], { size: 16 })}<span>${label}: ${t.tri[value]}</span></div>`;

export const reqSummary = (t, app, small = false) => html`<div class="reqs ${small && 'reqs--sm'}">
    ${reqLine(t, t.req.cardPhone, app.requires.localPhone)}
    ${reqLine(t, t.req.cardCard, app.requires.foreignCard)}
  </div>`;

function guideLink(ctx, lang, country, app) {
  const t = ctx.dict[lang];
  return ctx.guides[`${country.code}/${app.id}`]
    ? html`<a class="card-link" href="${page(lang, country.code, app.id)}">${t.country.guideLink}${icon('arrow-right')}</a>`
    : html`<span class="card-link card-link--none">${t.country.noGuide}</span>`;
}

export function kitCard(ctx, lang, country, app) {
  const t = ctx.dict[lang];
  return html`<div class="kit-card">
    <div class="kit-card__head">
      <span class="num">${app.kit}</span>
      <div>
        <div class="kit-card__name">${app.name}</div>
        <div class="kit-card__cat">${t.category[app.category]}</div>
      </div>
    </div>
    <div>${statusChip(t, app.status)}</div>
    ${reqSummary(t, app)}
    ${guideLink(ctx, lang, country, app)}
  </div>`;
}

export function appCard(ctx, lang, country, app) {
  const t = ctx.dict[lang];
  return html`<div class="app-card" data-app-card data-cat="${app.category}">
    <div class="app-card__head">
      <h3>${app.name}</h3>
      ${categoryChip(t, app.category)}
    </div>
    <p class="app-card__desc">${pick(app.description, lang)}</p>
    ${statusChip(t, app.status)}
    ${reqSummary(t, app, true)}
    ${guideLink(ctx, lang, country, app)}
  </div>`;
}

export function logoMark(size = 26) {
  return icon('logo', { size, sw: 2 });
}
