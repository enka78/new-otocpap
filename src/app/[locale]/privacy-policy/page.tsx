"use client";

import { useTranslations } from "next-intl";
import LegalPageLayout from "@/components/LegalPageLayout";
import { Shield, Database, Users, Lock, Link as LinkIcon, FileText, Copyright, AlertTriangle } from "lucide-react";

export default function PrivacyPolicyPage() {
    const t = useTranslations("footer");

    return (
        <LegalPageLayout title={t("privacyPolicy")}>
            <div className="space-y-8">

                <section>
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Database className="text-blue-600 w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">1. Kişisel Verilerin Toplanması</h2>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <p className="text-gray-700 mb-3">
                            Üyelik sistemi ve sipariş süreçleri kapsamında sizden; <strong>ad, soyad, adres, telefon, e-posta</strong> gibi iletişim bilgileri talep edilmektedir.
                        </p>
                        <p className="text-gray-700">
                            Bu bilgiler, <strong>fatura düzenleme, sipariş takibi ve müşteri hizmetleri</strong> amacıyla kullanılmaktadır.
                        </p>
                    </div>
                </section>

                <section>
                    <div className="flex items-center mb-4">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <Shield className="text-green-600 w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">2. Kişisel Verilerin Kullanımı</h2>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <p className="text-gray-700 mb-3">
                            Toplanan bilgiler, yalnızca <strong>ödeme işlemleri, ürün teslimatı ve müşteri hizmetleri</strong> için kullanılmaktadır.
                        </p>
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                            <p className="text-green-800">
                                <strong>✓</strong> Bilgileriniz Dönüşüm Medikal bünyesinde <strong>güvenli bir şekilde saklanmaktadır.</strong>
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center mb-4">
                        <div className="bg-orange-100 p-2 rounded-lg mr-3">
                            <Users className="text-orange-600 w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">3. Üçüncü Taraflarla Paylaşım</h2>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start">
                                <AlertTriangle className="text-amber-600 w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                                <p className="text-amber-900">
                                    Kişisel bilgileriniz, <strong>Dönüşüm Medikal'in onayı olmadan</strong> veya <strong>yasal bir yükümlülük bulunmadıkça</strong> üçüncü kişilerle paylaşılmaz.
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-700">
                            Yalnızca gerekli yetkiler çerçevesinde ve yasal düzenlemeler gereği açıklama yapılabilir.
                        </p>
                    </div>
                </section>

                <section>
                    <div className="flex items-center mb-4">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                            <FileText className="text-purple-600 w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">4. Bilgi Değişikliği ve Silme</h2>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <p className="text-gray-700">
                            Üyelik bilgilerinizde değişiklik yapmak veya üyeliğinizi silmek istediğinizde, talebiniz doğrultusunda bilgileriniz <strong>güncellenir veya silinir.</strong>
                        </p>
                    </div>
                </section>

                <section>
                    <div className="flex items-center mb-4">
                        <div className="bg-red-100 p-2 rounded-lg mr-3">
                            <Lock className="text-red-600 w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">5. Web Sitesi Güvenliği</h2>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                        <div className="flex items-start">
                            <span className="text-green-600 mr-2 mt-1">✓</span>
                            <p className="text-gray-700">
                                Web sitemizden girilen bilgiler, <strong>diğer kullanıcılar tarafından görüntülenemez.</strong>
                            </p>
                        </div>
                        <div className="flex items-start">
                            <span className="text-green-600 mr-2 mt-1">✓</span>
                            <p className="text-gray-700">
                                Sitemizde, bilgi güvenliğini sağlamak amacıyla <strong>sistem ve internet altyapısı en güvenilir seviyede</strong> tutulmakta ve gerekli önlemler alınmaktadır.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center mb-4">
                        <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                            <LinkIcon className="text-indigo-600 w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">6. Linkler ve Üçüncü Taraf Siteler</h2>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <p className="text-gray-700 mb-3">
                            Web sitemizdeki linkler ile ulaşabileceğiniz diğer sitelerdeki <strong>gizlilik uygulamaları ve içerik sorumluluğu Dönüşüm Medikal'i bağlamaz.</strong>
                        </p>
                        <p className="text-gray-700">
                            Bu sitelerdeki bilgiler için ilgili sitelerin gizlilik politikaları geçerlidir.
                        </p>
                    </div>
                </section>

                <section>
                    <div className="flex items-center mb-4">
                        <div className="bg-teal-100 p-2 rounded-lg mr-3">
                            <Users className="text-teal-600 w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">7. Bilgi Paylaşımı</h2>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <p className="text-gray-700 mb-3">
                            Dönüşüm Medikal, <strong>destek hizmetleri almak amacıyla</strong> farklı kuruluşlarla çalışabilir.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-900">
                                Bu firmalar, <strong>Dönüşüm Medikal'in gizlilik standartlarına uygun hareket etmekle yükümlüdür.</strong>
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center mb-4">
                        <div className="bg-gray-100 p-2 rounded-lg mr-3">
                            <Copyright className="text-gray-600 w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">8. Telif Hakları</h2>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <p className="text-gray-700">
                            Web sitemizdeki <strong>tüm bilgi ve materyallerin düzenlenmesi ile ilgili telif hakları Dönüşüm Medikal'e aittir.</strong>
                        </p>
                    </div>
                </section>

                <div className="mt-10 pt-6 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-start">
                            <Shield className="text-blue-600 w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gizliliğiniz Bizim İçin Önemlidir</h3>
                                <p className="text-gray-700 text-sm">
                                    Kişisel verilerinizin korunması konusunda herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz.
                                    Gizlilik politikamız, yasal düzenlemelere uygun olarak güncellenebilir.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 text-center mt-6">
                        <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR')}
                    </p>
                </div>

            </div>
        </LegalPageLayout>
    );
}
