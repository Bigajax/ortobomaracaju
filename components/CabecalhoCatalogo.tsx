import Image from "next/image";
import Link from "next/link";

/**
 * O topo do catálogo, em azul, como a faixa de categoria do site da
 * marca: o nome grande, a contagem, uma linha do que tem, e os atalhos
 * de tamanho já como pílulas (é o primeiro filtro que todo mundo usa).
 * À direita, o produto recortado num círculo, o mesmo gesto do
 * "Encontre o que procura" da home.
 */
export function CabecalhoCatalogo({
  etiqueta = "Ortobom Aracaju",
  titulo,
  texto,
  total,
  unidade,
  imagens,
  tamanhos = [],
  tamanhoAtual = "",
  base,
}: {
  etiqueta?: string;
  titulo: string;
  texto: string;
  total: number;
  unidade: [string, string];
  /* os tiles da marca a mostrar no círculo (um por categoria; no "Tudo", os quatro) */
  imagens: string[];
  tamanhos?: string[];
  tamanhoAtual?: string;
  /* a rota que recebe ?tamanho= */
  base: string;
}) {
  return (
    <header className="escuro escuro--azul">
      <div className="miolo grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12 lg:py-10">
        <div className="min-w-0">
          <p className="etiqueta">{etiqueta}</p>
          <h1 className="manchete mt-2 flex flex-wrap items-baseline gap-x-3 text-[clamp(2rem,4.5vw,3.25rem)] text-branco">
            {titulo}
            <span className="text-[0.4em] font-semibold text-azul-200">
              {total} {total === 1 ? unidade[0] : unidade[1]}
            </span>
          </h1>
          <p className="falada mt-2 max-w-[56ch] text-[1.0625rem] text-azul-200">{texto}</p>

          {tamanhos.length ? (
            <nav aria-label="Tamanhos" className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[0.8125rem] font-semibold text-azul-300">Tamanho</span>
              {tamanhos.map((t) => {
                const on = t === tamanhoAtual;
                return (
                  <Link key={t} href={on ? base : `${base}?tamanho=${encodeURIComponent(t)}`} className={`chip chip--claro ${on ? "chip--laranja" : ""}`} aria-current={on ? "true" : undefined}>
                    {t}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>

        <div className={`hidden lg:grid ${imagens.length > 1 ? "grid-cols-2 gap-3" : ""}`} aria-hidden="true">
          {imagens.slice(0, 4).map((src) => (
            <span key={src} className={`relative block overflow-hidden rounded-full bg-azul-50 ${imagens.length > 1 ? "h-24 w-24" : "h-44 w-44"}`}>
              <Image src={src} alt="" fill sizes="11rem" className="object-contain p-[6%]" />
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
