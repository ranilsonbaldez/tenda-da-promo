"use client";

import Image from "next/image";
import { Offer } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, Check, Flame } from "lucide-react";
import { useState } from "react";
import { CountdownTimer } from "./countdown-timer";

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const [copied, setCopied] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Se o temporizador chegar a zero em tempo real na ecrã, esconde o card
  if (isExpired) return null;

  const handleAction = () => {
    if (offer.coupon_code) {
      navigator.clipboard.writeText(offer.coupon_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }

    window.open(`/ir/${offer.id}`, "_blank");
  };

  return (
<Card className="flex flex-col justify-between overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-[#5B50B1]/40 hover:shadow-xl transition-all duration-200 group bg-white dark:bg-zinc-900">
  <CardContent className="p-4 flex flex-col items-center relative">
    {offer.is_featured && (
      <div className="absolute top-2 left-2 z-10">
        <Badge className="bg-[#E52427] hover:bg-[#c91d20] text-white flex items-center gap-1 text-xs font-bold shadow-sm border-none">
          <Flame className="w-3 h-3 fill-white" /> Destaque
        </Badge>
      </div>
    )}

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
      <span className="text-[10px] text-zinc-500 uppercase font-normal">CUPOM:</span>
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
