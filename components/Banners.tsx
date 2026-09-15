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
  /* a peça que está na foto: vira um chip sobre a imagem, com o link */
  naFoto?: { nome: string; href: string };
};

/**
 * O carrossel de banners da abertura: azul da marca de ponta a ponta,
 * com um brilho suave atrás da foto, a manchete grande em branco à
 * esquerda e a foto ambientada inteira à direita, num cartão quadrado
 * (a foto da marca é quadrada: mostrada inteira, nunca cortada), com o
 * chip "na foto" que leva ao colchão. No celular a foto vem em cima.
 * Rola por scroll-snap; setas e pontos só movem o scroll. Sem autoplay.
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
          <article key={i} aria-roledescription="slide" aria-label={`${i + 1} de ${banners.length}`} className="escuro escuro--azul banner-slide">
            <div className="miolo grid gap-0 lg:min-h-[30rem] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-10">
              <div className="order-1 w-full pt-6 lg:order-2 lg:py-10">
                {/* largura explícita: com justify-self-end o cartão encolhia a zero, porque a Image fill não tem tamanho próprio */}
                <div className="banner-foto relative mx-auto aspect-square w-full max-w-[26rem] lg:ml-auto lg:mr-0 lg:max-w-[28rem]">
                  <Image
                    src={b.imagem.url}
                    alt={b.imagem.alt ?? ""}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 1024px) 90vw, 28rem"
                    placeholder={b.imagem.blur ? "blur" : "empty"}
                    blurDataURL={b.imagem.blur ?? undefined}
                    className="object-cover"
                  />
                  {b.naFoto ? (
                    <Link href={b.naFoto.href} className="banner-chip">
                      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-laranja">Na foto</span>
                      <span className="block text-[0.875rem] font-semibold text-azul-900">{b.naFoto.nome}</span>
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="order-2 py-8 lg:order-1 lg:py-12 lg:pl-10">
                {b.etiqueta ? <span className="tag tag--laranja">{b.etiqueta}</span> : null}
                <h2 className="manchete mt-4 max-w-[14ch] text-[clamp(2rem,4.8vw,3.75rem)] text-branco">{b.titulo}</h2>
                <p className="falada mt-5 max-w-[46ch] text-[1.0625rem] text-azul-200">{b.texto}</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  {b.acao.externa ? (
                    <a href={b.acao.href} target="_blank" rel="noreferrer" className="btn btn--branco">
                      {b.acao.rotulo}
                    </a>
                  ) : (
                    <Link href={b.acao.href} className="btn btn--branco">
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
                      <Link href={b.segunda.href} className="btn btn--linha border-white/40 text-branco hover:bg-white hover:text-azul-900">
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
          <button type="button" onClick={() => ir(atual - 1)} aria-label="Banner anterior" className="banners-seta absolute left-3 top-1/2 hidden -translate-y-1/2 lg:grid">
            <Icone nome="seta-esq" className="h-5 w-5" peso={2} />
          </button>
          <button type="button" onClick={() => ir(atual + 1)} aria-label="Próximo banner" className="banners-seta absolute right-3 top-1/2 hidden -translate-y-1/2 lg:grid">
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
