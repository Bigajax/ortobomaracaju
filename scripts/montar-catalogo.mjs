/**
 * MONTAR CATÁLOGO — das fotos que o cliente mandou ao data/ da vitrine
 *
 * A Picorelli não tem Instagram de loja para a oficina colher: o material
 * chegou pelo WhatsApp, numa pasta. Este script lê `data/fonte.json`
 * (escrito à mão olhando as fotos: cada item aponta o número da foto na
 * pasta, em ordem alfabética, mais nome, categoria, marca, cor, preço e
 * as fotos extras) e escreve o que a base lê: `data/catalogo.json` e
 * `public/produtos/{slug}.webp`, com o blur que o <Image> usa.
 *
 * Rodar de novo quando chegar foto nova: só a fonte muda.
 *
 *   node scripts/montar-catalogo.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const fonte = JSON.parse(fs.readFileSync("data/fonte.json", "utf8"));
const arquivos = fs
  .readdirSync(fonte.origem)
  .filter((f) => /\.jpe?g$/i.test(f))
  .sort();

const pasta = path.join("public", "produtos");
fs.mkdirSync(pasta, { recursive: true });

const slugDe = (t) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

async function foto(numero, slug, sufixo = "") {
  const origem = path.join(fonte.origem, arquivos[numero]);
  const nome = `${slug}${sufixo}.webp`;
  const alvo = path.join(pasta, nome);
  const buf = await sharp(origem)
    .rotate()
    .resize({ width: 1200, height: 1500, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  fs.writeFileSync(alvo, buf);
  const meta = await sharp(buf).metadata();
  const blur = `data:image/webp;base64,${(await sharp(buf).resize(12, 12, { fit: "inside" }).webp({ quality: 40 }).toBuffer()).toString("base64")}`;
  return { url: `/produtos/${nome}`, largura: meta.width ?? 0, altura: meta.height ?? 0, blur };
}

const usados = new Set();
const produtos = [];
let estrela = 0;
for (const item of fonte.itens) {
  let slug = slugDe(item.nome);
  let n = 1;
  while (usados.has(slug)) slug = `${slugDe(item.nome)}-${++n}`;
  usados.add(slug);

  const capa = await foto(item.foto, slug);
  const imagens = [{ ...capa, alt: item.nome, ordem: 0 }];
  for (const [i, extra] of (item.extras ?? []).entries()) {
    imagens.push({ ...(await foto(extra, slug, `-${i + 2}`)), alt: item.nome, ordem: i + 1 });
  }

  produtos.push({
    id: `p-${String(produtos.length + 1).padStart(3, "0")}`,
    codigo: `PP-${String(produtos.length + 1).padStart(4, "0")}`,
    nome: item.nome,
    slug,
    descricao: item.descricao ?? null,
    marca: item.marca ?? null,
    preco: item.preco ?? null,
    /* o "De" da arte entra como preço cheio e o "Por" como promocional:
       é assim que a base risca o antigo e mostra o vigente */
    preco_promocional: null,
    categoria_slug: slugDe(item.categoria),
    tamanhos: item.tamanhos ?? [],
    cores: item.cor ? [item.cor] : [],
    destaque: Boolean(item.destaque),
    ativo: true,
    ordem: item.destaque ? ++estrela : 100 + produtos.length,
    imagens,
    ...(item.preco_de ? { preco: item.preco_de, preco_promocional: item.preco } : {}),
  });
  if (produtos.length % 10 === 0) console.log(`  ${produtos.length} peças...`);
}

const categorias = fonte.categorias.map((nome, i) => {
  const slug = slugDe(nome);
  const dentro = produtos.filter((p) => p.categoria_slug === slug).sort((a, b) => a.ordem - b.ordem);
  const capa = dentro[0]?.imagens[0];
  return { id: `c-${slug}`, nome, slug, ordem: i + 1, ativo: true, capa: capa?.url ?? null, capaBlur: capa?.blur ?? null };
});

const hero = produtos
  .filter((p) => p.destaque)
  .sort((a, b) => a.ordem - b.ordem)
  .map((p) => ({ ...p.imagens[0], slug: p.slug }));

fs.writeFileSync("data/catalogo.json", `${JSON.stringify({ categorias, produtos, hero }, null, 2)}\n`);
console.log(`${produtos.length} peças, ${categorias.length} categorias, ${hero.length} estrelas → data/catalogo.json`);
