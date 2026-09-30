import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

interface Props {
  params: Promise<{ id: string }>;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 1. O WhatsApp lê esta função para montar a prévia visual
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

  // Garante HTTPS direto para evitar bloqueio no WhatsApp
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

// 2. Redirecionamento direto e instantâneo no servidor usando o campo correto
export default async function RedirectPage({ params }: Props) {
  const { id } = await params;

  const { data: offer } = await supabase
    .from("offers")
    .select("affiliate_link") // ✅ Campo correto verificado na sua tabela
    .eq("id", id)
    .maybeSingle();

  if (offer?.affiliate_link) {
    redirect(offer.affiliate_link);
  }

  redirect("/");
}
