import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = body?.url;

    if (!url) {
      return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
    }

    // Função interna para identificar a loja considerando encurtadores
    const detectStore = (targetUrl: string): string => {
      const lower = targetUrl.toLowerCase();
      if (
        lower.includes("mercadolivre") ||
        lower.includes("mercadolibre") ||
        lower.includes("meli.la")
      ) {
        return "Mercado Livre";
      } else if (lower.includes("amazon") || lower.includes("amzn.to")) {
        return "Amazon";
      } else if (lower.includes("shopee") || lower.includes("shp.ee")) {
        return "Shopee";
      } else if (lower.includes("aliexpress")) {
        return "AliExpress";
      } else if (lower.includes("magazineluiza") || lower.includes("magalu")) {
        return "Magalu";
      }
      return "Outra";
    };

    let store = detectStore(url);
    let title = "";
    let image = "";
    let promotionalPrice = "";
    let originalPrice = "";

    // 1. Processamento específico do Mercado Livre
    if (store === "Mercado Livre") {
      try {
        const redirectRes = await fetch(url, {
          method: "GET",
          redirect: "follow",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          },
        });

        // Atualiza para a URL final expandida (ex: https://produto.mercadolivre.com.br/MLB-...)
        const finalUrl = redirectRes.url || url;
        store = detectStore(finalUrl);

        const htmlML = await redirectRes.text();
        const $ml = cheerio.load(htmlML);

        const mlbMatch =
          finalUrl.match(/MLB-?(\d+)/i) || url.match(/MLB-?(\d+)/i);

        if (mlbMatch && mlbMatch[1]) {
          const itemId = `MLB${mlbMatch[1]}`;
          const apiRes = await fetch(
            `https://api.mercadolibre.com/items/${itemId}`,
          );

          if (apiRes.ok) {
            const itemData = await apiRes.json();
            title = itemData.title || "";
            image =
              itemData.pictures?.[0]?.secure_url || itemData.thumbnail || "";

            if (itemData.price !== undefined && itemData.price !== null) {
              promotionalPrice = Number(itemData.price).toLocaleString(
                "pt-BR",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              );
            }

            if (
              itemData.original_price !== undefined &&
              itemData.original_price !== null
            ) {
              originalPrice = Number(itemData.original_price).toLocaleString(
                "pt-BR",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              );
            } else {
              originalPrice = promotionalPrice;
            }
          }
        }

        if (!title) {
          const ogTitle = $ml('meta[property="og:title"]').attr("content");
          const pdpTitle = $ml(".ui-pdp-title").first().text().trim();
          title = ogTitle || pdpTitle || "";
        }

        if (!image) {
          image = $ml('meta[property="og:image"]').attr("content") || "";
        }

        if (!promotionalPrice) {
          const frac = $ml(".andes-money-amount__fraction")
            .first()
            .text()
            .trim();
          const cents = $ml(".andes-money-amount__cents").first().text().trim();
          if (frac) {
            promotionalPrice = cents ? `${frac},${cents}` : `${frac},00`;
            originalPrice = promotionalPrice;
          }
        }

        title = title
          .replace(/\|/g, "")
          .replace(/Mercado Livre/gi, "")
          .trim();

        return NextResponse.json({
          title,
          image,
          store,
          promotional_price: promotionalPrice,
          original_price: originalPrice,
          affiliate_url: url,
        });
      } catch (mlErr) {
        console.error("Erro interno no processamento do Mercado Livre:", mlErr);
      }
    }

    // 2. Processamento genérico para outras lojas
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });

    const htmlGen = await response.text();
    const $gen = cheerio.load(htmlGen);

    const ogTitle = $gen('meta[property="og:title"]').attr("content");
    const docTitle = $gen("title").text();
    const ogImage = $gen('meta[property="og:image"]').attr("content");

    title = ogTitle || docTitle || "";
    image = ogImage || "";

    return NextResponse.json({
      title,
      image,
      store,
      promotional_price: promotionalPrice,
      original_price: originalPrice,
      affiliate_url: url,
    });
  } catch (error) {
    console.error("Erro geral na API scrape-product:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar a URL" },
      { status: 500 },
    );
  }
}
