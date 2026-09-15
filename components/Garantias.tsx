import { Icone, type NomeIcone } from "./Icones";

/**
 * A faixa de benefícios logo abaixo do banner, como a do site da marca:
 * quatro itens com ícone de linha, o que é em negrito e uma linha
 * explicando, separados por fios. Só o que a loja de Aracaju cumpre:
 * nada de "todo o Brasil", nada de "21x" sem a loja confirmar.
 */
const ITENS: { icone: NomeIcone; titulo: string; texto: string }[] = [
  { icone: "loja", titulo: "Venha deitar antes", texto: "loja no Grageru: Av. Tancredo Neves, 746" },
  { icone: "conversa", titulo: "Fala com gente de verdade", texto: "orçamento no WhatsApp, sem cadastro" },
  { icone: "caminhao", titulo: "Entrega combinada", texto: "retirada na loja ou entrega em Aracaju" },
  { icone: "garantia", titulo: "Garantia Ortobom", texto: "produto original, com a garantia da marca" },
];

export function Garantias() {
  return (
    <section aria-label="Como a loja funciona" className="border-b border-linha">
      <ul className="miolo faixa-scroll flex gap-6 overflow-x-auto py-5 lg:grid lg:grid-cols-4 lg:gap-0 lg:overflow-visible lg:py-6">
        {ITENS.map((i, n) => (
          <li key={i.titulo} className={`flex shrink-0 items-center gap-3 lg:justify-center ${n > 0 ? "lg:border-l lg:border-linha" : ""}`}>
            <Icone nome={i.icone} className="h-8 w-8 shrink-0 text-azul-700" peso={1.4} />
            <span className="min-w-0">
              <span className="block text-[0.9375rem] font-semibold text-azul-900">{i.titulo}</span>
              <span className="block whitespace-nowrap text-[0.8125rem] text-tinta-fraca">{i.texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
