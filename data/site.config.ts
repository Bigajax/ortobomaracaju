/**
 * Dados fixos do negócio. O que a dona da loja edita no dia a dia
 * (aviso do topo, frase do hero, endereço, horário, WhatsApp) vive na
 * tabela `config` e é editável em /painel/config — não aqui.
 */

/**
 * Endereço público do site — descoberto sozinho, sem precisar configurar
 * nada. Na Vercel ele cai no domínio do próprio projeto; em casa, em
 * localhost. Só vale a pena definir NEXT_PUBLIC_SITE_URL quando a loja
 * tiver domínio próprio.
 *
 * Uma variável de ambiente pode existir e estar VAZIA — e aí `??` não
 * salva, porque `""` não é `null`. Era isso que derrubava o build na
 * Vercel com `TypeError: Invalid URL, input: ''`. Aqui todo valor passa
 * por trim, só entra se tiver conteúdo, e ganha protocolo se vier sem.
 *
 * As variantes NEXT_PUBLIC_ valem também no bundle do navegador; as sem
 * prefixo só no servidor, e existem sempre na Vercel — por isso as duas
 * versões estão na fila.
 */
function resolverUrl(): string {
  const candidatos = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
    process.env.VERCEL_URL,
  ];

  for (const bruto of candidatos) {
    const valor = bruto?.trim();
    if (!valor) continue;
    const comProtocolo = /^https?:\/\//i.test(valor) ? valor : `https://${valor}`;
    try {
      return new URL(comProtocolo).origin;
    } catch {
      // valor malformado: tenta o próximo em vez de derrubar o build
    }
  }

  return "http://localhost:3000";
}

export const site = {
  nome: "Ortobom Aracaju",
  marca: "Ortobom",
  posicionamento: "Colchões, bases, cabeceiras e travesseiros Ortobom em Aracaju",
  cidade: "Aracaju | SE",
  /* o número da loja: todo botão de WhatsApp da vitrine cai aqui */
  whatsapp: "5579991604707",
  /* a loja ainda não passou o @ dela */
  instagram: "",
  url: resolverUrl(),
  endereco: "Av. Pres. Tancredo Neves, 746, Grageru, Aracaju - SE, 49040-500",
  maps: "https://www.google.com/maps/search/?api=1&query=Ortobom+Av.+Pres.+Tancredo+Neves%2C+746+-+Grageru%2C+Aracaju+-+SE%2C+49040-500",
} as const;

/**
 * MODO PRÉVIA. Quando é uma amostra, todo botão de WhatsApp aponta para o
 * estúdio com uma mensagem fixa. A Ortobom Aracaju nasce sem prévia: o
 * Rafael pediu o WhatsApp direto na loja.
 */
export const PREVIA: { whatsapp: string; mensagem: string } | null = null;

/** Valores iniciais da tabela config. Sobrescritos pelo banco (ou por data/config.json) quando existirem. */
export const configPadrao: Record<string, string> = {
  whatsapp: site.whatsapp,
  instagram: site.instagram,
  cidade: site.cidade,
  /* frases separadas por "|": o cabeçalho reveza uma de cada vez */
  aviso_topo: "Loja Ortobom em Aracaju: Av. Pres. Tancredo Neves, 746, Grageru | Pedido e orçamento pelo WhatsApp | Retirada na loja ou entrega combinada em Aracaju | Colchões, bases, cabeceiras e travesseiros",
  frase_hero: "Seu próximo colchão está aqui, em Aracaju.",
  endereco: site.endereco,
  /* a loja ainda não passou o horário: fica vazio até vir */
  horario: "",
};
