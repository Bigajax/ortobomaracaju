import Link from "next/link";
import { Logo, MarcaEstudio } from "./Marca";
import { Icone } from "./Icones";
import { PREVIA, site } from "@/data/site.config";
import type { Categoria } from "@/lib/tipos";

/**
 * O rodapé azul 950 em colunas, como o do site da marca: a loja, o
 * catálogo, a Ortobom (garantia, manual do sono, SAC) e o atendimento.
 * No celular cada coluna vira uma sanfona (details, sem JS). A faixa de
 * baixo diz que a loja é franqueada e leva a assinatura do estúdio.
 */
function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <>
      <details className="rodape-sanfona border-t border-white/10 sm:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[0.9375rem] font-semibold text-branco [&::-webkit-details-marker]:hidden">
          {titulo}
          <Icone nome="seta" className="rodape-seta h-4 w-4 text-azul-300" />
        </summary>
        <div className="pb-5">{children}</div>
      </details>
      <div className="hidden sm:block">
        <h2 className="text-[0.9375rem] font-semibold text-branco">{titulo}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </>
  );
}

const LINKS_ORTOBOM = [
  { nome: "Garantia dos produtos", href: "https://www.ortobom.com.br/Content/Garantia" },
  { nome: "Manual do sono", href: "https://www.ortobom.com.br/i/manual-do-sono" },
  { nome: "Como escolher o colchão ideal", href: "https://www.ortobom.com.br/3-passos-escolher-colchao-ideal" },
  { nome: "SAC Ortobom: 0800 285 5011", href: "https://ortobom.custhelp.com/" },
];

export function Rodape({
  linkWhats,
  instagram,
  categorias = [],
  horario,
}: {
  linkWhats: string;
  instagram?: string;
  categorias?: Categoria[];
  horario?: string;
}) {
  return (
    <footer className="escuro mt-16 lg:mt-20">
      <div className="miolo grid gap-0 py-10 sm:grid-cols-2 sm:gap-10 sm:py-12 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-8 lg:py-16">
        <div className="pb-8 sm:pb-0">
          <Link href="/" aria-label="Ortobom Aracaju, página inicial" className="inline-flex items-center gap-3">
            <Logo className="h-[1.5rem] w-auto" />
            <span className="border-l border-white/20 pl-3 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-azul-300">Aracaju</span>
          </Link>
          <p className="mt-4 max-w-[34ch] text-[0.9375rem] text-azul-200">{site.posicionamento}. Loja franqueada, no Grageru.</p>
          <a href={linkWhats} target="_blank" rel="noreferrer" className="btn btn--whats mt-5">
            <Icone nome="whats" className="h-[1.125rem] w-[1.125rem]" />
            (79) 99160-4707
          </a>
        </div>

        <Bloco titulo="Catálogo">
          <ul className="flex flex-col gap-2 text-[0.9375rem]">
            <li>
              <Link href="/catalogo" className="text-azul-200 hover:text-branco">
                Tudo
              </Link>
            </li>
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalogo/${c.slug}`} className="text-azul-200 hover:text-branco">
                  {c.nome}
                </Link>
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco titulo="A loja">
          <ul className="flex flex-col gap-2 text-[0.9375rem] text-azul-200">
            <li>{site.endereco}</li>
            {horario ? <li>{horario}</li> : null}
            <li>
              <a href={site.maps} target="_blank" rel="noreferrer" className="hover:text-branco">
                Como chegar
              </a>
            </li>
            {instagram ? (
              <li>
                <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer" className="hover:text-branco">
                  @{instagram}
                </a>
              </li>
            ) : null}
          </ul>
        </Bloco>

        <Bloco titulo="Ortobom">
          <ul className="flex flex-col gap-2 text-[0.9375rem]">
            {LINKS_ORTOBOM.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noreferrer" className="text-azul-200 hover:text-branco">
                  {l.nome}
                </a>
              </li>
            ))}
          </ul>
        </Bloco>
      </div>

      <div className="border-t border-white/10">
        <div className="miolo flex flex-col items-center gap-4 py-5 text-center sm:px-6 lg:flex-row lg:justify-between lg:text-left">
          <p className="text-[0.8125rem] text-azul-300">
            © {new Date().getFullYear()} Ortobom Aracaju, loja franqueada. Ortobom é marca registrada da Ortobom; fotos e informações dos produtos são da marca. {PREVIA ? "Prévia da vitrine, ainda não é a loja." : ""}
          </p>
          <a
            href="https://rafaelrazeira.com.br/landing-page"
            target="_blank"
            rel="noreferrer"
            aria-label="Vitrine feita por Rafael Razeira Estúdio"
            className="flex items-center gap-3 text-azul-300 transition-colors hover:text-branco"
          >
            <span className="text-[0.75rem]">vitrine por</span>
            <MarcaEstudio altura={36} />
          </a>
        </div>
      </div>
    </footer>
  );
}
