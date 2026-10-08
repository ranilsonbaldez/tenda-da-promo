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
  Pencil,
  Trash2,
  ListOrdered,
  XCircle,
  FolderTree,
} from "lucide-react";
import Link from "next/link";

interface Store {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Offer {
  id: string;
  title: string;
  slug: string;
  image_url: string;
  affiliate_link: string;
  original_price: number | null;
  promotional_price: number;
  coupon_code: string | null;
  store_id: string;
  category_id?: string | null;
  expires_at: string | null;
  is_featured: boolean;
  created_at?: string;
  stores?: { name: string } | null;
  categories?: { name: string } | null;
}

export default function NewOfferPage() {
  // Estados de dados
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  // Estados de carregamento
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Mensagens e feedback
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // Estado da oferta em edição
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

  // Campos do formulário
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [promotionalPrice, setPromotionalPrice] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [storeId, setStoreId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Carregar dados iniciais (Lojas, Categorias e Ofertas)
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      // 1. Carregar Lojas
      try {
        const { data: storesData, error: storesError } = await supabase
          .from("stores")
          .select("id, name")
          .order("name", { ascending: true });

        if (isMounted) {
          if (storesError) {
            console.error("Erro ao carregar lojas:", storesError.message);
          } else if (storesData && storesData.length > 0) {
            setStores(storesData);
            setStoreId((prev) => (prev ? prev : storesData[0].id));
          }
        }
      } catch (err) {
        console.error("Erro inesperado ao carregar lojas:", err);
      } finally {
        if (isMounted) setIsLoadingStores(false);
      }

      // 2. Carregar Categorias
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name")
          .order("name", { ascending: true });

        if (isMounted) {
          if (categoriesError) {
            console.error(
              "Erro ao carregar categorias:",
              categoriesError.message,
            );
          } else if (categoriesData && categoriesData.length > 0) {
            setCategories(categoriesData);
            setCategoryId((prev) => (prev ? prev : categoriesData[0].id));
          }
        }
      } catch (err) {
        console.error("Erro inesperado ao carregar categorias:", err);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }

      // 3. Carregar Ofertas
      try {
        const { data: offersData, error: offersError } = await supabase
          .from("offers")
          .select("*, stores(name), categories(name)")
          .order("created_at", { ascending: false });

        if (isMounted) {
          if (offersError) {
            console.error("Erro ao carregar ofertas:", offersError.message);
          } else if (offersData) {
            setOffers(offersData as Offer[]);
          }
        }
      } catch (err) {
        console.error("Erro inesperado ao carregar ofertas:", err);
      } finally {
        if (isMounted) setIsLoadingOffers(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Recarregar a lista de ofertas
  async function reloadOffers() {
    setIsLoadingOffers(true);
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*, stores(name), categories(name)")
        .order("created_at", { ascending: false });

      if (error) console.error("Erro ao carregar ofertas:", error.message);
      else if (data) setOffers(data as Offer[]);
    } catch (err) {
      console.error("Erro ao recarregar ofertas:", err);
    } finally {
      setIsLoadingOffers(false);
    }
  }

  // Gerador de Slug
  function createSlug(text: string): string {
    const baseSlug = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();

    const uniqueHash = Math.random().toString(36).substring(2, 6);
    return `${baseSlug}-${uniqueHash}`;
  }

  // Conversor de Preços
  function parsePrice(val: string): number | null {
    if (!val) return null;
    let cleaned = val.trim();
    if (cleaned.includes(",")) {
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    }
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  // Resetar formulário
  function resetForm() {
    setEditingOfferId(null);
    setTitle("");
    setImageUrl("");
    setAffiliateLink("");
    setOriginalPrice("");
    setPromotionalPrice("");
    setCouponCode("");
    setExpiresAt("");
    setIsFeatured(false);
    setErrorMessage("");
    setImagePreviewError(false);
    if (stores.length > 0) setStoreId(stores[0].id);
    if (categories.length > 0) setCategoryId(categories[0].id);
  }

  // Iniciar Edição
  function handleStartEdit(offer: Offer) {
    setEditingOfferId(offer.id);
    setTitle(offer.title);
    setImageUrl(offer.image_url || "");
    setAffiliateLink(offer.affiliate_link);
    setOriginalPrice(
      offer.original_price !== null ? String(offer.original_price) : "",
    );
    setPromotionalPrice(String(offer.promotional_price));
    setCouponCode(offer.coupon_code || "");
    setStoreId(offer.store_id);
    setCategoryId(
      offer.category_id || (categories.length > 0 ? categories[0].id : ""),
    );
    setExpiresAt(offer.expires_at ? offer.expires_at.slice(0, 16) : "");
    setIsFeatured(offer.is_featured);
    setErrorMessage("");
    setImagePreviewError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Apagar Oferta
  async function handleDeleteOffer(id: string) {
    if (!confirm("Tem certeza de que deseja apagar esta oferta?")) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw error;

      setOffers((prev) => prev.filter((item) => item.id !== id));
      if (editingOfferId === id) resetForm();
    } catch (err: unknown) {
      alert(
        "Erro ao excluir oferta: " +
          (err instanceof Error ? err.message : "Erro desconhecido"),
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Submeter Formulário
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setIsSuccess(false);

    try {
      const parsedOriginal = parsePrice(originalPrice);
      const parsedPromotional = parsePrice(promotionalPrice);

      if (parsedPromotional === null || parsedPromotional <= 0) {
        throw new Error("Por favor, insira um preço promocional válido.");
      }

      if (!storeId) {
        throw new Error("Selecione uma loja / plataforma válida.");
      }

      const payload = {
        title: title.trim(),
        image_url: imageUrl.trim(),
        affiliate_link: affiliateLink.trim(),
        original_price: parsedOriginal,
        promotional_price: parsedPromotional,
        coupon_code: couponCode.trim() || null,
        store_id: storeId,
        category_id: categoryId || null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        is_featured: isFeatured,
      };

      if (editingOfferId) {
        const { error } = await supabase
          .from("offers")
          .update(payload)
          .eq("id", editingOfferId);

        if (error) throw new Error(error.message);
        setSuccessMessage("Oferta atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("offers").insert([
          {
            ...payload,
            slug: createSlug(title),
          },
        ]);

        if (error) throw new Error(error.message);
        setSuccessMessage("Oferta cadastrada com sucesso!");
      }

      setIsSuccess(true);
      resetForm();
      await reloadOffers();

      setTimeout(() => setIsSuccess(false), 4000);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao salvar a promoção.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 px-3 py-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navegação e Atalhos */}
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
            <RotateCcw className="w-3.5 h-3.5" /> Limpar / Cancelar
          </Button>
        </div>

        {/* Formulário */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <CardHeader className="bg-[#000000] text-white px-5 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              {editingOfferId ? (
                <>
                  <Pencil className="w-5 h-5 text-amber-400" /> Editar Oferta
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 text-[#FACC15]" /> Nova Oferta
                </>
              )}
            </CardTitle>
            {editingOfferId && (
              <Button
                variant="destructive"
                size="sm"
                onClick={resetForm}
                className="h-7 text-xs flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancelar Edição
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-4 md:p-6 space-y-5">
            {isSuccess && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-medium">{successMessage}</span>
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
              {/* Título, Loja, Categoria e Cupom */}
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="title"
                    className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#5B50B1]" />{" "}
                    Título do Produto *
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label
                      htmlFor="store"
                      className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1"
                    >
                      <StoreIcon className="w-3.5 h-3.5 text-[#5B50B1]" /> Loja
                      *
                    </Label>
                    {isLoadingStores ? (
                      <div className="text-xs text-zinc-500 h-10 flex items-center">
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />{" "}
                        Carregando...
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
                      htmlFor="category"
                      className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1"
                    >
                      <FolderTree className="w-3.5 h-3.5 text-[#5B50B1]" />{" "}
                      Categoria
                    </Label>
                    {isLoadingCategories ? (
                      <div className="text-xs text-zinc-500 h-10 flex items-center">
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />{" "}
                        Carregando...
                      </div>
                    ) : (
                      <select
                        id="category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full h-10 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B50B1]"
                      >
                        <option value="">Sem categoria</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
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
                      <Tag className="w-3.5 h-3.5 text-[#5B50B1]" /> Cupom
                      (Opcional)
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

              {/* URLs */}
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="imageUrl"
                      className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#5B50B1]" /> URL
                      da Imagem (Opcional)
                    </Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreviewError(false);
                      }}
                      className="h-10 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="affiliateLink"
                      className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1"
                    >
                      <Link2 className="w-3.5 h-3.5 text-[#5B50B1]" /> Link de
                      Afiliado *
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

                {imageUrl.trim().length > 10 && (
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded border overflow-hidden relative shrink-0 flex items-center justify-center">
                      {!imagePreviewError ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          onError={() => setImagePreviewError(true)}
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-zinc-400" />
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 truncate">
                      {imagePreviewError
                        ? "Não foi possível carregar a imagem"
                        : "Miniatura de confirmação"}
                    </span>
                  </div>
                )}
              </div>

              {/* Preços e Expiração */}
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
                      <DollarSign className="w-3.5 h-3.5" /> Preço promocional *
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
                      <Calendar className="w-3.5 h-3.5 text-[#5B50B1]" />{" "}
                      Expiração (Opcional)
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

              {/* Botão de Envio */}
              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoadingStores}
                  className={`w-full font-bold h-12 text-base rounded-lg shadow-md transition-all active:scale-[0.99] ${
                    editingOfferId
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-[#028850] hover:bg-[#00683d] text-white"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      {editingOfferId
                        ? "Atualizando..."
                        : "Guardando Oferta..."}
                    </>
                  ) : editingOfferId ? (
                    "Salvar Alterações"
                  ) : (
                    "Cadastrar Oferta"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Listagem e Gerenciamento */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
              <ListOrdered className="w-5 h-5 text-[#5B50B1]" /> Ofertas
              Cadastradas ({offers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingOffers ? (
              <div className="p-8 text-center text-zinc-500 flex items-center justify-center gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando lista de
                ofertas...
              </div>
            ) : offers.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                Nenhuma oferta cadastrada até o momento.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 bg-white rounded border overflow-hidden shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {offer.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                          <span className="font-bold text-[#E52427]">
                            R${" "}
                            {offer.promotional_price
                              .toFixed(2)
                              .replace(".", ",")}
                          </span>
                          {offer.stores?.name && (
                            <>
                              <span>•</span>
                              <span>{offer.stores.name}</span>
                            </>
                          )}
                          {offer.categories?.name && (
                            <>
                              <span>•</span>
                              <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                                {offer.categories.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(offer)}
                        className="h-8 px-2.5 text-xs flex items-center gap-1 border-zinc-300 dark:border-zinc-700"
                      >
                        <Pencil className="w-3.5 h-3.5 text-amber-600" /> Editar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deletingId === offer.id}
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="h-8 px-2.5 text-xs flex items-center gap-1"
                      >
                        {deletingId === offer.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Apagar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
