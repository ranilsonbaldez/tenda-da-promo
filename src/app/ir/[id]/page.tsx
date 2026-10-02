import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

interface Props {
  params: Promise<{ id: string }>;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getOfferByIdentifier(identifier: string) {
  // 1. Tenta buscar por slug que comece com o termo enviado (ex: relogio-smartwatch%)
  const { data: offerBySlug } = await supabase
    .from("offers")
    .select("id, title, image_url, affiliate_link")
    .ilike("slug", `${identifier}%`)
    .limit(1)
    .maybeSingle();

  if (offerBySlug) return offerBySlug;

  // 2. Se não achou por slug, tenta buscar pelo ID original (caso seja UUID)
  const { data: offerById } = await supabase
    .from("offers")
    .select("id, title, image_url, affiliate_link")
    .or(`id.eq.${identifier},id.ilike.${identifier}%`)
    .limit(1)
    .maybeSingle();

  return offerById;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const offer = await getOfferByIdentifier(id);

  if (!offer) {
    return {
      title: "tenda-da-promo.vercel.app",
    };
  }

  const imageUrl = offer.image_url?.startsWith("http://")
    ? offer.image_url.replace("http://", "https://")
    : offer.image_url;

  const invisibleText = "\u200B";

  return {
    title: invisibleText,
    description: "",
    openGraph: {
      title: invisibleText,
      description: "",
      url: `https://tenda-da-promo.vercel.app/ir/${id}`,
      siteName: "tenda-da-promo.vercel.app",
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          alt: offer.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: invisibleText,
      description: "",
      images: [imageUrl],
    },
  };
}

export default async function RedirectPage({ params }: Props) {
  const { id } = await params;
  const offer = await getOfferByIdentifier(id);

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
