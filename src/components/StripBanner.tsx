"use client";

import { Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function StripBanner() {
  const { deliverySettings } = useCart();


  return (
    <div className="bg-orange-600 text-white py-3 px-4 shadow-md relative z-10 ">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center space-x-2 animate-fade-in">
        <Truck />
        <span className="font-bold text-xs md:text-base">
          ₺{deliverySettings.freeShippingThreshold.toLocaleString("tr-TR", {
            maximumFractionDigits: 0,
          })}{" "}
          ve üzeri alışverişlerinizde KARGO BEDAVA!
        </span>
      </div>
    </div>
  );
}
