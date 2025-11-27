"use client";

import { useTranslations } from "next-intl";
import LegalPageLayout from "@/components/LegalPageLayout";
import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, Phone } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string | JSX.Element;
}

export default function FAQPage() {
    const t = useTranslations("footer");
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqs: FAQItem[] = [
        {
            question: "1. CPAP ve BiPAP tedavisi nedir?",
            answer: (
                <div className="space-y-3">
                    <p>
                        <strong>CPAP (Continuous Positive Airway Pressure)</strong> ve <strong>BiPAP (Bilevel Positive Airway Pressure)</strong> cihazları,
                        uyku sırasında tıkayıcı uyku apnesi yaşayan hastalarda hava yolunun sürekli açık kalmasını sağlayan cihazlardır.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>CPAP cihazı:</strong> Tek seviyeli pozitif basınç uygular</li>
                        <li><strong>BiPAP cihazı:</strong> Nefes alırken ve verirken farklı basınç seviyeleri sunar</li>
                    </ul>
                    <p className="text-green-700 font-medium">
                        ✓ Düzenli kullanıldığında uykunun kesintisiz ve dinlendirici olmasını sağlar.
                    </p>
                </div>
            ),
        },
        {
            question: "2. CPAP veya BiPAP cihazı alırken nelere dikkat etmeliyim?",
            answer: (
                <div className="space-y-3">
                    <p>Cihaz alırken dikkat etmeniz gereken <strong>üç temel adım</strong> vardır:</p>
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">1. Uygun cihaz tipini seçmek:</h4>
                            <p className="text-blue-800">
                                CPAP, APAP, BiPAP, BiPAP ST veya BiPAP ASV gibi cihaz tiplerinden <strong>uyku doktorunuzun önerisine uygun olanı</strong> tercih edin.
                            </p>
                        </div>
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                            <h4 className="font-semibold text-green-900 mb-2">2. Cihaz markasını seçmek:</h4>
                            <p className="text-green-800">
                                Bilinen ve güvenilir markaları tercih edin (ör. <strong>ResMed, Philips Respironics</strong>).
                            </p>
                        </div>
                        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                            <h4 className="font-semibold text-purple-900 mb-2">3. Cihazı alacağınız firma:</h4>
                            <p className="text-purple-800">
                                <strong>Satış sonrası destek ve teknik servis</strong> sağlayan, uzun yıllardır sektörde olan firmalardan satın alın.
                            </p>
                        </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mt-4">
                        <p className="text-amber-900">
                            <strong>⚠️ Önemli Not:</strong> Maske seçimi cihaz kadar önemlidir. <strong>Burnunuza uygun maskeyi test etmeden cihaz almayın.</strong>
                        </p>
                    </div>
                </div>
            ),
        },
        {
            question: "3. CPAP cihazını SGK üzerinden alabilir miyim?",
            answer: (
                <div className="space-y-3">
                    <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                        <p className="text-green-900 font-medium mb-2">✅ Evet, CPAP cihazları SGK ödemesine tabidir.</p>
                        <p className="text-green-800">Fark ödemeden temin edebilirsiniz.</p>
                    </div>
                    <p className="text-gray-700">
                        Daha fazla bilgi ve yönlendirme için firmamız ile iletişime geçebilirsiniz:
                    </p>
                    <a href="tel:05532808273" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Phone className="w-4 h-4 mr-2" />
                        0553 280 82 73
                    </a>
                </div>
            ),
        },
        {
            question: "4. Uyku testi evde mi yoksa hastanede mi yapılmalı?",
            answer: (
                <div className="space-y-3">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Evde Uyku Testi Avantajları:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-blue-800">
                            <li>Hastanın daha rahat uyumasını sağlar</li>
                            <li>Psikolojik etkileri azaltır</li>
                            <li>Kendi yatağınızda, alışık olduğunuz ortamda test yapılır</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Hastane Ortamının Dezavantajları:</h4>
                        <p className="text-gray-700">
                            Yatak, yastık, oda havası, diğer hastalar gibi etkenler uykuyu olumsuz etkileyebilir.
                        </p>
                    </div>
                    <p className="text-green-700 font-medium">
                        ✓ Evde uyku testi cihazları, hastane cihazlarıyla aynı şekilde kayıt yapar ve <strong>güvenilir sonuç verir.</strong>
                    </p>
                </div>
            ),
        },
        {
            question: "5. Mini CPAP / Taşınabilir CPAP cihazları nelerdir?",
            answer: (
                <div className="space-y-3">
                    <p>
                        Taşınabilir CPAP cihazları, özellikle <strong>seyahat eden hastalar</strong> için tasarlanmıştır.
                    </p>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Örnek: ResMed AirMini Auto CPAP</h4>
                        <ul className="space-y-2">
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-2">✓</span>
                                <span>Dokunmatik ekran ile kullanım kolaylığı</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-2">✓</span>
                                <span>13 saate kadar batarya desteği</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-2">✓</span>
                                <span>Küçük boyut ve taşınabilir çanta</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-2">✓</span>
                                <span>Philips Türkiye garantisi</span>
                            </li>
                        </ul>
                    </div>
                </div>
            ),
        },
        {
            question: "6. BIPAP ASV cihazı nedir ve kimler kullanır?",
            answer: (
                <div className="space-y-3">
                    <p>
                        <strong>BIPAP ASV</strong>, adaptif servo ventilatör cihazıdır.
                    </p>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Kullanım Alanları:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-purple-800">
                            <li>Central apne</li>
                            <li>Cheyne-Stokes solunum bozukluğu olan hastalarda</li>
                        </ul>
                    </div>
                    <p className="text-gray-700">
                        Cihaz, <strong>son nefeslere göre basıncı ayarlayarak</strong> apneleri ortadan kaldırır.
                    </p>
                </div>
            ),
        },
        {
            question: "7. CPAP cihazı alırken fiyatlar neden çok farklı?",
            answer: (
                <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                        <h4 className="font-semibold text-amber-900 mb-3">Fiyat Farklılıklarının Nedenleri:</h4>
                        <ul className="space-y-2 text-amber-800">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Bazı firmalar <strong>sadece cihazı satar</strong>, bazıları <strong>cihaz + hizmet paketi</strong> sunar.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Düşük fiyatlı cihazlar <strong>kullanılmış, garantisiz</strong> veya yurt dışından gayri resmi yollarla getirilmiş olabilir.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Satış sonrası destek</strong>, cihazın ömrü boyunca önemlidir.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="text-blue-900 font-medium">
                            💡 Cihazı alırken sadece fiyat değil, <strong>satış sonrası servis ve teknik destek</strong> de dikkate alınmalıdır.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            question: "8. Sağlıklı bir kişinin günlük uyku ihtiyacı ne kadardır?",
            answer: (
                <div className="space-y-3">
                    <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                        <p className="text-green-900 font-medium">
                            ✓ Genellikle <strong>7-8 saat uyku</strong> önerilmektedir.
                        </p>
                    </div>
                    <p className="text-gray-700">
                        Uyku süresi <strong>genetik olarak belirlenmiştir</strong> ve <strong>4-11 saat</strong> arasında değişebilir.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">Kısa Uyuyanlar (6 saat altı):</h4>
                            <p className="text-blue-800 text-sm">Derin uyku ve REM fazına yoğunlaşır</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h4 className="font-semibold text-purple-900 mb-2">Uzun Uyuyanlar:</h4>
                            <p className="text-purple-800 text-sm">Yüzeyel uyku fazlarında daha uzun zaman geçirir</p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            question: "9. Solunum cihazları zimmeti hakkında bilgi verir misiniz?",
            answer: (
                <div className="space-y-3">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="text-blue-900 mb-2">
                            SGK, CPAP/BiPAP gibi cihazları <strong>ömür boyu kullanım hakkı</strong> ile verir.
                        </p>
                        <p className="text-blue-800">
                            Ancak <strong>her 2 yılda bir</strong> kullanım durumunu belgelemek gerekir.
                        </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                        <h4 className="font-semibold text-amber-900 mb-2">⚠️ Önemli Uyarı:</h4>
                        <ul className="space-y-2 text-amber-800">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Kayıt özelliği olan cihazlar</strong> tercih edilmelidir.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Cihazın <strong>yılda 1200 saatten az kullanılması</strong> durumunda SGK geri alma hakkına sahiptir.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            ),
        },
        {
            question: "10. COVID döneminde uyku testi yaptırmak güvenli mi?",
            answer: (
                <div className="space-y-3">
                    <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                        <p className="text-red-900">
                            <strong>⚠️</strong> Hastanede uyku testi, özellikle COVID döneminde <strong>riskli olabilir.</strong>
                        </p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 mb-2">✓ Güvenli Alternatif: Evde Uyku Testi</h4>
                        <p className="text-green-800 mb-2">
                            Evde uyku testi cihazları ile testi <strong>düşük riskle</strong> yaptırabilirsiniz.
                        </p>
                        <p className="text-green-700 font-medium">
                            Sonuçlar, hastanede yapılan testlerle <strong>aynı güvenilirliktedir.</strong>
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <LegalPageLayout title={t("faq")}>
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
                    >
                        <button
                            className="w-full flex justify-between items-center p-5 bg-white text-left focus:outline-none hover:bg-gray-50 transition-colors"
                            onClick={() => toggleAccordion(index)}
                        >
                            <span className="font-semibold text-gray-900 text-base pr-4">{faq.question}</span>
                            {openIndex === index ? (
                                <ChevronUp className="text-blue-600 w-5 h-5 flex-shrink-0" />
                            ) : (
                                <ChevronDown className="text-gray-400 w-5 h-5 flex-shrink-0" />
                            )}
                        </button>
                        <div
                            className={`bg-gray-50 transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                                }`}
                        >
                            <div className="p-5 text-gray-700 border-t border-gray-100">
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start">
                    <HelpCircle className="text-blue-600 w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sorunuz mu var?</h3>
                        <p className="text-gray-700 mb-4">
                            Aradığınız soruyu bulamadıysanız veya daha fazla bilgiye ihtiyacınız varsa, bizimle iletişime geçmekten çekinmeyin.
                        </p>
                        <a
                            href="tel:05532808273"
                            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Phone className="w-4 h-4 mr-2" />
                            0553 280 82 73
                        </a>
                    </div>
                </div>
            </div>
        </LegalPageLayout>
    );
}
