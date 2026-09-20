import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, '..');
const pages = JSON.parse(fs.readFileSync(path.join(siteDir, 'seo-pages.json'), 'utf8'));
const sitemap = fs.readFileSync(path.join(siteDir, 'sitemap.xml'), 'utf8');
const errors = [];

for (const page of pages) {
  const fullPath = path.join(siteDir, page.file);
  if (!fs.existsSync(fullPath)) { errors.push(`${page.file}: arquivo ausente`); continue; }
  const html = fs.readFileSync(fullPath, 'utf8');
  const checks = [
    ['idioma pt-BR', /<html[^>]+lang="pt-BR"/i],
    ['título', /<title>[^<]+<\/title>/i],
    ['descrição', /<meta[^>]+name="description"[^>]+content="[^"]+"/i],
    ['canonical', /<link[^>]+rel="canonical"[^>]+href="https:\/\/gia-conecta-landing\.vercel\.app\//i],
    ['meta robots', /<meta[^>]+name="robots"/i]
  ];
  for (const [label, pattern] of checks) if (!pattern.test(html)) errors.push(`${page.file}: falta ${label}`);
  if (!sitemap.includes(`https://gia-conecta-landing.vercel.app${page.path}`)) errors.push(`${page.file}: ausente do sitemap`);
}

const home = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');
for (const [label, pattern] of [
  ['Open Graph', /property="og:title"/i],
  ['imagem social', /property="og:image"/i],
  ['JSON-LD', /type="application\/ld\+json"/i],
  ['Instagram', /instagram\.com\/gia\.conecta/i],
  ['YouTube', /youtube\.com/i]
]) if (!pattern.test(home)) errors.push(`index.html: falta ${label}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`SEO técnico aprovado em ${pages.length} páginas.`);
