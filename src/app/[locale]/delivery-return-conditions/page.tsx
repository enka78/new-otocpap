"use client";

import { useTranslations } from "next-intl";
import LegalPageLayout from "@/components/LegalPageLayout";
import { Truck, RotateCcw, ShieldCheck, AlertCircle, Package, Clock, Mail } from "lucide-react";

export default function DeliveryReturnConditionsPage() {
    const t = useTranslations("footer");

    return (
        <LegalPageLayout title={t("deliveryReturnConditions")}>
            <div className="space-y-10">

                {/* Teslimat Bölümü */}
                <section>
                    <div className="flex items-center mb-6">
                        <div className="bg-blue-100 p-3 rounded-lg mr-3">
                            <Truck className="text-blue-600 w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Teslimat Şartları</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Kargo Süreci */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="flex items-center mb-4">
                                <Clock className="text-blue-600 w-5 h-5 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Kargo Süreci ve Teslimat</h3>
                            </div>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    <span>Siparişleriniz <strong>1-3 iş günü</strong> içinde kargoya teslim edilir.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    <span>Hafta sonu ve resmi tatillerde verilen siparişler ilk iş günü işleme alınır.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    <span>Kargoya verildikten sonra teslimat süresi bulunduğunuz şehre göre ortalama <strong>1-5 iş günü</strong> arasındadır.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    <span>Kargonuz kargoya teslim edildiğinde tarafınıza <strong>SMS ve e-posta</strong> ile takip numarası gönderilir.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Teslimatta Dikkat */}
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg">
                            <div className="flex items-start">
                                <AlertCircle className="text-amber-600 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold text-amber-900 mb-3">Teslimatta Dikkat Edilmesi Gerekenler</h3>
                                    <ul className="space-y-2 text-amber-800">
                                        <li className="flex items-start">
                                            <span className="mr-2">⚠️</span>
                                            <span>Kargonuzu teslim alırken paketi kontrol etmeniz önemlidir.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">⚠️</span>
                                            <span>Hasarlı, açılmış veya yırtılmış paket olması durumunda teslim almadan <strong>tutanak tutturmanız</strong> gerekir.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">⚠️</span>
                                            <span>Tutanak tutulmayan hasarlı gönderilerde sorumluluk müşteriye aittir.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Cihaz Teslimatı */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="flex items-center mb-4">
                                <Package className="text-green-600 w-5 h-5 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Satın Alınan Cihazların Teslimatı</h3>
                            </div>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Solunum ve uyku cihazları (CPAP, Auto CPAP, BiPAP, aksesuar vb.) <strong>orijinal kutusunda, kapalı ambalajla</strong> gönderilir.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Hijyen gerektiren ürün olduğu için ambalajı açılmış cihazlar <strong>kesinlikle ikinci kez satışa sunulmaz.</strong></span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* İade Bölümü */}
                <section>
                    <div className="flex items-center mb-6">
                        <div className="bg-orange-100 p-3 rounded-lg mr-3">
                            <RotateCcw className="text-orange-600 w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">İade ve Değişim Şartları</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Genel İade Politikası */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">Genel İade Politikası</h3>
                            <p className="text-blue-800">
                                Uyku ve solunum tedavi cihazları, <strong>kişisel sağlık ürünleri</strong> olduğu için mevzuat gereği özel bir iade sürecine tabidir.
                            </p>
                        </div>

                        {/* İade Edilemeyen Ürünler */}
                        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg">
                            <div className="flex items-start">
                                <AlertCircle className="text-red-600 w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-red-900 mb-3">İade Edilemeyen Ürünler</h3>
                                    <p className="text-red-800 mb-3 font-medium">
                                        Aşağıdaki ürünlerde <strong>ambalaj açıldığında iade kabul edilmez:</strong>
                                    </p>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-red-700">
                                        <li className="flex items-start">
                                            <span className="mr-2">❌</span>
                                            <span>CPAP / Auto CPAP / BiPAP cihazları</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">❌</span>
                                            <span>Maskeler (Burun, burun yastıklı, tam yüz)</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">❌</span>
                                            <span>Hortumlar</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">❌</span>
                                            <span>Humidifier aksesuarları</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">❌</span>
                                            <span>Filtreler</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">❌</span>
                                            <span>Ağızlık, burun pedi, silikon parçalar</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">❌</span>
                                            <span>Hijyenik tıbbi aksesuarlar</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
                                        <p className="text-green-800 text-sm">
                                            ✅ <strong>Ambalajı açılmamış, kullanılmamış</strong> ürünlerde <strong>14 gün içinde iade hakkı vardır.</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Arızalı Ürün İadesi */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Arızalı veya Ayıplı Ürün İadesi</h3>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2 font-bold">1.</span>
                                    <span>Ürün size ulaştığında çalışmıyor, kırık veya eksik parça varsa <strong>48 saat içinde</strong> bizimle iletişime geçmelisiniz.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2 font-bold">2.</span>
                                    <span>Arızalı ürün tarafımıza ulaştıktan sonra <strong>teknik ekip incelemesi</strong> yapılır.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2 font-bold">3.</span>
                                    <span>Fabrika üretim hatası tespit edilirse <strong>ücretsiz değişim</strong> yapılır.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Kullanılmış Ürün İadesi */}
                        <div className="bg-gray-100 border border-gray-300 rounded-xl p-5">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Kullanılmış Ürün İadesi</h3>
                            <p className="text-gray-700">
                                <strong>Hijyen yönetmeliği gereği</strong> kullanılmış cihazlar, takılmış maskeler ve denenmiş aksesuarlar <strong className="text-red-600">kesinlikle iade alınmaz.</strong>
                            </p>
                        </div>

                        {/* İade Süreci */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">İade Süreci Nasıl İşler?</h3>
                            <ol className="space-y-3 text-gray-700">
                                <li className="flex items-start">
                                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">1</span>
                                    <span>İade talebinizi <strong>info@otocpap.com</strong> adresine sipariş numaranız ile iletin.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">2</span>
                                    <span>Ürün, <strong>orijinal kutusu ve tüm aksesuarları</strong> ile tarafımıza gönderilir.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">3</span>
                                    <span>İnceleme tamamlandıktan sonra iade onaylanırsa, ücretiniz <strong>3–7 iş günü</strong> içinde ödeme yaptığınız yöntemle iade edilir.</span>
                                </li>
                            </ol>
                        </div>

                        {/* Kargo Ücretleri */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kargo Ücretleri</h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span className="text-gray-700">Hatalı veya arızalı ürün kaynaklı iadelerde kargo ücreti <strong className="text-green-600">firmamıza aittir.</strong></span>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-orange-600 mr-2">•</span>
                                    <span className="text-gray-700">Diğer iade taleplerinde kargo ücreti <strong>müşteriye aittir.</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Garanti Bölümü */}
                <section>
                    <div className="flex items-center mb-6">
                        <div className="bg-green-100 p-3 rounded-lg mr-3">
                            <ShieldCheck className="text-green-600 w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Cihazlarda Garanti</h2>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span>Tüm cihazlar <strong>2 yıl Resmi Türkiye Garantisi</strong> altındadır.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span>Arıza durumlarında <strong>kullanıcı kaynaklı olmayan</strong> sorunlar garanti kapsamında değerlendirilir.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* İletişim */}
                <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                        <Mail className="text-blue-600 w-6 h-6 mr-2" />
                        <h3 className="text-xl font-semibold text-gray-900">İletişim</h3>
                    </div>
                    <p className="text-gray-700 mb-3">
                        Her türlü soru, destek veya iade talepleriniz için:
                    </p>
                    <a
                        href="mailto:info@otocpap.com"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Mail className="w-5 h-5 mr-2" />
                        info@otocpap.com
                    </a>
                </section>

            </div>
        </LegalPageLayout>
    );
}
