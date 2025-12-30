"use client";

import { useTranslations } from "next-intl";
import LegalPageLayout from "@/components/LegalPageLayout";

export default function DistanceSalesAgreementPage() {
    const t = useTranslations("footer");

    return (
        <LegalPageLayout title={t("distanceSalesAgreement")}>
            <div className="space-y-6">
                <section>
                    <p className="text-sm text-gray-500 mb-6">
                        İşbu Mesafeli Satış Sözleşmesi, aşağıda bilgileri bulunan taraflar arasında, tüketicinin{" "}
                        <strong>www.otocpap.com</strong> ("Site") üzerinden elektronik ortamda verdiği siparişe ilişkin olarak
                        6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca akdedilmiştir.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">1. TARAFLAR</h2>

                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">1.1. SATICI BİLGİLERİ</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                            <p><strong>Unvan:</strong> Dönüşüm Medikal Ve Sağlık Hiz. Tic. Ltd. Şti. </p>
                            <p><strong>Adres:</strong> Kartaltpe Mah. Süvari Cad. No:10 İç Kapı No:21 TORKAM AVM OFİS Küçükçekmece/İSTANBUL</p>
                            <p><strong>Telefon:</strong> +90 553 280 82 73</p>
                            <p><strong>E-posta:</strong> info@otocpap.com</p>
                            <p><strong>MERSİS / Vergi No:</strong> 3131410087</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">1.2. ALICI BİLGİLERİ</h3>
                        <p className="text-sm text-gray-600">
                            Alıcı (Tüketici): Sipariş formunda yer alan ad-soyad, adres, telefon ve e-posta bilgileri.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">2. SÖZLEŞMENİN KONUSU</h2>
                    <p>
                        Bu sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesi üzerinden elektronik ortamda sipariş verdiği
                        ürün/ürünlerin satışı, teslimi ve ilgili tarafların hak ve yükümlülüklerinin belirlenmesidir.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">3. ÜRÜN BİLGİLERİ</h2>
                    <p>
                        Ürünlerin cinsi, türü, miktarı, temel nitelikleri, satış bedeli, ödeme şekli ve teslimat bilgileri
                        sipariş onay sayfasında yer almaktadır ve bu sözleşmenin ayrılmaz parçasıdır.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">4. TESLİMAT ŞARTLARI</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Ürünler, ALICI'nın sipariş formunda belirttiği adrese gönderilir.</li>
                        <li>Teslim süresi genellikle 1-3 iş günü olup, kargo kaynaklı gecikmelerden SATICI sorumlu değildir.</li>
                        <li>ALICI, teslim sırasında paketi kontrol etmeli; hasarlı ürünlerde kargo görevlisine tutanak tutturmalıdır.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">5. İADE ve CAYMA HAKKI</h2>

                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">5.1. Cayma Hakkı</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>ALICI, ürünü teslim aldığı tarihten itibaren 14 gün içinde hiçbir gerekçe göstermeden cayma hakkını kullanabilir.</li>
                            <li>Cayma bildirimi yazılı olarak veya e-posta yoluyla yapılmalıdır.</li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">5.2. Sağlık Ürünlerinde İade Kısıtlaması</h3>
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-3">
                            <p className="font-medium text-amber-900 mb-2">
                                Hijyen nedeniyle aşağıdaki ürünlerde ambalajı açılmış veya kullanılmış olması durumunda iade kabul edilmez:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-amber-800">
                                <li>CPAP, Auto CPAP, BIPAP cihazları</li>
                                <li>Maskeler (nazal, oronazal, yastıklı)</li>
                                <li>Hortum, filtre, Humidifier, sarf malzemeleri</li>
                                <li>Kişiye özel ayar yapılan tüm solunum cihazları</li>
                            </ul>
                            <p className="text-sm text-amber-700 mt-2 italic">
                                (Ambalajı açılmamış ürünlerde iade hakkı geçerlidir.)
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">5.3. Ücret İadesi</h3>
                        <p>İade edilen ürün SATICI'ya ulaştıktan sonra 14 gün içinde ücret iadesi yapılır.</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">6. ÖDEME ŞARTLARI</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>ALICI, kredi kartı, banka kartı, havale/EFT ile ödeme yapabilir.</li>
                        <li>Taksit seçenekleri bankalar tarafından sağlanır.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">7. GARANTİ ve SERVİS</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Tüm cihazlar üretici veya ithalatçı garantisi altındadır.</li>
                        <li>Kullanım hatasından kaynaklanan arızalar garanti kapsamı dışındadır.</li>
                        <li>Teknik destek SATICI veya yetkili servis tarafından sağlanır.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">8. KİŞİSEL VERİLERİN KORUNMASI</h2>
                    <p>
                        ALICI'nın kişisel verileri KVKK'ya uygun şekilde işlenir ve yalnızca siparişi gerçekleştirmek amacıyla
                        üçüncü kişilerle paylaşılabilir (kargo firması vb.).
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">9. UYUŞMAZLIK ÇÖZÜMÜ</h2>
                    <p>
                        Uyuşmazlık durumunda ALICI, yerleşim yerindeki veya işlemin yapıldığı yerdeki Tüketici Hakem Heyeti
                        veya Tüketici Mahkemesine başvurabilir.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">10. YÜRÜRLÜK</h2>
                    <p>
                        ALICI'nın elektronik ortamda onayladığı işbu sözleşme, onay anından itibaren yürürlüğe girer.
                    </p>
                </section>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                        <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR')}
                    </p>
                </div>
            </div>
        </LegalPageLayout>
    );
}
