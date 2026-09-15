"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icone } from "./Icones";
import type { Imagem } from "@/lib/tipos";

export type Banner = {
  etiqueta?: string;
  titulo: string;
  texto: string;
  acao: { rotulo: string; href: string; externa?: boolean };
  segunda?: { rotulo: string; href: string; externa?: boolean };
  imagem: Imagem;
  /* o slide escuro: texto branco sobre azul 900 */
  escuro?: boolean;
};

/**
 * O carrossel de banners da abertura, no molde do site da marca: um
 * slide por tela, texto à esquerda e a foto à direita (no celular, a
 * foto em cima), setas e pontos. Rola por scroll-snap; as setas e os
 * pontos só movem o scroll. Sem autoplay: o cliente escolhe o ritmo.
 */
export function Banners({ banners }: { banners: Banner[] }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const ler = () => setAtual(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", ler, { passive: true });
    return () => el.removeEventListener("scroll", ler);
  }, []);

  const ir = (n: number) => {
    const el = trilho.current;
    if (!el) return;
    const i = (n + banners.length) % banners.length;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  if (!banners.length) return null;

  return (
    <section aria-roledescription="carrossel" aria-label="Destaques da loja" className="relative">
      <div ref={trilho} className="banners">
        {banners.map((b, i) => (
          <article key={i} aria-roledescription="slide" aria-label={`${i + 1} de ${banners.length}`} className={b.escuro ? "escuro escuro--azul" : "bg-azul-50"}>
            <div className="miolo grid gap-0 lg:min-h-[26rem] lg:grid-cols-2 lg:items-center">
              <div className="relative order-1 aspect-[4/3] w-[calc(100%+2*var(--sangria))] -mx-[var(--sangria)] sm:aspect-[16/9] lg:order-2 lg:mx-0 lg:aspect-auto lg:h-full lg:min-h-[26rem] lg:w-full">
                <Image
                  src={b.imagem.url}
                  alt={b.imagem.alt ?? ""}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  placeholder={b.imagem.blur ? "blur" : "empty"}
                  blurDataURL={b.imagem.blur ?? undefined}
                  className="object-cover object-center"
                />
              </div>
              <div className="order-2 py-8 lg:order-1 lg:py-12 lg:pl-10 lg:pr-12">
                {b.etiqueta ? <span className="tag tag--laranja">{b.etiqueta}</span> : null}
                <h2 className={`manchete mt-3 max-w-[16ch] text-[clamp(1.75rem,4.5vw,3rem)] ${b.escuro ? "text-branco" : "text-azul-900"}`}>{b.titulo}</h2>
                <p className={`falada mt-4 max-w-[46ch] text-[1.0625rem] ${b.escuro ? "text-azul-200" : "text-tinta-fraca"}`}>{b.texto}</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  {b.acao.externa ? (
                    <a href={b.acao.href} target="_blank" rel="noreferrer" className="btn btn--azul">
                      {b.acao.rotulo}
                    </a>
                  ) : (
                    <Link href={b.acao.href} className={`btn ${b.escuro ? "btn--branco" : "btn--azul"}`}>
                      {b.acao.rotulo}
                    </Link>
                  )}
                  {b.segunda ? (
                    b.segunda.externa ? (
                      <a href={b.segunda.href} target="_blank" rel="noreferrer" className="btn btn--whats">
                        <Icone nome="whats" className="h-[1.125rem] w-[1.125rem]" />
                        {b.segunda.rotulo}
                      </a>
                    ) : (
                      <Link href={b.segunda.href} className="btn btn--linha">
                        {b.segunda.rotulo}
                      </Link>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {banners.length > 1 ? (
        <>
          <button type="button" onClick={() => ir(atual - 1)} aria-label="Banner anterior" className="banners-seta absolute left-3 top-[28%] hidden lg:top-1/2 lg:-translate-y-1/2 lg:grid">
            <Icone nome="seta-esq" className="h-5 w-5" peso={2} />
          </button>
          <button type="button" onClick={() => ir(atual + 1)} aria-label="Próximo banner" className="banners-seta absolute right-3 top-[28%] hidden lg:top-1/2 lg:-translate-y-1/2 lg:grid">
            <Icone nome="seta" className="h-5 w-5" peso={2} />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 lg:bottom-5">
            {banners.map((_, i) => (
              <button key={i} type="button" onClick={() => ir(i)} aria-label={`Ir para o banner ${i + 1}`} aria-current={i === atual} className="banners-ponto" style={i === atual ? { background: "var(--laranja)" } : undefined} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
