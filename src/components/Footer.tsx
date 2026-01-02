"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Phone, Clock } from "lucide-react";
import BrandsSection from "@/components/BrandsSection";
import Image from "next/image";

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex gap-2 text-2xl font-bold">
              <Image
                src="/logo-white.svg"
                alt="PayTR"
                width={26}
                height={26}
                className="object-contain"
              />
              <div className="text-2xl font-bold">
                <span className="text-blue-400">Oto</span>
                <span className="text-white">Cpap</span>
              </div>
            </div>
            <div className="text-lg text-gray-300 mb-2">
              {t("footer.company")}
            </div>
            <p className="text-gray-400 mb-4">
              Zuhuratbaba Mah. Dr. Tevfik Sağlam Cad. No:5 Bakırköy/İSTANBUL
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+90 553 280 82 73</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400 mt-2">
              <Clock size={16} />
              <div>
                <div>{t("contact.weekdays")}</div>
                <div>{t("contact.saturday")}</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/products`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("nav.products")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/blog`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("nav.blog")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("footer.information")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/privacy-policy`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/distance-sales-agreement`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footer.distanceSalesAgreement")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/delivery-return-conditions`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footer.deliveryReturnConditions")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/faq`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footer.faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.brands")}</h3>
            <BrandsSection variant="footer" />
          </div>
        </div>

        {/* Payment Trust Badge - PayTR */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>{t("footer.copyRight")}</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-xs text-center md:text-right">
              Ödemeleriniz PayTR güvenli ödeme altyapısı ile 256-bit SSL
              üzerinden korunmaktadır.
            </span>
            <div className="h-8 w-24 relative opacity-90 hover:opacity-100 transition-opacity">
              <img
                src="/PayTR-Logo.svg"
                alt="PayTR"
                className="h-full w-full object-contain brightness-0 invert"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
