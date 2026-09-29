"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, PlusCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Store {
  id: string;
  name: string;
}

export default function NewOfferPage() {
  const router = useRouter();

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

  // Buscar lojas disponíveis ao montar o componente
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

  // Função auxiliar para gerar slug a partir do título
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

  // Processar o envio do formulário
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setIsSuccess(false);

    try {
      // Tratar vírgulas e converter para números
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

      // Payload exatamente alinhado com o schema SQL da tabela 'offers'
      const payload = {
        title: title.trim(),
        slug: createSlug(title),
        image_url: imageUrl.trim(),
        affiliate_link: affiliateLink.trim(), // Ajustado de affiliate_url para affiliate_link
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

      // Limpar os campos do formulário
      setTitle("");
      setImageUrl("");
      setAffiliateLink("");
      setOriginalPrice("");
      setPromotionalPrice("");
      setCouponCode("");
      setExpiresAt("");
      setIsFeatured(false);

      // Redirecionar após pequeno intervalo
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
} catch (err: unknown) {
  console.error("Erro na submissão:", err);
  const message =
    err instanceof Error ? err.message : "Ocorreu um erro ao cadastrar a promoção.";
  setErrorMessage(message);
}finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para a Vitrine
        </Link>

        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md">
          <CardHeader className="bg-[#5B50B1] text-white rounded-t-xl py-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#FACC15]" /> Cadastrar Nova
              Oferta
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {isSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Oferta cadastrada com sucesso! Redirecionando...</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                <strong>Erro:</strong> {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Título da Oferta */}
              <div>
                <Label htmlFor="title" className="font-bold">
                  Título da Oferta *
                </Label>
                <Input
                  id="title"
                  type="text"
                  required
                  placeholder="Ex: Fone Sem Fio Bluetooth QCY MeloBuds Pro"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                  }
                  className="mt-1"
                />
              </div>

              {/* Loja e Código do Cupom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store" className="font-bold">
                    Loja / Plataforma *
                  </Label>
                  {isLoadingStores ? (
                    <div className="text-xs text-zinc-500 py-2">
                      Carregando lojas...
                    </div>
                  ) : (
                    <select
                      id="store"
                      required
                      value={storeId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setStoreId(e.target.value)
                      }
                      className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B50B1]"
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
                  <Label htmlFor="coupon" className="font-bold">
                    Código de Cupom (Opcional)
                  </Label>
                  <Input
                    id="coupon"
                    type="text"
                    placeholder="Ex: PROMO10"
                    value={couponCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCouponCode(e.target.value)
                    }
                    className="mt-1 font-mono uppercase"
                  />
                </div>
              </div>

              {/* URL da Imagem e Link de Afiliado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imageUrl" className="font-bold">
                    URL da Imagem do Produto *
                  </Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    required
                    placeholder="https://.../imagem.jpg"
                    value={imageUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setImageUrl(e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="affiliateLink" className="font-bold">
                    Link de Afiliado *
                  </Label>
                  <Input
                    id="affiliateLink"
                    type="url"
                    required
                    placeholder="https://mercadolivre.com/sec/..."
                    value={affiliateLink}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAffiliateLink(e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Preço Original e Preço Promocional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="originalPrice" className="font-bold">
                    Preço Original (De) - R$
                  </Label>
                  <Input
                    id="originalPrice"
                    type="text"
                    placeholder="199,90"
                    value={originalPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setOriginalPrice(e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="promotionalPrice" className="font-bold">
                    Preço Promocional (Por) * - R$
                  </Label>
                  <Input
                    id="promotionalPrice"
                    type="text"
                    required
                    placeholder="129,90"
                    value={promotionalPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPromotionalPrice(e.target.value)
                    }
                    className="mt-1 font-bold text-[#E52427]"
                  />
                </div>
              </div>

              {/* Data de Expiração e Sinalizador de Destaque */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <Label htmlFor="expiresAt" className="font-bold">
                    Data e Hora de Expiração (Opcional)
                  </Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setExpiresAt(e.target.value)
                    }
                    className="mt-1 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setIsFeatured(e.target.checked)
                    }
                    className="w-4 h-4 accent-[#E52427] rounded cursor-pointer"
                  />
                  <Label
                    htmlFor="isFeatured"
                    className="cursor-pointer text-sm font-bold text-zinc-800 dark:text-zinc-200 select-none"
                  >
                    Destaque (Selo de Fogo 💥)
                  </Label>
                </div>
              </div>

              {/* Botão de Submissão */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#E52427] hover:bg-[#c91d20] text-white font-bold py-3 text-base"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Cadastrando Oferta...
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