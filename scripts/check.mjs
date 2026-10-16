// Zkontroluje sestavený web: node scripts/check.mjs (nejdřív spusť node scripts/build.mjs)
// Ověří, že každý lokální odkaz, obrázek, styl a skript vede na existující soubor
// a že odkazy na #kotvy mají cíl na stejné stránce.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE } from '../src/lib/paths.mjs';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (!fs.existsSync(dist)) {
  console.error('Složka dist/ neexistuje. Spusť nejdřív: node scripts/build.mjs');
  process.exit(1);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const htmlFiles = walk(dist).filter((f) => f.endsWith('.html'));
const problems = [];
let checked = 0;

function exists(urlPath) {
  const rel = decodeURIComponent(urlPath.slice(BASE.length)).replace(/^\/+/, '');
  const target = path.join(dist, rel);
  if (rel === '' || rel.endsWith('/')) return fs.existsSync(path.join(target, 'index.html'));
  return fs.existsSync(target) && fs.statSync(target).isFile();
}

for (const file of htmlFiles) {
  const rel = path.relative(dist, file);
  const html = fs.readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  for (const ref of refs) {
    if (!ref || /^(https?:|mailto:|tel:|data:)/.test(ref)) continue;
    checked += 1;
    if (ref.startsWith('#')) {
      if (!ids.has(ref.slice(1))) problems.push(`${rel}: kotva ${ref} nemá cíl`);
      continue;
    }
    const [urlPath, hash] = ref.split('#');
    if (!urlPath.startsWith('/')) {
      problems.push(`${rel}: relativní adresa „${ref}“ (použij adresy od kořene)`);
      continue;
    }
    if (!exists(urlPath)) problems.push(`${rel}: ${ref} vede na neexistující soubor`);
    else if (hash && urlPath.endsWith('/')) {
      const target = fs.readFileSync(path.join(dist, decodeURIComponent(urlPath.slice(BASE.length)), 'index.html'), 'utf8');
      if (!target.includes(`id="${hash}"`)) problems.push(`${rel}: ${ref} nemá cíl na cílové stránce`);
    }
  }
  if (!/<html lang="(cs|en)"/.test(html)) problems.push(`${rel}: chybí atribut lang na <html>`);
}

// Překlady: každá stránka v /cs/ musí mít protějšek v /en/
for (const file of htmlFiles) {
  const rel = path.relative(dist, file);
  if (rel.startsWith(`cs${path.sep}`) && !fs.existsSync(path.join(dist, 'en', rel.slice(3)))) {
    problems.push(`${rel}: chybí anglická verze`);
  }
}

if (problems.length) {
  console.error(`Nalezeno ${problems.length} problémů:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`Kontrola prošla: ${htmlFiles.length} stránek, ${checked} odkazů a souborů.`);
