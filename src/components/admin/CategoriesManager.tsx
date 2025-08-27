"use client";

import { useState, useEffect } from "react";
import { supabase, Category } from "@/lib/supabase";
import { useCategoriesAndBrands } from "@/contexts/CategoriesAndBrandsContext";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderOpen,
  ArrowUp,
  ArrowDown,
  Save,
  X,
} from "lucide-react";

export default function CategoriesManager() {
  const { clearCache } = useCategoriesAndBrands();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    order: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;
      setCategories((data || []) as unknown as Category[]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) return;

    try {
      // Önce bu kategoriye ait ürün var mı kontrol et
      const { data: products, error: checkError } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", id)
        .limit(1);

      if (checkError) throw checkError;

      if (products && products.length > 0) {
        alert("Bu kategoriye ait ürünler bulunduğu için silinemez.");
        return;
      }

      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;

      setCategories(categories.filter((c) => c.id !== id));
      clearCache(); // Clear cache when categories change
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Kategori silinirken bir hata oluştu.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Eğer yeni kategori ekliyorsa ve order boşsa, otomatik order ver
      let orderValue = parseInt(formData.order);
      if (!editingCategory && (!formData.order || orderValue <= 0)) {
        // En büyük order değerini bul ve 1 ekle
        const maxOrder = Math.max(...categories.map((c) => c.order), 0);
        orderValue = maxOrder + 1;
      }

      const categoryData = {
        name: formData.name,
        order: orderValue,
        updated_at: new Date().toISOString(),
      };

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", editingCategory.id);

        if (error) throw error;
      } else {
        // Create new category - ID'yi belirtme, PostgreSQL otomatik oluşturacak
        const insertData = {
          name: categoryData.name,
          order: categoryData.order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("categories")
          .insert([insertData]);

        if (error) throw error;
      }

      await fetchCategories();
      clearCache(); // Clear cache when categories change
      handleCloseModal();
    } catch (error) {
      console.error("Error saving category:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Kategori kaydedilirken bir hata oluştu."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      order: category.order.toString(),
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", order: "" });
  };

  const handleOrderChange = async (
    category: Category,
    direction: "up" | "down"
  ) => {
    const currentIndex = categories.findIndex((c) => c.id === category.id);
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const targetCategory = categories[targetIndex];

    try {
      // Swap order values
      await Promise.all([
        supabase
          .from("categories")
          .update({ order: targetCategory.order })
          .eq("id", category.id),
        supabase
          .from("categories")
          .update({ order: category.order })
          .eq("id", targetCategory.id),
      ]);

      await fetchCategories();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Sıralama güncellenirken bir hata oluştu.");
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <FolderOpen className="w-8 h-8 text-green-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Kategori Yönetimi
            </h1>
            <p className="text-gray-600">
              Toplam {filteredCategories.length} kategori
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Yeni Kategori
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Kategori ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sıra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oluşturma Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category, index) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {category.order}
                      </span>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleOrderChange(category, "up")}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => handleOrderChange(category, "down")}
                          disabled={index === filteredCategories.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FolderOpen className="w-5 h-5 text-green-600 mr-3" />
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(category.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Kategori bulunamadı
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Arama kriterlerinize uygun kategori bulunamadı.
            </p>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Kategori adını girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sıra Numarası{" "}
                    {!editingCategory && (
                      <span className="text-gray-500">(opsiyonel)</span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: e.target.value })
                    }
                    required={!!editingCategory}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={editingCategory ? "1" : "Otomatik atanacak"}
                  />
                  {!editingCategory && (
                    <p className="mt-1 text-xs text-gray-500">
                      Boş bırakırsanız otomatik olarak en son sıra numarası
                      atanacak
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      {editingCategory ? "Güncelle" : "Kaydet"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
