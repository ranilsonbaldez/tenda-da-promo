"use client";

import { useState, useMemo } from "react";
import { OfferCard } from "@/components/offer-card";
import { Offer } from "@/types";
import { Search, Store, X } from "lucide-react";

interface OffersListProps {
  initialOffers: Offer[];
}

// Função para remover acentos e converter para minúsculas
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function OffersList({ initialOffers }: OffersListProps) {
  // Controle de visibilidade do painel expandido (loja + botão)
  const [isExpanded, setIsExpanded] = useState(false);

  // Estados dos inputs (filtragem em tempo real)
  const [searchInput, setSearchInput] = useState("");
  const [storeInput, setStoreInput] = useState("ALL");

  // Lista única de lojas extraídas das ofertas
  const stores = useMemo(() => {
    const storeMap = new Map<string, string>();
    initialOffers.forEach((offer) => {
      if (offer.stores?.name) {
        storeMap.set(offer.store_id, offer.stores.name);
      }
    });
    return Array.from(storeMap.entries()).map(([id, name]) => ({ id, name }));
  }, [initialOffers]);

  // Previne comportamento padrão do formulário ao clicar em Buscar/dar Enter
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  // Reseta todos os filtros
  function handleClear() {
    setSearchInput("");
    setStoreInput("ALL");
    setIsExpanded(false);
  }

  // Filtragem em TEMPO REAL (ignora acentos e case sensitivity)
  const filteredOffers = useMemo(() => {
    const normalizedSearch = normalizeText(searchInput);

    return initialOffers.filter((offer) => {
      const normalizedTitle = normalizeText(offer.title || "");
      const matchesSearch = normalizedTitle.includes(normalizedSearch);

      const matchesStore =
        storeInput === "ALL" || offer.store_id === storeInput;

      return matchesSearch && matchesStore;
    });
  }, [initialOffers, searchInput, storeInput]);

  const hasActiveFilters = searchInput.trim() !== "" || storeInput !== "ALL";

  return (
    <div className="space-y-6">
      {/* Formulário de Pesquisa */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all"
      >
        {/* Linha 1: Campo de texto da pesquisa */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Pesquisar oferta ou produto..."
            value={searchInput}
            onFocus={() => setIsExpanded(true)}
            onChange={(e) => {
              setSearchInput(e.target.value);
              if (!isExpanded) setIsExpanded(true);
            }}
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B50B1] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Linha 2: Exibida após clicar ou digitar no campo de busca */}
        {(isExpanded || hasActiveFilters) && (
          <div className="flex items-center gap-2 w-full pt-1 animate-in fade-in duration-200">
            {/* Dropdown de Lojas */}
            <div className="relative flex-1">
              <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <select
                value={storeInput}
                onChange={(e) => setStoreInput(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B50B1] text-zinc-900 dark:text-zinc-100 appearance-none cursor-pointer truncate"
              >
                <option value="ALL">Todas as Lojas</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão Buscar */}
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#5B50B1] hover:bg-[#4a4096] text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>
        )}

        {/* Link para limpar busca caso haja filtro ativo */}
        {hasActiveFilters && (
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-semibold text-[#E52427] hover:underline"
            >
              Limpar busca
            </button>
          </div>
        )}
      </form>

      {/* Lista de Ofertas */}
      {filteredOffers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/50 p-6">
          <p className="text-zinc-600 dark:text-zinc-400 font-medium text-sm">
            Nenhuma promoção encontrada para essa pesquisa.
          </p>
          <button
            type="button"
            onClick={handleClear}
            className="mt-3 text-xs font-bold text-[#5B50B1] underline"
          >
            Ver todas as ofertas
          </button>
        </div>
      )}
    </div>
  );
}
