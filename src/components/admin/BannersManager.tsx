"use client";

import { useState, useEffect } from "react";
import { supabase, Banner, getBannerImageUrl } from "@/lib/supabase";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Calendar,
} from "lucide-react";
import BannerModal from "./BannerModal";

export default function BannersManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBanners((data || []) as unknown as Banner[]);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu banner'ı silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);

      if (error) throw error;

      setBanners(banners.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("Banner silinirken bir hata oluştu.");
    }
  };

  const isActive = (banner: Banner) => {
    const now = new Date();
    const startDate = new Date(banner.start_date);
    const endDate = new Date(banner.end_date);
    return now >= startDate && now <= endDate;
  };

  const filteredBanners = banners.filter((banner) =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.sub_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    fetchBanners();
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
          <ImageIcon className="w-8 h-8 text-orange-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Banner Yönetimi</h1>
            <p className="text-gray-600">
              Toplam {filteredBanners.length} banner
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Yeni Banner
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Banner ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBanners.map((banner) => (
          <div
            key={banner.id}
            className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
              isActive(banner) ? "ring-2 ring-green-500" : ""
            }`}
          >
            {/* Banner Image */}
            <div className="relative h-48 bg-gray-200">
              {banner.image ? (
                <img
                  src={getBannerImageUrl(banner.image)}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                {isActive(banner) ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Eye size={12} className="mr-1" />
                    Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <EyeOff size={12} className="mr-1" />
                    Pasif
                  </span>
                )}
              </div>
            </div>

            {/* Banner Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {banner.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {banner.sub_title}
              </p>

              {/* Date Range */}
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <Calendar size={12} className="mr-1" />
                {new Date(banner.start_date).toLocaleDateString("tr-TR")} - {" "}
                {new Date(banner.end_date).toLocaleDateString("tr-TR")}
              </div>

              {/* Button Info */}
              {banner.add_button && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Buton: {banner.btn_text || "Varsayılan"}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-xs text-gray-500">
                  {new Date(banner.created_at).toLocaleDateString("tr-TR")}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingBanner(banner);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 p-1"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
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

      {filteredBanners.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Banner bulunamadı
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Arama kriterlerinize uygun banner bulunamadı.
          </p>
        </div>
      )}

      {/* Banner Modal */}
      {isModalOpen && (
        <BannerModal
          banner={editingBanner}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}