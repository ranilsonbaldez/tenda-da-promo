import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Aguarda os parâmetros da URL
  const { id } = await params;

  // 1. Busca o link original de afiliado
  const { data: offer, error } = await supabase
    .from("offers")
    .select("affiliate_link")
    .eq("id", id)
    .single();

  // Se houver erro ou link não cadastrado, volta para a home
  if (error || !offer || !offer.affiliate_link) {
    console.error("Oferta não encontrada ou sem link de afiliado:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Registra o clique assincronamente no banco
  supabase.from("clicks").insert({ offer_id: id }).then();

  // 3. Redireciona para o link de afiliado cadastrado
  return NextResponse.redirect(offer.affiliate_link);
}
