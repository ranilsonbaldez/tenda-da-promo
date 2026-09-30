"use client";

import { useState, useMemo } from "react";
import { OfferCard } from "@/components/offer-card";
import { Offer } from "@/types";
import { Search, Store, X } from "lucide-react";

interface OffersListProps {
  initialOffers: Offer[];
}

export function OffersList({ initialOffers }: OffersListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState("ALL");

  // Lista dinâmica de lojas presentes nas ofertas
  const stores = useMemo(() => {
    const storeMap = new Map<string, string>();
    initialOffers.forEach((offer) => {
      if (offer.stores?.name) {
        storeMap.set(offer.store_id, offer.stores.name);
      }
    });
    return Array.from(storeMap.entries()).map(([id, name]) => ({ id, name }));
  }, [initialOffers]);

  // Filtro combinado de busca por título e filtro por loja
  const filteredOffers = useMemo(() => {
    return initialOffers.filter((offer) => {
      const matchesSearch = offer.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());

      const matchesStore =
        selectedStore === "ALL" || offer.store_id === selectedStore;

      return matchesSearch && matchesStore;
    });
  }, [initialOffers, searchTerm, selectedStore]);

  const hasFiltersActive = searchTerm.length > 0 || selectedStore !== "ALL";

  function clearFilters() {
    setSearchTerm("");
    setSelectedStore("ALL");
  }

  return (
    <div className="space-y-6">
      {/* Barra de Pesquisa e Filtro por Loja */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Campo de Pesquisa */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Pesquisar oferta ou produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B50B1] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown de Lojas */}
        <div className="relative w-full md:w-64">
          <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B50B1] text-zinc-900 dark:text-zinc-100 appearance-none cursor-pointer"
          >
            <option value="ALL">Todas as Lojas</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {/* Botão para Limpar Filtros (aparece se houver filtro ativo) */}
        {hasFiltersActive && (
          <button
            onClick={clearFilters}
            className="w-full md:w-auto px-4 py-2.5 text-xs font-semibold text-[#E52427] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 transition-colors whitespace-nowrap"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Exibição da Lista das Ofertas */}
      {filteredOffers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/50 p-6">
          <p className="text-zinc-600 dark:text-zinc-400 font-medium">
            Nenhuma promoção encontrada.
          </p>
          {hasFiltersActive && (
            <button
              onClick={clearFilters}
              className="mt-3 text-xs font-bold text-[#5B50B1] underline hover:opacity-80"
            >
              Mostrar todas as ofertas
            </button>
          )}
        </div>
      )}
    </div>
  );
}
