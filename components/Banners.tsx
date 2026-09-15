"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icone } from "./Icones";
import type { Imagem } from "@/lib/tipos";

export type Banner = {
  /* a palavra de abertura em caligrafia, como o "Renove" das campanhas da marca */
  script?: string;
  titulo: string;
  texto: string;
  acao: { rotulo: string; href: string; externa?: boolean };
  imagem: Imagem;
  /* o selo escuro à direita: número grande, uma linha embaixo, uma nota */
  selo?: { grande: string; pequeno: string; nota?: string };
  /* a peça que está na foto, para o rodapé do banner */
  naFoto?: { nome: string; href: string };
};

const INTERVALO = 4000;

/**
 * O carrossel de banners, no molde exato do site da marca: a foto ocupa
 * o banner inteiro (1920x450 no desktop, quadrado no celular), a
 * caligrafia e a manchete sentam por cima à esquerda, o selo escuro à
 * direita, os controles no canto de baixo. Autoplay de 4 segundos que
 * para quando o mouse está em cima, quando o foco entra, ou quando a
 * pessoa pediu menos movimento.
 */
export function Banners({ banners }: { banners: Banner[] }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  const [parado, setParado] = useState(false);

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

  useEffect(() => {
    if (banners.length < 2 || parado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      const el = trilho.current;
      if (!el) return;
      const i = (Math.round(el.scrollLeft / el.clientWidth) + 1) % banners.length;
      el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    }, INTERVALO);
    return () => clearInterval(t);
  }, [banners.length, parado]);

  if (!banners.length) return null;

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques da loja"
      className="relative"
      onMouseEnter={() => setParado(true)}
      onMouseLeave={() => setParado(false)}
      onFocus={() => setParado(true)}
      onBlur={() => setParado(false)}
    >
      <div ref={trilho} className="banners">
        {banners.map((b, i) => (
          <article key={i} aria-roledescription="slide" aria-label={`${i + 1} de ${banners.length}`} className="banner-slide">
            <div className="banner-fundo" aria-hidden="true">
              <Image src={b.imagem.url} alt="" fill sizes="100vw" className="object-cover" priority={i === 0} />
            </div>
            <div className="banner-nitida">
              <Image
                src={b.imagem.url}
                alt={b.imagem.alt ?? ""}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 40vw"
                placeholder={b.imagem.blur ? "blur" : "empty"}
                blurDataURL={b.imagem.blur ?? undefined}
                className="object-cover"
              />
            </div>
            <div className="banner-veu" aria-hidden="true" />

            {b.selo ? (
              <div className="banner-selo">
                <span className="manchete text-[clamp(2.25rem,4.5vw,3.75rem)] leading-none">{b.selo.grande}</span>
                <span className="mt-1 text-[0.8125rem] font-semibold lg:text-[0.9375rem]">{b.selo.pequeno}</span>
                {b.selo.nota ? <span className="mt-2 border-t border-white/25 pt-2 text-[0.625rem] uppercase tracking-[0.08em] text-white/80 lg:text-[0.6875rem]">{b.selo.nota}</span> : null}
              </div>
            ) : null}

            <div className="miolo banner-miolo">
              <div className="max-w-[34rem] lg:pl-8">
                {b.script ? <p className="script text-[clamp(2.5rem,6vw,4.5rem)] text-branco">{b.script}</p> : null}
                <h2 className={`manchete max-w-[16ch] text-branco ${b.script ? "-mt-1 text-[clamp(1.625rem,3.4vw,2.75rem)]" : "text-[clamp(1.875rem,4.5vw,3.5rem)]"}`}>{b.titulo}</h2>
                <p className="falada mt-3 max-w-[44ch] text-[clamp(0.9375rem,1.2vw,1.0625rem)] text-white/85">{b.texto}</p>
                <div className="mt-5">
                  {b.acao.externa ? (
                    <a href={b.acao.href} target="_blank" rel="noreferrer" className="btn btn--branco">
                      {b.acao.rotulo}
                    </a>
                  ) : (
                    <Link href={b.acao.href} className="btn btn--branco">
                      {b.acao.rotulo}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {b.naFoto ? (
              <p className="banner-legal hidden lg:block">
                Na foto: {b.naFoto.nome}. Fotos ilustrativas da Ortobom; o colchão não inclui a base.
              </p>
            ) : null}
          </article>
        ))}
      </div>

      {banners.length > 1 ? (
        <div className="banners-controles">
          <div className="miolo flex items-center justify-center gap-2 lg:justify-start lg:pl-8">
            <button type="button" onClick={() => ir(atual - 1)} aria-label="Banner anterior" className="banners-seta">
              <Icone nome="seta-esq" className="h-4 w-4" peso={2} />
            </button>
            <div className="flex items-center gap-1.5 px-1">
              {banners.map((_, i) => (
                <button key={i} type="button" onClick={() => ir(i)} aria-label={`Ir para o banner ${i + 1}`} aria-current={i === atual} className="banners-ponto" />
              ))}
            </div>
            <button type="button" onClick={() => ir(atual + 1)} aria-label="Próximo banner" className="banners-seta">
              <Icone nome="seta" className="h-4 w-4" peso={2} />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
