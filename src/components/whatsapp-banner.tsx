// import { MessageCircle } from "lucide-react";

export function WhatsappBanner() {
  const WHATSAPP_GROUP_URL =
    "https://chat.whatsapp.com/IgekRAdbzDa6EisXa0ChN5?s=sh&p=a&mlu=4&ilr=4"; // Coloque o link do seu grupo aqui

  return (
    <div className="bg-[#0fad49] text-white py-2 px-4 text-center font-medium text-xs sm:text-sm shadow-xs border-b border-emerald-600/20">
      <div className="container mx-auto flex items-center justify-center gap-1.5 flex-wrap">
        {/* <MessageCircle className="w-4 h-4 shrink-0 fill-white text-[#25D366]" /> */}
        <span>
          Entre no nosso grupo do WhatsApp e receba ofertas em tempo real.
        </span>
        <a
          href={WHATSAPP_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-[#128C7E] font-extrabold px-2.5 py-0.5 rounded-full hover:bg-emerald-50 transition-all hover:underline shrink-0 ml-1 shadow-xs"
        >
          GRUPO DE OFERTAS
        </a>
      </div>
    </div>
  );
}
