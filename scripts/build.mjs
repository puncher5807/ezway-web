// Sestaví web do složky dist/. Bez závislostí, stačí Node 20 nebo novější: node scripts/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { LANGS, DEFAULT_LANG, loadDictionaries, pick } from '../src/lib/i18n.mjs';
import { loadContent } from '../src/lib/data.mjs';
import { resolvePreviews } from '../src/lib/preview.mjs';
import { BASE, page, asset, pageFile } from '../src/lib/paths.mjs';
import { homePage } from '../src/pages/home.mjs';
import { countryPage } from '../src/pages/country.mjs';
import { appPage } from '../src/pages/app.mjs';
import { rootPage, notFoundPage } from '../src/pages/misc.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const sha = (data) => crypto.createHash('sha256').update(data).digest('hex');

const written = new Map(); // cesta v dist -> otisk obsahu

function write(rel, data) {
  const file = path.join(dist, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  written.set(rel, sha(data));
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// 1) Obsah a překlady (build spadne s popisem chyby, když něco nesedí)
const dict = loadDictionaries(root);
const { countries, byCode, guides } = loadContent(root);
const preview = resolvePreviews(root, countries);

// 2) Styly a skripty s otiskem v názvu, aby se po změně nenačetla stará kopie z cache
const css = fs.readFileSync(path.join(root, 'src', 'styles', 'site.css'), 'utf8');
const clientDir = path.join(root, 'src', 'client');
const js = fs
  .readdirSync(clientDir)
  .filter((name) => name.endsWith('.js'))
  .sort()
  .map((name) => fs.readFileSync(path.join(clientDir, name), 'utf8'))
  .join('\n');
const assets = {
  css: `assets/site.${sha(css).slice(0, 8)}.css`,
  js: `assets/site.${sha(js).slice(0, 8)}.js`
};
write(assets.css, css);
write(assets.js, js);

// 3) Statické soubory z public/ (popisné README.md ve složkách se nekopírují)
function copyDir(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const rel = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, rel);
    else if (!entry.name.endsWith('.md')) write(rel, fs.readFileSync(src));
  }
}
copyDir(path.join(root, 'public'), '');

// 4) Manifest
write(
  'manifest.webmanifest',
  JSON.stringify(
    {
      name: 'EzWay',
      short_name: 'EzWay',
      description: dict[DEFAULT_LANG].site.description,
      lang: DEFAULT_LANG,
      start_url: page(DEFAULT_LANG),
      scope: page(),
      display: 'standalone',
      background_color: '#F4F6F8',
      theme_color: '#0F2230',
      icons: [
        { src: asset('favicon.svg'), sizes: 'any', type: 'image/svg+xml' },
        { src: asset('icon-192.png'), sizes: '192x192', type: 'image/png' },
        { src: asset('icon-512.png'), sizes: '512x512', type: 'image/png' }
      ]
    },
    null,
    2
  )
);

// 5) Stránky
const ctx = { dict, countries, byCode, guides, preview, assets };
const out = (rel, content) => write(rel, content.toString());

out(pageFile(), rootPage(ctx));
out('404.html', notFoundPage(ctx));
let pageCount = 2;
for (const lang of LANGS) {
  out(pageFile(lang), homePage(ctx, lang));
  pageCount += 1;
  for (const country of countries) {
    out(pageFile(lang, country.code), countryPage(ctx, lang, country));
    pageCount += 1;
    for (const app of country.apps) {
      if (!guides[`${country.code}/${app.id}`]) continue;
      out(pageFile(lang, country.code, app.id), appPage(ctx, lang, country, app));
      pageCount += 1;
    }
  }
}

// 6) Service worker: seznam souborů, které se uloží hned při první návštěvě
const precache = [
  page(),
  ...LANGS.map((lang) => page(lang)),
  asset(assets.css),
  asset(assets.js),
  asset('fonts/manrope-variable.woff'),
  asset('fonts/space-grotesk-variable.woff'),
  asset('manifest.webmanifest'),
  asset('favicon.svg'),
  ...countries.map((c) => asset(preview[c.code].src))
];

for (const url of precache) {
  const rel = decodeURI(url.slice(BASE.length + 1));
  const target = rel === '' || rel.endsWith('/') ? `${rel}index.html` : rel;
  if (!written.has(target)) throw new Error(`Service worker: soubor „${url}“ v dist neexistuje (hledán ${target}).`);
}

const swSource = fs.readFileSync(path.join(root, 'src', 'sw.js'), 'utf8');
const version = sha([swSource, ...[...written.entries()].sort().map(([rel, hash]) => `${rel}:${hash}`)].join('\n')).slice(0, 10);
const sw = swSource
  .replaceAll('__VERSION__', version)
  .replaceAll('__PRECACHE__', JSON.stringify(precache, null, 2));
if (sw.includes('__VERSION__') || sw.includes('__PRECACHE__')) throw new Error('sw.js: zástupné značky se nenahradily');
write('sw.js', sw);

console.log(`Hotovo: ${pageCount} stránek, ${countries.length} zemí, verze ${version}, složka dist/`);
for (const country of countries) {
  const p = preview[country.code];
  console.log(`  ${country.code}: ${country.apps.length} aplikací, náhled ${p.kind === 'photo' ? 'fotka' : 'vlajka'} (${p.src})`);
}
