import { Icone } from "./Icones";
import { site } from "@/data/site.config";

/**
 * A loja física: o bloco que o site da marca não tem para esta loja
 * (ela não está no mapa de lojas da Ortobom). Endereço, como chegar,
 * horário quando a loja passar, e o WhatsApp grande. Fundo azul 50.
 */
export function Loja({ linkWhats, horario }: { linkWhats: string; horario?: string }) {
  return (
    <section id="loja" aria-labelledby="loja-titulo" className="mt-12 scroll-mt-24 bg-azul-50 lg:mt-16">
      <div className="miolo grid gap-8 py-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:py-14">
        <div>
          <p className="etiqueta">Loja franqueada Ortobom</p>
          <h2 id="loja-titulo" className="secao mt-2">
            Venha deitar antes de escolher
          </h2>
          <p className="falada mt-3 max-w-[52ch] text-[1.0625rem] text-tinta-fraca">
            A loja fica no Grageru, em Aracaju. Você pode testar o colchão pessoalmente, ou escolher aqui e combinar tudo pelo WhatsApp: valor, forma de pagamento, retirada na loja ou entrega.
          </p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <Icone nome="pino" className="mt-0.5 h-6 w-6 shrink-0 text-azul-700" peso={1.4} />
              <div>
                <dt className="text-[0.8125rem] font-semibold uppercase tracking-[0.04em] text-tinta-fraca">Endereço</dt>
                <dd className="mt-0.5 text-[0.9375rem] text-tinta">{site.endereco}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Icone nome="conversa" className="mt-0.5 h-6 w-6 shrink-0 text-azul-700" peso={1.4} />
              <div>
                <dt className="text-[0.8125rem] font-semibold uppercase tracking-[0.04em] text-tinta-fraca">WhatsApp</dt>
                <dd className="mt-0.5 text-[0.9375rem] text-tinta">(79) 99160-4707</dd>
              </div>
            </div>
            {horario ? (
              <div className="flex gap-3 sm:col-span-2">
                <Icone nome="loja" className="mt-0.5 h-6 w-6 shrink-0 text-azul-700" peso={1.4} />
                <div>
                  <dt className="text-[0.8125rem] font-semibold uppercase tracking-[0.04em] text-tinta-fraca">Horário</dt>
                  <dd className="mt-0.5 text-[0.9375rem] text-tinta">{horario}</dd>
                </div>
              </div>
            ) : null}
          </dl>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href={linkWhats} target="_blank" rel="noreferrer" className="btn btn--whats">
              <Icone nome="whats" className="h-[1.125rem] w-[1.125rem]" />
              Falar com a loja
            </a>
            <a href={site.maps} target="_blank" rel="noreferrer" className="btn btn--linha">
              Como chegar
            </a>
          </div>
        </div>
        <div className="cartao overflow-hidden">
          <iframe
            title="Mapa: Ortobom Aracaju, Av. Pres. Tancredo Neves, 746"
            src={`https://www.google.com/maps?q=${encodeURIComponent(`Av. Pres. Tancredo Neves, 746 - Grageru, Aracaju - SE, 49040-500`)}&output=embed`}
            width="100%"
            height="320"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block w-full"
          />
        </div>
      </div>
    </section>
  );
}
