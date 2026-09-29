import { supabase } from "@/lib/supabase";
import { OfferCard } from "@/components/offer-card";
import { Offer } from "@/types";

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
      

{/* Header Tenda da Promo (Amarelo FACC15) */}
<header className="bg-[#FACC15] border-b border-yellow-500/30 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    <div className="flex flex-col items-start text-left select-none">
      {/* TENDA DA (Roxo / Itálico / Ultra Negrito) */}
      <div className="font-(family-name:--font-montserrat) italic font-black text-xl md:text-2xl text-[#5B50B1] tracking-normal leading-none">
        TENDA DA
      </div>

      {/* PR%MO (Vermelho com Selo Central) */}
      <div className="font-(family-name:--font-montserrat) italic font-black text-3xl md:text-4xl text-[#E52427] flex items-center leading-none mt-0.5 tracking-tight">
        <span>PR</span>

        {/* Selo de Porcentagem */}
        <div className="relative mx-0.5 inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 bg-[#E52427] text-[#FACC15] rounded-full text-xs md:text-sm font-black not-italic shadow-sm">
          %
        </div>

        <span>MO</span>
      </div>

      {/* Slogan */}
      <span className="font-(family-name:--font-inter) text-[11px] md:text-xs text-zinc-900 font-semibold tracking-tight mt-1 text-left">
        Quem procura preço baixo, acampa aqui.
      </span>
    </div>
  </div>
</header>

{/* Banner Informativo Fixo (Roxo da Marca) */}
<div className="bg-[#5B50B1] text-white font-medium py-2 px-4 text-left text-xs md:text-sm shadow-inner">
  <div className="max-w-7xl mx-auto">
    Selecionamos os melhores preços e cupons do{" "}
    <span className="font-bold text-[#FACC15]">Mercado Livre</span>,{" "}
    <span className="font-bold text-[#FACC15]">Amazon</span>,{" "}
    <span className="font-bold text-[#FACC15]">Magalu</span> e{" "}
    <span className="font-bold text-[#FACC15]">Shopee</span> em um só lugar.
  </div>
</div>

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
