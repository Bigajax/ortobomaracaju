import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardProduto } from "@/components/CardProduto";
import { CompraProduto } from "@/components/CompraProduto";
import { FichaRapida } from "@/components/FichaRapida";
import { GaleriaProduto } from "@/components/GaleriaProduto";
import { Icone } from "@/components/Icones";
import { carregarCatalogo, obterConfig, obterProduto } from "@/lib/dados";
import { nomeDoTamanho, temDesconto } from "@/lib/filtro";
import { precoBRL } from "@/lib/formato";
import { site } from "@/data/site.config";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { produtos } = await carregarCatalogo();
  return produtos.filter((p) => p.ativo).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const produto = await obterProduto(slug);
  if (!produto) return {};

  const descricao = (produto.descricao?.split("\n\n")[0] ?? `${produto.nome} Ortobom`) + " Na loja Ortobom de Aracaju, com pedido pelo WhatsApp.";

  return {
    title: produto.nome,
    description: descricao,
    alternates: { canonical: `/produto/${produto.slug}` },
    openGraph: {
      type: "website",
      title: `${produto.nome} · Ortobom Aracaju`,
      description: descricao,
      url: `/produto/${produto.slug}`,
      images: produto.imagens[0] ? [{ url: produto.imagens[0].url, alt: produto.nome }] : [],
    },
  };
}

/**
 * A página da peça no molde da marca: galeria à esquerda; à direita a
 * categoria, o nome, o valor (ou "pelo WhatsApp"), o pedido com o
 * seletor de tamanho, e embaixo a descrição em parágrafos e a ficha
 * técnica em tabela chave/valor, como a "Especificação completa" do
 * site da Ortobom.
 */
