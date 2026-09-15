import Image from "next/image";
import Link from "next/link";
import { Icone } from "./Icones";
import { precoBRL } from "@/lib/formato";
import { nomeDoTamanho, temDesconto } from "@/lib/filtro";
import { linkPeca } from "@/lib/whatsapp";
import type { Categoria, Produto } from "@/lib/tipos";

/**
 * O card de produto no molde do site da marca: foto quadrada em fundo
 * branco, tag verde com a tecnologia (Nanolastic, Superpocket...), nome,
 * a linha dos tamanhos e o botão "Pedir no WhatsApp", que já leva a
 * mensagem montada com o produto. Sem preço, o card não inventa: é a
 * loja que passa o valor na conversa.
 */
export function CardProduto({
  produto,
  categoria,
  prioridade = false,
  tamanhos = "(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw",
}: {
  produto: Produto;
  categoria?: Categoria | null;
  prioridade?: boolean;
  tamanhos?: string;
}) {
  const capa = produto.imagens[0];
  const promo = temDesconto(produto);
  const cheio = precoBRL(produto.preco);
  const vigenteNumero = produto.preco_promocional ?? produto.preco;
  const vigente = precoBRL(vigenteNumero);
  const href = `/produto/${produto.slug}`;
  const pedir = linkPeca(produto, { preco: vigenteNumero ?? null });
  const tecnologia = produto.atributos?.find((a) => /^tipos? de mola|^tecnologia$|^tipo de espuma$/i.test(a.chave))?.valor;
  const medidas = [...new Set(produto.tamanhos.map(nomeDoTamanho))];

  return (
    <article className="cartao group flex h-full flex-col">
      <Link href={href} className="foto block aspect-square rounded-b-none" aria-label={produto.nome}>
        {tecnologia ? <span className="tag tag--verde absolute left-3 top-3 z-[1]">{tecnologia}</span> : null}
        {capa ? (
          <Image
            src={capa.url}
            alt={capa.alt ?? produto.nome}
            fill
            sizes={tamanhos}
            placeholder={capa.blur ? "blur" : "empty"}
            blurDataURL={capa.blur ?? undefined}
            priority={prioridade}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col border-t border-linha px-4 pb-4 pt-3">
        {categoria ? <p className="etiqueta">{categoria.nome}</p> : null}
        {/* o nome reserva sempre duas linhas e os tamanhos uma, para os
            cards da mesma fila fecharem retos, com o botão na mesma altura */}
        <h3 className="titulo-cartao mt-1 line-clamp-2 min-h-[2.7em] text-tinta">
          <Link href={href} className="hover:text-azul-700">
            {produto.nome}
          </Link>
        </h3>
        <p className="mt-1 min-h-[1.25rem] truncate text-[0.8125rem] text-tinta-fraca" title={medidas.join(", ")}>
          {medidas.slice(0, 3).join(", ")}
          {medidas.length > 3 ? <span className="font-semibold text-azul-700"> +{medidas.length - 3}</span> : null}
        </p>

        {vigente ? (
          <p className="mt-3 flex items-baseline gap-2">
            {promo && cheio ? <span className="text-[0.8125rem] text-tinta-fraca line-through">{cheio}</span> : null}
            <span className="preco text-[1.25rem] text-azul-900">{vigente}</span>
          </p>
        ) : (
          <p className="mt-3 text-[0.875rem] font-medium text-azul-700">Consulte o valor no WhatsApp</p>
        )}

        <div className="mt-auto pt-4">
          <a href={pedir} target="_blank" rel="noreferrer" className="btn btn--azul btn--pequeno w-full">
            <Icone nome="whats" className="h-[1.125rem] w-[1.125rem]" />
            Pedir no WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
