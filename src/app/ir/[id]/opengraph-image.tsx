import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
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
  const { data: offerBySlug } = await supabase
    .from("offers")
    .select("id, title, image_url")
    .ilike("slug", `${identifier}%`)
    .limit(1)
    .maybeSingle();

  if (offerBySlug) return offerBySlug;

  const { data: offerById } = await supabase
    .from("offers")
    .select("id, title, image_url")
    .or(`id.eq.${identifier},id.ilike.${identifier}%`)
    .limit(1)
    .maybeSingle();

  return offerById;
}

// Função auxiliar para carregar a imagem externa sem quebrar o canvas do Vercel OG
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${base64}`;
  } catch (err) {
    console.error("Erro ao buscar imagem externa para OG:", err);
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = await getOfferByIdentifier(id);

  let imageSrc: string | null = null;

  if (offer?.image_url) {
    const formattedUrl = offer.image_url.startsWith("http://")
      ? offer.image_url.replace("http://", "https://")
      : offer.image_url;

    imageSrc = await fetchImageAsBase64(formattedUrl);
  }

  // Se falhar o fetch da imagem externa, usa um SVG/fundo padrão simples com o texto
  if (!imageSrc) {
    return new ImageResponse(
      <div
        style={{
          background: "linear-gradient(135deg, #5B50B1 0%, #E52427 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 48,
          fontWeight: "bold",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <span>⛺ Tenda da Promo</span>
        <span style={{ fontSize: 28, marginTop: 20, opacity: 0.9 }}>
          {offer?.title || "Confira essa oferta incrível!"}
        </span>
      </div>,
      { ...size },
    );
  }

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
        src={imageSrc}
        alt="Oferta"
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