export default async function PaginaProduto({ params }: Props) {
  const { slug } = await params;
  const [produto, { categorias, produtos }, config] = await Promise.all([obterProduto(slug), carregarCatalogo(), obterConfig()]);

  if (!produto) notFound();

  const categoria = categorias.find((c) => c.slug === produto.categoria_slug);
  const promo = temDesconto(produto);
  const cheio = precoBRL(produto.preco);
  const vigente = precoBRL(produto.preco_promocional ?? produto.preco);
  const paragrafos = (produto.descricao ?? "").split("\n\n").filter(Boolean);
  /* a abertura da marca ("Durma com Conforto e Estilo!") fica para a seção "Conheça"; aqui em cima vai o que decide */
  const ficha = [
    ...(produto.tamanhos.length ? [{ chave: "Tamanhos", valor: produto.tamanhos.map(nomeDoTamanho).join(", ") }] : []),
    ...(produto.cores.length === 1 ? [{ chave: "Cor", valor: produto.cores[0] }] : []),
    ...(produto.atributos ?? []),
  ];

  const parecidos = produtos.filter((p) => p.ativo && p.id !== produto.id && p.categoria_slug === produto.categoria_slug).slice(0, 4);
  const tecnologia = produto.atributos?.find((a) => /^tipos? de mola|^tecnologia$|^tipo de espuma$/i.test(a.chave))?.valor;
  const quantosTamanhos = produto.tamanhos.length;

  const preco = produto.preco_promocional ?? produto.preco;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: produto.nome,
    sku: produto.codigo,
    brand: { "@type": "Brand", name: "Ortobom" },
    ...(paragrafos[0] ? { description: paragrafos[0] } : {}),
    image: produto.imagens.map((i) => `${site.url}${i.url}`),
    offers: {
      "@type": "Offer",
      url: `${site.url}/produto/${produto.slug}`,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      ...(preco ? { price: preco } : {}),
      seller: { "@type": "Store", name: "Ortobom Aracaju" },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="miolo pb-28 pt-6 lg:pb-20 lg:pt-8">
        <nav aria-label="Você está em" className="miudo mb-5">
          <Link href="/" className="hover:text-azul-700">
            Início
          </Link>
          <span className="px-2">/</span>
          <Link href="/catalogo" className="hover:text-azul-700">
            Catálogo
          </Link>
          {categoria ? (
            <>
              <span className="px-2">/</span>
              <Link href={`/catalogo/${categoria.slug}`} className="hover:text-azul-700">
                {categoria.nome}
              </Link>
            </>
          ) : null}
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
          <div>
            <GaleriaProduto imagens={produto.imagens} nome={produto.nome} tag={tecnologia} />
            <p className="miudo mt-3">Fotos ilustrativas da Ortobom: o colchão não inclui a base. Confira o tamanho e as medidas antes de pedir.</p>
          </div>

          <div className="pedido-fixo self-start">
            <p className="etiqueta flex flex-wrap items-center gap-x-3 gap-y-1">
              {categoria ? <span>{categoria.nome} Ortobom</span> : null}
              <span className="text-cinza-500">{produto.codigo}</span>
            </p>
            <h1 className="manchete mt-2 text-[clamp(1.625rem,3vw,2.25rem)] text-azul-900">{produto.nome}</h1>
            {quantosTamanhos > 1 ? (
              <p className="mt-1.5 text-[0.9375rem] text-tinta-fraca">
                Em {quantosTamanhos} tamanhos, de {nomeDoTamanho(produto.tamanhos[0]).toLowerCase()} a {nomeDoTamanho(produto.tamanhos[quantosTamanhos - 1]).toLowerCase()}.
              </p>
            ) : null}

            <FichaRapida produto={produto} />

            <div className="mt-5 border-y border-linha py-4">
              {vigente ? (
                <p className="preco flex items-baseline gap-3 text-[1.75rem] text-azul-900">
                  {promo && cheio ? <span className="text-[1.125rem] text-tinta-fraca line-through">{cheio}</span> : null}
                  <span>{vigente}</span>
                </p>
              ) : (
                <p className="text-[0.9375rem] leading-relaxed text-tinta">
                  <span className="font-semibold text-azul-900">Valor e condições pelo WhatsApp.</span> A loja responde na hora com o preço em Aracaju e as formas de pagamento.
                </p>
              )}
            </div>

            <div className="mt-5">
              <CompraProduto produto={produto} whatsapp={config.whatsapp} base={site.url} />
            </div>

            <Link href="/#loja" className="loja-cartao group mt-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-azul-50 text-azul-700 transition-colors group-hover:bg-laranja group-hover:text-branco">
                <Icone nome="loja" className="h-6 w-6" peso={1.4} />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.9375rem] font-bold text-azul-900 group-hover:text-azul-700">Venha deitar antes de escolher</span>
                <span className="block text-[0.8125rem] leading-snug text-tinta-fraca">
                  Loja Ortobom no Grageru, Av. Pres. Tancredo Neves, 746{config.horario ? `. ${config.horario}` : ""}. Retirada na loja ou entrega em Aracaju.
                </span>
              </span>
            </Link>
          </div>
        </div>

        {paragrafos.length || ficha.length ? (
          <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
            {paragrafos.length ? (
              <section aria-labelledby="titulo-conheca">
                <h2 id="titulo-conheca" className="secao">
                  Conheça o {produto.nome}
                </h2>
                <div className="mt-4 space-y-4">
                  {paragrafos.map((p, i) => (
                    <p key={i} className="max-w-[64ch] text-[0.9375rem] leading-relaxed text-tinta">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ) : (
              <div />
            )}
            {ficha.length ? (
              <section aria-labelledby="titulo-ficha">
                <h2 id="titulo-ficha" className="secao">
                  Especificação completa
                </h2>
                <dl className="cartao mt-4 divide-y divide-linha">
                  {ficha.map((a) => (
                    <div key={a.chave} className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-4 px-4 py-3 text-[0.9375rem]">
                      <dt className="font-semibold text-azul-900">{a.chave}</dt>
                      <dd className="text-tinta">{a.valor}</dd>
                    </div>
                  ))}
                </dl>
                <p className="miudo mt-3">
                  Informações da Ortobom. Garantia conforme a{" "}
                  <a href="https://www.ortobom.com.br/Content/Garantia" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-azul-700">
                    política da marca
                  </a>
                  .
                </p>
              </section>
            ) : null}
          </div>
        ) : null}

        {parecidos.length ? (
          <section aria-labelledby="titulo-parecidos" className="mt-14 lg:mt-20">
            <div className="regua">
              <h2 id="titulo-parecidos" className="secao">
                Mais em {categoria?.nome ?? "a loja"}
              </h2>
              {categoria ? (
                <Link href={`/catalogo/${categoria.slug}`} className="btn btn--texto shrink-0">
                  Ver todos
                </Link>
              ) : null}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
              {parecidos.map((p) => (
                <CardProduto key={p.id} produto={p} categoria={categoria} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
