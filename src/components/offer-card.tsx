"use client";

import Image from "next/image";
import { Offer } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Share2, Copy, Check, Flame } from "lucide-react";
import { useState } from "react";
import { CountdownTimer } from "./countdown-timer";

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Se o temporizador chegar a zero em tempo real na ecrã, esconde o card
  if (isExpired) return null;

  const handleAction = () => {
    if (offer.coupon_code) {
      navigator.clipboard.writeText(offer.coupon_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }

    // Garante que o link exista e tenha o protocolo https://
    let targetUrl = offer.affiliate_link;

    if (targetUrl) {
      if (
        !targetUrl.startsWith("http://") &&
        !targetUrl.startsWith("https://")
      ) {
        targetUrl = `https://${targetUrl}`;
      }
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } else {
      console.error("Link de afiliado não encontrado.");
    }
  };

  // Função para compartilhar nas redes / copiar link
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Lista de variações de títulos chamativos
    const calloutTitles = [
      "🔥 *OFERTA IMPERDÍVEL!*",
      "⚡ *MENOR PREÇO DO DIA!*",
      "🚨 *PROMOÇÃO RELÂMPAGO!*",
      "💥 *BAIXOU O PREÇO!*",
      "✨ *ACHADINHO IMPERDÍVEL!*",
      "👀 *OLHA ESSE DESCONTO!*",
    ];

    // Escolhe um aleatoriamente a cada compartilhamento
    const randomTitle =
      calloutTitles[Math.floor(Math.random() * calloutTitles.length)];

    function shortenSlug(slug: string, maxWords = 4): string {
      if (!slug) return "";

      const parts = slug.split("-");

      // Se o slug for curto, retorna-o completo
      if (parts.length <= maxWords) return slug;

      // Pega apenas as primeiras N palavras
      return parts.slice(0, maxWords).join("-");
    }

    const productIdentifier = offer.slug
      ? shortenSlug(offer.slug, 3)
      : offer.id.split("-")[0];

    // const shareUrl = `${window.location.origin}/ir/${offer.id}`;
    const shareUrl = `https://tenda-da-promo.vercel.app/ir/${productIdentifier}`;
    const siteUrl = "tenda-da-promo.vercel.app";

    // Texto limpo sem induzir preview da loja
    const shareText = `${randomTitle}

📌 *${offer.title}*

${
  offer.original_price && offer.original_price > offer.promotional_price
    ? `🔥 DE ~${Number(offer.original_price).toFixed(2).replace(".", ",")}~ | POR *${Number(offer.promotional_price).toFixed(2).replace(".", ",")} no Pix*`
    : `💰 Por apenas: *${Number(offer.promotional_price).toFixed(2).replace(".", ",")} no Pix*`
}${offer.coupon_code ? `🎟️ Cupom: *${offer.coupon_code}*` : ""}
🔗 ${shareUrl}

---
⛺ *CONFIRA OUTRAS OFERTAS NO NOSSO SITE:*
${siteUrl}`;

    // Prepara o link direto para o WhatsApp Web
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

    // Verifica estritamente se o utilizador está num dispositivo móvel (telemóvel ou tablet)
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    // 1. Se for dispositivo móvel E suportar partilha nativa, abre o menu do telemóvel
    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: offer.title,
          text: shareText,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    // 2. Se for Desktop (Chrome, Firefox, Edge, etc.), abre o WhatsApp Web diretamente
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    // 3. Copia também o texto por segurança e mostra o feedback visual "Copiado!"
    try {
      await navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch (err) {
      console.error("Erro ao copiar link:", err);
    }
  };

  return (
    <Card className="flex flex-col justify-between overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-[#5B50B1]/40 hover:shadow-xl transition-all duration-200 group bg-white dark:bg-zinc-900 relative">
      <CardContent className="p-4 flex flex-col items-center relative">
        {/* Badge de Destaque no canto superior esquerdo */}
        {offer.is_featured && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-[#E52427] hover:bg-[#c91d20] text-white flex items-center gap-1 text-xs font-bold shadow-sm border-none">
              <Flame className="w-3 h-3 fill-white" /> Destaque
            </Badge>
          </div>
        )}

        {/* Botão de Compartilhar no canto superior direito */}
        <button
          type="button"
          onClick={handleShare}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-zinc-100/80 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all active:scale-95 shadow-sm backdrop-blur-xs"
          title="Compartilhar oferta"
        >
          {shared ? (
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>

        {/* Toast/Feedback rápido ao copiar no Desktop */}
        {shared && (
          <div className="absolute top-12 right-2 z-20 text-[10px] bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-2 py-1 rounded shadow-md font-medium animate-in fade-in zoom-in duration-150">
            Link copiado!
          </div>
        )}

        {/* Imagem do Produto */}
        <div className="relative w-full h-44 mb-3 group-hover:scale-105 transition-transform duration-200">
          <Image
            src={offer.image_url}
            alt={offer.title}
            fill
            priority
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, 250px"
          />
        </div>

        {/* Relógio regressivo visual */}
        {offer.expires_at && (
          <div className="w-full mb-2 flex justify-start">
            <CountdownTimer
              expiresAt={offer.expires_at}
              onExpire={() => setIsExpired(true)}
            />
          </div>
        )}

        <div className="w-full flex items-center justify-between mb-2 gap-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider truncate">
            {offer.stores?.name}
          </span>

          {offer.coupon_code && (
            <Badge
              variant="outline"
              className="border-[#5B50B1] text-[#5B50B1] bg-[#5B50B1]/10 font-bold border-dashed flex items-center gap-1 max-w-[60%] truncate"
              title={`Cupom: ${offer.coupon_code}`}
            >
              <span className="text-[10px] text-zinc-500 uppercase font-normal">
                CUPOM:
              </span>
              <code className="font-mono text-xs uppercase font-extrabold tracking-wide">
                {offer.coupon_code}
              </code>
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-sm line-clamp-2 w-full text-zinc-800 dark:text-zinc-200 mb-2 min-h-10">
          {offer.title}
        </h3>

        <div className="w-full mt-auto">
          {offer.original_price && (
            <span className="text-xs line-through text-zinc-400 block">
              R$ {offer.original_price.toFixed(2)}
            </span>
          )}
          <span className="text-2xl font-black text-[#E52427]">
            R$ {offer.promotional_price.toFixed(2)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAction}
          className="w-full bg-[#c2650e] hover:bg-[#8a4301] text-white font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all border-none"
        >
          {offer.coupon_code ? (
            <>
              {copied ? (
                <Check className="w-4 h-4 text-[#FACC15]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Cupom Copiado!" : "Copiar Cupom & Ir"}
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Pegar Promoção
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
