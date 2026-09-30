import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import RedirectClient from "./redirect-client";

interface Props {
  params: Promise<{ id: string }>;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 1. WhatsApp / Telegram lê esta função para montar o preview
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const { data: offer } = await supabase
    .from("offers")
    .select("title, promotional_price, image_url, coupon_code")
    .eq("id", id)
    .maybeSingle();

  if (!offer) {
    return {
      title: "Tenda da Promo | Oferta Especial",
      description: "Confira as melhores ofertas na Tenda da Promo!",
    };
  }

  const title = `🔥 ${offer.title} - R$ ${Number(offer.promotional_price).toFixed(2)}`;
  const description = offer.coupon_code
    ? `Utilize o cupom ${offer.coupon_code} para garantir esta oferta na Tenda da Promo!`
    : `Aproveite o menor preço na Tenda da Promo. Clique e confira!`;

  const imageUrl = offer.image_url?.startsWith("http://")
    ? offer.image_url.replace("http://", "https://")
    : offer.image_url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://tenda-da-promo.vercel.app/ir/${id}`,
      siteName: "Tenda da Promo",
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 800,
          height: 800,
          alt: offer.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

// 2. Componente de Servidor que busca o link correto do banco
export default async function RedirectPage({ params }: Props) {
  const { id } = await params;

  const { data: offer, error } = await supabase
    .from("offers")
    .select("affiliate_url")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erro Supabase:", error.message);
  }

  // Se não encontrar o link no banco local/prod, redireciona para a raiz
  const destination = offer?.affiliate_url || "/";

  return <RedirectClient destination={destination} />;
}
