import fs from 'node:fs';
import path from 'node:path';

// Náhled země: vlastní fotka z public/images/countries/<kód>.(jpg|jpeg|png|webp),
// když chybí, záložní vlajka public/images/flags/<kód>.svg.
// Přípona se porovnává bez ohledu na velikost písmen, takže cz.JPG z Windows funguje také.
const PHOTO_EXT = ['jpg', 'jpeg', 'png', 'webp'];

export function resolvePreviews(root, countries) {
  const photosDir = path.join(root, 'public', 'images', 'countries');
  const flagsDir = path.join(root, 'public', 'images', 'flags');
  const photoFiles = fs.existsSync(photosDir) ? fs.readdirSync(photosDir) : [];
  const result = {};

  for (const { code } of countries) {
    const photo = photoFiles.find((file) => {
      const match = file.match(/^(.+)\.([^.]+)$/);
      return match && match[1].toLowerCase() === code && PHOTO_EXT.includes(match[2].toLowerCase());
    });
    if (photo) {
      result[code] = { kind: 'photo', src: `images/countries/${photo}` };
      continue;
    }
    if (!fs.existsSync(path.join(flagsDir, `${code}.svg`))) {
      throw new Error(`Chybí náhled země „${code}“: nahraj public/images/countries/${code}.jpg nebo vlajku public/images/flags/${code}.svg`);
    }
    result[code] = { kind: 'flag', src: `images/flags/${code}.svg` };
  }
  return result;
}
