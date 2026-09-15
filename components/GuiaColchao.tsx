"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icone } from "./Icones";

export type ColchaoResumo = {
  slug: string;
  nome: string;
  tamanhos: string[]; // só os nomes: "Casal", "Queen"...
  conforto: string | null; // "Macio", "Firme", "Híbrido"
};

/* os tamanhos da Ortobom em escala: largura x comprimento em cm */
const TAMANHOS: { nome: string; largura: number; comprimento: number; quem: string }[] = [
  { nome: "Solteiro", largura: 88, comprimento: 188, quem: "uma pessoa" },
  { nome: "Solteiro Extra", largura: 108, comprimento: 198, quem: "uma pessoa, com folga" },
  { nome: "Casal", largura: 138, comprimento: 188, quem: "duas pessoas" },
  { nome: "Queen", largura: 158, comprimento: 198, quem: "duas, com espaço" },
  { nome: "King", largura: 193, comprimento: 203, quem: "duas e a criança" },
];

const CONFORTOS: { nome: string; texto: string }[] = [
  { nome: "Macio", texto: "acolhe o corpo, para quem dorme de lado" },
  { nome: "Firme", texto: "segura a coluna, para quem dorme de costas ou pesa mais" },
  { nome: "Híbrido", texto: "molas e espuma juntas, o meio-termo" },
];

/**
 * "Qual colchão é o seu?": o guia da loja, em duas escolhas. Os tamanhos
 * são desenhados em escala (o King é de fato o dobro do Solteiro), e o
 * conforto vem em três chips com uma linha explicando. A cada escolha o
 * botão conta quantos modelos sobram e leva para o catálogo já
 * filtrado. É o "3 passos" do site da marca, só que respondendo na hora.
 */
export function GuiaColchao({ colchoes }: { colchoes: ColchaoResumo[] }) {
  const [tamanho, setTamanho] = useState<string | null>(null);
  const [conforto, setConforto] = useState<string | null>(null);

  const lista = useMemo(
    () => colchoes.filter((c) => (!tamanho || c.tamanhos.includes(tamanho)) && (!conforto || c.conforto === conforto)),
    [colchoes, tamanho, conforto],
  );
  const maior = Math.max(...TAMANHOS.map((t) => t.largura));
  const conta = (t: string) => colchoes.filter((c) => c.tamanhos.includes(t) && (!conforto || c.conforto === conforto)).length;
  const contaConforto = (k: string) => colchoes.filter((c) => c.conforto === k && (!tamanho || c.tamanhos.includes(tamanho))).length;

  const href = `/catalogo/colchoes?${new URLSearchParams({ ...(tamanho ? { tamanho } : {}), ...(conforto ? { busca: conforto } : {}) }).toString()}`;

  return (
    <section id="escolha" aria-labelledby="escolha-titulo" className="mt-12 scroll-mt-24 bg-azul-50 lg:mt-16">
      <div className="miolo py-10 lg:py-14">
        <div className="max-w-[60ch]">
          <p className="etiqueta">Guia da loja</p>
          <h2 id="escolha-titulo" className="secao mt-2">
            Qual colchão é o seu?
          </h2>
          <p className="falada mt-2 text-[1.0625rem] text-tinta-fraca">Duas escolhas e a vitrine mostra só o que serve. O resto você acerta deitando na loja.</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-12">
          {/* 1 · o tamanho, em escala */}
          <fieldset>
            <legend className="text-[0.9375rem] font-semibold text-azul-900">1. Qual tamanho cabe no seu quarto?</legend>
            <ul className="mt-4 flex items-end gap-2 sm:gap-3">
              {TAMANHOS.map((t) => {
                const ativo = tamanho === t.nome;
                const n = conta(t.nome);
                return (
                  <li key={t.nome} className="flex min-w-0 flex-1 flex-col items-center" style={{ flexGrow: t.largura }}>
                    <button
                      type="button"
                      aria-pressed={ativo}
                      disabled={n === 0}
                      onClick={() => setTamanho(ativo ? null : t.nome)}
                      className={`group relative w-full rounded-[var(--raio)] border-2 transition-colors disabled:opacity-40 ${ativo ? "border-laranja bg-white" : "border-azul-200 bg-white hover:border-azul-500"}`}
                      style={{ aspectRatio: `${t.largura} / ${t.comprimento}`, maxWidth: `${(t.largura / maior) * 100}%` }}
                      aria-label={`${t.nome}, ${t.largura} por ${t.comprimento} centímetros, ${n} modelos`}
                    >
                      <span aria-hidden="true" className="absolute inset-x-2 top-2 h-[22%] rounded-[3px] bg-azul-100 group-hover:bg-azul-200" />
                      <span aria-hidden="true" className={`absolute inset-x-1 bottom-1 hidden text-[0.6875rem] font-semibold sm:block ${ativo ? "text-laranja" : "text-azul-700"}`}>
                        {t.largura}
                      </span>
                    </button>
                    <span className={`mt-2 text-center text-[0.8125rem] font-semibold leading-tight ${ativo ? "text-laranja" : "text-azul-900"}`}>{t.nome}</span>
                    <span className="hidden text-center text-[0.6875rem] text-tinta-fraca sm:block">
                      {t.largura} x {t.comprimento} cm
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="miudo mt-3">Os retângulos estão em escala: o King é mais que o dobro do Solteiro. Berço, infantil e viúva estão no catálogo.</p>
          </fieldset>

          {/* 2 · o conforto */}
          <fieldset>
            <legend className="text-[0.9375rem] font-semibold text-azul-900">2. Como você gosta de dormir?</legend>
            <ul className="mt-4 grid gap-2">
              {CONFORTOS.map((c) => {
                const ativo = conforto === c.nome;
                const n = contaConforto(c.nome);
                return (
                  <li key={c.nome}>
                    <button
                      type="button"
                      aria-pressed={ativo}
                      disabled={n === 0}
                      onClick={() => setConforto(ativo ? null : c.nome)}
                      className={`flex w-full items-center gap-3 rounded-[var(--raio)] border-2 bg-white px-4 py-3 text-left transition-colors disabled:opacity-40 ${ativo ? "border-laranja" : "border-azul-200 hover:border-azul-500"}`}
                    >
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${ativo ? "border-laranja bg-laranja text-white" : "border-azul-300"}`}>{ativo ? <Icone nome="seta" className="h-3.5 w-3.5" peso={3} /> : null}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.9375rem] font-semibold text-azul-900">{c.nome}</span>
                        <span className="block text-[0.8125rem] text-tinta-fraca">{c.texto}</span>
                      </span>
                      <span className="text-[0.8125rem] font-semibold text-cinza-500">{n}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href={href} className="btn btn--azul">
                Ver {lista.length === 1 ? "o colchão" : `os ${lista.length} colchões`}
                {tamanho ? ` ${tamanho}` : ""}
                {conforto ? ` ${conforto.toLowerCase()}` : ""}
              </Link>
              {tamanho || conforto ? (
                <button
                  type="button"
                  onClick={() => {
                    setTamanho(null);
                    setConforto(null);
                  }}
                  className="btn btn--texto"
                >
                  Limpar
                </button>
              ) : null}
            </div>
          </fieldset>
        </div>
      </div>
    </section>
  );
}
