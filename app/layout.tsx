import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { site } from "@/data/site.config";
import "./globals.css";

/* A DM Sans é a família do site da marca: uma só, em todos os pesos. */
const corpo = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--fonte-corpo",
  display: "swap",
});

const TITULO = "Ortobom Aracaju — Colchões, bases, cabeceiras e travesseiros";
const DESCRICAO = `Loja Ortobom em Aracaju, na ${site.endereco}. Colchões de molas e espuma, bases, cabeceiras e travesseiros com pedido e orçamento pelo WhatsApp.`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: TITULO,
    template: "%s · Ortobom Aracaju",
  },
  description: DESCRICAO,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Ortobom Aracaju",
    url: site.url,
    title: TITULO,
    description: site.posicionamento,
    images: [{ url: "/og/site.jpg", width: 1200, height: 630, alt: "Ortobom Aracaju" }],
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${corpo.variable} antialiased`}>{children}</body>
    </html>
  );
}
