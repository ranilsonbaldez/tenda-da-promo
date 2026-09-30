import { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Props {
  params: Promise<{ id: string }>;
}

// 1. O WhatsApp lê esta função para montar o preview dinâmico do produto
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const { data: offer } = await supabase
    .from("offers")
    .select("title, promotional_price, image_url, coupon_code")
    .eq("id", id)
    .single();

  if (!offer) {
    return {
      title: "Tenda da Promo | Oferta Especial",
    };
  }

  const title = `${offer.title} - R$ ${Number(offer.promotional_price).toFixed(2)}`;
  const description = offer.coupon_code
    ? `Cupom exclusivo: ${offer.coupon_code}. Aproveite essa promoção na Tenda da Promo!`
    : `Garanta com o menor preço na Tenda da Promo. Clique e confira!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Tenda da Promo",
      images: [
        {
          url: offer.image_url,
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
      images: [offer.image_url],
    },
  };
}

// 2. Redireciona o usuário para o link de afiliado assim que o link é aberto
export default async function RedirectPage({ params }: Props) {
  const { id } = await params;

  const { data: offer } = await supabase
    .from("offers")
    .select("affiliate_url")
    .eq("id", id)
    .single();

  if (offer?.affiliate_url) {
    redirect(offer.affiliate_url);
  }

  redirect("/");
}
