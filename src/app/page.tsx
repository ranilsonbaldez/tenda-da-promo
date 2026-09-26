import { supabase } from "@/lib/supabase";
import { OfferCard } from "@/components/offer-card";
import { Offer } from "@/types";
import { Flame, ShoppingBag } from "lucide-react";

// Força a página a buscar dados atualizados do servidor a cada acesso
export const revalidate = 0;

export default async function HomePage() {
  const now = new Date().toISOString();

  const { data: offers } = await supabase
    .from("offers")
    .select("*, stores(name, logo_url)")
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header Tenda da Promo */}
      <header className="bg-orange-500 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white text-orange-500 p-2 rounded-xl font-black text-xl flex items-center justify-center shadow">
              <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight block leading-none">
                TENDA DA PROMO
              </span>
              <span className="text-[10px] text-orange-100 font-medium tracking-wide uppercase">
                Quem procura preço baixo, acampa aqui!
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-zinc-900 text-white py-8 px-4 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold flex items-center justify-center md:justify-start gap-2">
              <Flame className="w-8 h-8 text-orange-500 animate-pulse" /> As
              melhores ofertas da internet só aqui!
            </h1>
            <p className="text-zinc-400 mt-2 text-sm md:text-base">
              Selecionamos os melhores preços e cupons do Mercado Livre, Amazon,
              Magalu e Shopee em um só lugar.
            </p>
          </div>
        </div>
      </section>

      {/* Vitrine de Produtos */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {offers && offers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer as Offer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
            <p className="text-zinc-500 font-medium">
              Nenhuma promoção cadastrada na Tenda no momento.
            </p>
          </div>
        )}
      </main>

      {/* Rodapé simples */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Tenda da Promo. Todos os direitos
        reservados.
      </footer>
    </div>
  );
}
