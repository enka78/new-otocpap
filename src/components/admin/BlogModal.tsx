"use client";

import { useState, useEffect } from "react";
import { supabase, Blog } from "@/lib/supabase";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface BlogModalProps {
  blog?: Blog | null;
  onClose: () => void;
}

export default function BlogModal({ blog, onClose }: BlogModalProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    sub_title: "",
    description: "",
    order: "1",
    is_featured: false,
  });

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || "",
        sub_title: blog.sub_title || "",
        description: blog.description || "",
        order: blog.order?.toString() || "1",
        is_featured: blog.is_featured || false,
      });
      if (blog.image) {
        setImagePreview(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blogs-images/${blog.image}`);
      }
    }
  }, [blog]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = blog?.image || null;

      // Resim yükleme
      if (imageFile) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${imageFile.name.split('.').pop()}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from("blogs-images")
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error("Resim yüklenirken hata oluştu: " + uploadError.message);
        }

        imageUrl = fileName;
      }

      // Kullanıcı bilgisini al
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Kullanıcı oturumu bulunamadı");
      }

      const blogData = {
        title: formData.title,
        sub_title: formData.sub_title,
        description: formData.description,
        image: imageUrl,
        order: parseInt(formData.order) || 1,
        is_featured: formData.is_featured,
        author: user.id,
      };

      if (blog) {
        // Update existing blog
        const { error } = await supabase
          .from("blogs")
          .update(blogData)
          .eq("id", blog.id);

        if (error) throw error;
      } else {
        // Create new blog
        const { error } = await supabase
          .from("blogs")
          .insert([{
            ...blogData,
            created_add: new Date().toISOString(),
          }]);

        if (error) throw error;
      }

      onClose();
    } catch (error: any) {
      console.error("Error saving blog:", error);
      alert("Blog kaydedilirken bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {blog ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlık *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Blog yazısı başlığı"
            />
          </div>

          {/* Sub Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alt Başlık
            </label>
            <input
              type="text"
              value={formData.sub_title}
              onChange={(e) => setFormData({ ...formData, sub_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Blog yazısı alt başlığı"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İçerik *
            </label>
            <textarea
              required
              rows={8}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Blog yazısı içeriği..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blog Resmi
            </label>
            <div className="space-y-4">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Resim yüklemek için tıklayın</span>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Order and Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sıralama
              </label>
              <input
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Öne Çıkan Yazı</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : blog ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}