"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tag, Layers } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Category } from "@/types";

interface CategoryMenuProps {
  categories: Category[];
}

export function CategoryMenu({ categories }: CategoryMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lê a categoria selecionada diretamente da URL (?category=ID)
  const selectedCategory = searchParams.get("category");

  const handleSelect = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }

    // Atualiza a URL mantendo outros filtros
    router.push(`/?${params.toString()}`);
    setOpen(false); // Fecha o Sheet
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/30 hover:bg-white/50 text-[#E52427] rounded-2xl w-11 h-11 flex items-center justify-center transition-all active:scale-95 shadow-xs"
        >
          {/* Ícone customizado com 3 traços vermelhos grossos */}
          <div className="flex flex-col justify-between h-4.5 w-5">
            <span className="h-1 w-full bg-[#E52427] rounded-full" />
            <span className="h-1 w-full bg-[#E52427] rounded-full" />
            <span className="h-1 w-full bg-[#E52427] rounded-full" />
          </div>
          <span className="sr-only">Abrir menu de categorias</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-75 sm:w-87.5">
        <SheetHeader className="border-b pb-4 mb-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold">
            <Layers className="w-5 h-5 text-[#E52427]" />
            Categorias
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-120px)] pr-1">
          {/* Opção para limpar o filtro e mostrar todas */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
              selectedCategory === null
                ? "bg-[#5B50B1] text-white"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <Tag className="w-4 h-4" />
            Todas as Ofertas
          </button>

          <hr className="my-2 border-zinc-200 dark:border-zinc-800" />

          {/* Lista de Categorias vindas do Supabase */}
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleSelect(category.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  isSelected
                    ? "bg-[#5B50B1] text-white"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
