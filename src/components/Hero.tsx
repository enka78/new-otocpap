"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight } from "lucide-react";
import { supabase, Banner, getBannerImageUrl } from "@/lib/supabase";
import Image from "next/image";

export default function Hero() {
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations();
  const locale = useLocale();

  useEffect(() => {
    fetchActiveBanner();

    // Her 5 dakikada bir aktif banner'ı kontrol et
    const interval = setInterval(() => {
      fetchActiveBanner();
    }, 5 * 60 * 1000); // 5 dakika

    return () => clearInterval(interval);
  }, []);

  const fetchActiveBanner = async () => {
    try {
      const now = new Date().toISOString();

      // Aktif banner'ları çek (tarih aralığında olanlar)
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .lte("start_date", now)
        .gte("end_date", now)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setCurrentBanner(data[0] as unknown as Banner);
      } else {
        // Aktif banner yoksa, en son eklenen banner'ı al (default)
        const { data: defaultData, error: defaultError } = await supabase
          .from("banners")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);

        if (defaultError) throw defaultError;

        if (defaultData && defaultData.length > 0) {
          setCurrentBanner(defaultData[0] as unknown as Banner);
        }
      }
    } catch (error) {
      console.error("Error fetching banner:", error);
      // Hata durumunda default banner
      setCurrentBanner({
        id: 0,
        title: t("hero.title"),
        sub_title: t("hero.subtitle"),
        image: undefined,
        add_button: false,
        btn_text: undefined,
        add_link: undefined,
        created_at: new Date().toISOString(),
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 overflow-hidden">
      {/* Background Image */}
      {currentBanner?.image && (
        <div className="absolute inset-0">
          <Image
            src={getBannerImageUrl(currentBanner.image)}
            alt="Banner Background"
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
            priority
          />
        </div>
      )}

      <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="relative bg-black/30 backdrop-blur-sm rounded-2xl px-10 py-16">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded mb-6"></div>
                <div className="h-6 bg-gray-200 rounded mb-8"></div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                  {currentBanner?.title || t("hero.title")}
                </h1>
                <p className="text-xl text-white mb-8 leading-relaxed">
                  {currentBanner?.sub_title || t("hero.subtitle")}
                </p>
              </>
            )}

            {/* CTA Button */}
            {currentBanner?.add_button && currentBanner?.add_link ? (
              <Link
                href={currentBanner.add_link}
                className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors group"
              >
                {currentBanner.btn_text || t("hero.cta")}
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </Link>
            ) : (
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors group"
              >
                {t("hero.cta")}
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </Link>
            )}
          </div>
        </div>
        <div className="absolute  -top-8 left-30 bg-blue-600 text-white py-2 px-6 rounded-xl shadow-lg">
          <div className="text-sm font-semibold">{t("hero.freeInstallation")}</div>
          <div className="text-xs">{t("hero.installation")}</div>
        </div>

        <div className="absolute  -top-10 left-15 bg-green-500 text-white p-4 rounded-xl shadow-lg">
          <div className="text-sm font-semibold">{t("hero.support247")}</div>
          <div className="text-xs">{t("hero.support")}</div>
        </div>
      </div>
    </section>
  );
}
