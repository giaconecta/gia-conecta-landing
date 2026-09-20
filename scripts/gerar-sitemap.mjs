import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, '..');
const baseUrl = 'https://gia-conecta-landing.vercel.app';
const pages = JSON.parse(fs.readFileSync(path.join(siteDir, 'seo-pages.json'), 'utf8'));

for (const page of pages) {
  if (!fs.existsSync(path.join(siteDir, page.file))) {
    throw new Error(`Arquivo público ausente: ${page.file}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(page.lastmod)) {
    throw new Error(`Data lastmod inválida em ${page.file}: ${page.lastmod}`);
  }
}

const urls = pages.map((page) => [
  '  <url>',
  `    <loc>${baseUrl}${page.path}</loc>`,
  `    <lastmod>${page.lastmod}</lastmod>`,
  '  </url>'
].join('\n')).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
fs.writeFileSync(path.join(siteDir, 'sitemap.xml'), sitemap, 'utf8');
console.log(`Sitemap gerado com ${pages.length} páginas.`);
