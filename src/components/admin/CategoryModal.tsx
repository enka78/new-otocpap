"use client";

import { useState, useEffect } from "react";
import { supabase, Category } from "@/lib/supabase";
import { X, Save } from "lucide-react";

interface CategoryModalProps {
  category?: Category | null;
  onClose: () => void;
}

export default function CategoryModal({ category, onClose }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    order: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        order: category.order ? category.order.toString() : "",
      });
    } else {
      setFormData({
        name: "",
        order: "",
      });
    }
  }, [category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const categoryData = {
        name: formData.name,
        order: parseInt(formData.order) || 0,
        updated_at: new Date().toISOString(),
      };

      if (category) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", category.id);

        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from("categories")
          .insert([{ ...categoryData, created_at: new Date().toISOString() }]);

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
            {category ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
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
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori Adı *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Kategori adını girin"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1"
              />
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {category ? "Güncelle" : "Kaydet"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}