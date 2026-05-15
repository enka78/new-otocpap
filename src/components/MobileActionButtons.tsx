"use client";

import { Phone, MessageCircle } from "lucide-react";

const PHONE_NUMBER = "05532808273";
const WHATSAPP_LINK = `https://wa.me/905532808273`;

export default function MobileActionButtons() {
  return (
    <>
      {/* Mobil sabit butonlar container */}
      <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3 md:hidden">
        {/* Telefon Butonu */}
        <a
          href={`tel:${PHONE_NUMBER}`}
          className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Bizi Arayın"
        >
          <Phone size={24} />
        </a>

        {/* WhatsApp Butonu */}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="WhatsApp'tan Yazın"
        >
          <MessageCircle size={26} />
        </a>
      </div>
    </>
  );
}