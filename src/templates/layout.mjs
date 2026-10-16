import { html, raw } from '../lib/html.mjs';
import { page, asset } from '../lib/paths.mjs';
import { LANGS } from '../lib/i18n.mjs';
import { icon, logoMark } from './components.mjs';

function langSwitch(t, lang, alt) {
  return html`<div class="lang" role="group" aria-label="${t.langSwitch.aria}">
    ${LANGS.map(
      (code) =>
        html`<a href="${alt[code]}" hreflang="${code}" lang="${code}" data-lang="${code}" aria-current="${String(code === lang)}">${code.toUpperCase()}</a>`
    )}
  </div>`;
}

// Hlavička. nav: odkazy na sekce úvodní stránky. back: odkaz zpět na podstránkách.
function header(ctx, lang, alt, { nav, back }) {
  const t = ctx.dict[lang];
  return html`<header class="site-header">
    <div class="container site-header__row">
      <a class="brand" href="${page(lang)}" aria-label="EzWay">${logoMark()}EzWay</a>
      <div class="site-header__right">
        ${nav &&
        html`<nav class="site-nav" aria-label="${t.nav.aria}">
          <a href="#zeme">${t.nav.countries}</a>
          <a href="#proc">${t.nav.why}</a>
          <a href="#offline">${t.nav.about}</a>
        </nav>`}
        ${back && html`<a class="back-link" href="${back.href}">${icon('arrow-left')}${back.label}</a>`}
        ${langSwitch(t, lang, alt)}
      </div>
    </div>
  </header>`;
}

function footer(t) {
  return html`<footer class="site-footer">
    <div class="container">
      <strong>${t.footer.title}</strong>
      <span>${t.footer.note}</span>
    </div>
  </footer>`;
}

// Společný rámec všech stránek.
// alt: adresy stejné stránky v obou jazycích { cs, en }. headerOptions: { nav } nebo { back: { href, label } }.
export function layout(ctx, { lang, title, description, alt, headerOptions, body }) {
  const t = ctx.dict[lang];
  const sw = asset('sw.js');
  return html`<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="theme-color" content="#0F2230">
<link rel="manifest" href="${asset('manifest.webmanifest')}">
<link rel="icon" href="${asset('favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${asset('apple-touch-icon.png')}">
${LANGS.filter((code) => code !== lang).map(
    (code) => html`<link rel="alternate" hreflang="${code}" href="${alt[code]}">`
  )}
<link rel="preload" href="${asset('fonts/manrope-variable.woff')}" as="font" type="font/woff" crossorigin>
<link rel="preload" href="${asset('fonts/space-grotesk-variable.woff')}" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="${asset(ctx.assets.css)}">
<script src="${asset(ctx.assets.js)}" defer></script>
</head>
<body>
<a class="skip" href="#obsah">${t.skip}</a>
<div class="banner" role="note">${t.banner}</div>
${header(ctx, lang, alt, headerOptions)}
<main id="obsah">
${body}
</main>
${footer(t)}
${raw(`<script>if('serviceWorker' in navigator&&location.protocol!=='file:'){window.addEventListener('load',function(){navigator.serviceWorker.register(${JSON.stringify(sw)}).catch(function(){})})}</script>`)}
</body>
</html>
`;
}

export { footer, header };
