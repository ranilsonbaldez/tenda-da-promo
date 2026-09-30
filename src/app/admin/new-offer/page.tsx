"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  PlusCircle,
  CheckCircle2,
  Image as ImageIcon,
  Link2,
  Tag,
  DollarSign,
  Calendar,
  Flame,
  Store as StoreIcon,
  ShoppingBag,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

interface Store {
  id: string;
  name: string;
}

export default function NewOfferPage() {
  // Estado do componente
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estado dos campos do formulário
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [promotionalPrice, setPromotionalPrice] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [storeId, setStoreId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Buscar lojas disponíveis ao montar
  useEffect(() => {
    async function fetchStores() {
      try {
        const { data, error } = await supabase
          .from("stores")
          .select("id, name")
          .order("name", { ascending: true });

        if (error) {
          console.error("Erro ao carregar lojas:", error.message);
        } else if (data) {
          setStores(data);
          if (data.length > 0) {
            setStoreId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Erro inesperado ao carregar lojas:", err);
      } finally {
        setIsLoadingStores(false);
      }
    }

    fetchStores();
  }, []);

  // Helper para slug
  function createSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  }

  // Limpar formulário para novo cadastro sem recarregar
  function resetForm() {
    setTitle("");
    setImageUrl("");
    setAffiliateLink("");
    setOriginalPrice("");
    setPromotionalPrice("");
    setCouponCode("");
    setExpiresAt("");
    setIsFeatured(false);
    setErrorMessage("");
  }

  // Processar submissão
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setIsSuccess(false);

    try {
      const parsePrice = (val: string) => {
        if (!val) return null;
        const normalized = val.replace(",", ".");
        const parsed = parseFloat(normalized);
        return isNaN(parsed) ? null : parsed;
      };

      const parsedOriginal = parsePrice(originalPrice);
      const parsedPromotional = parsePrice(promotionalPrice);

      if (parsedPromotional === null) {
        throw new Error("Por favor, insira um preço promocional válido.");
      }

      if (!storeId) {
        throw new Error("Selecione uma loja / plataforma válida.");
      }

      const payload = {
        title: title.trim(),
        slug: createSlug(title),
        image_url: imageUrl.trim(),
        affiliate_link: affiliateLink.trim(),
        original_price: parsedOriginal,
        promotional_price: parsedPromotional,
        coupon_code: couponCode.trim() || null,
        store_id: storeId,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        is_featured: isFeatured,
      };

      const { error } = await supabase.from("offers").insert([payload]);

      if (error) {
        console.error("Erro do Supabase:", error);
        throw new Error(error.message || "Erro ao guardar no banco de dados.");
      }

      setIsSuccess(true);
      resetForm();

      // Ocultar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      console.error("Erro na submissão:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao cadastrar a promoção.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 px-3 py-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Navegação e Atalhos Rápidos */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 font-medium bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Vitrine
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetForm}
            className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpar Campos
          </Button>
        </div>

        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          {/* Cabeçalho Limpo */}
          <CardHeader className="bg-[#000000] text-white px-5 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#FACC15]" />
              Nova Oferta
            </CardTitle>
            <span className="text-xs bg-white/10 text-white/80 px-2.5 py-1 rounded-full font-mono">
              Cadastro Rápido
            </span>
          </CardHeader>

          <CardContent className="p-4 md:p-6 space-y-5">
            {isSuccess && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg flex items-center justify-between gap-3 text-sm animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-medium">Oferta cadastrada com sucesso!</span>
                </div>
                <Link
                  href="/"
                  className="text-xs underline font-bold hover:text-emerald-900"
                >
                  Ver na Vitrine →
                </Link>
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
                <strong>Erro:</strong> {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Seção 1: Título e Loja */}
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="title"
                    className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#5B50B1]" /> Título do Produto *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-10 text-sm focus:border-[#5B50B1] focus:ring-[#5B50B1]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="store"
                      className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1"
                    >
                      <StoreIcon className="w-3.5 h-3.5 text-[#5B50B1]" /> Loja / Plataforma *
                    </Label>
                    {isLoadingStores ? (
                      <div className="text-xs text-zinc-500 h-10 flex items-center">
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Carregando lojas...
                      </div>
                    ) : (
                      <select
                        id="store"
                        required
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                        className="w-full h-10 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B50B1]"
                      >
                        {stores.map((store) => (
                          <option key={store.id} value={store.id}>
                            {store.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="coupon"
                      className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1"
                    >
                      <Tag className="w-3.5 h-3.5 text-[#5B50B1]" /> Cupom (Opcional)
                    </Label>
                    <Input
                      id="coupon"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="h-10 font-mono uppercase tracking-wide text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Links e Pré-visualização de Imagem */}
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="imageUrl"
                      className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#5B50B1]" /> URL da Imagem *
                    </Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="h-10 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="affiliateLink"
                      className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1"
                    >
                      <Link2 className="w-3.5 h-3.5 text-[#5B50B1]" /> Link de Afiliado *
                    </Label>
                    <Input
                      id="affiliateLink"
                      type="url"
                      required
                      value={affiliateLink}
                      onChange={(e) => setAffiliateLink(e.target.value)}
                      className="h-10 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Preview Rápido da Imagem ao colar a URL */}
                {imageUrl.trim().length > 10 && (
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded border overflow-hidden relative shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500 truncate">
                      Miniatura de confirmação da imagem
                    </span>
                  </div>
                )}
              </div>

              {/* Seção 3: Preços e Destaque */}
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="originalPrice"
                      className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1 mb-1"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Preço original
                    </Label>
                    <Input
                      id="originalPrice"
                      type="text"
                      inputMode="decimal"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="h-10 text-sm line-through text-zinc-500"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="promotionalPrice"
                      className="text-xs font-bold text-[#E52427] uppercase tracking-wider flex items-center gap-1 mb-1"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Preço promocional
                    </Label>
                    <Input
                      id="promotionalPrice"
                      type="text"
                      inputMode="decimal"
                      required
                      value={promotionalPrice}
                      onChange={(e) => setPromotionalPrice(e.target.value)}
                      className="h-10 font-bold text-base text-[#E52427] focus:ring-[#E52427]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center pt-1">
                  <div>
                    <Label
                      htmlFor="expiresAt"
                      className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#5B50B1]" /> Expiração (Opcional)
                    </Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="pt-2 md:pt-5">
                    <label
                      htmlFor="isFeatured"
                      className="flex items-center gap-2.5 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 accent-[#E52427] rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                        <Flame className="w-4 h-4 text-[#E52427] fill-[#E52427]" />
                        Destaque com Selo de Fogo 💥
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Botão de Envio de Alto Impacto */}
              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#028850] hover:bg-[#00683d] text-white font-bold h-12 text-base rounded-lg shadow-md transition-all active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Guardando Oferta...
                    </>
                  ) : (
                    "Cadastrar Oferta"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}