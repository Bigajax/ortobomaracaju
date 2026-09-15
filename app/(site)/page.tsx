import { Banners, type Banner } from "@/components/Banners";
import { Certificacoes } from "@/components/Certificacoes";
import { ConfortoAbas, type AbaConforto } from "@/components/ConfortoAbas";
import { Encontre } from "@/components/Encontre";
import { FaixaWhats } from "@/components/FaixaWhats";
import { Garantias } from "@/components/Garantias";
import { Loja } from "@/components/Loja";
import { Numeros } from "@/components/Numeros";
import { Prateleira } from "@/components/Prateleira";
import { carregarCatalogo, obterConfig } from "@/lib/dados";
import { nomeDoTamanho } from "@/lib/filtro";
import { linkGeral } from "@/lib/whatsapp";
import { configPadrao, site } from "@/data/site.config";

/* quantos cards cada aba do "Conforto em outro nível" leva para a home */
const POR_ABA = 8;

/**
 * A home no molde do ortobom.com.br: os banners de campanha, a faixa de
 * benefícios, os círculos "Encontre o que procura", as abas "Conforto em
 * outro nível" (uma categoria por vez, com esqueleto na troca), os mais
 * procurados, os números da loja, a loja física, a faixa do WhatsApp e
 * os selos. Tudo montado do catálogo colhido do site da marca; as fotos
 * dos banners são as ambientadas dos destaques.
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

  /* as abas lideram com o que NÃO está nos destaques, para a home não repetir foto */
  const inedito = (lista: typeof ativos) => [...lista.filter((p) => !destaques.includes(p)), ...lista.filter((p) => destaques.includes(p))];
  /* bases e cabeceiras repetem o modelo por cor: a aba mostra um de cada modelo primeiro */
  const variado = (lista: typeof ativos) => {
    const vistos = new Set<string>();
    const primeiros = lista.filter((p) => {
      const modelo = p.nome.replace(/\s+\S+$/, "");
      if (vistos.has(modelo)) return false;
      vistos.add(modelo);
      return true;
    });
    return [...primeiros, ...lista.filter((p) => !primeiros.includes(p))];
  };
  const colchoes = inedito(da("colchoes"));
  const travesseiros = inedito(da("travesseiros"));
  const bases = inedito(da("bases"));
  const cabeceiras = inedito(da("cabeceiras"));

  const frase = config.frase_hero || configPadrao.frase_hero;
  const fotoDe = (slug: string, n = 0) => peca(slug)?.imagens[n] ?? destaques[0]?.imagens[0];
  const tamanhosDeCama = new Set(da("colchoes").flatMap((p) => p.tamanhos.map(nomeDoTamanho)).filter((t) => !/berço|berco|infantil|baby/i.test(t)));

  /* a frase do hero vira caligrafia + manchete: "Aracaju," em script, o resto em negrito */
  const [scriptHero, ...restoHero] = frase.split(/,\s*/);
  const banners: Banner[] = [
    {
      script: restoHero.length ? `${scriptHero},` : undefined,
      titulo: restoHero.length ? restoHero.join(", ") : frase,
      texto: "De molas e de espuma, do solteiro ao king. Escolha aqui, mande no WhatsApp e venha deitar na loja do Grageru antes de fechar.",
      acao: { rotulo: "Ver os colchões", href: "/catalogo/colchoes" },
      imagem: fotoDe("colchao-pro-saude-nanolastic")!,
      selo: { grande: String(colchoes.length), pequeno: "modelos de colchão", nota: "venha deitar na loja" },
    },
    {
      script: "Renove",
      titulo: "seu descanso.",
      texto: "Macio, firme ou híbrido: a ficha de cada colchão diz a altura, o tipo de mola ou espuma e o peso suportado. O resto você acerta deitando na loja.",
      acao: { rotulo: "Escolher o colchão", href: "/catalogo/colchoes" },
      imagem: fotoDe("colchao-liberty")!,
      selo: { grande: String(tamanhosDeCama.size), pequeno: "tamanhos de cama", nota: "do solteiro ao king" },
    },
    {
      script: "Complete",
      titulo: "o quarto.",
      texto: "Base e cabeceira no tamanho do seu colchão, em corino, linho, veludo e nobuck. A loja monta o conjunto com você.",
      acao: { rotulo: "Ver bases e cabeceiras", href: "/catalogo/bases" },
      imagem: fotoDe("colchao-absolut-hybrid")!,
      selo: { grande: String(bases.length + cabeceiras.length), pequeno: "bases e cabeceiras", nota: "para o seu tamanho" },
    },
  ].filter((b) => b.imagem);

  const abas = ([
    { slug: "colchoes", nome: "Colchões", icone: "colchao", produtos: colchoes.slice(0, POR_ABA), total: colchoes.length },
    { slug: "bases", nome: "Bases", icone: "base", produtos: variado(bases).slice(0, POR_ABA), total: bases.length },
    { slug: "cabeceiras", nome: "Cabeceiras", icone: "cabeceira", produtos: variado(cabeceiras).slice(0, POR_ABA), total: cabeceiras.length },
    { slug: "travesseiros", nome: "Travesseiros", icone: "travesseiro", produtos: travesseiros.slice(0, POR_ABA), total: travesseiros.length },
  ] satisfies AbaConforto[]).filter((a) => a.produtos.length);

  return (
    <>
      <Banners banners={banners} />

      <Garantias linkWhats={whats} />

      <Encontre
        circulos={[
          { nome: "Colchões", href: "/catalogo/colchoes", imagem: "/marca/cat-colchoes.png", nota: `${colchoes.length} modelos` },
          { nome: "Bases", href: "/catalogo/bases", imagem: "/marca/cat-bases.png", nota: `${bases.length} opções` },
          { nome: "Cabeceiras", href: "/catalogo/cabeceiras", imagem: "/marca/cat-cabeceiras.png", nota: `${cabeceiras.length} opções` },
          { nome: "Travesseiros", href: "/catalogo/travesseiros", imagem: "/marca/cat-travesseiros.png", nota: `${travesseiros.length} modelos` },
        ]}
      />

      <ConfortoAbas abas={abas} categorias={porSlug} />

      <Prateleira id="destaques" titulo="Os mais procurados" subtitulo="A seleção da loja: os colchões que mais saem em Aracaju." href="/catalogo" verTudo="Ver o catálogo" produtos={destaques} categorias={porSlug} total={ativos.length} nomeDaPorta="produtos" />

      <Numeros
        itens={[
          { numero: String(colchoes.length), texto: "modelos de colchão, de molas e de espuma" },
          { numero: String(tamanhosDeCama.size), texto: "tamanhos de cama, do solteiro ao king" },
          { numero: String(bases.length + cabeceiras.length), texto: "bases e cabeceiras para completar o quarto" },
          { numero: "1", texto: "WhatsApp: a loja responde com o valor e combina a entrega" },
        ]}
      />

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
