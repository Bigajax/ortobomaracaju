import Link from "next/link";
import { Icone, type NomeIcone } from "./Icones";

/**
 * A faixa de benefícios logo abaixo do banner, só que aqui ela é uma
 * placa branca que sobe por cima do pé do hero, como um balcão à frente
 * da vitrine. Quatro itens, cada um um link para onde a promessa se
 * cumpre (a loja, o WhatsApp, a garantia da marca); o ícone senta num
 * círculo azul-claro que acende de laranja no hover. Só o que a loja de
 * Aracaju cumpre: nada de "todo o Brasil", nada de "21x" sem a loja
 * confirmar.
 */
const ITENS: { icone: NomeIcone; titulo: string; texto: string; href: string; externa?: boolean }[] = [
  { icone: "loja", titulo: "Venha deitar antes", texto: "loja no Grageru: Av. Tancredo Neves, 746", href: "/#loja" },
  { icone: "conversa", titulo: "Fala com gente de verdade", texto: "orçamento no WhatsApp, sem cadastro", href: "", externa: true },
  { icone: "caminhao", titulo: "Entrega combinada", texto: "retirada na loja ou entrega em Aracaju", href: "/#loja" },
  { icone: "garantia", titulo: "Garantia Ortobom", texto: "produto original, com a garantia da marca", href: "https://www.ortobom.com.br/Content/Garantia", externa: true },
];

export function Garantias({ linkWhats }: { linkWhats: string }) {
  return (
    <section aria-label="Como a loja funciona" className="miolo relative z-10 lg:-mt-9">
      <ul className="garantias sangra faixa-scroll lg:mx-0">
        {ITENS.map((i) => {
          const href = i.href || linkWhats;
          const conteudo = (
            <>
              <span className="garantia-icone">
                <Icone nome={i.icone} className="h-7 w-7" peso={1.4} />
              </span>
              <span className="min-w-0">
                <span className="garantia-titulo">{i.titulo}</span>
                <span className="block text-[0.8125rem] leading-snug text-tinta-fraca">{i.texto}</span>
              </span>
            </>
          );
          return (
            <li key={i.titulo}>
              {i.externa ? (
                <a href={href} target="_blank" rel="noreferrer" className="garantia">
                  {conteudo}
                </a>
              ) : (
                <Link href={href} className="garantia">
                  {conteudo}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
