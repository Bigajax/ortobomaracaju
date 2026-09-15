# Ortobom Aracaju — vitrine digital

Vitrine da loja franqueada Ortobom de Aracaju (Av. Pres. Tancredo Neves, 746, Grageru), no molde do ortobom.com.br, com pedido pelo WhatsApp da loja (79 99160-4707). Next 15 + Tailwind v4, catálogo em `data/catalogo.json`, painel em `/painel` (senha local `ortobom`).

## Rodar

```
npm install
npx next dev -p 3040
```

## Catálogo

Os produtos e as fotos vêm do site da marca, colhidos por `node scripts/colher-ortobom.mjs` (ver o cabeçalho do script: o site só responde depois do cookie de cidade). `data/destaques.json` diz quais slugs são estrelas. `--sem-fotos` regrava só o JSON; `--so colchoes` limita a uma categoria. Os elementos de marca (logo, tiles, selos) vêm de `node scripts/colher-marca.mjs`; favicon e imagem de compartilhamento de `node scripts/gerar-icones.mjs`.

Sem preço por decisão: o card diz "Consulte o valor no WhatsApp" até a loja passar a tabela (`--com-precos` importa o preço online como referência).
