# EzWay

Web, který pro zvolenou zemi ukáže, jaké dopravní aplikace si nainstalovat, jak se v nich jako cizinec zaregistrovat a zaplatit. Česky a anglicky, funguje offline. Školní projekt.

Země: Česko (pilot), Slovensko, Německo, Polsko, Rakousko.

**Obsah je zatím ukázkový a nic z něj není ověřeno.** Každá aplikace má stav `pending`, dokud ji někdo neprojde a nezapíše datum ověření.

## Spuštění

Stačí Node 20 nebo novější. Nic se neinstaluje.

```
npm start          # sestaví web a spustí ho na http://localhost:4173/
npm test           # sestaví web a zkontroluje všechny odkazy
```

Bez npm: `node scripts/build.mjs` a `node scripts/serve.mjs`.

## Jak to funguje

Web je statický. `scripts/build.mjs` vezme obsah z `content/`, překlady ze `src/i18n/` a vyrobí složku `dist/` s hotovými stránkami `/cs/...` a `/en/...`. Žádný framework, žádné závislosti.

```
content/countries/<kód>.json      země a její aplikace
content/guides/<kód>/<app>.json   postup pro cizince (kroky, screenshoty)
src/i18n/cs.json, en.json         všechny texty rozhraní
src/pages/                        úvod, země, aplikace, 404
src/templates/                    společný rámec a karty
src/styles/site.css               styly
src/client/                       malé skripty (filtr, offline, hlasování)
src/sw.js                         service worker pro offline
public/                           obrázky, písma, ikony (kopíruje se beze změny)
design/ezway-navrh.html           původní návrh z plátna, jen jako předloha
```

## Časté úpravy

**Vyměnit náhled země za fotku.** Nahraj `cz.jpg`, `sk.jpg`, `de.jpg`, `pl.jpg` nebo `at.jpg` (také `.png`, `.webp`) do `public/images/countries/`. Bez fotky se ukáže vlajka. Podrobně v `public/images/countries/README.md`.

**Přidat zemi.** Zkopíruj `content/countries/sk.json` pod novým dvoupísmenným kódem a uprav ho. Přidej vlajku `public/images/flags/<kód>.svg`. Build zkontroluje, že nic nechybí.

**Přidat nebo ověřit aplikaci.** Uprav její záznam v `content/countries/<kód>.json`: `status` (`verified`, `partial`, `broken`, `pending`), `verifiedAt` ve tvaru `RRRR-MM-DD` a `requires`. Texty jsou vždy v obou jazycích (`cs`, `en`).

**Napsat postup pro cizince.** Vytvoř `content/guides/<kód>/<id-aplikace>.json` podle `content/guides/cz/pid-litacka.json`. Screenshot dej do `public/images/guides/` a uveď cestu v `image` a popis v `imageAlt`. Stránka aplikace vznikne sama.

**Přidat jazyk.** Přidej ho do `LANGS` v `src/lib/i18n.mjs` a vytvoř `src/i18n/<jazyk>.json` se stejnými klíči jako `cs.json`. Build spadne, když nějaký klíč chybí. Texty v obsahu (`content/`) je pak potřeba doplnit také.

## Offline

Service worker při první návštěvě uloží úvodní stránky, styly, písma a náhledy zemí. Tlačítko **Uložit offline** na stránce země uloží celou zemi včetně postupů. Uložené země se při další online návštěvě samy obnoví.

Na iPhonu může Safari uložená data po delší nečinnosti smazat. Je to známé omezení a v projektu je vedené jako riziko R-T1.

## Nasazení

Vercel spouští `node scripts/build.mjs` a publikuje složku `dist/` (viz `vercel.json`). Framework Preset v nastavení projektu nevadí, `vercel.json` ho přebíjí.

Pro hostování v podadresáři (například GitHub Pages) nastav `EZWAY_BASE=/ezway-web` před buildem.

## Fonty

Space Grotesk a Manrope, licence SIL OFL (soubory `public/fonts/OFL-*.txt`).
