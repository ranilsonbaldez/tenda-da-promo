import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Oferta Tenda da Promo";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getOfferByIdentifier(identifier: string) {
  // 1. Tenta buscar por slug que comece com o termo enviado
  const { data: offerBySlug } = await supabase
    .from("offers")
    .select("id, title, image_url")
    .ilike("slug", `${identifier}%`)
    .limit(1)
    .maybeSingle();

  if (offerBySlug) return offerBySlug;

  // 2. Se não achou por slug, tenta buscar pelo ID original
  const { data: offerById } = await supabase
    .from("offers")
    .select("id, title, image_url")
    .or(`id.eq.${identifier},id.ilike.${identifier}%`)
    .limit(1)
    .maybeSingle();

  return offerById;
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = await getOfferByIdentifier(id);

  return new ImageResponse(
    <div
      style={{
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={offer?.image_url || "https://tenda-da-promo.vercel.app/logo.png"}
        alt={offer?.title || "Oferta"}
        style={{
          maxHeight: "100%",
          maxWidth: "100%",
          objectFit: "contain",
        }}
      />
    </div>,
    {
      ...size,
    },
  );
}
