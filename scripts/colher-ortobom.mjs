/**
 * Colhe o catálogo da Ortobom (ortobom.com.br) para a vitrine da loja de
 * Aracaju: nomes, tamanhos, descrições, especificações e as fotos
 * oficiais. Escreve data/catalogo.json e public/produtos/*.webp.
 *
 * Como o site funciona (descoberto em 15/09/2026):
 *   - É ASP.NET próprio, sem API JSON. Os produtos só aparecem depois de
 *     um cookie de cidade: GET /Content/SetMinhaLocalizacao?CidadeId=8770
 *     (Aracaju; o id vem de /Content/GetCidades?siglaUF=SE).
 *   - A lista de cada categoria é um parcial HTML:
 *     /Produto/_ProductsByFilter?NewLayout=True&Exibir<Categoria>=true&...
 *     Cada card traz data-produto-id, -nome, -variant, -url e o carrossel
 *     de fotos. Um mesmo modelo aparece uma vez por tamanho: agrupamos
 *     pelo slug da URL (/p/colchao/<slug>/<tamanho>).
 *   - Os tamanhos de um modelo vêm de /Produto/_Preco/<id> (.sizeOpts).
 *   - Descrição e ficha técnica vêm da página /p/... (#descricaoResumida,
 *     .product-details-text e #product-full-specs).
 *   - Fotos: https://cdn.ortobom.com.br/file/<guid>/<nome>, sem parâmetros
 *     (o ?w= do site devolve 500).
 *   - Preços existem no site, mas a franquia não os pratica: ficam de fora
 *     por padrão. --com-precos grava o menor preço do modelo como
 *     referência.
 *
 *   node scripts/colher-ortobom.mjs               (as 4 categorias)
 *   node scripts/colher-ortobom.mjs --so colchoes  (uma só)
 *   node scripts/colher-ortobom.mjs --sem-fotos    (só o JSON, rápido)
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SITE = "https://www.ortobom.com.br";
const CIDADE_ARACAJU = 8770;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const FONTE = "_fonte/ortobom";
const SAIDA = "public/produtos";

/* as categorias da vitrine, na ordem, e o parâmetro que lista cada uma no site */
const CATEGORIAS = [
  { slug: "colchoes", nome: "Colchões", filtro: "ExibirColchoes", pasta: "colchao" },
  { slug: "travesseiros", nome: "Travesseiros", filtro: "ExibirTrav", pasta: "travesseiro" },
  { slug: "bases", nome: "Bases", filtro: "ExibirCamas", pasta: "cama" },
  { slug: "cabeceiras", nome: "Cabeceiras", filtro: "ExibirCabeceiras", pasta: "cabeceira" },
];

const args = process.argv.slice(2);
const so = args.includes("--so") ? args[args.indexOf("--so") + 1] : null;
const comPrecos = args.includes("--com-precos");
const semFotos = args.includes("--sem-fotos");

/* ——— http com o cookie da cidade ——— */
const jar = new Map();
function cookies() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}
async function pegar(url, tipo = "text") {
  const r = await fetch(url, { headers: { "User-Agent": UA, Cookie: cookies(), Accept: "*/*" } });
  for (const linha of r.headers.getSetCookie?.() ?? []) {
    const [par] = linha.split(";");
    const i = par.indexOf("=");
    jar.set(par.slice(0, i).trim(), par.slice(i + 1).trim());
  }
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return tipo === "buffer" ? Buffer.from(await r.arrayBuffer()) : r.text();
}

const decodificar = (t) =>
  String(t ?? "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const semTags = (t) => decodificar(String(t ?? "").replace(/<[^>]+>/g, " "));
const slugDe = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);
/* bases e cabeceiras repetem o nome por cor: a cor mora no rabo do slug, em inglês */
const CORES = { black: "Preto", preto: "Preto", white: "Branco", branco: "Branco", gray: "Cinza", grey: "Cinza", cinza: "Cinza", brown: "Marrom", marrom: "Marrom", cream: "Creme", creme: "Creme", beige: "Bege", bege: "Bege", blue: "Azul", azul: "Azul" };
function corDoSlug(slug) {
  for (const parte of slug.split("-").reverse()) if (CORES[parte]) return CORES[parte];
  return null;
}
function nomeComCor(nome, slug) {
  const cor = corDoSlug(slug);
  if (!cor) return { nome, cores: [] };
  const semCorIngles = nome.replace(new RegExp(`\\s+(${Object.keys(CORES).join("|")})\\s*$`, "i"), "").trim();
  return { nome: `${semCorIngles} ${cor}`, cores: [cor] };
}
/* "Colchão Pró Saúde Nanolastic" vem em caixa mista, mas alguns itens vêm em CAIXA ALTA */
const nomeBonito = (n) => (n === n.toUpperCase() ? n.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()) : n);

