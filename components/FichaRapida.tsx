import { Icone, type NomeIcone } from "./Icones";
import type { Produto } from "@/lib/tipos";

const NIVEIS = ["Macio", "Médio", "Firme"];

/**
 * A ficha rápida da peça, logo abaixo do nome: o que decide a compra em
 * quatro ou cinco chips (a mola ou a espuma, a densidade, o peso que
 * aguenta, o revestimento) e, quando a ficha diz o conforto, a escala
 * desenhada de macio a firme com o ponto aceso. É o número mostrado,
 * não descrito: quem lê já sabe onde o colchão fica.
 */
export function FichaRapida({ produto }: { produto: Produto }) {
  const atributos = produto.atributos ?? [];
  const pega = (chave: RegExp) => atributos.find((a) => chave.test(a.chave) && a.valor.length <= 28 && a.valor !== "-")?.valor ?? null;

  const conforto = pega(/conforto/i);
  const chips: { icone: NomeIcone; rotulo: string; valor: string }[] = [
    { icone: "colchao", rotulo: "Mola", valor: pega(/^tipos? de mola/i) },
    { icone: "colchao", rotulo: "Espuma", valor: pega(/^tipo de espuma$/i) },
    { icone: "etiqueta", rotulo: "Tecnologia", valor: pega(/^tecnologia$/i) },
    { icone: "regua", rotulo: "Densidade", valor: pega(/^densidade$/i) },
    { icone: "garantia", rotulo: "Aguenta", valor: pega(/peso suportado/i) },
    { icone: "cabeceira", rotulo: "Revestimento", valor: pega(/^revestimento$/i) },
    { icone: "base", rotulo: "Estilo", valor: pega(/^estilo$/i) },
    { icone: "travesseiro", rotulo: "Material", valor: pega(/^material$/i) },
    { icone: "regua", rotulo: "Pés", valor: pega(/altura dos pés/i) },
  ].filter((c): c is { icone: NomeIcone; rotulo: string; valor: string } => Boolean(c.valor)).slice(0, 5);

  if (!conforto && !chips.length) return null;

  const indice = conforto ? NIVEIS.findIndex((n) => n.localeCompare(conforto, "pt-BR", { sensitivity: "base" }) === 0) : -1;
  const hibrido = conforto ? /h[ií]brido|intermedi/i.test(conforto) : false;
  const nivel = indice >= 0 ? indice : hibrido ? 1 : -1;

  return (
    <div className="mt-5 space-y-4">
      {conforto ? (
        <div className="escala" role="img" aria-label={`Nível de conforto: ${conforto}`}>
          <span className="escala-rotulo">Conforto</span>
          <span className="escala-trilho" aria-hidden="true">
            {NIVEIS.map((n, i) => (
              <span key={n} className={`escala-passo ${i === nivel ? "escala-passo--on" : ""}`}>
                {n}
              </span>
            ))}
          </span>
          <span className="escala-valor">{conforto}</span>
        </div>
      ) : null}

      {chips.length ? (
        <ul className="flex flex-wrap gap-2" aria-label="Ficha rápida">
          {chips.map((c) => (
            <li key={c.rotulo} className="ficha-chip">
              <Icone nome={c.icone} className="h-4 w-4 shrink-0 text-laranja" peso={1.6} />
              <span className="text-tinta-fraca">{c.rotulo}</span>
              <span className="font-semibold text-azul-900">{c.valor}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
