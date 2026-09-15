/**
 * Baixa os elementos de marca do ortobom.com.br que a vitrine reaproveita:
 * a logo, os tiles de categoria, os banners de categoria, os "round
 * banners" e os selos de certificação. Tudo cai em public/marca e
 * public/banners, já como webp quando é foto.
 *
 *   node scripts/colher-marca.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const SITE = "https://www.ortobom.com.br";
const CDN = "https://cdn.ortobom.com.br/file";

const ITENS = [
  /* logo: PNG branco com alfa; guardado como está */
  { url: `${SITE}/Content/V3/img/Ortobom_branco.png`, destino: "public/marca/ortobom-branco.png", crua: true },
  { url: `${SITE}/Content/images/ortobom-logo-slogan.png`, destino: "public/marca/ortobom-slogan.png", crua: true },
  /* tiles de categoria da home da marca */
  ...["colchoes", "bases", "cabeceiras", "travesseiros", "acessorios", "moveis"].map((c) => ({ url: `${SITE}/Content/Ortobom/img/categorias/cat-${c}.png`, destino: `public/marca/cat-${c}.png`, crua: true })),
  /* banners de categoria (desktop e celular) */
  { url: `${CDN}/d31d348b-6c9d-4c69-94d5-cfe6f6a4b42e/DESK%20COLCH%C3%95ES.jpg`, destino: "public/banners/colchoes-desktop.webp" },
  { url: `${CDN}/3653c2f4-1019-4475-92ae-7fff323b1521/MOB%20COLCH%C3%95ES.jpg`, destino: "public/banners/colchoes-celular.webp" },
  { url: `${CDN}/250bd7dc-de76-4c95-bf9a-f4a4d71b8d2d/DESK%20TRAVESSEIROS.jpg`, destino: "public/banners/travesseiros-desktop.webp" },
  { url: `${CDN}/5165c7ab-8ea4-48d7-b2c6-129ef0bde8be/MOB%20TRAVESSEIROS.jpg`, destino: "public/banners/travesseiros-celular.webp" },
  /* fotos ambientadas das bases (usadas no banner de bases) */
  { url: `${CDN}/0a35e586-db67-4ac3-a240-1ed6f712e360/base_sommier_cori_brown_ambientada_grande.png`, destino: "public/banners/bases-desktop.webp" },
  /* round banners e selos */
  ...[1, 2, 3, 4, 5].map((n) => ({ url: `${SITE}/Content/Ortobom/img/round-banner-${n}.webp`, destino: `public/marca/round-${n}.webp`, crua: true })),
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ url: `${SITE}/Content/Ortobom/img/certificacoes/cert-${n}.webp`, destino: `public/marca/cert-${n}.webp`, crua: true })),
];

for (const item of ITENS) {
  try {
    const r = await fetch(item.url, { headers: { "User-Agent": UA } });
    if (!r.ok) throw new Error(String(r.status));
    const buf = Buffer.from(await r.arrayBuffer());
    await fs.mkdir(path.dirname(item.destino), { recursive: true });
    if (item.crua) await fs.writeFile(item.destino, buf);
    else await sharp(buf).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 82 }).toFile(item.destino);
    const m = await sharp(item.destino).metadata();
    console.log(`✓ ${item.destino} ${m.width}x${m.height}`);
  } catch (e) {
    console.log(`✗ ${item.destino}: ${e.message}`);
  }
}
