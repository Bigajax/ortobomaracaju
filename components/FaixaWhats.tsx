import { Icone } from "./Icones";

/**
 * A faixa azul de destaque, como a do "frete grátis" do site da marca,
 * só que aqui o que a loja tem para prometer é o jeito de comprar:
 * escolhe aqui, manda a mensagem, a loja fecha. Três passos numerados
 * porque é uma sequência de fato.
 */
const PASSOS = [
  { n: "1", texto: "Escolhe o modelo e o tamanho aqui na vitrine" },
  { n: "2", texto: "Manda a mensagem que o botão já monta" },
  { n: "3", texto: "A loja passa o valor, as formas de pagamento e combina a entrega" },
];

export function FaixaWhats({ linkWhats }: { linkWhats: string }) {
  return (
    <section aria-labelledby="titulo-faixa" className="miolo pt-12 lg:pt-16">
      <div className="escuro escuro--azul bloco grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,5fr)_1px_minmax(0,6fr)] lg:items-center lg:gap-12 lg:p-12">
        <div className="flex items-center gap-5">
          <Icone nome="whats" className="h-12 w-12 shrink-0 text-[#25d366] sm:h-14 sm:w-14" />
          <div>
            <h2 id="titulo-faixa" className="manchete text-[clamp(1.5rem,3.2vw,2.25rem)] text-branco">
              Escolheu? Manda no WhatsApp da loja.
            </h2>
            <p className="mt-1 text-[0.9375rem] text-azul-200">Sem cadastro, sem carrinho: quem responde é a loja do Grageru.</p>
          </div>
        </div>

        <div className="hidden h-full bg-white/15 lg:block" aria-hidden="true" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between lg:gap-8">
          <ol className="flex flex-col gap-2.5">
            {PASSOS.map((p) => (
              <li key={p.n} className="flex items-baseline gap-3 text-[0.9375rem] text-branco">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-laranja text-[0.8125rem] font-bold text-branco">{p.n}</span>
                {p.texto}
              </li>
            ))}
          </ol>
          <a href={linkWhats} target="_blank" rel="noreferrer" className="btn btn--whats shrink-0">
            <Icone nome="whats" className="h-[1.125rem] w-[1.125rem]" />
            Chamar agora
          </a>
        </div>
      </div>
    </section>
  );
}
