import { supabase } from "@/lib/supabase";
import { Offer, Category } from "@/types";
import { OffersList } from "@/components/offers-list";
import { CategoryMenu } from "@/components/category-menu";
import { WhatsappBanner } from "@/components/whatsapp-banner";

export const revalidate = 0;

export default async function HomePage() {
  const now = new Date().toISOString();

  // 1. Buscar Ofertas com os relacionamentos
  const { data: offers } = await supabase
    .from("offers")
    .select("*, stores(name, logo_url), categories(name, slug)")
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("created_at", { ascending: false });

  // 2. Buscar Categorias para o Menu
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

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

          {/* NOVO: Menu Hambúrguer no Topo Amarelo */}
          <div className="flex items-center">
            <CategoryMenu categories={(categories as Category[]) || []} />
          </div>

          {/* O menu de categorias será renderizado pelo OffersList ou colocado aqui via Client Wrapper se necessário */}
        </div>
      </header>

      {/* 2. Banner do WhatsApp fixo logo abaixo do topo */}
      <WhatsappBanner />

      {/* Banner Informativo Fixo (Roxo da Marca) */}
      <div className="bg-[#5B50B1] text-white font-medium py-2 px-4 text-left text-xs md:text-sm shadow-inner">
        <div className="max-w-7xl mx-auto">
          Selecionamos os melhores preços e cupons do{" "}
          <span className="font-bold text-[#FACC15]">Mercado Livre</span>,{" "}
          <span className="font-bold text-[#FACC15]">Amazon</span>,{" "}
          <span className="font-bold text-[#FACC15]">Magalu</span> e{" "}
          <span className="font-bold text-[#FACC15]">Shopee</span> em um só
          lugar.
        </div>
      </div>

      {/* Vitrine de Produtos com Filtro e Pesquisa */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <OffersList
          initialOffers={(offers as Offer[]) || []}
          categories={(categories as Category[]) || []}
        />
      </main>

      {/* Rodapé simples */}
      <footer className="w-full bg-zinc-900 text-zinc-400 py-6 mt-12 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center text-center text-sm">
          <p>
            © {new Date().getFullYear()} Tenda da Promo. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
