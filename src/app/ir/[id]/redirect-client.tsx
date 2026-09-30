"use client";

import { useEffect } from "react";

export default function RedirectClient({
  destination,
}: {
  destination: string;
}) {
  useEffect(() => {
    if (destination) {
      window.location.replace(destination);
    }
  }, [destination]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 text-zinc-800 p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mb-4"></div>
      <p className="text-sm font-medium">Redirecionando para a oferta...</p>
      <a href={destination} className="mt-2 text-xs text-blue-600 underline">
        Clique aqui se não for redirecionado automaticamente
      </a>
    </div>
  );
}
