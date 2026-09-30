import { Metadata } from "next";
import { supabase } from "@/lib/supabase";

interface Props {
  params: Promise<{ id: string }>;
}

// 1. O WhatsApp lê esta função e obtém a imagem, título e preço
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
    ? `Aproveite com o cupom ${offer.coupon_code} na Tenda da Promo!`
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

// 2. Renderiza o HTML com as metatags e redireciona o utilizador no navegador
export default async function RedirectPage({ params }: Props) {
  const { id } = await params;

  const { data: offer } = await supabase
    .from("offers")
    .select("affiliate_url")
    .eq("id", id)
    .single();

  const destination = offer?.affiliate_url || "/";

  return (
    <html>
      <head>
        {/* Redirecionamento instantâneo via Meta Refresh no navegador */}
        <meta httpEquiv="refresh" content={`0;url=${destination}`} />
      </head>
      <body>
        {/* Fallback de redirecionamento via JS caso o meta refresh seja ignorado */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.href = "${destination}";`,
          }}
        />
      </body>
    </html>
  );
}
