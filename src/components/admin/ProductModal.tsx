"use client";

import { useState, useEffect } from "react";
import { supabase, Product } from "@/lib/supabase";
import { X, Upload, Trash2, Save } from "lucide-react";
import { useCategoriesAndBrands } from "@/contexts/CategoriesAndBrandsContext";

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const {
    categories,
    brands,
    loading: contextLoading,
    refreshData,
  } = useCategoriesAndBrands();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    brand_id: "",
    is_featured: false,
    order_number: "",
    quantity: "",
    usage_instructions: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set form data when product changes (regardless of categories/brands loading state)
  useEffect(() => {
    console.log("ProductModal - Product data:", product);

    if (product) {
      const formDataToSet = {
        name: product.name || "",
        description: product.description || "",
        price: product.price ? product.price.toString() : "",
        category_id: product.category_id ? product.category_id.toString() : "",
        brand_id: product.brand_id ? product.brand_id.toString() : "",
        is_featured: product.is_featured || false,
        order_number: product.order_number
          ? product.order_number.toString()
          : "",
        quantity: product.quantity ? product.quantity.toString() : "",
        usage_instructions: product.usage_instructions || "",
      };

      console.log("ProductModal - Setting form data:", formDataToSet);
      setFormData(formDataToSet);

      // Set existing images
      const existingImgs = [];
      if (product.image1) existingImgs.push(product.image1);
      if (product.image2) existingImgs.push(product.image2);
      if (product.image3) existingImgs.push(product.image3);
      if (product.image4) existingImgs.push(product.image4);
      setExistingImages(existingImgs);
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        description: "",
        price: "",
        category_id: "",
        brand_id: "",
        is_featured: false,
        order_number: "",
        quantity: "",
        usage_instructions: "",
      });
      setExistingImages([]);
    }
  }, [product]);

  // Log categories and brands when they change
  useEffect(() => {
    console.log("ProductModal - Categories:", categories);
    console.log("ProductModal - Brands:", brands);
    console.log("ProductModal - Context Loading:", contextLoading);
  }, [categories, brands, contextLoading]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + existingImages.length > 4) {
      setError("En fazla 4 resim yükleyebilirsiniz.");
      return;
    }
    setImages(files);
    setError("");
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedImages: string[] = [];

    for (const image of images) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      console.log("Uploading image:", fileName, "to bucket: products-images");

      const { data, error: uploadError } = await supabase.storage
        .from("products-images")
        .upload(fileName, image);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Resim yükleme hatası: ${uploadError.message}`);
      }

      console.log("Upload successful:", data);
      uploadedImages.push(fileName);
    }

    return uploadedImages;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Upload new images
      const newImageUrls = await uploadImages();

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];

      // Prepare product data
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        brand_id: parseInt(formData.brand_id),
        is_featured: formData.is_featured,
        order_number: parseInt(formData.order_number),
        quantity: parseInt(formData.quantity),
        usage_instructions: formData.usage_instructions,
        image1: allImages[0] || null,
        image2: allImages[1] || null,
        image3: allImages[2] || null,
        image4: allImages[3] || null,
        updated_at: new Date().toISOString(),
      };

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from("products")
          .insert([{ ...productData, created_at: new Date().toISOString() }]);

        if (error) throw error;
      }

      // Refresh categories and brands cache if needed
      refreshData();
      // Modal'ı kapat ve state'leri temizle
      handleClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // State'leri temizle
    setImages([]);
    setExistingImages([]);
    setLoading(false);
    setError("");
    setFormData({
      name: "",
      description: "",
      price: "",
      category_id: "",
      brand_id: "",
      is_featured: false,
      order_number: "",
      quantity: "",
      usage_instructions: "",
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
            {product ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
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
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Loading state for categories and brands */}
          {contextLoading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Kategoriler ve markalar yükleniyor...
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ürün adını girin"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Ürün açıklamasını girin"
                />
              </div>

              {/* Usage Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanım Talimatları
                </label>
                <textarea
                  name="usage_instructions"
                  value={formData.usage_instructions}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Kullanım talimatlarını girin"
                />
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok Adedi *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Order Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sıra Numarası *
                </label>
                <input
                  type="number"
                  name="order_number"
                  value={formData.order_number}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Category, Brand and Widget */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    disabled={contextLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {contextLoading
                        ? "Kategoriler yükleniyor..."
                        : "Kategori seçin"}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marka *
                  </label>
                  <select
                    name="brand_id"
                    value={formData.brand_id}
                    onChange={handleInputChange}
                    required
                    disabled={contextLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {contextLoading
                        ? "Markalar yükleniyor..."
                        : "Marka seçin"}
                    </option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Öne çıkan ürün olarak işaretle
                </label>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Resimleri (En fazla 4)
                </label>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Mevcut resimler:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products-images/${image}`}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Yeni resim yükle
                      </span>
                      <input
                        type="file"
                        multiple
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

                {/* Preview new images */}
                {images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Yeni resimler:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {product ? "Güncelle" : "Kaydet"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
