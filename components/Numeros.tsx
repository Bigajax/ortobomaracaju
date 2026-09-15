/**
 * Os números da loja numa faixa azul: o que a vitrine tem, em quatro
 * batidas, com o número grande em laranja. Nada de prêmio da marca
 * aqui: é a loja falando de si.
 */
export function Numeros({ itens }: { itens: { numero: string; texto: string }[] }) {
  return (
    <section aria-label="A loja em números" className="escuro escuro--azul mt-12 lg:mt-16">
      <ul className="miolo grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-4 lg:py-12">
        {itens.map((i, n) => (
          <li key={i.texto} className={`flex flex-col ${n > 0 ? "lg:border-l lg:border-white/10 lg:pl-8" : ""}`}>
            <span className="manchete text-[clamp(2.25rem,4.5vw,3.5rem)] leading-none text-laranja">{i.numero}</span>
            <span className="mt-2 max-w-[18ch] text-[0.9375rem] leading-snug text-azul-200">{i.texto}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
