"use client";

import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandsSection from "@/components/BrandsSection";
import { CheckCircle, Users, Award, Clock } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {t("about.title")}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t("about.description")}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-blue-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {t("about.experienceYears")}
              </div>
              <div className="text-gray-600">{t("about.experienceDesc")}</div>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {t("about.happyCustomers")}
              </div>
              <div className="text-gray-600">
                {t("about.happyCustomersDesc")}
              </div>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-purple-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {t("about.authorizedBrands")}
              </div>
              <div className="text-gray-600">
                {t("about.authorizedBrandsDesc")}
              </div>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-orange-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {t("about.support247")}
              </div>
              <div className="text-gray-600">{t("about.support247Desc")}</div>
            </div>
          </div>

          {/* Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {t("about.ourStory")}
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>{t("about.storyP1")}</p>
                <p>{t("about.storyP2")}</p>
                <p>{t("about.storyP3")}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t("about.ourMission")}
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {t("about.qualityService")}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {t("about.qualityServiceDesc")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {t("about.expertSupport")}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {t("about.expertSupportDesc")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {t("about.reliability")}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {t("about.reliabilityDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Brands Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              {t("home.authorizedBrands")}
            </h2>
            <BrandsSection variant="grid" />
          </div>

          {/* Services Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("about.freeInstallation")}
              </h3>
              <p className="text-gray-600">{t("about.freeInstallationDesc")}</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("about.expertConsultancy")}
              </h3>
              <p className="text-gray-600">
                {t("about.expertConsultancyDesc")}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("about.support247Title")}
              </h3>
              <p className="text-gray-600">{t("about.support247DescLong")}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
