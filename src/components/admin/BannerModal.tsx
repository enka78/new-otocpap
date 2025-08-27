"use client";

import { useState, useEffect } from "react";
import { supabase, Banner, getBannerImageUrl } from "@/lib/supabase";
import { X, Upload, Trash2, Save, Calendar, Link as LinkIcon } from "lucide-react";

interface BannerModalProps {
  banner?: Banner | null;
  onClose: () => void;
}

export default function BannerModal({ banner, onClose }: BannerModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    sub_title: "",
    add_button: false,
    btn_text: "",
    add_link: "",
    start_date: "",
    end_date: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        sub_title: banner.sub_title || "",
        add_button: banner.add_button || false,
        btn_text: banner.btn_text || "",
        add_link: banner.add_link || "",
        start_date: banner.start_date ? banner.start_date.split('T')[0] : "",
        end_date: banner.end_date ? banner.end_date.split('T')[0] : "",
      });
      setExistingImage(banner.image || "");
    } else {
      // Yeni banner için varsayılan tarihler
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      
      setFormData({
        title: "",
        sub_title: "",
        add_button: false,
        btn_text: "",
        add_link: "",
        start_date: today.toISOString().split('T')[0],
        end_date: nextMonth.toISOString().split('T')[0],
      });
      setExistingImage("");
    }
  }, [banner]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setError("");
    }
  };

  const removeExistingImage = () => {
    setExistingImage("");
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!image) return null;

    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
      .from("banner-images")
      .upload(fileName, image);

    if (uploadError) {
      throw new Error(`Resim yükleme hatası: ${uploadError.message}`);
    }

    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imageUrl = existingImage;

      // Upload new image if selected
      if (image) {
        const uploadedImage = await uploadImage();
        if (uploadedImage) {
          imageUrl = uploadedImage;
        }
      }

      const bannerData = {
        title: formData.title,
        sub_title: formData.sub_title,
        image: imageUrl || null,
        add_button: formData.add_button,
        btn_text: formData.add_button ? formData.btn_text : null,
        add_link: formData.add_button ? formData.add_link : null,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };

      if (banner) {
        // Update existing banner
        const { error } = await supabase
          .from("banners")
          .update(bannerData)
          .eq("id", banner.id);

        if (error) throw error;
      } else {
        // Create new banner
        const { error } = await supabase
          .from("banners")
          .insert([{ ...bannerData, created_at: new Date().toISOString() }]);

        if (error) throw error;
      }

      handleClose();
    } catch (error: any) {
      setError(error.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // State'leri temizle
    setImage(null);
    setExistingImage("");
    setLoading(false);
    setError("");
    setFormData({
      title: "",
      sub_title: "",
      add_button: false,
      btn_text: "",
      add_link: "",
      start_date: "",
      end_date: "",
    });
    
    // Modal'ı kapat
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {banner ? "Banner Düzenle" : "Yeni Banner Ekle"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Banner Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Başlığı *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Banner başlığını girin"
                />
              </div>

              {/* Banner Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Başlık *
                </label>
                <textarea
                  name="sub_title"
                  value={formData.sub_title}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Banner alt başlığını girin"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Bitiş Tarihi *
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Button Settings */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="add_button"
                    checked={formData.add_button}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Banner'da buton göster
                  </label>
                </div>

                {formData.add_button && (
                  <div className="space-y-4 pl-6 border-l-2 border-orange-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buton Metni
                      </label>
                      <input
                        type="text"
                        name="btn_text"
                        value={formData.btn_text}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Buton metnini girin"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <LinkIcon size={16} className="inline mr-1" />
                        Buton Linki
                      </label>
                      <input
                        type="url"
                        name="add_link"
                        value={formData.add_link}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Banner Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Resmi
                </label>
                
                {/* Existing Image */}
                {existingImage && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Mevcut resim:</p>
                    <div className="relative inline-block">
                      <img
                        src={getBannerImageUrl(existingImage)}
                        alt="Current banner"
                        className="w-full max-w-sm h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeExistingImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* New Image Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        {existingImage ? "Yeni resim yükle" : "Resim yükle"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF (Max 5MB) - Önerilen boyut: 1920x600px
                    </p>
                  </div>
                </div>

                {/* Preview new image */}
                {image && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Yeni resim:</p>
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      className="w-full max-w-sm h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Preview Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Önizleme</h3>
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {formData.title || "Banner Başlığı"}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {formData.sub_title || "Banner alt başlığı"}
                  </p>
                  {formData.add_button && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                      {formData.btn_text || "Buton Metni"}
                    </button>
                  )}
                  <div className="mt-3 text-xs text-gray-500">
                    {formData.start_date && formData.end_date && (
                      <>
                        {new Date(formData.start_date).toLocaleDateString("tr-TR")} - {" "}
                        {new Date(formData.end_date).toLocaleDateString("tr-TR")}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {banner ? "Güncelle" : "Kaydet"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}