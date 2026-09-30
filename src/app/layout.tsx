import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

// Configuração da Montserrat para a Logomarca (pesos pesados + itálico)
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800", "900"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
});

// Configuração da Inter para o slogan e textos da interface
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://tenda-da-promo.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tenda da Promo | Quem procura preço baixo, acampa aqui!",
    template: "%s | Tenda da Promo",
  },
  description:
    "Encontre os melhores preços, descontos e cupons do Mercado Livre, Amazon, Shopee e Magalu reunidos em um só lugar.",
  openGraph: {
    title: "Tenda da Promo | Quem procura preço baixo, acampa aqui!",
    description:
      "Encontre os melhores preços, descontos e cupons do Mercado Livre, Amazon, Shopee e Magalu reunidos em um só lugar.",
    url: SITE_URL,
    siteName: "Tenda da Promo",
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-zinc-50 text-zinc-900">
        {children}
      </body>
    </html>
  );
}