/* ——— 1. cards da categoria ——— */
async function cards(cat) {
  const html = await pegar(`${SITE}/Produto/_ProductsByFilter?NewLayout=True&${cat.filtro}=true&PrecoMin=0&PrecoMax=40000&comKits=false&take=400`);
  const blocos = html.split('class="product-card-wrapper').slice(1);
  const lista = [];
  for (const b of blocos) {
    const attr = (k) => decodificar(b.match(new RegExp(`data-produto-${k}="([^"]*)"`))?.[1]);
    const url = attr("url");
    if (!url) continue;
    const partes = url.split("/"); // ["", "p", "colchao", "slug", "tamanho"]
    if (partes[2] !== cat.pasta) continue; // o filtro de travesseiros devolve outras coisas junto
    const fotos = [...b.matchAll(/https:\/\/cdn\.ortobom\.com\.br\/file\/[^"'&?\s]+/g)].map((m) => m[0]);
    lista.push({
      id: attr("id"),
      nome: nomeBonito(attr("nome")),
      variante: attr("variant"),
      preco: Number(attr("preco")) || null,
      url,
      slug: slugDe(partes[3]) /* o site tem "colchao-orion" e "colchao-orion-": é o mesmo modelo */,
      fotos: [...new Set(fotos)],
    });
  }
  return lista;
}

/* ——— 2. tamanhos do modelo ——— */
async function tamanhos(id) {
  try {
    const html = await pegar(`${SITE}/Produto/_Preco/${id}?concept=false&mostrandoSobMedida=`);
    const lista = [];
    /* o <p> tem que vir logo depois da abertura do .sizeOpts: sem isso o regex pula para
       qualquer parágrafo da página quando o modelo não tem tamanhos (travesseiros) */
    for (const m of html.matchAll(/<div class="sizeOpts[^"]*"[^>]*>\s*<p[^>]*>([^<]+)<\/p>\s*(?:<small[^>]*>([^<]+)<\/small>)?/g)) {
      const nome = semTags(m[1]);
      if (/sob medida/i.test(nome)) continue;
      const medida = semTags(m[2] ?? "");
      lista.push(medida ? `${nome} (${medida})` : nome);
    }
    return lista;
  } catch {
    return [];
  }
}

/* ——— 3. descrição e ficha da página do produto ——— */
async function detalhes(url) {
  try {
    const html = await pegar(`${SITE}${url}`);
    const resumo = semTags(html.match(/id="descricaoResumida"[^>]*>([\s\S]*?)<\/div>/)?.[1]);
    const paragrafos = [...html.matchAll(/<p class="product-details-text">([\s\S]*?)<\/p>/g)].map((m) => semTags(m[1])).filter(Boolean);
    const atributos = [];
    const ficha = html.match(/id="product-full-specs"[\s\S]*?<\/section>/)?.[0] ?? "";
    for (const m of ficha.matchAll(/<span class="key">([\s\S]*?)<\/span>\s*<span class="value">([\s\S]*?)<\/span>/g)) {
      const chave = semTags(m[1]);
      const valor = semTags(m[2]);
      if (!chave || !valor || /cuidado|composi/i.test(chave)) continue; // longos demais para a ficha
      atributos.push({ chave, valor });
    }
    return { resumo, paragrafos, atributos };
  } catch {
    return { resumo: "", paragrafos: [], atributos: [] };
  }
}

/* ——— 4. fotos: original guardado fora do repo, webp com blur no public ——— */
async function foto(urlOrigem, nomeBase) {
  const ext = (urlOrigem.match(/\.(jpe?g|png|webp)/i)?.[1] ?? "jpg").toLowerCase();
  const origem = path.join(FONTE, `${nomeBase}.${ext}`);
  let buf;
  try {
    buf = await fs.readFile(origem);
  } catch {
    buf = await pegar(urlOrigem, "buffer");
    await fs.writeFile(origem, buf);
  }
  const destino = path.join(SAIDA, `${nomeBase}.webp`);
  const img = sharp(buf).rotate().flatten({ background: "#ffffff" });
  const info = await img.clone().resize({ width: 1200, height: 1500, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toFile(destino);
  const blur = await sharp(buf).resize(12, 12, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  return { url: `/produtos/${nomeBase}.webp`, largura: info.width, altura: info.height, blur: `data:image/webp;base64,${blur.toString("base64")}` };
}

async function emLotes(itens, tamanho, fn) {
  const saida = [];
  for (let i = 0; i < itens.length; i += tamanho) {
    saida.push(...(await Promise.all(itens.slice(i, i + tamanho).map(fn))));
    process.stdout.write(`  ${Math.min(i + tamanho, itens.length)}/${itens.length}\r`);
  }
  process.stdout.write("\n");
  return saida;
}

/* ——— o trabalho ——— */
await fs.mkdir(FONTE, { recursive: true });
await fs.mkdir(SAIDA, { recursive: true });

await pegar(`${SITE}/`);
const loc = JSON.parse(await pegar(`${SITE}/Content/SetMinhaLocalizacao?CidadeId=${CIDADE_ARACAJU}`));
console.log(`cidade: Aracaju (${loc.lojaonline})`);

let destaques = [];
try {
  destaques = JSON.parse(await fs.readFile("data/destaques.json", "utf8"));
} catch {}

const produtos = [];
const categorias = [];
let n = 0;

for (const cat of CATEGORIAS) {
  if (so && cat.slug !== so) continue;
  const lista = await cards(cat);
  /* um modelo por slug; o card de cada tamanho vira um tamanho */
  const porSlug = new Map();
  for (const c of lista) {
    const g = porSlug.get(c.slug) ?? { ...c, precos: [] };
    if (c.preco) g.precos.push(c.preco);
    if (!g.fotos.length && c.fotos.length) g.fotos = c.fotos;
    porSlug.set(c.slug, g);
  }
  const modelos = [...porSlug.values()];
  console.log(`${cat.nome}: ${lista.length} cards, ${modelos.length} modelos`);

  const enriquecidos = await emLotes(modelos, 4, async (m) => ({
    ...m,
    tamanhos: await tamanhos(m.id),
    ...(await detalhes(m.url)),
  }));

  for (const m of enriquecidos) {
    n += 1;
    const slug = m.slug;
    const { nome, cores } = cat.slug === "colchoes" || cat.slug === "travesseiros" ? { nome: m.nome, cores: [] } : nomeComCor(m.nome, slug);
    const imagens = [];
    if (!semFotos) {
      const urls = m.fotos.slice(0, 6);
      for (let i = 0; i < urls.length; i++) {
        try {
          const f = await foto(urls[i], i === 0 ? slug : `${slug}-${i + 1}`);
          imagens.push({ ...f, alt: `${m.nome}, foto ${i + 1}`, ordem: i });
        } catch (e) {
          console.warn(`  foto falhou ${slug} #${i + 1}: ${e.message}`);
        }
      }
    }
    const descricao = [m.resumo, ...m.paragrafos.filter((p) => p !== m.resumo)].filter(Boolean).join("\n\n") || null;
    produtos.push({
      id: `p-${String(n).padStart(3, "0")}`,
      codigo: `OB-${String(n).padStart(4, "0")}`,
      nome,
      slug,
      descricao,
      marca: "Ortobom",
      preco: comPrecos && m.precos.length ? Math.min(...m.precos) : null,
      preco_promocional: null,
      categoria_slug: cat.slug,
      tamanhos: m.tamanhos,
      cores,
      atributos: m.atributos.filter((a) => !/^tamanho$/i.test(a.chave)),
      origem: `${SITE}${m.url}`,
      destaque: destaques.includes(slug),
      ativo: true,
      ordem: destaques.includes(slug) ? destaques.indexOf(slug) + 1 : 100 + n,
      imagens,
    });
    process.stdout.write(`  ${nome} · ${m.tamanhos.length} tamanhos · ${imagens.length} fotos\n`);
  }

  categorias.push({ id: `c-${cat.slug}`, nome: cat.nome, slug: cat.slug, ordem: categorias.length + 1, ativo: true });
}

/* capa de cada categoria: a primeira peça dela (destaque primeiro) */
for (const c of categorias) {
  const primeira = produtos.filter((p) => p.categoria_slug === c.slug).sort((a, b) => a.ordem - b.ordem)[0];
  c.capa = primeira?.imagens[0]?.url ?? null;
  c.capaBlur = primeira?.imagens[0]?.blur ?? null;
}

const hero = produtos
  .filter((p) => p.destaque && p.imagens[0])
  .sort((a, b) => a.ordem - b.ordem)
  .map((p) => ({ ...p.imagens[0], slug: p.slug }));

/* com --so, preserva as outras categorias do JSON anterior */
let anterior = { categorias: [], produtos: [] };
if (so) {
  try {
    anterior = JSON.parse(await fs.readFile("data/catalogo.json", "utf8"));
  } catch {}
}
const catalogo = so
  ? {
      categorias: [...anterior.categorias.filter((c) => c.slug !== so), ...categorias].sort((a, b) => a.ordem - b.ordem),
      produtos: [...anterior.produtos.filter((p) => p.categoria_slug !== so), ...produtos],
      hero,
    }
  : { categorias, produtos, hero };

await fs.writeFile("data/catalogo.json", `${JSON.stringify(catalogo, null, 2)}\n`);
console.log(`\ncatalogo.json: ${catalogo.produtos.length} produtos, ${catalogo.categorias.length} categorias, ${hero.length} estrelas`);
