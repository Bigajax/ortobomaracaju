import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CabecalhoCatalogo } from "@/components/CabecalhoCatalogo";
import { Catalogo } from "@/components/Catalogo";
import { carregarCatalogo, obterConfig } from "@/lib/dados";
import { tamanhosDisponiveis } from "@/lib/filtro";
import { GRUPOS } from "@/lib/grupos";
import { linkGeral } from "@/lib/whatsapp";

type Props = { params: Promise<{ categoria: string }>; searchParams?: Promise<{ busca?: string; tamanho?: string }> };

/* a linha de apresentação e o tile de cada porta */
const PORTAS: Record<string, { texto: string; unidade: [string, string]; imagem: string }> = {
  colchoes: { texto: "De molas ensacadas, Nanolastic, espuma e ortopédico, do solteiro ao king. Escolha o tamanho, veja a ficha e peça pelo WhatsApp: a loja responde com o valor.", unidade: ["modelo", "modelos"], imagem: "/marca/cat-colchoes.png" },
  bases: { texto: "Planas e baú, em corino, linho, nobuck e malha, no tamanho do seu colchão. A loja monta o conjunto com você.", unidade: ["opção", "opções"], imagem: "/marca/cat-bases.png" },
  cabeceiras: { texto: "Linho, veludo, corino e facto, em várias cores, para fechar o quarto. Escolha a sua e peça pelo WhatsApp.", unidade: ["opção", "opções"], imagem: "/marca/cat-cabeceiras.png" },
  travesseiros: { texto: "Látex, visco, pluma e fibra: macio, médio ou firme, o par certo para o seu colchão.", unidade: ["modelo", "modelos"], imagem: "/marca/cat-travesseiros.png" },
};

/* uma porta pode ser uma categoria do catálogo ou um grupo delas */
async function resolver(slug: string) {
  const { categorias, produtos } = await carregarCatalogo();
  const grupo = GRUPOS[slug];
  const atual = categorias.find((c) => c.slug === slug);
  if (!grupo && !atual) return null;
  const escopo = grupo ? grupo.categorias : [slug];
  const pecas = produtos.filter((p) => p.ativo && escopo.includes(p.categoria_slug ?? ""));
  return { nome: grupo?.nome ?? atual!.nome, escopo, pecas, categorias: categorias.filter((c) => c.ativo), grupo: Boolean(grupo) };
}

export async function generateStaticParams() {
  const { categorias } = await carregarCatalogo();
  return [...categorias.map((c) => ({ categoria: c.slug })), ...Object.keys(GRUPOS).map((categoria) => ({ categoria }))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const r = await resolver(categoria);
  if (!r) return {};
  const quantas = r.pecas.length;
  return {
    title: r.nome,
    description: `${r.nome} Ortobom na loja de Aracaju: ${quantas} ${quantas === 1 ? "modelo" : "modelos"}. Escolha o tamanho e peça pelo WhatsApp.`,
    alternates: { canonical: `/catalogo/${categoria}` },
  };
}

export default async function PaginaCategoria({ params, searchParams }: Props) {
  const { categoria } = await params;
  const sp = (await searchParams) ?? {};
  const [r, config] = await Promise.all([resolver(categoria), obterConfig()]);
  if (!r) notFound();

  const porta = PORTAS[categoria] ?? { texto: "Escolha o modelo e o tamanho e peça pelo WhatsApp: a loja responde com o valor.", unidade: ["modelo", "modelos"] as [string, string], imagem: "/marca/cat-colchoes.png" };
  /* os atalhos de tamanho só fazem sentido onde o tamanho é o eixo (colchões, bases) */
  const tamanhos = categoria === "colchoes" || categoria === "bases" ? tamanhosDisponiveis(r.pecas).filter((t) => !/berço|berco|infantil|baby/i.test(t)) : [];

  return (
    <>
      <CabecalhoCatalogo titulo={r.nome} texto={porta.texto} total={r.pecas.length} unidade={porta.unidade} imagens={[porta.imagem]} tamanhos={tamanhos} tamanhoAtual={sp.tamanho ?? ""} base={`/catalogo/${categoria}`} />
      <Catalogo produtos={r.pecas} categorias={r.categorias} categoriaAtual={r.grupo ? undefined : categoria} escopoFechado buscaInicial={sp.busca ?? ""} tamanhoInicial={sp.tamanho ?? ""} linkWhats={linkGeral(config.whatsapp)} />
    </>
  );
}
