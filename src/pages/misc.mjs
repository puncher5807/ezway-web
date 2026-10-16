import { html, raw } from '../lib/html.mjs';
import { page, asset } from '../lib/paths.mjs';
import { LANGS } from '../lib/i18n.mjs';
import { icon, logoMark } from '../templates/components.mjs';
import { layout } from '../templates/layout.mjs';

// Adresa "/": vybere jazyk podle uložené volby nebo jazyka prohlížeče a přesměruje.
// Bez JavaScriptu zůstanou vidět dva odkazy.
export function rootPage(ctx) {
  const t = ctx.dict.cs;
  const e = ctx.dict.en;
  const script = `(function(){var l=null;try{l=localStorage.getItem('ezway:lang')}catch(x){}if(l!=='cs'&&l!=='en'){var n=(navigator.language||'').slice(0,2);l=(n==='cs'||n==='sk')?'cs':'en'}location.replace(${JSON.stringify(page('__L__'))}.replace('__L__',l))})()`;
  return html`<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.site.title}</title>
<meta name="description" content="${t.site.description}">
<meta name="theme-color" content="#0F2230">
<link rel="manifest" href="${asset('manifest.webmanifest')}">
<link rel="icon" href="${asset('favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${asset('apple-touch-icon.png')}">
${LANGS.map((code) => html`<link rel="alternate" hreflang="${code}" href="${page(code)}">`)}
<link rel="alternate" hreflang="x-default" href="${page()}">
<link rel="stylesheet" href="${asset(ctx.assets.css)}">
</head>
<body>
<header class="site-header"><div class="container site-header__row"><span class="brand">${logoMark()}EzWay</span></div></header>
<main class="container center-page">
  <h1>EzWay</h1>
  <p>${t.site.description}</p>
  <p lang="en">${e.site.description}</p>
  <div class="hero__cta">
    <a class="btn btn--primary" href="${page('cs')}" hreflang="cs" lang="cs">Česky${icon('arrow-right')}</a>
    <a class="btn btn--teal" href="${page('en')}" hreflang="en" lang="en">English${icon('arrow-right')}</a>
  </div>
</main>
${raw(`<script>${script}</script>`)}
</body>
</html>
`;
}

// Chybová stránka. Vercel ji ukáže u každé neexistující adresy, proto je dvojjazyčná a odkazy jsou absolutní.
export function notFoundPage(ctx) {
  const t = ctx.dict.cs;
  const e = ctx.dict.en;
  const body = html`
<div class="container center-page">
  <h1>${t.notFound.title}</h1>
  <p>${t.notFound.text}</p>
  <a class="btn btn--primary" href="${page('cs')}">${t.notFound.home}${icon('arrow-right')}</a>
  <h2 lang="en" class="h-display" style="margin-top:24px;font-size:26px">${e.notFound.title}</h2>
  <p lang="en">${e.notFound.text}</p>
  <a class="btn btn--teal" lang="en" href="${page('en')}">${e.notFound.home}${icon('arrow-right')}</a>
</div>`;

  return layout(ctx, {
    lang: 'cs',
    title: `${t.notFound.title} – ${t.site.name}`,
    description: t.notFound.text,
    alt: { cs: page('cs'), en: page('en') },
    headerOptions: {},
    body
  });
}
