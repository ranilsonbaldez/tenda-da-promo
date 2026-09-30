import { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Props {
  params: { id: string };
}

// 1. O WhatsApp lê esta função para montar o preview limpo
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;

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

  const title = `🔥 ${offer.title}`;
  const description = offer.coupon_code
    ? `Por R$ ${Number(offer.promotional_price).toFixed(2)} com o cupom ${offer.coupon_code}`
    : `Por apenas R$ ${Number(offer.promotional_price).toFixed(2)} na Tenda da Promo!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: offer.image_url }],
    },
  };
}

// 2. Redireciona o usuário para o link de afiliado assim que o link é aberto
export default async function RedirectPage({ params }: Props) {
  const { id } = params;

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
