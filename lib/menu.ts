import type { Produto } from "./tipos";
import { nomeDoTamanho, compararTamanhos } from "./filtro";

/**
 * O menu das portas, montado do catálogo: cada porta do cabeçalho abre
 * uma aba ao passar o mouse, e o que está na aba vem das peças (os
 * tipos de colchão lidos da ficha, os tamanhos que existem, os
 * revestimentos das bases). Assim a aba nunca promete o que a vitrine
 * não tem.
 */
export type NomeIconeMenu = "colchao" | "travesseiro" | "base" | "cabeceira" | "loja" | "etiqueta" | "regua" | "estrela";

export type ItemMenu = {
  nome: string;
  href: string;
  icone?: NomeIconeMenu;
  nota?: string;
  externa?: boolean;
};

export type Aba = {
  chave: string;
  nome: string;
  href: string;
  icone: NomeIconeMenu;
  externa?: boolean;
  titulo?: string;
  itens: ItemMenu[];
  colunas: 1 | 2 | 3 | 4;
};

const atributo = (p: Produto, chave: RegExp) => p.atributos?.find((a) => chave.test(a.chave))?.valor ?? null;

/* conta os valores de um atributo dentro de uma categoria */
function contar(produtos: Produto[], categoria: string, chave: RegExp, limite = 8) {
  const contagem = new Map<string, number>();
  for (const p of produtos) {
    if (p.categoria_slug !== categoria) continue;
    const v = atributo(p, chave);
    if (v) contagem.set(v, (contagem.get(v) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
    .slice(0, limite)
    .map(([nome, total]) => ({ nome, total }));
}

function tamanhosDe(produtos: Produto[], categoria: string) {
  return [...new Set(produtos.filter((p) => p.categoria_slug === categoria).flatMap((p) => p.tamanhos.map(nomeDoTamanho)))].sort(compararTamanhos);
}

export function montarMenu(produtos: Produto[], linkWhats: string): Aba[] {
  const ativos = produtos.filter((p) => p.ativo);
  const conta = (slug: string) => ativos.filter((p) => p.categoria_slug === slug).length;
  const busca = (cat: string, termo: string) => `/catalogo/${cat}?busca=${encodeURIComponent(termo)}`;
  const tamanho = (cat: string, t: string) => `/catalogo/${cat}?tamanho=${encodeURIComponent(t)}`;

  const tiposColchao = contar(ativos, "colchoes", /^tipo de colch/i, 4);
  const molas = contar(ativos, "colchoes", /^tipos? de mola/i, 4);
  const conforto = contar(ativos, "colchoes", /conforto/i, 3);
  const tamanhosColchao = tamanhosDe(ativos, "colchoes").filter((t) => !/baby|berço|berco|infantil/i.test(t));
  const revestimentos = contar(ativos, "bases", /revestimento/i, 5);
  const estilosBase = contar(ativos, "bases", /^estilo$/i, 3);
  const revCabeceira = contar(ativos, "cabeceiras", /revestimento/i, 5);
  const materialTrav = contar(ativos, "travesseiros", /material/i, 5);

  return [
    {
      chave: "colchoes",
      nome: "Colchões",
      href: "/catalogo/colchoes",
      icone: "colchao",
      titulo: `${conta("colchoes")} modelos`,
      colunas: 3,
      itens: [
        ...tamanhosColchao.map((t) => ({ nome: t, href: tamanho("colchoes", t), icone: "regua" as const })),
        ...tiposColchao.map((t) => ({ nome: t.nome, href: busca("colchoes", t.nome), nota: `${t.total}` })),
        ...molas.map((t) => ({ nome: `Molas ${t.nome}`, href: busca("colchoes", t.nome), nota: `${t.total}` })),
        ...conforto.map((t) => ({ nome: `Conforto ${t.nome.toLowerCase()}`, href: busca("colchoes", t.nome), nota: `${t.total}` })),
        { nome: "Todos os colchões", href: "/catalogo/colchoes", icone: "colchao" as const },
      ],
    },
    {
      chave: "bases",
      nome: "Bases",
      href: "/catalogo/bases",
      icone: "base",
      titulo: `${conta("bases")} opções, para cada tamanho de colchão`,
      colunas: 2,
      itens: [
        ...estilosBase.map((t) => ({ nome: `Base ${t.nome.toLowerCase()}`, href: busca("bases", t.nome), nota: `${t.total}` })),
        ...revestimentos.map((t) => ({ nome: t.nome, href: busca("bases", t.nome), nota: `${t.total}` })),
        { nome: "Todas as bases", href: "/catalogo/bases", icone: "base" as const },
      ],
    },
    {
      chave: "cabeceiras",
      nome: "Cabeceiras",
      href: "/catalogo/cabeceiras",
      icone: "cabeceira",
      titulo: `${conta("cabeceiras")} opções`,
      colunas: 2,
      itens: [
        ...revCabeceira.map((t) => ({ nome: t.nome, href: busca("cabeceiras", t.nome), nota: `${t.total}` })),
        { nome: "Todas as cabeceiras", href: "/catalogo/cabeceiras", icone: "cabeceira" as const },
      ],
    },
    {
      chave: "travesseiros",
      nome: "Travesseiros",
      href: "/catalogo/travesseiros",
      icone: "travesseiro",
      titulo: `${conta("travesseiros")} modelos`,
      colunas: 2,
      itens: [
        ...materialTrav.map((t) => ({ nome: t.nome, href: busca("travesseiros", t.nome), nota: `${t.total}` })),
        { nome: "Todos os travesseiros", href: "/catalogo/travesseiros", icone: "travesseiro" as const },
      ],
    },
    {
      chave: "destaques",
      nome: "Destaques",
      href: "/catalogo",
      icone: "estrela",
      colunas: 1,
      itens: [
        { nome: "Os mais procurados", href: "/#destaques", icone: "estrela", nota: "a seleção da loja" },
        { nome: "Qual colchão é o seu?", href: "/#escolha", icone: "colchao", nota: "por conforto e tamanho" },
        { nome: "Catálogo completo", href: "/catalogo", icone: "etiqueta", nota: `${ativos.length} produtos` },
      ],
    },
    {
      chave: "loja",
      nome: "A loja",
      href: "/#loja",
      icone: "loja",
      colunas: 1,
      itens: [
        { nome: "Endereço e como chegar", href: "/#loja", icone: "loja", nota: "Av. Tancredo Neves, 746, Grageru" },
        { nome: "Falar no WhatsApp", href: linkWhats, icone: "etiqueta", nota: "pedido e orçamento", externa: true },
      ],
    },
  ];
}
