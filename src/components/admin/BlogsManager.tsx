"use client";

import { useState, useEffect } from "react";
import { supabase, Blog, getBlogImageUrl } from "@/lib/supabase";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Calendar,
  User,
  MessageCircle,
  Star,
} from "lucide-react";
import BlogModal from "./BlogModal";

export default function BlogsManager() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;
      setBlogs((data || []) as unknown as Blog[]);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu blog yazısını silmek istediğinizden emin misiniz?")) return;

    try {
      // Önce yorumları sil
      await supabase.from("comments").delete().eq("article_id", id);
      
      // Sonra blog yazısını sil
      const { error } = await supabase.from("blogs").delete().eq("id", id);

      if (error) throw error;

      setBlogs(blogs.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Blog yazısı silinirken bir hata oluştu.");
    }
  };

  const toggleFeatured = async (blog: Blog) => {
    try {
      const { error } = await supabase
        .from("blogs")
        .update({ is_featured: !blog.is_featured })
        .eq("id", blog.id);

      if (error) throw error;

      setBlogs(blogs.map(b => 
        b.id === blog.id ? { ...b, is_featured: !b.is_featured } : b
      ));
    } catch (error) {
      console.error("Error updating featured status:", error);
      alert("Öne çıkan durumu güncellenirken bir hata oluştu.");
    }
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.sub_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
    fetchBlogs();
  };

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
          <ImageIcon className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Yönetimi</h1>
            <p className="text-gray-600">
              Toplam {filteredBlogs.length} blog yazısı
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Yeni Blog Yazısı
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Blog yazısı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => (
          <div
            key={blog.id}
            className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
              blog.is_featured ? "ring-2 ring-yellow-500" : ""
            }`}
          >
            {/* Blog Image */}
            <div className="relative h-48 bg-gray-200">
              {blog.image ? (
                <img
                  src={getBlogImageUrl(blog.image)}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              {/* Featured Badge */}
              {blog.is_featured && (
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Star size={12} className="mr-1" />
                    Öne Çıkan
                  </span>
                </div>
              )}

              {/* Order Badge */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  #{blog.order}
                </span>
              </div>
            </div>

            {/* Blog Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {blog.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {blog.sub_title}
              </p>

              {/* Description Preview */}
              <p className="text-xs text-gray-500 mb-3 line-clamp-3">
                {blog.description}
              </p>

              {/* Date */}
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <Calendar size={12} className="mr-1" />
                {new Date(blog.created_add).toLocaleDateString("tr-TR")}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFeatured(blog)}
                    className={`p-1 rounded ${
                      blog.is_featured 
                        ? "text-yellow-600 hover:text-yellow-900" 
                        : "text-gray-400 hover:text-yellow-600"
                    }`}
                    title={blog.is_featured ? "Öne çıkandan kaldır" : "Öne çıkar"}
                  >
                    <Star size={16} fill={blog.is_featured ? "currentColor" : "none"} />
                  </button>
                  <button
                    className="text-gray-400 hover:text-blue-600 p-1"
                    title="Yorumları görüntüle"
                  >
                    <MessageCircle size={16} />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingBlog(blog);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 p-1"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBlogs.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Blog yazısı bulunamadı
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Arama kriterlerinize uygun blog yazısı bulunamadı.
          </p>
        </div>
      )}

      {/* Blog Modal */}
      {isModalOpen && (
        <BlogModal
          blog={editingBlog}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}