import { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Props {
  params: Promise<{ id: string }>;
}

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

  const title = `🔥 ${offer.title} - R$ ${Number(offer.promotional_price).toFixed(2)}`;
  const description = offer.coupon_code
    ? `Utilize o cupom ${offer.coupon_code} para garantir esta oferta na Tenda da Promo!`
    : `Aproveite o menor preço na Tenda da Promo. Clique para conferir!`;

  // Garante que a URL da imagem utiliza o protocolo https
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
          width: 600,
          height: 600,
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
