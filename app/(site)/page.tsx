import { Banners, type Banner } from "@/components/Banners";
import { Certificacoes } from "@/components/Certificacoes";
import { FaixaWhats } from "@/components/FaixaWhats";
import { Garantias } from "@/components/Garantias";
import { InfoCards } from "@/components/InfoCards";
import { Loja } from "@/components/Loja";
import { Portas } from "@/components/Portas";
import { Prateleira } from "@/components/Prateleira";
import { carregarCatalogo, obterConfig } from "@/lib/dados";
import { linkGeral } from "@/lib/whatsapp";
import { configPadrao, site } from "@/data/site.config";

/**
 * A home no molde do ortobom.com.br: banners, a faixa de benefícios,
 * as portas com os tiles da marca, as prateleiras por categoria (uma
 * linha cada, com o "tem mais"), os cartões redondos, a loja física, a
 * faixa do WhatsApp e os selos. Tudo montado do catálogo colhido do
 * site da marca; as fotos dos banners são as ambientadas dos destaques.
 */
export default async function Home() {
  const [{ categorias, produtos, hero }, config] = await Promise.all([carregarCatalogo(), obterConfig()]);

  const whats = linkGeral(config.whatsapp);
  const ativos = produtos.filter((p) => p.ativo);
  const ativas = categorias.filter((c) => c.ativo);
  const porSlug = new Map(ativas.map((c) => [c.slug, c]));
  const da = (slug: string) => ativos.filter((p) => p.categoria_slug === slug).sort((a, b) => a.ordem - b.ordem);
  const peca = (slug: string) => ativos.find((p) => p.slug === slug) ?? null;

  const destaques = hero
    .map((h) => ativos.find((p) => p.slug === h.slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  /* as prateleiras lideram com o que NÃO está nos destaques, para a home não repetir foto */
  const inedito = (lista: typeof ativos) => [...lista.filter((p) => !destaques.includes(p)), ...lista.filter((p) => destaques.includes(p))];
  const colchoes = inedito(da("colchoes"));
  const travesseiros = inedito(da("travesseiros"));
  const bases = inedito(da("bases"));
  const cabeceiras = inedito(da("cabeceiras"));

  const frase = config.frase_hero || configPadrao.frase_hero;
  const fotoDe = (slug: string, n = 0) => peca(slug)?.imagens[n] ?? destaques[0]?.imagens[0];
  const banners: Banner[] = [
    {
      etiqueta: "Loja Ortobom em Aracaju",
      titulo: frase,
      texto: `Colchões de molas e espuma, bases, cabeceiras e travesseiros Ortobom, com ${colchoes.length} modelos de colchão em todos os tamanhos. Escolha aqui e feche pelo WhatsApp.`,
      acao: { rotulo: "Ver os colchões", href: "/catalogo/colchoes" },
      segunda: { rotulo: "Pedir no WhatsApp", href: whats, externa: true },
      imagem: fotoDe("colchao-pro-saude-nanolastic")!,
    },
    {
      etiqueta: "Qual colchão é o seu?",
      titulo: "Firme, macio ou híbrido: a ficha de cada modelo diz.",
      texto: "Nível de conforto, tipo de mola ou espuma, altura e peso suportado: tudo que a Ortobom informa está na página de cada colchão, para você comparar antes de vir deitar na loja.",
      acao: { rotulo: "Comparar os modelos", href: "/catalogo/colchoes" },
      segunda: { rotulo: "Ver por tamanho", href: "/catalogo/colchoes?tamanho=Casal" },
      imagem: fotoDe("colchao-liberty")!,
      escuro: true,
    },
    {
      etiqueta: "Complete o quarto",
      titulo: "Base e cabeceira no tamanho do seu colchão.",
      texto: `${bases.length} bases e ${cabeceiras.length} cabeceiras, em corino, linho, veludo e nobuck, do solteiro ao king. A loja monta o conjunto com você.`,
      acao: { rotulo: "Ver as bases", href: "/catalogo/bases" },
      segunda: { rotulo: "Ver as cabeceiras", href: "/catalogo/cabeceiras" },
      imagem: fotoDe("colchao-absolut-hybrid")!,
    },
  ].filter((b) => b.imagem);

  return (
    <>
      <Banners banners={banners} />

      <Garantias />

      <Portas
        portas={[
          { nome: "Colchões", href: "/catalogo/colchoes", imagem: "/marca/cat-colchoes.png", nota: `${colchoes.length} modelos` },
          { nome: "Bases", href: "/catalogo/bases", imagem: "/marca/cat-bases.png", nota: `${bases.length} opções` },
          { nome: "Cabeceiras", href: "/catalogo/cabeceiras", imagem: "/marca/cat-cabeceiras.png", nota: `${cabeceiras.length} opções` },
          { nome: "Travesseiros", href: "/catalogo/travesseiros", imagem: "/marca/cat-travesseiros.png", nota: `${travesseiros.length} modelos` },
        ]}
      />

      <Prateleira id="destaques" titulo="Os mais procurados" subtitulo="A seleção da loja: os colchões que mais saem em Aracaju." href="/catalogo" verTudo="Ver o catálogo" produtos={destaques} categorias={porSlug} prioridade total={ativos.length} nomeDaPorta="produtos" />

      <InfoCards
        cards={[
          { titulo: "Qual colchão é o seu?", texto: "Do conforto das molas à sofisticação das espumas, o seu sono perfeito começa aqui.", acao: "Escolha o seu", href: "/catalogo/colchoes", imagem: "/marca/round-2.webp" },
          { titulo: "Bases", texto: "Estilo e funcionalidade se unem na linha de bases para cama.", acao: "Confira as opções", href: "/catalogo/bases", imagem: "/marca/round-1.webp" },
          { titulo: "Cabeceiras", texto: "Cabeceiras que combinam com o seu estilo e com o conforto do seu quarto.", acao: "Clique e descubra", href: "/catalogo/cabeceiras", imagem: "/marca/round-3.webp" },
        ]}
      />

      <Prateleira id="colchoes" titulo="Colchões" subtitulo="Molas ensacadas, Nanolastic, espuma e ortopédico, do solteiro ao king." href="/catalogo/colchoes" verTudo={`Ver os ${colchoes.length}`} produtos={colchoes} categorias={porSlug} nomeDaPorta="colchões" />

      <Prateleira id="travesseiros" titulo="Travesseiros" subtitulo="Látex, visco, pluma e fibra." href="/catalogo/travesseiros" verTudo={`Ver os ${travesseiros.length}`} produtos={travesseiros} categorias={porSlug} nomeDaPorta="travesseiros" />

      <Prateleira id="bases" titulo="Bases" subtitulo="Planas, baú e articuladas, em corino, linho, nobuck e malha." href="/catalogo/bases" verTudo={`Ver as ${bases.length}`} produtos={bases} categorias={porSlug} nomeDaPorta="bases" feminino />

      <Prateleira id="cabeceiras" titulo="Cabeceiras" subtitulo="Linho, veludo, corino e facto, em várias cores." href="/catalogo/cabeceiras" verTudo={`Ver as ${cabeceiras.length}`} produtos={cabeceiras} categorias={porSlug} nomeDaPorta="cabeceiras" feminino />

      <Loja linkWhats={whats} horario={config.horario} />

      <FaixaWhats linkWhats={whats} />

      <Certificacoes />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: "Ortobom Aracaju",
            brand: { "@type": "Brand", name: "Ortobom" },
            telephone: "+55 79 99160-4707",
            url: site.url,
            address: {
              "@type": "PostalAddress",
              streetAddress: "Av. Pres. Tancredo Neves, 746",
              addressLocality: "Aracaju",
              addressRegion: "SE",
              postalCode: "49040-500",
              addressCountry: "BR",
            },
          }),
        }}
      />
    </>
  );
}
