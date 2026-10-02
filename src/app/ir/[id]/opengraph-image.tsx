import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const alt = "Oferta Tenda da Promo";
export const size = {
  width: 900,
  height: 730,
};
export const contentType = "image/png";

async function getOfferByIdentifier(identifier: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
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
    console.error("Erro ao buscar oferta:", err);
    return null;
  }
}

// Trata URLs do Mercado Livre e outros CDNs convertendo para JPG e Base64
async function fetchAndConvertImage(url: string): Promise<string | null> {
  try {
    let targetUrl = url.trim();

    if (targetUrl.startsWith("http://")) {
      targetUrl = targetUrl.replace("http://", "https://");
    }

    // Tratamento específico para Mercado Livre (http2.mlstatic.com)
    if (targetUrl.includes("mlstatic.com")) {
      // Substitui o final .webp por .jpg
      targetUrl = targetUrl.replace(/\.webp$/i, ".jpg");
    }

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      // Tenta URL original se a modificação falhou
      const fallbackRes = await fetch(url);
      if (!fallbackRes.ok) return null;
      const buffer = await fallbackRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      return `data:image/jpeg;base64,${base64}`;
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = res.headers.get("content-type") || "image/jpeg";

    return `data:${mimeType};base64,${base64}`;
  } catch (e) {
    console.error("Erro ao converter imagem para base64:", e);
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
    imageSrc = await fetchAndConvertImage(offer.image_url);
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
        padding: "30px",
      }}
    >
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
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
            textAlign: "center",
            padding: "20px",
          }}
        >
          <h1 style={{ fontSize: 52, color: "#15803d", marginBottom: 16 }}>
            ⛺ Tenda da Promo
          </h1>
          <p
            style={{
              fontSize: 28,
              color: "#18181b",
              maxWidth: "800px",
              lineHeight: 1.3,
            }}
          >
            {offer?.title || "Confira esta oferta incrível!"}
          </p>
        </div>
      )}
    </div>,
    {
      ...size,
    },
  );
}
