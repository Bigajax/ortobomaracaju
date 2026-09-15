import { PREVIA, site } from "@/data/site.config";
import type { Produto } from "./tipos";

function numero(whatsapp?: string) {
  return (whatsapp ?? site.whatsapp).replace(/\D/g, "");
}

export function linkWhatsApp(texto: string, whatsapp?: string): string {
  /* na prévia, o destino e a mensagem são fixos: ver PREVIA em site.config */
  if (PREVIA) return `https://wa.me/${PREVIA.whatsapp}?text=${encodeURIComponent(PREVIA.mensagem)}`;
  return `https://wa.me/${numero(whatsapp)}?text=${encodeURIComponent(texto)}`;
}

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export type Pedido = {
  whatsapp?: string;
  base?: string;
  tamanho?: string;
  cor?: string;
  quantidade?: number;
  observacao?: string;
  preco?: number | null;
};

/**
 * CTA de produto: a mensagem chega estruturada, uma linha por coisa, para
 * quem atende não precisar perguntar o básico. O que a pessoa não
 * preencheu não aparece; nada vira "undefined".
 */
export function linkPeca(produto: Pick<Produto, "codigo" | "nome" | "slug">, opcoes: Pedido = {}): string {
  const base = opcoes.base ?? site.url;
  const url = `${base.replace(/\/$/, "")}/produto/${produto.slug}`;
  const quantidade = opcoes.quantidade && opcoes.quantidade > 0 ? opcoes.quantidade : 1;
  const preco = opcoes.preco ?? null;

  const linhas = [
    "Oi! Vi no site da Ortobom Aracaju e quero este produto:",
    `• ${produto.nome}`,
    `• Quantidade: ${quantidade}`,
    opcoes.tamanho ? `• Tamanho: ${opcoes.tamanho}` : null,
    opcoes.cor ? `• Cor: ${opcoes.cor}` : null,
    opcoes.observacao?.trim() ? `• Obs.: ${opcoes.observacao.trim()}` : null,
    preco !== null
      ? `• Preço no site: ${BRL.format(preco)}${quantidade > 1 ? ` (total ${BRL.format(preco * quantidade)})` : ""}`
      : null,
    "Tem disponível? Qual o valor e o prazo de entrega?",
    url,
  ].filter(Boolean);

  return linkWhatsApp(linhas.join("\n"), opcoes.whatsapp);
}

/** CTA de atendimento: a consulta se agenda, não se compra. */
export function linkAgendar(nome: string, whatsapp?: string): string {
  return linkWhatsApp(`Oi! Vi no site e queria agendar: ${nome}. Como funciona?`, whatsapp);
}

export function linkGeral(whatsapp?: string): string {
  return linkWhatsApp("Oi! Vim pelo site da Ortobom Aracaju e quero um orçamento.", whatsapp);
}
