import type { Filtros, Produto } from "./tipos";

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * O nome do tamanho sem a medida: "Casal (25 x 188 x 138 cm)" vira
 * "Casal". A medida muda de modelo para modelo (altura), o nome não;
 * o filtro e as pílulas trabalham com o nome, a ficha mostra a medida.
 */
export function nomeDoTamanho(tamanho: string): string {
  return tamanho.replace(/\s*\(.*\)\s*$/, "").trim();
}
export function medidaDoTamanho(tamanho: string): string | null {
  return tamanho.match(/\(([^)]+)\)/)?.[1] ?? null;
}

/* a ordem natural dos tamanhos de cama, para pílulas e fichas */
const ORDEM_TAMANHOS = ["berço", "berco", "infantil", "baby", "solteiro", "solteiro extra", "solteirão", "solteirao", "viúva", "viuva", "casal", "queen", "king", "super king"];
export function compararTamanhos(a: string, b: string): number {
  const ia = ORDEM_TAMANHOS.indexOf(normalizar(nomeDoTamanho(a)));
  const ib = ORDEM_TAMANHOS.indexOf(normalizar(nomeDoTamanho(b)));
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  return a.localeCompare(b, "pt-BR", { numeric: true });
}

export function precoVigente(p: Produto): number | null {
  return p.preco_promocional ?? p.preco ?? null;
}

export function temDesconto(p: Produto): boolean {
  return (
    p.preco_promocional !== null &&
    p.preco !== null &&
    p.preco_promocional < p.preco
  );
}

/**
 * Filtro e ordenação do catálogo. Roda no servidor e no cliente com o
 * mesmo resultado — o catálogo é pequeno e cabe na memória.
 */
export function filtrar(produtos: Produto[], f: Filtros = {}): Produto[] {
  const busca = f.busca ? normalizar(f.busca).trim() : "";
  const marcas = f.marca?.length ? f.marca.map(normalizar) : null;
  const tamanhos = f.tamanho?.length ? f.tamanho.map(normalizar) : null;

  const lista = produtos.filter((p) => {
    if (!f.incluirInativos && !p.ativo) return false;
    if (f.categoria && p.categoria_slug !== f.categoria) return false;
    if (marcas && !marcas.includes(normalizar(p.marca ?? ""))) return false;
    if (tamanhos && !p.tamanhos.some((t) => tamanhos.includes(normalizar(nomeDoTamanho(t)))))
      return false;

    if (f.atributos) {
      for (const [chave, valores] of Object.entries(f.atributos)) {
        if (!valores.length) continue;
        const quer = valores.map(normalizar);
        const tem = (p.atributos ?? []).some((a) => a.chave === chave && quer.includes(normalizar(a.valor)));
        if (!tem) return false;
      }
    }

    const preco = precoVigente(p);
    if (f.precoMin !== undefined && (preco === null || preco < f.precoMin))
      return false;
    if (f.precoMax !== undefined && (preco === null || preco > f.precoMax))
      return false;

    if (busca) {
      const campos = normalizar(
        [p.nome, p.codigo, p.marca ?? "", p.descricao ?? "", ...p.cores, ...(p.atributos ?? []).map((a) => a.valor), ...p.tamanhos].join(" "),
      );
      if (!busca.split(/\s+/).every((termo) => campos.includes(termo)))
        return false;
    }
    return true;
  });

  const ordem = f.ordem ?? "recentes";
  return [...lista].sort((a, b) => {
    if (ordem === "nome-az") return a.nome.localeCompare(b.nome, "pt-BR");
    if (ordem === "nome-za") return b.nome.localeCompare(a.nome, "pt-BR");
    if (ordem === "menor-preco" || ordem === "maior-preco") {
      const pa = precoVigente(a);
      const pb = precoVigente(b);
      // peças sem preço cadastrado vão para o fim, em qualquer direção
      if (pa === null && pb === null) return a.ordem - b.ordem;
      if (pa === null) return 1;
      if (pb === null) return -1;
      return ordem === "menor-preco" ? pa - pb : pb - pa;
    }
    return a.ordem - b.ordem;
  });
}

export function marcasDisponiveis(produtos: Produto[]): string[] {
  return [...new Set(produtos.map((p) => p.marca).filter(Boolean) as string[])].sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );
}

export function tamanhosDisponiveis(produtos: Produto[]): string[] {
  return [...new Set(produtos.flatMap((p) => p.tamanhos.map(nomeDoTamanho)))].sort(compararTamanhos);
}

export function faixaDePreco(produtos: Produto[]): [number, number] | null {
  const precos = produtos
    .map(precoVigente)
    .filter((v): v is number => v !== null);
  if (!precos.length) return null;
  return [Math.floor(Math.min(...precos)), Math.ceil(Math.max(...precos))];
}

/* as chaves da ficha que viram filtro na lateral do catálogo, nesta ordem */
export const CHAVES_FACETA = ["Nível de Conforto", "Tipo de Colchão", "Tipos de Mola", "Tipo de Espuma", "Tecnologia", "Densidade", "Material", "Estilo", "Revestimento", "Altura dos pés"];

export type Faceta = { chave: string; valores: { valor: string; total: number }[] };

/**
 * As facetas de um escopo: para cada chave da lista, os valores que
 * existem e quantas peças têm cada um. Valores compridos (a ficha da
 * marca às vezes traz um parágrafo no lugar de uma palavra) ficam de
 * fora; chaves com um valor só não viram filtro.
 */
export function facetas(produtos: Produto[], chaves: string[] = CHAVES_FACETA): Faceta[] {
  return chaves
    .map((chave) => {
      const contagem = new Map<string, number>();
      for (const p of produtos) {
        for (const a of p.atributos ?? []) {
          if (a.chave !== chave || a.valor.length > 28 || a.valor === "-") continue;
          contagem.set(a.valor, (contagem.get(a.valor) ?? 0) + 1);
        }
      }
      const valores = [...contagem.entries()]
        .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0], "pt-BR", { numeric: true }))
        .map(([valor, total]) => ({ valor, total }));
      return { chave, valores };
    })
    .filter((f) => f.valores.length > 1);
}
