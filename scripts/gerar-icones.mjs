/**
 * Gera o favicon e a imagem de compartilhamento a partir da logo da
 * Ortobom (o PNG branco do site da marca) sobre o azul 900:
 *   app/icon.png (512) e app/apple-icon.png (180): o "O" da logo não
 *   existe solto, então o ícone é a logo inteira centrada, que em 32px
 *   ainda se lê como a marca.
 *   public/og/site.jpg (1200x630): logo + "Aracaju" + a linha da loja,
 *   o que aparece quando alguém manda o link no WhatsApp.
 *
 *   node scripts/gerar-icones.mjs
 */
import sharp from "sharp";

const AZUL = "#243656";
const LARANJA = "#fb8c00";

async function icone(tamanho, destino) {
  const largura = Math.round(tamanho * 0.84);
  const logo = await sharp("public/marca/ortobom-branco.png").resize({ width: largura }).toBuffer();
  await sharp({ create: { width: tamanho, height: tamanho, channels: 4, background: AZUL } })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(destino);
  console.log(destino, tamanho);
}

async function og() {
  const L = 1200, A = 630;
  const logo = await sharp("public/marca/ortobom-branco.png").resize({ width: 680 }).toBuffer();
  const texto = Buffer.from(`<svg width="${L}" height="${A}">
    <style>text{font-family:"DM Sans","Segoe UI",Arial,sans-serif}</style>
    <rect x="260" y="378" width="680" height="3" fill="${LARANJA}"/>
    <text x="600" y="440" text-anchor="middle" font-size="44" font-weight="700" fill="#ffffff" letter-spacing="6">ARACAJU</text>
    <text x="600" y="492" text-anchor="middle" font-size="24" font-weight="500" fill="#9cb6dd">Colchões, bases, cabeceiras e travesseiros · pedido pelo WhatsApp</text>
  </svg>`);
  await sharp({ create: { width: L, height: A, channels: 3, background: AZUL } })
    .composite([{ input: logo, left: Math.round((L - 680) / 2), top: 220 }, { input: texto, left: 0, top: 0 }])
    .jpeg({ quality: 92 })
    .toFile("public/og/site.jpg");
  console.log("public/og/site.jpg", L, A);
}

await icone(512, "app/icon.png");
await icone(180, "app/apple-icon.png");
await og();
