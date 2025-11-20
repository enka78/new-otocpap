"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations, useLocale } from "next-intl";
import AuthModal from "@/components/AuthModal";

interface ReactionType {
  id: number;
  name: string;
  display_name: string;
  display_name_en?: string;
  icon: string;
  color: string;
  order_index: number;
}

interface BlogReaction {
  blog_id: number;
  reaction_type_id: number;
  name: string;
  display_name: string;
  display_name_en?: string;
  icon: string;
  color: string;
  count: number;
}

interface UserReaction {
  reaction_type_id: number;
  name: string;
}

interface BlogReactionsProps {
  blogId: number;
}

export default function BlogReactions({ blogId }: BlogReactionsProps) {
  const { user } = useAuth();
  const t = useTranslations();
  const locale = useLocale();
  const [reactions, setReactions] = useState<BlogReaction[]>([]);
  const [userReactions, setUserReactions] = useState<UserReaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchReactions();
      if (user) {
        fetchUserReactions();
      }
    }
  }, [blogId, user, mounted]);

  const fetchReactions = async () => {
    try {
      // First fetch reaction types with display_name_en
      const { data: reactionTypes, error: typesError } = await supabase
        .from("reaction_types")
        .select(
          "id, name, display_name, display_name_en, icon, color, order_index"
        )
        .eq("is_active", true)
        .order("order_index");

      if (typesError) throw typesError;

      // Calculate count for each reaction type
      const reactionsWithCounts = await Promise.all(
        (reactionTypes || []).map(async (type: any) => {
          const { count } = await supabase
            .from("blog_reactions")
            .select("*", { count: "exact", head: true })
            .eq("blog_id", blogId)
            .eq("reaction_type_id", type.id);

          return {
            blog_id: blogId,
            reaction_type_id: type.id,
            name: type.name,
            display_name: type.display_name,
            display_name_en: type.display_name_en,
            icon: type.icon,
            color: type.color,
            order_index: type.order_index,
            count: count || 0,
          };
        })
      );

      setReactions(reactionsWithCounts);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  const fetchUserReactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_blog_reactions")
        .select("reaction_type_id, name")
        .eq("blog_id", blogId)
        .eq("user_id", user.id);

      if (error) throw error;
      setUserReactions((data || []) as UserReaction[]);
    } catch (error) {
      console.error("Error fetching user reactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReaction = async (reactionTypeId: number) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const hasReaction = userReactions.some(
      (r) => r.reaction_type_id === reactionTypeId
    );

    try {
      if (hasReaction) {
        // Remove reaction
        const { error } = await supabase
          .from("blog_reactions")
          .delete()
          .eq("blog_id", blogId)
          .eq("user_id", user.id)
          .eq("reaction_type_id", reactionTypeId);

        if (error) throw error;

        setUserReactions((prev) =>
          prev.filter((r) => r.reaction_type_id !== reactionTypeId)
        );
      } else {
        // Add reaction
        const { error } = await supabase.from("blog_reactions").insert({
          blog_id: blogId,
          user_id: user.id,
          reaction_type_id: reactionTypeId,
        });

        if (error) throw error;

        // Add new reaction to user reactions
        const reactionType = reactions.find(
          (r) => r.reaction_type_id === reactionTypeId
        );
        if (reactionType) {
          setUserReactions((prev) => [
            ...prev,
            {
              reaction_type_id: reactionTypeId,
              name: reactionType.name,
            },
          ]);
        }
      }

      // Update reaction counts
      fetchReactions();
    } catch (error) {
      console.error("Error toggling reaction:", error);
      alert(t("common.error") + ": " + t("blog.reactionError"));
    }
  };

  // Helper function to get display name based on locale
  const getDisplayName = (reaction: BlogReaction) => {
    if (locale === "en" && reaction.display_name_en) {
      return reaction.display_name_en;
    }
    return reaction.display_name;
  };

  const renderContent = () => {
    if (!mounted) {
      return (
        <div className="bg-gray-50 rounded-lg p-6 mt-8">
          <div className="flex items-center justify-center py-4">
            <div
              className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
              aria-label={t("blog.loadingReactions")}
            ></div>
          </div>
        </div>
      );
    }

    if (loading && !user) {
      return (
        <div className="bg-gray-50 rounded-lg p-6 mt-8">
          <p className="text-sm text-gray-600 text-center">
            {t("blog.loginToReact")}{" "}
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              {t("blog.loginLink")}
            </button>
            .
          </p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="bg-gray-50 rounded-lg p-6 mt-8">
          <div className="flex items-center justify-center py-4">
            <div
              className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
              aria-label={t("blog.loadingReactions")}
            ></div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("blog.reactionTitle")}
        </h3>

        {!user && (
          <p className="text-sm text-gray-600 mb-4">
            {t("blog.loginToReact")}{" "}
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-blue-600 hover:underline font-medium"
            >
              {t("blog.loginLink")}
            </button>
            .
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {reactions.map((reaction) => {
            const isSelected = userReactions.some(
              (r) => r.reaction_type_id === reaction.reaction_type_id
            );

            return (
              <button
                key={reaction.reaction_type_id}
                onClick={() => toggleReaction(reaction.reaction_type_id)}
                disabled={!user}
                className={`
                  flex items-center justify-between p-3 rounded-lg border-2 transition-all
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }
                  ${
                    !user
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:shadow-sm"
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{reaction.icon}</span>
                  <span className="text-sm font-medium">
                    {getDisplayName(reaction)}
                  </span>
                </div>
                {reaction.count > 0 && (
                  <span
                    className={`
                    text-xs px-2 py-1 rounded-full
                    ${
                      isSelected
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-200 text-gray-600"
                    }
                  `}
                  >
                    {reaction.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
