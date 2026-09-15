import Image from "next/image";
import Link from "next/link";

export type Porta = {
  nome: string;
  href: string;
  /* o tile da marca (public/marca/cat-*.png), quadrado, fundo branco */
  imagem: string;
  nota?: string;
};

/**
 * "Seu próximo colchão está aqui!": a fileira de categorias do site da
 * marca, com os tiles oficiais (colchão, base, cabeceira, travesseiro)
 * em cartões brancos de borda fina e o nome embaixo.
 */
export function Portas({ portas, titulo = "Seu próximo colchão está aqui!" }: { portas: Porta[]; titulo?: string }) {
  return (
    <section aria-labelledby="titulo-portas" className="miolo pt-12 lg:pt-16">
      <div className="regua">
        <h2 id="titulo-portas" className="secao">
          {titulo}
        </h2>
        <Link href="/catalogo" className="btn btn--texto shrink-0">
          Ver todas
        </Link>
      </div>
      <ul className="faixa-scroll sangra mt-4 flex gap-3 overflow-x-auto pb-2 lg:mx-0 lg:grid lg:gap-5 lg:overflow-visible lg:px-0" style={{ gridTemplateColumns: `repeat(${portas.length}, minmax(0, 1fr))` }}>
        {portas.map((p) => (
          <li key={p.nome} className="w-[44vw] shrink-0 sm:w-[13rem] lg:w-auto">
            <Link href={p.href} className="cartao group block">
              <span className="foto block aspect-square rounded-b-none bg-white">
                <Image src={p.imagem} alt="" fill sizes="(max-width: 640px) 44vw, (max-width: 1024px) 30vw, 20vw" className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
              </span>
              <span className="block border-t border-linha px-4 py-3 text-center">
                <span className="block text-[1rem] font-semibold text-azul-900 group-hover:text-azul-700">{p.nome}</span>
                {p.nota ? <span className="block text-[0.8125rem] text-tinta-fraca">{p.nota}</span> : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
