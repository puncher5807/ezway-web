# Fotky zemí

Sem patří náhledové fotky, které se zobrazují na kartách destinací (výběr země na úvodní stránce).

## Jak fotku vyměnit

1. Připrav fotku hlavního města nebo jiný typický záběr dané země.
2. Pojmenuj ji **kódem země** malými písmeny a příponou `.jpg`, `.png` nebo `.webp`:

| Země | Soubor |
|---|---|
| Česko | `cz.jpg` |
| Slovensko | `sk.jpg` |
| Německo | `de.jpg` |
| Polsko | `pl.jpg` |
| Rakousko | `at.jpg` |

3. Nahraj ji do této složky (na GitHubu: **Add file → Upload files**) a potvrď commit.
4. Web při příštím sestavení použije fotku. Kde fotka chybí, zobrazí se vlajka ze složky `public/images/flags/`.

## Doporučené parametry

- poměr stran 5 : 3, například 1200 × 720 px,
- velikost do 300 kB (zmenši ji nástrojem jako Squoosh),
- na výšku nebo na šířku nevadí, střed záběru se ořízne na poměr karty.

## Autorská práva

Používej jen vlastní fotky nebo fotky s licencí, která to dovoluje (například CC0 nebo CC BY z Wikimedia Commons). U fotek s licencí CC BY zapiš autora a zdroj do souboru `CREDITS.md` v této složce.

## Nová země

Pro další zemi přidej fotku `kód.jpg` a vlajku `public/images/flags/kód.svg`. Kód země je dvoupísmenný (ISO 3166-1 alpha-2).
