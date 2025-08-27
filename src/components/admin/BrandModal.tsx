"use client";

import { useState, useEffect } from "react";
import { supabase, Brand, getBrandImageUrl } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { X, Upload, Trash2, Save } from "lucide-react";

interface BrandModalProps {
  brand?: Brand | null;
  onClose: () => void;
}

export default function BrandModal({ brand, onClose }: BrandModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    order: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || "",
        order: brand.order ? brand.order.toString() : "",
      });
      setExistingImage(brand.image || "");
    } else {
      setFormData({
        name: "",
        order: "",
      });
      setExistingImage("");
    }
  }, [brand]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { data, error: uploadError } = await adminSupabase.storage
      .from("brands")
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

      // Upload new image if provided
      if (image) {
        const newImageUrl = await uploadImage();
        if (newImageUrl) {
          imageUrl = newImageUrl;
        }
      }

      const brandData = {
        name: formData.name,
        order: parseInt(formData.order) || 0,
        image: imageUrl || null,
        updated_at: new Date().toISOString(),
      };

      if (brand) {
        // Update existing brand
        const { error } = await supabase
          .from("brands")
          .update(brandData)
          .eq("id", brand.id);

        if (error) throw error;
      } else {
        // Create new brand
        const { error } = await supabase
          .from("brands")
          .insert([{ ...brandData, created_at: new Date().toISOString() }]);

        if (error) throw error;
      }

      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {brand ? "Marka Düzenle" : "Yeni Marka Ekle"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marka Adı *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Marka adını girin"
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sıra Numarası *
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="1"
              />
            </div>

            {/* Brand Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marka Logosu
              </label>

              {/* Existing Image */}
              {existingImage && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Mevcut logo:</p>
                  <div className="relative inline-block">
                    <img
                      src={getBrandImageUrl(existingImage)}
                      alt="Existing brand logo"
                      className="w-20 h-20 object-cover rounded-lg"
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
                      Logo yükle
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, GIF (Max 5MB)
                  </p>
                </div>
              </div>

              {/* Preview new image */}
              {image && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Yeni logo:</p>
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {brand ? "Güncelle" : "Kaydet"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
