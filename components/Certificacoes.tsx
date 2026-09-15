import Image from "next/image";

/**
 * "Prêmios e certificações recebidas pelo Ortobom": a fila de selos da
 * marca (Inmetro, Top of Mind, Experience Certified...), como no rodapé
 * do site dela. São da Ortobom, não da loja: o título diz isso.
 */
const SELOS = [1, 2, 3, 4, 5, 6, 7, 8];

export function Certificacoes() {
  return (
    <section aria-labelledby="selos-titulo" className="miolo pt-12 lg:pt-16">
      <h2 id="selos-titulo" className="secao text-center">
        Prêmios e certificações recebidas pela Ortobom
      </h2>
      <ul className="faixa-scroll sangra mt-6 flex items-center gap-6 overflow-x-auto pb-2 lg:mx-0 lg:grid lg:grid-cols-8 lg:gap-4 lg:overflow-visible lg:px-0">
        {SELOS.map((n) => (
          <li key={n} className="flex h-20 w-[9.5rem] shrink-0 items-center justify-center lg:w-auto">
            <Image src={`/marca/cert-${n}.webp`} alt="" width={150} height={80} className="h-16 w-auto object-contain" />
          </li>
        ))}
      </ul>
    </section>
  );
}
