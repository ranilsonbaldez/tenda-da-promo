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
    .select("affiliate_link, title, image_url")
    .like("id", `${id}%`)
    .maybeSingle();

  if (!offer) {
    return {
      title: "tenda-da-promo.vercel.app",
    };
  }

  const imageUrl = offer.image_url?.startsWith("http://")
    ? offer.image_url.replace("http://", "https://")
    : offer.image_url;

  // Usa caractere invisível para forçar o WhatsApp a ocultar a linha do título
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

  const { data: offer } = await supabase
    .from("offers")
    .select("affiliate_link, title, image_url")
    .like("id", `${id}%`)
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
