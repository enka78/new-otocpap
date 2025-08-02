'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase, Blog, Comment, getBlogImageUrl } from '@/lib/supabase';
import { ArrowLeft, Calendar, User, Eye, Heart, MessageCircle, Send } from 'lucide-react';
import Image from 'next/image';
import AuthModal from '@/components/AuthModal';


export default function BlogDetailPage() {
  const [post, setPost] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [likes, setLikes] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const params = useParams();
  const t = useTranslations();
  const locale = useLocale();
  const postId = params.id;

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
      checkUser();
    }
  }, [postId]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        // Check if user liked this post
        await checkUserLike(user.id);
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setCurrentUser(session.user);
          setIsLoggedIn(true);
          checkUserLike(session.user.id);
        } else {
          setCurrentUser(null);
          setIsLoggedIn(false);
          setIsLiked(false);
        }
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const checkUserLike = async (userId: string) => {
    try {
      // Check if user has liked this post (using localStorage for simplicity)
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      setIsLiked(likedPosts.includes(`${userId}-${postId}`));
    } catch (error) {
      console.error('Error checking user like:', error);
    }
  };

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('article_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add user names to comments
      const commentsWithUsers = (data || []).map(comment => ({
        ...comment,
        user_name: comment.profiles?.full_name || comment.profiles?.email || `Kullanıcı #${comment.user_id}`
      }));
      
      setComments(commentsWithUsers);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Fallback: fetch without user info
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', postId)
        .order('created_at', { ascending: false });
      
      const commentsWithUsers = (data || []).map(comment => ({
        ...comment,
        user_name: `Kullanıcı #${comment.user_id}`
      }));
      
      setComments(commentsWithUsers);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn || !currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    
    try {
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      const likeKey = `${currentUser.id}-${postId}`;
      
      if (isLiked) {
        // Remove like
        const updatedLikes = likedPosts.filter((like: string) => like !== likeKey);
        localStorage.setItem('likedPosts', JSON.stringify(updatedLikes));
        setLikes(prev => prev - 1);
        setIsLiked(false);
      } else {
        // Add like
        likedPosts.push(likeKey);
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        setLikes(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn || !currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    
    if (!newComment.trim()) return;
    
    try {
      console.log('Submitting comment:', {
        article_id: Number(postId),
        user_id: currentUser.id,
        comment: newComment
      });

      const commentData = {
        article_id: Number(postId),
        user_id: currentUser.id, // UUID string - table should be uuid type
        comment: newComment.trim()
      };

      const { data, error } = await supabase
        .from('comments')
        .insert([commentData])
        .select()
        .single();

      console.log('Comment insert result:', { data, error }); // Debug log

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      // Add user info to comment for display
      const commentWithUser = {
        ...data,
        user_name: currentUser.user_metadata?.full_name || currentUser.email || 'Anonim Kullanıcı'
      };
      
      setComments(prev => [commentWithUser, ...prev]);
      setNewComment('');
      alert('Yorum başarıyla eklendi!');
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Error adding comment:', error);
      alert(`Yorum eklenirken bir hata oluştu: ${error.message || error}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Yazısı Bulunamadı</h1>
            <p className="text-gray-600 mb-8">Aradığınız blog yazısı mevcut değil.</p>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link href={`/${locale}`} className="hover:text-blue-600">Ana Sayfa</Link>
            <span>/</span>
            <Link href={`/${locale}/blog`} className="hover:text-blue-600">Blog</Link>
            <span>/</span>
            <span className="text-gray-900">{post.title}</span>
          </nav>

          {/* Article Header */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            {/* Featured Image */}
            <div className="relative h-64 bg-gray-200">
              {post.image ? (
                <Image
                  src={getBlogImageUrl(post.image)}
                  alt={post.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-700">OTOCPAP</div>
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
              <h2 className="text-xl text-gray-600 mb-6">
                {post.sub_title}
              </h2>

              {/* Meta Information */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-6 pb-6 border-b">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <User size={16} className="mr-2" />
                    {post.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    {formatDate(post.created_at)}
                  </div>
                </div>
                
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  disabled={!isLoggedIn}
                >
                  <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                  <span>{likes || 0}</span>
                </button>
              </div>

              {/* Content */}
              <div 
                className="prose max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.description }}
              />
            </div>
          </article>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Yorumlar ({comments.length})
            </h3>

            {/* Comment Form */}
            {isLoggedIn ? (
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Yorumunuzu yazın..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} className="mr-2" />
                    Yorum Yap
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
                <p className="text-gray-600 mb-4">Yorum yapmak için giriş yapmanız gerekiyor.</p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Giriş Yap
                </button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{comment.user_name}</h4>
                        <p className="text-sm text-gray-500">{formatDate(comment.created_at)}</p>
                      </div>
                    </div>
                    
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors">
                      <Heart size={16} />
                      <span>Beğen</span>
                    </button>
                  </div>
                  
                  <p className="text-gray-700 ml-13">{comment.comment}</p>
                </div>
              ))}
            </div>

            {comments.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
              </div>
            )}
          </div>
        </div>
      </main>

        <Footer />
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode="login"
        />
      </div>
  );
}