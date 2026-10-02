import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const alt = "Oferta Tenda da Promo";
export const size = {
  width: 800,
  height: 600,
};
export const contentType = "image/png";

async function getOfferByIdentifier(identifier: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

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
    console.error("[OG DEBUG] Erro ao buscar no Supabase:", err);
    return null;
  }
}

async function fetchImageAsPngBase64(imageUrl: string): Promise<string | null> {
  try {
    let targetUrl = imageUrl.trim();
    if (targetUrl.startsWith("http://")) {
      targetUrl = targetUrl.replace("http://", "https://");
    }

    console.log("[OG DEBUG] URL original da imagem:", targetUrl);

    // 1. Teste de tentativa com .jpg
    let jpgUrl = targetUrl;
    if (jpgUrl.endsWith(".webp") && jpgUrl.includes("mlstatic.com")) {
      jpgUrl = jpgUrl.replace(/\.webp$/i, ".jpg");
    }

    console.log("[OG DEBUG] Tentando baixar JPG:", jpgUrl);

    const res = await fetch(jpgUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    console.log(
      "[OG DEBUG] Status do JPG:",
      res.status,
      res.headers.get("content-type"),
    );

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("webp")) {
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mime = contentType.includes("png") ? "image/png" : "image/jpeg";
        console.log("[OG DEBUG] Sucesso via JPG direto!");
        return `data:${mime};base64,${base64}`;
      }
    }

    // 2. Teste via Next.js Optimizer
    const siteUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://tenda-da-promo.vercel.app";

    const nextOptimizerUrl = `${siteUrl}/_next/image?url=${encodeURIComponent(
      targetUrl,
    )}&w=1200&q=85`;

    console.log("[OG DEBUG] Tentando via Optimizer:", nextOptimizerUrl);

    const optimizerRes = await fetch(nextOptimizerUrl, {
      headers: {
        Accept: "image/png,image/jpeg,image/*",
      },
    });

    console.log(
      "[OG DEBUG] Status do Optimizer:",
      optimizerRes.status,
      optimizerRes.headers.get("content-type"),
    );

    if (optimizerRes.ok) {
      const buffer = await optimizerRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mime = optimizerRes.headers.get("content-type") || "image/png";
      console.log("[OG DEBUG] Sucesso via Optimizer!");
      return `data:${mime};base64,${base64}`;
    }

    console.log("[OG DEBUG] Todas as tentativas de conversão falharam.");
    return null;
  } catch (e) {
    console.error("[OG DEBUG] Exceção capturada:", e);
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

  console.log("[OG DEBUG] Oferta encontrada:", offer?.id, offer?.title);

  let imageSrc: string | null = null;

  if (offer?.image_url) {
    imageSrc = await fetchImageAsPngBase64(offer.image_url);
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
