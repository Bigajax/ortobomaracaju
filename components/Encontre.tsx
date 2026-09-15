import Image from "next/image";
import Link from "next/link";

export type Circulo = {
  nome: string;
  href: string;
  /* o tile da marca (public/marca/cat-*.png), recortado, fundo transparente */
  imagem: string;
  nota?: string;
};

/**
 * "Encontre o que procura", como no site da marca: uma fileira de
 * círculos azul-claro com o produto recortado dentro e o nome embaixo.
 * No celular a fileira rola de lado. O círculo sobe um nada no hover, o
 * produto cresce dentro dele.
 */
export function Encontre({ circulos, id = "escolha" }: { circulos: Circulo[]; id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="miolo scroll-mt-24 pt-12 lg:pt-16">
      <h2 id={`${id}-titulo`} className="secao">
        Encontre o que procura
      </h2>
      <ul className="faixa-scroll sangra mt-6 flex gap-5 overflow-x-auto pb-2 sm:gap-8 lg:mx-0 lg:justify-between lg:gap-10 lg:overflow-visible lg:px-0 xl:justify-around">
        {circulos.map((c) => (
          <li key={c.nome} className="w-[38vw] shrink-0 sm:w-[11rem] lg:w-[13rem] xl:w-[14rem]">
            <Link href={c.href} className="group block text-center">
              <span className="relative block aspect-square overflow-hidden rounded-full bg-azul-50 transition-[transform,background-color] duration-300 ease-out group-hover:-translate-y-1 group-hover:bg-azul-100">
                <Image src={c.imagem} alt="" fill sizes="(max-width: 640px) 38vw, (max-width: 1024px) 11rem, 14rem" className="object-contain p-[5%] transition-transform duration-500 ease-out group-hover:scale-[1.06]" />
              </span>
              <span className="mt-4 block text-[1.0625rem] font-semibold text-azul-900 group-hover:text-azul-700">{c.nome}</span>
              {c.nota ? <span className="block text-[0.8125rem] text-tinta-fraca">{c.nota}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
