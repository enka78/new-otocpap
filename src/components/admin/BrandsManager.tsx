"use client";

import { useState, useEffect } from "react";
import { supabase, Brand, getBrandImageUrl } from "@/lib/supabase";
import { useCategoriesAndBrands } from "@/contexts/CategoriesAndBrandsContext";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  Upload,
} from "lucide-react";

export default function BrandsManager() {
  const { clearCache } = useCategoriesAndBrands();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    order: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;
      setBrands((data || []) as unknown as Brand[]);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu markayı silmek istediğinizden emin misiniz?")) return;

    try {
      // Önce bu markaya ait ürün var mı kontrol et
      const { data: products, error: checkError } = await supabase
        .from("products")
        .select("id")
        .eq("brand_id", id)
        .limit(1);

      if (checkError) throw checkError;

      if (products && products.length > 0) {
        alert("Bu markaya ait ürünler bulunduğu için silinemez.");
        return;
      }

      const { error } = await supabase.from("brands").delete().eq("id", id);

      if (error) throw error;

      setBrands(brands.filter((b) => b.id !== id));
      clearCache(); // Clear cache when brands change
    } catch (error) {
      console.error("Error deleting brand:", error);
      alert("Marka silinirken bir hata oluştu.");
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!image) return null;

    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("brands-images")
      .upload(fileName, image);

    if (error) {
      throw new Error(`Resim yükleme hatası: ${error.message}`);
    }

    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = existingImage;

      // Upload new image if selected
      if (image) {
        const uploadedImage = await uploadImage();
        if (uploadedImage) {
          imageUrl = uploadedImage;
        }
      }

      const brandData = {
        name: formData.name,
        order: parseInt(formData.order),
        image: imageUrl || null,
        updated_at: new Date().toISOString(),
      };

      if (editingBrand) {
        // Update existing brand
        const { error } = await supabase
          .from("brands")
          .update(brandData)
          .eq("id", editingBrand.id);

        if (error) throw error;
      } else {
        // Create new brand
        const { error } = await supabase
          .from("brands")
          .insert([{ ...brandData, created_at: new Date().toISOString() }]);

        if (error) throw error;
      }

      await fetchBrands();
      clearCache(); // Clear cache when brands change
      handleCloseModal();
    } catch (error) {
      console.error("Error saving brand:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Marka kaydedilirken bir hata oluştu."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      order: brand.order.toString(),
    });
    setExistingImage(brand.image || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormData({ name: "", order: "" });
    setImage(null);
    setExistingImage("");
  };

  const handleOrderChange = async (brand: Brand, direction: "up" | "down") => {
    const currentIndex = brands.findIndex((b) => b.id === brand.id);
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= brands.length) return;

    const targetBrand = brands[targetIndex];

    try {
      // Swap order values
      await Promise.all([
        supabase
          .from("brands")
          .update({ order: targetBrand.order })
          .eq("id", brand.id),
        supabase
          .from("brands")
          .update({ order: brand.order })
          .eq("id", targetBrand.id),
      ]);

      await fetchBrands();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Sıralama güncellenirken bir hata oluştu.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <Building2 className="w-8 h-8 text-purple-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marka Yönetimi</h1>
            <p className="text-gray-600">
              Toplam {filteredBrands.length} marka
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Yeni Marka
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
            placeholder="Marka ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sıra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marka
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
              {filteredBrands.map((brand, index) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {brand.order}
                      </span>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleOrderChange(brand, "up")}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => handleOrderChange(brand, "down")}
                          disabled={index === filteredBrands.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={
                            brand.image
                              ? getBrandImageUrl(brand.image)
                              : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0Y5RkFGQiIvPgo8cGF0aCBkPSJNMjAgMTJMMjQgMTZIMjJWMjRIMThWMTZIMTZMMjAgMTJaIiBmaWxsPSIjOTMzNkI0Ii8+Cjwvc3ZnPgo="
                          }
                          alt={brand.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {brand.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(brand.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
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

        {filteredBrands.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Marka bulunamadı
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Arama kriterlerinize uygun marka bulunamadı.
            </p>
          </div>
        )}
      </div>

      {/* Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBrand ? "Marka Düzenle" : "Yeni Marka Ekle"}
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
                    Marka Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Marka adını girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sıra Numarası *
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: e.target.value })
                    }
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marka Logosu
                  </label>

                  {/* Existing Image */}
                  {existingImage && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Mevcut logo:</p>
                      <img
                        src={getBrandImageUrl(existingImage)}
                        alt="Current logo"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* New Image Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-2">
                      <label className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          {existingImage ? "Yeni logo yükle" : "Logo yükle"}
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
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      {editingBrand ? "Güncelle" : "Kaydet"}
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
