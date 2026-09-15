"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Marca";
import { Icone } from "./Icones";
import type { Aba } from "@/lib/menu";

/**
 * O cabeçalho no molde do site da marca, em três linhas: a barra do
 * topo (azul 950, o aviso da loja se revezando), a linha da marca (azul
 * 900: logo à esquerda, busca redonda no meio, WhatsApp e Menu à
 * direita) e a fila de portas com ícone. No desktop, passar o mouse numa
 * porta abre a aba dela por baixo, um painel branco translúcido com o
 * que a vitrine tem; o clique continua abrindo a página. O botão Menu
 * abre uma gaveta pela direita: a busca, as portas e o WhatsApp.
 */
export function Cabecalho({ linkWhats, aviso, menu }: { linkWhats: string; aviso?: string; menu: Aba[] }) {
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const router = useRouter();
  const caminho = usePathname();
  /* o revezamento do aviso é escrito para quatro frases: menos que isso, repete; mais, corta */
  const base = (aviso ?? "").split("|").map((f) => f.trim()).filter(Boolean);
  const frases = base.length ? Array.from({ length: 4 }, (_, i) => base[i % base.length]) : [];

  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", fechar);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fechar);
      document.body.style.overflow = "";
    };
  }, [aberto]);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const q = termo.trim();
    setAberto(false);
    router.push(q ? `/catalogo?busca=${encodeURIComponent(q)}` : "/catalogo");
  }

  const atual = (href: string) => href.startsWith("/catalogo/") && caminho.startsWith(href.split("?")[0]);

  return (
    <header className="relative z-50 [overflow-x:clip]">
      {frases.length ? (
        <p className="escuro aviso text-[0.8125rem] font-medium" aria-live="off">
          {frases.map((f, i) => (
            <span key={i} className="aviso-item" style={{ "--i": i } as React.CSSProperties}>
              {f}
            </span>
          ))}
        </p>
      ) : null}

      <div className="escuro escuro--azul">
        <div className="miolo flex h-[4.25rem] items-center justify-between gap-3 lg:grid lg:h-[5.5rem] lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-10">
          <button type="button" onClick={() => setAberto(true)} aria-expanded={aberto} aria-controls="menu-gaveta" aria-label="Abrir o menu" className="flex h-10 w-10 items-center justify-center lg:hidden">
            <span aria-hidden="true" className="flex flex-col gap-[5px]">
              <span className="block h-[2px] w-6 bg-branco" />
              <span className="block h-[2px] w-6 bg-branco" />
              <span className="block h-[2px] w-6 bg-branco" />
            </span>
          </button>

          <Link href="/" aria-label="Ortobom Aracaju, página inicial" className="flex shrink-0 items-center gap-3">
            <Logo className="h-[1.375rem] w-auto lg:h-[1.75rem]" />
            <span className="hidden border-l border-azul-300/40 pl-3 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-azul-300 sm:inline">Aracaju</span>
          </Link>

          <form onSubmit={buscar} role="search" className="mx-auto hidden w-full max-w-[34rem] lg:block">
            <label className="busca-cabecalho">
              <span className="sr-only">Buscar por nome, linha ou tamanho</span>
              <input value={termo} onChange={(e) => setTermo(e.target.value)} placeholder="Olá, o que você deseja encontrar?" />
              <button type="submit" aria-label="Buscar">
                <Icone nome="lupa" className="h-5 w-5" />
              </button>
            </label>
          </form>

          <div className="flex items-center gap-2 lg:gap-4">
            <a href={linkWhats} target="_blank" rel="noreferrer" className="btn btn--whats btn--pequeno hidden lg:inline-flex">
              <Icone nome="whats" className="h-[1.125rem] w-[1.125rem]" />
              Pedir no WhatsApp
            </a>
            <a href={linkWhats} target="_blank" rel="noreferrer" aria-label="Pedir no WhatsApp" className="flex h-10 w-10 items-center justify-center text-branco lg:hidden">
              <Icone nome="whats" className="h-6 w-6" />
            </a>
            <button type="button" onClick={() => setAberto((v) => !v)} aria-expanded={aberto} aria-controls="menu-gaveta" className="hidden items-center gap-2 text-[0.9375rem] font-medium text-branco hover:text-laranja lg:flex">
              <span aria-hidden="true" className="flex flex-col gap-[4px]">
                <span className="block h-[2px] w-5 bg-current" />
                <span className="block h-[2px] w-5 bg-current" />
                <span className="block h-[2px] w-5 bg-current" />
              </span>
              Menu
            </button>
          </div>
        </div>

        {/* a busca do celular, larga, logo abaixo da marca */}
        <form onSubmit={buscar} role="search" className="miolo pb-3 lg:hidden">
          <label className="busca-cabecalho">
            <span className="sr-only">Buscar por nome, linha ou tamanho</span>
            <input value={termo} onChange={(e) => setTermo(e.target.value)} placeholder="Olá, o que você deseja encontrar?" />
            <button type="submit" aria-label="Buscar">
              <Icone nome="lupa" className="h-5 w-5" />
            </button>
          </label>
        </form>

        <nav aria-label="Portas da loja" className="border-t border-white/10">
          <ul className="miolo faixa-scroll flex overflow-x-auto lg:grid lg:grid-cols-6 lg:overflow-visible">
            {menu.map((aba, i) => (
              <li key={aba.chave} className={`porta ${i > 0 ? "lg:border-l lg:border-white/10" : ""}`}>
                {aba.externa ? (
                  <a href={aba.href} target="_blank" rel="noreferrer" className="porta-link">
                    <Icone nome={aba.icone} className="h-7 w-7 lg:h-8 lg:w-8" peso={1.4} />
                    {aba.nome}
                  </a>
                ) : (
                  <Link href={aba.href} className="porta-link" aria-current={atual(aba.href) ? "page" : undefined}>
                    <Icone nome={aba.icone} className="h-7 w-7 lg:h-8 lg:w-8" peso={1.4} />
                    {aba.nome}
                  </Link>
                )}

                <div className={`porta-aba ${i >= menu.length / 2 ? "porta-aba--direita" : ""}`} aria-label={`${aba.nome}: atalhos`}>
                  {aba.titulo ? <p className="etiqueta mb-3">{aba.titulo}</p> : null}
                  <ul className={`grid gap-x-8 gap-y-1 ${aba.colunas === 4 ? "grid-cols-4" : aba.colunas === 3 ? "grid-cols-3" : aba.colunas === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                    {aba.itens.map((item) => {
                      const conteudo = (
                        <>
                          {item.icone ? <Icone nome={item.icone} className="h-6 w-6 shrink-0 text-azul-700" peso={1.4} /> : null}
                          <span className="min-w-0">
                            <span className="block text-[0.9375rem] text-tinta group-hover:text-azul-700">{item.nome}</span>
                            {item.nota && item.icone ? <span className="block text-[0.75rem] text-tinta-fraca">{item.nota}</span> : null}
                          </span>
                          {item.nota && !item.icone ? <span className="ml-auto text-[0.75rem] font-semibold text-cinza-500">{item.nota}</span> : null}
                        </>
                      );
                      return (
                        <li key={item.nome + item.href}>
                          {item.externa ? (
                            <a href={item.href} target="_blank" rel="noreferrer" className="porta-item group">
                              {conteudo}
                            </a>
                          ) : (
                            <Link href={item.href} className="porta-item group">
                              {conteudo}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {aberto ? (
        <>
          <button type="button" aria-label="Fechar o menu" onClick={() => setAberto(false)} className="gaveta-veu" />
          <nav id="menu-gaveta" aria-label="Menu" className="escuro escuro--azul gaveta">
            <div className="flex items-center justify-between px-5 pt-5">
              <Logo className="h-[1.25rem] w-auto" />
              <button type="button" onClick={() => setAberto(false)} aria-label="Fechar o menu" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-branco hover:border-laranja hover:text-laranja">
                <Icone nome="fechar" className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={buscar} role="search" className="px-5 pt-4">
              <label className="busca-cabecalho">
                <span className="sr-only">Buscar por nome, linha ou tamanho</span>
                <input id="busca-gaveta" value={termo} onChange={(e) => setTermo(e.target.value)} placeholder="O que você procura?" />
                <button type="submit" aria-label="Buscar">
                  <Icone nome="lupa" className="h-5 w-5" />
                </button>
              </label>
            </form>

            <ul className="mt-3 flex-1 overflow-y-auto px-3 pb-4">
              {menu.map((aba) => (
                <li key={aba.chave} className="border-b border-white/10 last:border-b-0">
                  {aba.externa ? (
                    <a href={aba.href} target="_blank" rel="noreferrer" onClick={() => setAberto(false)} className="gaveta-porta">
                      <Icone nome={aba.icone} className="h-7 w-7 shrink-0 text-laranja" peso={1.4} />
                      <span className="text-[1rem] text-branco">{aba.nome}</span>
                    </a>
                  ) : (
                    <Link href={aba.href} onClick={() => setAberto(false)} className="gaveta-porta">
                      <Icone nome={aba.icone} className="h-7 w-7 shrink-0 text-laranja" peso={1.4} />
                      <span className="text-[1rem] text-branco">{aba.nome}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 px-5 py-5">
              <a href={linkWhats} target="_blank" rel="noreferrer" onClick={() => setAberto(false)} className="btn btn--whats w-full">
                <Icone nome="whats" className="h-[1.125rem] w-[1.125rem]" />
                Pedir no WhatsApp
              </a>
            </div>
          </nav>
        </>
      ) : null}
    </header>
  );
}
