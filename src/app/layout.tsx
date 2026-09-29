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

export const metadata: Metadata = {
  title: "Tenda da Promo | Quem procura preço baixo, acampa aqui!",
  description:
    "Encontre os melhores preços, descontos e cupons do Mercado Livre, Amazon, Shopee e Magalu reunidos em um só lugar.",
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
