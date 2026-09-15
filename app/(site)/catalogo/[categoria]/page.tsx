import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalogo } from "@/components/Catalogo";
import { carregarCatalogo, obterConfig } from "@/lib/dados";
import { GRUPOS } from "@/lib/grupos";
import { linkGeral } from "@/lib/whatsapp";

type Props = { params: Promise<{ categoria: string }>; searchParams?: Promise<{ busca?: string; tamanho?: string }> };

/* uma porta pode ser uma categoria do catálogo ou um grupo delas (Roupas) */
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

  const quantas = r.pecas.length;

  return (
    <>
      <header className="miolo pb-6 pt-8 lg:pb-8 lg:pt-12">
        <p className="etiqueta">Ortobom Aracaju</p>
        <h1 className="manchete mt-2 text-[clamp(1.75rem,4vw,2.5rem)] text-azul-900">{r.nome}</h1>
        <p className="falada mt-2 text-[1.0625rem] text-tinta-fraca">
          {quantas} {quantas === 1 ? "modelo" : "modelos"}. Escolha o tamanho na página de cada um e peça pelo WhatsApp.
        </p>
      </header>
      <Catalogo produtos={r.pecas} categorias={r.categorias} categoriaAtual={r.grupo ? undefined : categoria} escopoFechado buscaInicial={sp.busca ?? ""} tamanhoInicial={sp.tamanho ?? ""} linkWhats={linkGeral(config.whatsapp)} />
    </>
  );
}
