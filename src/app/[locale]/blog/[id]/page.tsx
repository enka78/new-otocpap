"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase, getBlogImageUrl } from "@/lib/supabase";
import { Blog, Profile } from "@/types/blog";
import { ArrowLeft, Calendar } from "lucide-react";
import Image from "next/image";

import dynamic from "next/dynamic";

const BlogReactions = dynamic(() => import("@/components/blog/BlogReactions"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-50 rounded-lg p-6 mt-8">
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    </div>
  ),
});

export default function BlogDetailPage() {
  const [post, setPost] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const params = useParams();
  const t = useTranslations();
  const locale = useLocale();
  const postId = parseInt(params.id as string);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Tarih belirtilmemiş";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Geçersiz tarih";

    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && postId) {
      fetchPost();
    }
  }, [postId, mounted]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", postId)
        .single();

      if (error) throw error;

      console.log("Blog data:", data); // Debug log
      console.log("Created at:", data?.created_at); // Debug log

      if (data) {
        setPost(data as unknown as Blog);
      }
    } catch (error) {
      console.error("Error fetching blog post:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Blog Yazısı Bulunamadı
            </h1>
            <p className="text-gray-600 mb-8">
              Aradığınız blog yazısı mevcut değil.
            </p>
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Blog&apos;a Dön
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link href={`/${locale}`} className="hover:text-blue-600">
              Ana Sayfa
            </Link>
            <span>/</span>
            <Link href={`/${locale}/blog`} className="hover:text-blue-600">
              Blog
            </Link>
            <span>/</span>
            <span className="text-gray-900">{post.title}</span>
          </nav>

          {/* Article Header */}
          <article className="prose-content bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            {/* Featured Image */}
            <div className="relative h-80 bg-gray-200 flex items-center justify-center overflow-hidden">
              {post.image ? (
                <Image
                  src={getBlogImageUrl(post.image)}
                  alt={post.title}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-700">
                      OTOCPAP
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8">
              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>

              {/* Subtitle */}
              <h2 className="text-xl text-gray-600 mb-6">{post.sub_title}</h2>

              {/* Meta Information */}
              <div className="flex items-center text-sm text-gray-600 mb-6 pb-6 border-b">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  {post?.created_add
                    ? formatDate(post.created_add)
                    : "Tarih belirtilmemiş"}
                </div>
              </div>

              {/* Content */}
              <div
                className="prose max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.description || "" }}
              />
            </div>
          </article>

          {/* Blog Reactions */}
          <BlogReactions blogId={postId} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
