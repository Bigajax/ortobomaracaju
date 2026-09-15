"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CardProduto } from "./CardProduto";
import { Icone, type NomeIcone } from "./Icones";
import type { Categoria, Produto } from "@/lib/tipos";

export type AbaConforto = {
  slug: string;
  nome: string;
  icone: NomeIcone;
  produtos: Produto[];
  total: number;
};

/**
 * "Conforto em outro nível", como no site da marca: as categorias numa
 * coluna de abas à esquerda (a ativa em azul cheio) e, à direita, um
 * trilho de cards que rola de lado com uma seta. Ao trocar de aba os
 * cards saem e entra um esqueleto com o brilho da marca por um instante,
 * como no site, para a troca ter peso; o catálogo já está na página, o
 * esqueleto é só o gesto.
 */
export function ConfortoAbas({ abas, categorias }: { abas: AbaConforto[]; categorias: Map<string, Categoria> }) {
  const [ativa, setAtiva] = useState(abas[0]?.slug ?? "");
  const [carregando, setCarregando] = useState(false);
  const trilho = useRef<HTMLUListElement>(null);
  const aba = abas.find((a) => a.slug === ativa) ?? abas[0];

  useEffect(() => {
    if (!carregando) return;
    const t = setTimeout(() => setCarregando(false), 420);
    return () => clearTimeout(t);
  }, [carregando]);

  function trocar(slug: string) {
    if (slug === ativa) return;
    setAtiva(slug);
    setCarregando(true);
    trilho.current?.scrollTo({ left: 0 });
  }

  function rolar(sentido: 1 | -1) {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({ left: sentido * el.clientWidth * 0.8, behavior: "smooth" });
  }

  if (!aba) return null;

  return (
    <section id="conforto" aria-labelledby="conforto-titulo" className="miolo scroll-mt-24 pt-12 lg:pt-16">
      <h2 id="conforto-titulo" className="secao">
        Conforto em outro nível
      </h2>

      <div className="mt-5 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-6">
        {/* as abas: coluna no desktop, fila que rola no celular */}
        <ul role="tablist" aria-label="Categorias" className="faixa-scroll sangra flex gap-2 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {abas.map((a) => {
            const on = a.slug === ativa;
            return (
              <li key={a.slug} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls={`painel-${a.slug}`}
                  onClick={() => trocar(a.slug)}
                  className={`flex w-full items-center gap-3 rounded-[var(--raio)] border px-4 py-3 text-left text-[0.9375rem] font-semibold transition-colors lg:px-5 lg:py-5 lg:text-[1.0625rem] ${on ? "border-azul-700 bg-azul-700 text-branco" : "border-linha bg-white text-azul-900 hover:border-azul-300"}`}
                >
                  <Icone nome={a.icone} className={`h-7 w-7 shrink-0 lg:h-9 lg:w-9 ${on ? "text-branco" : "text-azul-700"}`} peso={1.3} />
                  {a.nome}
                </button>
              </li>
            );
          })}
        </ul>

        {/* o trilho dos cards, com a seta e o esqueleto */}
        <div className="relative min-w-0" id={`painel-${aba.slug}`} role="tabpanel" aria-busy={carregando}>
          <ul ref={trilho} className="faixa-scroll sangra flex gap-3 overflow-x-auto pb-2 sm:gap-4 lg:mx-0 lg:px-0">
            {carregando
              ? Array.from({ length: 4 }, (_, i) => (
                  <li key={i} className="w-[70vw] shrink-0 sm:w-[16rem] lg:w-[calc((100%-3rem)/4)]" aria-hidden="true">
                    <div className="cartao">
                      <div className="esqueleto aspect-square rounded-b-none" />
                      <div className="space-y-2 border-t border-linha px-4 pb-4 pt-3">
                        <div className="esqueleto h-3 w-1/3" />
                        <div className="esqueleto h-4 w-4/5" />
                        <div className="esqueleto h-3 w-2/3" />
                        <div className="esqueleto mt-4 h-10 w-full" />
                      </div>
                    </div>
                  </li>
                ))
              : aba.produtos.map((p) => (
                  <li key={p.id} className="w-[70vw] shrink-0 sm:w-[16rem] lg:w-[calc((100%-3rem)/4)]">
                    <CardProduto produto={p} categoria={categorias.get(p.categoria_slug ?? "")} tamanhos="(max-width: 640px) 70vw, (max-width: 1024px) 16rem, 20vw" />
                  </li>
                ))}
            {!carregando && aba.total > aba.produtos.length ? (
              <li className="w-[70vw] shrink-0 sm:w-[16rem] lg:w-[calc((100%-3rem)/4)]">
                <Link href={`/catalogo/${aba.slug}`} className="escuro escuro--azul bloco flex h-full min-h-[20rem] flex-col justify-between p-5">
                  <span className="etiqueta">Tem mais</span>
                  <span className="my-auto block">
                    <span className="manchete block text-[3rem] leading-none text-branco">+{aba.total - aba.produtos.length}</span>
                    <span className="mt-2 block text-[0.9375rem] text-azul-200">
                      {aba.nome.toLowerCase()} além {aba.slug === "bases" || aba.slug === "cabeceiras" ? "destas" : "destes"}
                    </span>
                  </span>
                  <span className="btn btn--branco w-full">Ver {aba.slug === "bases" || aba.slug === "cabeceiras" ? "as" : "os"} {aba.total}</span>
                </Link>
              </li>
            ) : null}
          </ul>

          <button type="button" onClick={() => rolar(1)} aria-label="Ver mais produtos" className="absolute -right-2 top-[9rem] hidden h-10 w-10 place-items-center rounded-l-[var(--raio)] bg-white shadow-[var(--sombra)] text-azul-900 hover:bg-azul-50 lg:grid">
            <Icone nome="seta" className="h-5 w-5" peso={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
