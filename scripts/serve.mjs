// Místní server pro prohlížení sestaveného webu: node scripts/serve.mjs [port]
// Service worker funguje jen přes http://localhost nebo https, ne při otevření souboru z disku.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.argv[2] || process.env.PORT || 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const target = path.normalize(path.join(dist, clean));
  if (!target.startsWith(dist)) return null;
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    return clean.endsWith('/') ? path.join(target, 'index.html') : null;
  }
  return target;
}

http
  .createServer((req, res) => {
    const file = resolve(req.url);
    if (file === null && req.url.split('?')[0] !== undefined && fs.existsSync(path.join(dist, decodeURIComponent(req.url.split('?')[0]), 'index.html'))) {
      res.writeHead(308, { Location: `${req.url.split('?')[0]}/` });
      res.end();
      return;
    }
    if (file && fs.existsSync(file) && fs.statSync(file).isFile()) {
      const headers = { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' };
      if (file.endsWith('sw.js')) headers['Cache-Control'] = 'no-cache';
      res.writeHead(200, headers);
      fs.createReadStream(file).pipe(res);
      return;
    }
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    const notFound = path.join(dist, '404.html');
    res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not found');
  })
  .listen(port, () => console.log(`http://localhost:${port}/`));
