import { html } from '../lib/html.mjs';
import { page, alternates } from '../lib/paths.mjs';
import { LANGS, fmt, pick } from '../lib/i18n.mjs';
import { kitApps, usedCategories } from '../lib/data.mjs';
import { icon, kitCard, appCard } from '../templates/components.mjs';
import { layout } from '../templates/layout.mjs';

// Adresy, které tlačítko "Uložit offline" uloží: stránka země a její postupy, v obou jazycích.
export function offlineUrls(ctx, country) {
  const urls = [];
  for (const lang of LANGS) {
    urls.push(page(lang, country.code));
    for (const app of country.apps) {
      if (ctx.guides[`${country.code}/${app.id}`]) urls.push(page(lang, country.code, app.id));
    }
  }
  return urls;
}

function offlineBlock(ctx, lang, country) {
  const t = ctx.dict[lang];
  return html`<div class="offline" data-offline data-urls="${JSON.stringify(offlineUrls(ctx, country))}" data-probe="${page(lang, country.code)}" hidden>
    <button class="btn btn--teal" type="button" data-state="idle" data-act="save">${icon('download')}${t.offline.save}</button>
    <span class="offline-state offline-state--busy" data-state="busy" role="status" hidden>${t.offline.saving}</span>
    <span class="offline-state" data-state="saved" role="status" hidden>${icon('circle-check')}${t.offline.saved}
      <button class="btn btn--teal" type="button" data-act="remove">${t.offline.remove}</button>
    </span>
    <span class="offline-state offline-state--error" data-state="error" role="alert" hidden>${icon('x')}${t.offline.error}
      <button class="btn btn--teal" type="button" data-act="retry">${t.offline.retry}</button>
    </span>
  </div>`;
}

// Stránka jedné země: balíček před příjezdem a všechny aplikace s filtrem podle kategorie.
export function countryPage(ctx, lang, country) {
  const t = ctx.dict[lang];
  const name = pick(country.name, lang);
  const lead = fmt(t.country.lead, { in: pick(country.nameIn, lang) });
  const kit = kitApps(country);
  const categories = usedCategories(country);

  const body = html`
<section class="page-head">
  <div class="container">
    <nav class="crumbs" aria-label="${t.breadcrumb.aria}">
      <a href="${page(lang)}#zeme">${t.breadcrumb.countries}</a> / <span aria-current="page">${name}</span>
    </nav>
    <div class="page-head__row">
      <div class="page-head__text">
        <h1>${name}</h1>
        <p class="lead">${lead}</p>
        ${country.status === 'soon' &&
        html`<div class="notice" role="note"><strong>${t.country.soonTitle}</strong><span>${t.country.soonText}</span></div>`}
      </div>
      ${offlineBlock(ctx, lang, country)}
    </div>
  </div>
</section>

${kit.length > 0 &&
html`<section class="block">
  <div class="container">
    <h2 class="title">${t.country.kitH2}</h2>
    <p class="block__sub">${t.country.kitSub}</p>
    <div class="kit-row">
      ${kit.map((app) => kitCard(ctx, lang, country, app))}
    </div>
  </div>
</section>`}

<section class="block">
  <div class="container">
    <h2 class="title">${t.country.allH2}</h2>
    <div class="filter" role="group" aria-label="${t.country.filterAria}" data-filter hidden>
      <button type="button" data-cat="all" aria-pressed="true">${t.country.filterAll}</button>
      ${categories.map((cat) => html`<button type="button" data-cat="${cat}" aria-pressed="false">${t.category[cat]}</button>`)}
    </div>
    <p class="count" data-count data-template="${t.country.shown}" aria-live="polite" hidden>${fmt(t.country.shown, { n: country.apps.length })}</p>
    <div class="app-grid">
      ${country.apps.map((app) => appCard(ctx, lang, country, app))}
    </div>
  </div>
</section>`;

  return layout(ctx, {
    lang,
    title: `${name} – ${t.site.name}`,
    description: lead,
    alt: alternates(country.code),
    headerOptions: { back: { href: page(lang), label: t.back.all } },
    body
  });
}
