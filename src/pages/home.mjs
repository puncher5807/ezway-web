import { html } from '../lib/html.mjs';
import { page, alternates } from '../lib/paths.mjs';
import { fmt, pick } from '../lib/i18n.mjs';
import { kitApps } from '../lib/data.mjs';
import { icon, countryCard, statusChip } from '../templates/components.mjs';
import { layout } from '../templates/layout.mjs';

// Úvodní stránka: hlavní nabídka, výběr destinace, tři důvody, odkaz na uložení offline.
export function homePage(ctx, lang) {
  const t = ctx.dict[lang];
  const pilot = ctx.countries.find((c) => c.status === 'pilot') || ctx.countries[0];
  const pilotName = pick(pilot.name, lang);

  const body = html`
<section class="hero">
  <div class="container hero__row">
    <div class="hero__text">
      <p class="kicker">${t.home.kicker}</p>
      <h1>${t.home.h1}</h1>
      <p class="hero__sub">${t.home.sub}</p>
      <div class="hero__cta">
        <a class="btn btn--primary" href="#zeme">${t.home.cta}${icon('arrow-right')}</a>
        <a class="btn btn--ghost" href="${page(lang, pilot.code)}">${fmt(t.home.cta2, { country: pilotName })}</a>
      </div>
    </div>
    <div class="hero__card">
      <div class="label-caps">${t.home.cardLabel}</div>
      <h2>${pilotName}</h2>
      <div class="mini-kit">
        ${kitApps(pilot).map(
          (app) => html`<div class="mini-kit__item">
          <span class="num num--sm">${app.kit}</span>
          <div>
            <div class="mini-kit__name">${app.name}</div>
            <div class="mini-kit__desc">${t.category[app.category]}</div>
            ${statusChip(t, app.status)}
          </div>
        </div>`
        )}
      </div>
    </div>
  </div>
</section>

<section class="section section--tight" id="zeme">
  <div class="container">
    <h2 class="title">${t.home.countriesH2}</h2>
    <p class="section__sub">${t.home.countriesSub}</p>
    <div class="country-grid">
      ${ctx.countries.map((country) => countryCard(ctx, lang, country))}
    </div>
  </div>
</section>

<section class="section" id="proc">
  <div class="container">
    <h2 class="title">${t.home.whyH2}</h2>
    <div class="feature-row">
      ${t.home.why.map(
        (feature) => html`<div class="feature">
        <span class="feature__icon">${icon(feature.icon, { size: 24 })}</span>
        <h3>${feature.title}</h3>
        <p>${feature.text}</p>
      </div>`
      )}
    </div>
  </div>
</section>

<section class="section section--tight" id="offline">
  <div class="container">
    <div class="offline-cta">
      <div>
        <h2>${t.home.offlineH2}</h2>
        <p>${t.home.offlineP}</p>
      </div>
      <a class="btn btn--primary" href="${page(lang, pilot.code)}">${fmt(t.home.offlineCta, { country: pilotName })}${icon('arrow-right')}</a>
    </div>
  </div>
</section>`;

  return layout(ctx, {
    lang,
    title: t.site.title,
    description: t.site.description,
    alt: alternates(),
    headerOptions: { nav: true },
    body
  });
}
