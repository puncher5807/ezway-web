/* EzWay service worker. Verzi a seznam souborů k uložení doplňuje scripts/build.mjs.
 *
 * Tři cache:
 *  - ezway-shell-<verze>: úvodní stránky, CSS, JS, písma a náhledy zemí (uloží se při instalaci)
 *  - ezway-runtime-<verze>: stránky a soubory, které uživatel během používání otevřel
 *  - ezway-saved: země uložené tlačítkem "Uložit offline" (verzí se nemění, patří uživateli)
 * Při nové verzi webu se shell a runtime smažou, saved zůstane a při online návštěvě se obnoví.
 */
const VERSION = '__VERSION__';
const SHELL = `ezway-shell-${VERSION}`;
const RUNTIME = `ezway-runtime-${VERSION}`;
const SAVED = 'ezway-saved';
const PRECACHE = __PRECACHE__;
const NAV_TIMEOUT_MS = 3500;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        const old = (key.startsWith('ezway-shell-') || key.startsWith('ezway-runtime-')) && !key.endsWith(VERSION);
        if (old) await caches.delete(key);
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.cache === 'reload' || request.cache === 'no-store') return; // vynucené stažení ze sítě (Uložit offline)
  if (request.mode === 'navigate') {
    event.respondWith(navigate(request));
  } else {
    event.respondWith(assetFirst(request));
  }
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

// Stránky: nejdřív síť (aktuální obsah). Když je offline nebo pomalá a máme kopii, použije se kopie.
async function navigate(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  try {
    const response = await withTimeout(fetch(request), cached ? NAV_TIMEOUT_MS : 30000);
    if (response.ok) {
      const copy = response.clone();
      const runtime = await caches.open(RUNTIME);
      await runtime.put(request, response.clone());
      const saved = await caches.open(SAVED);
      if (await saved.match(request)) await saved.put(request, copy); // uložená země se při online návštěvě obnoví
    }
    return response;
  } catch (error) {
    return cached || offlinePage();
  }
}

// Soubory (CSS, JS, písma, obrázky): nejdřív cache. Nová verze webu má novou cache, takže se nic nezasekne.
async function assetFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === 'basic') {
    const runtime = await caches.open(RUNTIME);
    await runtime.put(request, response.clone());
  }
  return response;
}

function offlinePage() {
  const body = `<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EzWay – offline</title></head><body style="font-family:system-ui,sans-serif;background:#F4F6F8;color:#12222F;margin:0;padding:48px 24px"><h1 style="margin:0 0 12px">Jsi offline / You are offline</h1><p>Tuhle stránku nemáme uloženou. Otevři zemi, kterou sis uložil, nebo se připoj k internetu.</p><p>This page is not saved. Open a country you saved, or connect to the internet.</p></body></html>`;
  return new Response(body, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
