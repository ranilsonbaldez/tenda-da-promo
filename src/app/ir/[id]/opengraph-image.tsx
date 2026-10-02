import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const alt = "Oferta Tenda da Promo";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function getOfferByIdentifier(identifier: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Variáveis do Supabase ausentes!");
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  } catch (err) {
    console.error("Erro na busca da oferta no OG:", err);
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

  let imageUrl = offer?.image_url;

  // Trata a imagem para garantir compatibilidade com o Vercel OG (Satori)
  if (imageUrl) {
    // 1. Força HTTPS
    if (imageUrl.startsWith("http://")) {
      imageUrl = imageUrl.replace("http://", "https://");
    }

    // 2. Se for WebP do Mercado Livre, substitui o sufixo .webp por .jpg (o CDN do Mercado Livre entrega JPG automaticamente)
    if (imageUrl.endsWith(".webp")) {
      imageUrl = imageUrl.replace(/\.webp$/i, ".jpg");
    }
  }

  return new ImageResponse(
    <div
      style={{
        background: "#ffffff",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Oferta"
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1 style={{ fontSize: 48, color: "#5B50B1", marginBottom: 10 }}>
            ⛺ Tenda da Promo
          </h1>
          <p style={{ fontSize: 24, color: "#333333" }}>
            {offer?.title || "Oferta Imperdível"}
          </p>
        </div>
      )}
    </div>,
    {
      ...size,
    },
  );
}
