import Link from "next/link";
import { CardProduto } from "./CardProduto";
import type { Categoria, Produto } from "@/lib/tipos";

/**
 * Uma prateleira da home: título com o caminho para ver tudo e uma
 * amostra curta dos produtos, quatro cartões e o fecho, numa linha de
 * cinco no desktop e num trilho que rola de lado no celular. A home não
 * é o catálogo: mostra poucos e fecha a fila com um cartão azul que diz
 * quantos faltam e leva para a categoria inteira.
 */
export function Prateleira({
  id,
  titulo,
  href,
  verTudo,
  produtos,
  categorias,
  prioridade = false,
  limite = 4,
  total,
  nomeDaPorta,
  feminino = false,
  subtitulo,
}: {
  id: string;
  titulo: string;
  href: string;
  verTudo: string;
  produtos: Produto[];
  categorias: Map<string, Categoria>;
  prioridade?: boolean;
  limite?: number;
  /** quantos existem ao todo, quando a lista recebida não é o total */
  total?: number;
  /** o que sobra, no plural: "colchões", "bases", "travesseiros" */
  nomeDaPorta?: string;
  feminino?: boolean;
  subtitulo?: string;
}) {
  if (!produtos.length) return null;

  const amostra = produtos.slice(0, limite);
  const todos = total ?? produtos.length;
  const restantes = todos - amostra.length;
  const fecho = restantes > 0 ? <CardVerMais href={href} restantes={restantes} total={todos} nome={nomeDaPorta ?? titulo.toLowerCase()} feminino={feminino} /> : null;
  const largura = "w-[70vw] shrink-0 sm:w-[16rem] lg:w-auto";

  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="miolo scroll-mt-24 pt-12 lg:pt-16">
      <div className="regua">
        <div>
          <h2 id={`${id}-titulo`} className="secao">
            {titulo}
          </h2>
          {subtitulo ? <p className="mt-1 text-[0.9375rem] text-tinta-fraca">{subtitulo}</p> : null}
        </div>
        <Link href={href} className="btn btn--texto shrink-0">
          {verTudo}
        </Link>
      </div>
      <ul className="faixa-scroll sangra mt-4 flex gap-3 overflow-x-auto pb-2 sm:gap-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0">
        {amostra.map((p, i) => (
          <li key={p.id} className={largura}>
            <CardProduto produto={p} categoria={categorias.get(p.categoria_slug ?? "")} prioridade={prioridade && i < 2} tamanhos="(max-width: 640px) 70vw, (max-width: 1024px) 16rem, 18vw" />
          </li>
        ))}
        {fecho ? <li className={largura}>{fecho}</li> : null}
      </ul>
    </section>
  );
}

/**
 * O fecho da prateleira: um cartão azul do tamanho dos outros, com o
 * número do que ficou de fora e o botão que leva para a categoria.
 */
function CardVerMais({ href, restantes, total, nome, feminino }: { href: string; restantes: number; total: number; nome: string; feminino: boolean }) {
  return (
    <Link href={href} className="escuro escuro--azul bloco group flex h-full flex-col justify-between p-5 sm:p-6">
      <span className="etiqueta">Tem mais</span>
      <span className="my-auto block">
        <span className="manchete block text-[clamp(2.5rem,4vw,3.5rem)] leading-none text-branco">+{restantes}</span>
        <span className="mt-3 block text-[0.9375rem] text-azul-200">
          {nome} além {feminino ? (restantes === 1 ? "desta" : "destas") : restantes === 1 ? "deste" : "destes"}.<br />
          {total} ao todo no catálogo.
        </span>
      </span>
      <span className="btn btn--branco w-full">Ver {total === 1 ? "tudo" : `${feminino ? "as" : "os"} ${total}`}</span>
    </Link>
  );
}
