import { html } from '../lib/html.mjs';
import { page, asset, alternates } from '../lib/paths.mjs';
import { fmt, pick } from '../lib/i18n.mjs';
import { APP_STATUSES } from '../lib/data.mjs';
import { icon, statusChip, categoryChip, triValue } from '../templates/components.mjs';
import { layout } from '../templates/layout.mjs';

const DATE_LOCALE = { cs: 'cs-CZ', en: 'en-GB' };

function formatDate(iso, lang) {
  const options = lang === 'cs' ? { day: 'numeric', month: 'numeric', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat(DATE_LOCALE[lang], { ...options, timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
}

function step(ctx, lang, item, index) {
  const t = ctx.dict[lang];
  return html`<li class="step">
    <div class="step__body">
      <span class="num num--sm num--accent">${index + 1}</span>
      <div>
        <h3>${pick(item.title, lang)}</h3>
        <p>${pick(item.text, lang)}</p>
      </div>
    </div>
    ${item.image
      ? html`<div class="step__img"><img src="${asset(item.image)}" alt="${pick(item.imageAlt, lang)}" loading="lazy" decoding="async"></div>`
      : html`<div class="step__shot">${t.app.screenshot}</div>`}
  </li>`;
}

function storesBlock(t, app) {
  const links = Object.entries(app.stores || {}).filter(([, url]) => url);
  return html`<div class="stores">
    <strong>${t.app.storesH2}</strong>
    ${links.length === 0
      ? t.app.storesPlaceholder
      : html`<ul>${links.map(([key, url]) => html`<li><a href="${url}" rel="noopener" target="_blank">${t.app.store[key]}</a></li>`)}</ul>`}
  </div>`;
}

// Detail aplikace v dané zemi: postup pro cizince, požadavky, hlasování "funguje / nefunguje", legenda a odkazy do obchodů.
export function appPage(ctx, lang, country, app) {
  const t = ctx.dict[lang];
  const guide = ctx.guides[`${country.code}/${app.id}`];
  const countryName = pick(country.name, lang);
  const req = app.requires;
  const summary = pick(app.summary, lang) || pick(app.description, lang);
  const languages =
    Array.isArray(req.languages) && req.languages.length ? html`<span class="kv__val">${req.languages.join(', ')}</span>` : triValue(t, 'unknown');

  const body = html`
<section class="page-head">
  <div class="container">
    <nav class="crumbs" aria-label="${t.breadcrumb.aria}">
      <a href="${page(lang)}#zeme">${t.breadcrumb.countries}</a> /
      <a href="${page(lang, country.code)}">${countryName}</a> /
      <span aria-current="page">${app.name}</span>
    </nav>
    <div class="app-head">
      <span class="app-icon" aria-hidden="true">${icon('logo', { size: 36, sw: 1.8 })}</span>
      <div class="app-head__text">
        <h1>${app.name}</h1>
        <div class="chip-row">
          ${statusChip(t, app.status)}
          ${categoryChip(t, app.category)}
          <span class="chip-row__note">${app.verifiedAt ? fmt(t.app.verified, { date: formatDate(app.verifiedAt, lang) }) : t.app.notVerified}</span>
        </div>
        <p class="app-head__summary">${summary}</p>
        ${app.source && html`<p class="app-head__source">${pick(app.source, lang)}</p>`}
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="container">
    <div class="guide">
      <h2>${t.app.guideH2}</h2>
      <p class="guide__intro">${pick(guide.intro, lang)}</p>
      <ol class="guide__steps">
        ${guide.steps.map((item, index) => step(ctx, lang, item, index))}
      </ol>
    </div>
  </div>
</section>

<section class="block">
  <div class="container">
    <div class="panel-grid">
      <div class="panel">
        <h2>${t.app.reqH2}</h2>
        <dl class="kv">
          <div><dt>${t.req.phone}</dt><dd>${triValue(t, req.localPhone)}</dd></div>
          <div><dt>${t.req.card}</dt><dd>${triValue(t, req.foreignCard)}</dd></div>
          <div><dt>${t.req.languages}</dt><dd>${languages}</dd></div>
          <div><dt>${t.req.offline}</dt><dd>${triValue(t, req.offline)}</dd></div>
        </dl>
      </div>
      <div class="panel" data-feedback data-key="${country.code}/${app.id}">
        <h2>${t.app.feedbackH2}</h2>
        <p class="panel__sub">${t.app.feedbackP}</p>
        <div class="vote">
          <button type="button" data-vote="ok" aria-pressed="false">${icon('check')}${t.app.feedbackOk}</button>
          <button type="button" data-vote="bad" aria-pressed="false">${icon('x')}${t.app.feedbackBad}</button>
        </div>
        <p class="vote-note" data-note hidden>${t.app.feedbackNote}</p>
      </div>
      <div class="panel">
        <h2>${t.app.legendH2}</h2>
        <div class="legend">
          ${APP_STATUSES.map((status) => html`<div>${statusChip(t, status)}<span>${t.statusDesc[status]}</span></div>`)}
        </div>
      </div>
    </div>
    <div style="margin-top:20px">${storesBlock(t, app)}</div>
  </div>
</section>`;

  return layout(ctx, {
    lang,
    title: `${app.name} – ${countryName} – ${t.site.name}`,
    description: summary,
    alt: alternates(country.code, app.id),
    headerOptions: { back: { href: page(lang, country.code), label: fmt(t.back.toCountry, { country: countryName }) } },
    body
  });
}
