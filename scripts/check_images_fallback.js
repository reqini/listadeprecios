#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'src/data/entregaya_fallback.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.status;
  } catch (err) {
    return 'ERR';
  }
}

(async () => {
  console.log('Comprobando imágenes del fallback...');
  for (const p of data) {
    const img = p.imagen || p.image || p.foto || '';
    if (!img) {
      console.log(`${p.codigo} - ${p.descripcion} -> sin imagen`);
      continue;
    }
    const status = await checkUrl(img);
    console.log(`${p.codigo} - ${p.descripcion} -> ${img} -> ${status}`);
  }
})();
