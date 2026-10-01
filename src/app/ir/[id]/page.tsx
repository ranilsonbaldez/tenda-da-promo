import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

interface Props {
  params: Promise<{ id: string }>;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

  // const title = `🔥 ${offer.title} - R$ ${Number(offer.promotional_price).toFixed(2)}`;
  const title = `🔥 OLHA ESSA PROMOÇÃO INCRÍVEL!`;
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

export default async function RedirectPage({ params }: Props) {
  const { id } = await params;

  const { data: offer } = await supabase
    .from("offers")
    .select("affiliate_link")
    .eq("id", id)
    .maybeSingle();

  const destination =
    offer?.affiliate_link || "https://tenda-da-promo.vercel.app";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 text-zinc-800 p-4">
      <meta httpEquiv="refresh" content={`0;url=${destination}`} />
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mb-4"></div>
      <p className="text-sm font-medium">Redirecionando para a oferta...</p>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace(${JSON.stringify(destination)});`,
        }}
      />
    </div>
  );
}
