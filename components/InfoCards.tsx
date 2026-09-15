import Image from "next/image";
import Link from "next/link";

export type InfoCard = {
  titulo: string;
  texto: string;
  acao: string;
  href: string;
  imagem: string;
};

/**
 * "Encontre o que procura": os cartões redondos do site da marca, com a
 * foto ambientada em meia-lua à direita, título, uma linha e o link.
 */
export function InfoCards({ cards, id = "escolha" }: { cards: InfoCard[]; id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="miolo scroll-mt-24 pt-12 lg:pt-16">
      <h2 id={`${id}-titulo`} className="secao">
        Encontre o que procura
      </h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-3 lg:gap-5">
        {cards.map((c) => (
          <li key={c.titulo}>
            <Link href={c.href} className="cartao group flex h-full items-stretch">
              <span className="flex flex-1 flex-col justify-center p-5">
                <span className="block text-[1.125rem] font-bold text-azul-900">{c.titulo}</span>
                <span className="mt-1.5 block text-[0.875rem] leading-snug text-tinta-fraca">{c.texto}</span>
                <span className="btn btn--texto mt-3 justify-start group-hover:underline group-hover:underline-offset-4">{c.acao}</span>
              </span>
              <span className="relative w-[42%] shrink-0 overflow-hidden rounded-l-[999px]">
                <Image src={c.imagem} alt="" fill sizes="(max-width: 768px) 40vw, 14rem" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
