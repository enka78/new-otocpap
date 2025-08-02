'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Users, Award, Clock } from 'lucide-react';
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
              Hakkımızda
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Dönüşüm Medikal olarak 20 yıldır uyku apnesi ve KOAH hastaları için 
              profesyonel çözümler sunuyoruz. Sağlığınız bizim önceliğimizdir.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-blue-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">20+</div>
              <div className="text-gray-600">Yıllık Tecrübe</div>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">5000+</div>
              <div className="text-gray-600">Mutlu Müşteri</div>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-purple-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">6</div>
              <div className="text-gray-600">Yetkili Marka</div>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-orange-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">7/24</div>
              <div className="text-gray-600">Teknik Destek</div>
            </div>
          </div>

          {/* Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Hikayemiz
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  2004 yılında kurulan Dönüşüm Medikal, uyku apnesi ve KOAH hastaları için 
                  kaliteli solunum cihazları ve aksesuarları sağlama misyonuyla yola çıktı.
                </p>
                <p>
                  20 yıllık tecrübemizle, dünya çapında tanınmış markaların yetkili bayisi 
                  olarak hizmet veriyoruz. Müşterilerimizin yaşam kalitesini artırmak için 
                  sürekli olarak kendimizi geliştiriyoruz.
                </p>
                <p>
                  Uzman ekibimiz, her müşteriye özel çözümler sunarak, doğru ürün seçiminden 
                  kurulum ve sonrası desteğe kadar tüm süreçte yanınızda yer alır.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Misyonumuz
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">Kaliteli Hizmet</h4>
                    <p className="text-gray-600 text-sm">En yüksek kalitede ürün ve hizmet sunmak</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">Uzman Destek</h4>
                    <p className="text-gray-600 text-sm">Profesyonel danışmanlık ve teknik destek</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">Güvenilirlik</h4>
                    <p className="text-gray-600 text-sm">Güvenilir ve sürdürülebilir çözümler</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Brands Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Yetkili Markalarımız
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {[
                'ResMed',
                'Philips Respironics',
                'LÖWENSTEIN',
                'AONMED',
                'Devilbiss',
                'Respirox'
              ].map((brand) => (
                <div key={brand} className="text-center">
                  <div className="bg-gray-100 rounded-lg p-6 mb-3 h-20 flex items-center justify-center">
                    <span className="font-semibold text-gray-700">{brand}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Ücretsiz Kurulum
              </h3>
              <p className="text-gray-600">
                İstanbul ve çevre illerde ücretsiz cihaz kurulumu ve eğitim hizmeti
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Uzman Danışmanlık
              </h3>
              <p className="text-gray-600">
                Deneyimli uzmanlarımızdan profesyonel danışmanlık hizmeti alın
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                7/24 Destek
              </h3>
              <p className="text-gray-600">
                Teknik sorunlarınız için 7/24 destek hattımızdan yardım alın
              </p>
            </div>
          </div>
        </div>
      </main>

        <Footer />
      </div>
  );
}