"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CardProduto } from "./CardProduto";
import { Icone } from "./Icones";
import { facetas, filtrar, tamanhosDisponiveis } from "@/lib/filtro";
import type { Categoria, Ordenacao, Produto } from "@/lib/tipos";

const POR_PAGINA = 12;

const ORDENS: { valor: Ordenacao; rotulo: string }[] = [
  { valor: "recentes", rotulo: "Ordem da loja" },
  { valor: "nome-az", rotulo: "Nome, A a Z" },
  { valor: "nome-za", rotulo: "Nome, Z a A" },
];

type Escolhas = Record<string, string[]>;

/**
 * O catálogo no molde do site da marca: filtros na coluna da esquerda
 * (o tamanho e as facetas da ficha: conforto, tipo, mola, revestimento,
 * cada uma com a contagem), a grade à direita com a busca, a ordem e as
 * escolhas ativas em pílulas que se tiram com um toque. No celular a
 * coluna vira uma gaveta. Sem preço na vitrine, não há ordem por preço:
 * é a loja que passa o valor.
 */
export function Catalogo({
  produtos,
  categorias,
  categoriaAtual,
  escopoFechado = false,
  buscaInicial = "",
  tamanhoInicial = "",
  linkWhats,
}: {
  produtos: Produto[];
  categorias: Categoria[];
  categoriaAtual?: string;
  /* a página já entregou só as peças do escopo (uma porta que junta categorias) */
  escopoFechado?: boolean;
  buscaInicial?: string;
  /* o tamanho que veio na URL (?tamanho=Casal), das abas do menu e do topo */
  tamanhoInicial?: string;
  linkWhats: string;
}) {
  const [busca, setBusca] = useState(buscaInicial);
  const [tamanhos, setTamanhos] = useState<string[]>(tamanhoInicial ? [tamanhoInicial] : []);
  const [escolhas, setEscolhas] = useState<Escolhas>({});
  const [ordem, setOrdem] = useState<Ordenacao>("recentes");
  const [visiveis, setVisiveis] = useState(POR_PAGINA);
  const [gaveta, setGaveta] = useState(false);

  /* o tamanho da URL muda quando a pessoa clica nos atalhos do topo */
  useEffect(() => setTamanhos(tamanhoInicial ? [tamanhoInicial] : []), [tamanhoInicial]);
  useEffect(() => setBusca(buscaInicial), [buscaInicial]);

  const doEscopo = useMemo(
    () => (categoriaAtual && !escopoFechado ? produtos.filter((p) => p.categoria_slug === categoriaAtual) : produtos),
    [produtos, categoriaAtual, escopoFechado],
  );

  const opcoesTamanho = useMemo(() => tamanhosDisponiveis(doEscopo), [doEscopo]);
  const grupos = useMemo(() => facetas(doEscopo), [doEscopo]);

  const lista = useMemo(() => filtrar(doEscopo, { busca, tamanho: tamanhos, atributos: escolhas, ordem }), [doEscopo, busca, tamanhos, escolhas, ordem]);

  useEffect(() => setVisiveis(POR_PAGINA), [busca, tamanhos, escolhas, ordem]);

  const ativas: { chave: string; valor: string }[] = [
    ...tamanhos.map((t) => ({ chave: "Tamanho", valor: t })),
    ...Object.entries(escolhas).flatMap(([chave, valores]) => valores.map((valor) => ({ chave, valor }))),
  ];
  const temFiltro = Boolean(busca) || ativas.length > 0;

  function limpar() {
    setBusca("");
    setTamanhos([]);
    setEscolhas({});
  }

  function alternaTamanho(t: string) {
    setTamanhos((atual) => (atual.includes(t) ? atual.filter((v) => v !== t) : [...atual, t]));
  }

  function alternaEscolha(chave: string, valor: string) {
    setEscolhas((atual) => {
      const lista = atual[chave] ?? [];
      const nova = lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
      const proximo = { ...atual, [chave]: nova };
      if (!nova.length) delete proximo[chave];
      return proximo;
    });
  }

  function tirar(a: { chave: string; valor: string }) {
    if (a.chave === "Tamanho") alternaTamanho(a.valor);
    else alternaEscolha(a.chave, a.valor);
  }

  const painel = (
    <div className="space-y-7">
      {opcoesTamanho.length > 1 ? (
        <Faceta titulo="Tamanho">
          {opcoesTamanho.map((t) => (
            <Opcao key={t} rotulo={t} ativo={tamanhos.includes(t)} onClick={() => alternaTamanho(t)} />
          ))}
        </Faceta>
      ) : null}

      {grupos.map((g) => (
        <Faceta key={g.chave} titulo={g.chave}>
          {g.valores.map((v) => (
            <Opcao key={v.valor} rotulo={v.valor} total={v.total} ativo={(escolhas[g.chave] ?? []).includes(v.valor)} onClick={() => alternaEscolha(g.chave, v.valor)} />
          ))}
        </Faceta>
      ))}

      {temFiltro ? (
        <button type="button" onClick={limpar} className="btn btn--texto">
          Limpar tudo
        </button>
      ) : null}
    </div>
  );

  const temPainel = opcoesTamanho.length > 1 || grupos.length > 0;

  return (
    <div className="miolo pb-20 pt-6 lg:pt-8">
      {/* as categorias, sempre à vista: no celular rola de lado, no desktop cabe inteiro */}
      <nav aria-label="Categorias" className="faixa-scroll sangra flex gap-2 overflow-x-auto pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
        <Link href="/catalogo" className={`chip chip--quadrado shrink-0 ${!categoriaAtual && !escopoFechado ? "chip--cheio" : ""}`} aria-current={!categoriaAtual && !escopoFechado ? "page" : undefined}>
          Tudo
        </Link>
        {categorias.map((c) => (
          <Link key={c.slug} href={`/catalogo/${c.slug}`} className={`chip chip--quadrado shrink-0 ${categoriaAtual === c.slug ? "chip--cheio" : ""}`} aria-current={categoriaAtual === c.slug ? "page" : undefined}>
            {c.nome}
          </Link>
        ))}
      </nav>

      <div className={`mt-6 grid gap-8 ${temPainel ? "lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10" : ""}`}>
        {temPainel ? (
          <aside className="hidden lg:block" aria-label="Filtros">
            <div className="sticky top-6">
              <p className="mb-4 flex items-center gap-2 text-[0.9375rem] font-bold text-azul-900">
                <Icone nome="regua" className="h-5 w-5 text-laranja" peso={1.6} />
                Filtrar
              </p>
              {painel}
            </div>
          </aside>
        ) : null}

        <div className="min-w-0">
          {/* a barra: busca, contagem, ordem, e no celular o botão da gaveta */}
          <div className="flex flex-wrap items-center gap-3 rounded-[var(--raio)] border border-linha p-3 sm:rounded-none sm:border-0 sm:border-b sm:p-0 sm:pb-4">
            <label className="busca-catalogo min-w-0 flex-1 sm:max-w-[22rem]">
              <Icone nome="lupa" className="h-5 w-5 shrink-0 text-azul-700" />
              <span className="sr-only">Buscar por modelo, linha ou tamanho</span>
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Modelo, linha ou tamanho" />
              {busca ? (
                <button type="button" onClick={() => setBusca("")} aria-label="Limpar a busca">
                  <Icone nome="fechar" className="h-4 w-4" />
                </button>
              ) : null}
            </label>

            <p className="text-[0.875rem] text-tinta-fraca">
              <span className="preco text-[1.25rem] text-azul-900">{lista.length}</span> {lista.length === 1 ? "produto" : "produtos"}
            </p>

            <div className="ml-auto flex items-center gap-2">
              <label className="sr-only" htmlFor="ordem">
                Ordenar
              </label>
              <select id="ordem" value={ordem} onChange={(e) => setOrdem(e.target.value as Ordenacao)} className="busca-linha campo--auto cursor-pointer">
                {ORDENS.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.rotulo}
                  </option>
                ))}
              </select>
              {temPainel ? (
                <button type="button" onClick={() => setGaveta(true)} className="btn btn--linha btn--pequeno lg:hidden" aria-expanded={gaveta}>
                  Filtros{ativas.length ? ` (${ativas.length})` : ""}
                </button>
              ) : null}
            </div>
          </div>

          {ativas.length ? (
            <ul className="mt-4 flex flex-wrap items-center gap-2" aria-label="Filtros ativos">
              {ativas.map((a) => (
                <li key={a.chave + a.valor}>
                  <button type="button" onClick={() => tirar(a)} className="chip chip--ativa" aria-label={`Tirar ${a.chave}: ${a.valor}`}>
                    <span className="text-azul-300">{a.chave === "Tamanho" ? "" : `${a.chave}: `}</span>
                    {a.valor}
                    <Icone nome="fechar" className="h-3.5 w-3.5" peso={2} />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={limpar} className="btn btn--texto btn--pequeno">
                  Limpar tudo
                </button>
              </li>
            </ul>
          ) : null}

          <div className="pt-6">
            {lista.length ? (
              <>
                {/* uma coluna no celular, como o catálogo da marca: o card inteiro na largura do dedo */}
                <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${temPainel ? "md:grid-cols-3 xl:grid-cols-4" : "sm:grid-cols-3 lg:grid-cols-4"} lg:gap-5`}>
                  {lista.slice(0, visiveis).map((p, i) => (
                    <CardProduto key={p.id} produto={p} categoria={categorias.find((c) => c.slug === p.categoria_slug)} prioridade={i < 2} tamanhos="(max-width: 640px) 92vw, (max-width: 1024px) 30vw, 20vw" />
                  ))}
                </div>
                {visiveis < lista.length ? (
                  <div className="mt-12 flex flex-col items-center gap-3">
                    <p className="text-[0.875rem] text-tinta-fraca">
                      Mostrando {visiveis} de {lista.length}
                    </p>
                    <button type="button" onClick={() => setVisiveis((v) => v + POR_PAGINA)} className="btn btn--azul">
                      Ver mais {Math.min(POR_PAGINA, lista.length - visiveis)}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="cartao mx-auto max-w-md p-10 text-center">
                <p className="manchete text-[1.25rem] text-azul-900">Nada com esses filtros</p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-tinta-fraca">Tire um filtro ou pergunte no WhatsApp: a loja tem mais do que a vitrine mostra.</p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={limpar} className="btn btn--linha">
                    Limpar filtros
                  </button>
                  <a href={linkWhats} target="_blank" rel="noreferrer" className="btn btn--whats">
                    <Icone nome="whats" className="h-[1.125rem] w-[1.125rem]" />
                    Perguntar à loja
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {gaveta ? (
        <>
          <button type="button" aria-label="Fechar os filtros" onClick={() => setGaveta(false)} className="gaveta-veu" />
          <div role="dialog" aria-label="Filtros" className="gaveta gaveta--clara">
            <div className="flex items-center justify-between px-5 pt-5">
              <span className="text-[1.0625rem] font-bold text-azul-900">Filtros</span>
              <button type="button" onClick={() => setGaveta(false)} aria-label="Fechar" className="grid h-10 w-10 place-items-center rounded-full border border-linha text-azul-900">
                <Icone nome="fechar" className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{painel}</div>
            <div className="border-t border-linha px-5 py-4">
              <button type="button" onClick={() => setGaveta(false)} className="btn btn--azul w-full">
                Ver {lista.length} {lista.length === 1 ? "produto" : "produtos"}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Faceta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[0.8125rem] font-semibold uppercase tracking-[0.04em] text-tinta-fraca">{titulo}</h3>
      <ul className="flex flex-col">{children}</ul>
    </section>
  );
}

function Opcao({ rotulo, total, ativo, onClick }: { rotulo: string; total?: number; ativo: boolean; onClick: () => void }) {
  return (
    <li>
      <button type="button" onClick={onClick} aria-pressed={ativo} className="faceta-opcao">
        <span className="faceta-caixa" aria-hidden="true">
          {ativo ? <Icone nome="check" className="h-3 w-3" peso={3} /> : null}
        </span>
        <span className="min-w-0 flex-1 truncate">{rotulo}</span>
        {total !== undefined ? <span className="faceta-total">{total}</span> : null}
      </button>
    </li>
  );
}
