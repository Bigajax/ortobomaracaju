import type { Metadata } from "next";
import { CabecalhoCatalogo } from "@/components/CabecalhoCatalogo";
import { Catalogo } from "@/components/Catalogo";
import { carregarCatalogo, obterConfig } from "@/lib/dados";
import { linkGeral } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Colchões, bases, cabeceiras e travesseiros Ortobom na loja de Aracaju. Escolha o modelo e o tamanho e peça pelo WhatsApp.",
  alternates: { canonical: "/catalogo" },
};

export default async function PaginaCatalogo({ searchParams }: { searchParams: Promise<{ busca?: string; tamanho?: string }> }) {
  const [{ categorias, produtos }, config, sp] = await Promise.all([carregarCatalogo(), obterConfig(), searchParams]);

  const pecas = produtos.filter((p) => p.ativo);
  const categoriasDaLoja = categorias.filter((c) => c.ativo);
  const conta = (slug: string) => pecas.filter((p) => p.categoria_slug === slug).length;

  return (
    <>
      <CabecalhoCatalogo
        titulo="Catálogo"
        texto={`${conta("colchoes")} colchões, ${conta("bases")} bases, ${conta("cabeceiras")} cabeceiras e ${conta("travesseiros")} travesseiros Ortobom. Escolha o modelo e o tamanho e peça pelo WhatsApp: a loja responde com o valor.`}
        total={pecas.length}
        unidade={["produto", "produtos"]}
        imagens={["/marca/cat-colchoes.png", "/marca/cat-bases.png", "/marca/cat-cabeceiras.png", "/marca/cat-travesseiros.png"]}
        base="/catalogo"
      />
      <Catalogo produtos={pecas} categorias={categoriasDaLoja} buscaInicial={sp.busca ?? ""} tamanhoInicial={sp.tamanho ?? ""} linkWhats={linkGeral(config.whatsapp)} />
    </>
  );
}
