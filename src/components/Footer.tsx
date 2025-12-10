"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Phone, Clock } from "lucide-react";
import BrandsSection from "@/components/BrandsSection";

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold mb-4">
              <span className="text-blue-400">Oto</span>
              <span className="text-white">Cpap</span>
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

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>{t("footer.copyRight")}</p>
        </div>
      </div>
    </footer>
  );
}
