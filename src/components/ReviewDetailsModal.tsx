import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Star,
  User,
  Send,
  Smile,
  ExternalLink,
  Heart,
  Reply,
  Trash2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { RestaurantMood } from "./RestaurantMood";

interface CommentReaction {
  emoji: string;
  count: number;
  users: string[];
}

interface CommentReply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_email: string;
  user_avatar?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_email: string;
  user_avatar?: string;
  reactions: {
    [emoji: string]: CommentReaction;
  };
  replies: CommentReply[];
}

// interface Rating {
//   id: string;
//   score: number;
//   user_id: string;
// }

interface ReviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: {
    id: string;
    restaurant: {
      id: string;
      name: string;
      description: string;
      address: string;
      image_url: string;
    };
    user: {
      id: string;
      email: string;
    };
    rating: number;
    comment: string;
    created_at: string;
  } | null;
}

const EMOJI_OPTIONS = ["👍", "❤️", "😋", "🔥", "👏", "😍"];

function getGoogleMapsUrl(address: string) {
  // const encodedAddress = encodeURIComponent(address);
  return `${address}`;
}

function getGoogleMapsDirectionsUrl(address: string) {
  // const encodedAddress = encodeURIComponent(address);
  return `${address}`;
}

export function ReviewDetailsModal({
  isOpen,
  onClose,
  review,
}: ReviewDetailsModalProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [activeEmojiPicker, setActiveEmojiPicker] = useState<string | null>(
    null
  );
  const [showMap, setShowMap] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [reviewerAvatar, setReviewerAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (review?.id) {
      fetchComments();
      fetchRatings();
      fetchLikes();
      fetchReviewerAvatar();
    }
  }, [review?.id]);

  const fetchReviewerAvatar = async () => {
    if (!review?.user.id) return;

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", review.user.id)
        .single();

      setReviewerAvatar(profileData?.avatar_url || null);
    } catch (err) {
      console.error("Error fetching reviewer avatar:", err);
    }
  };

  const fetchLikes = async () => {
    if (!review) return;

    try {
      // Get total likes
      const { data: likesData, error: likesError } = await supabase
        .from("review_likes")
        .select("user_id")
        .eq("review_id", review.id);

      if (likesError) throw likesError;

      // Check if current user has liked
      if (user) {
        const { data: userLike, error: userLikeError } = await supabase
          .from("review_likes")
          .select()
          .eq("review_id", review.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (userLikeError) throw userLikeError;
        setHasLiked(!!userLike);
      }

      setLikeCount(likesData?.length || 0);
    } catch (err) {
      console.error("Error fetching likes:", err);
    }
  };

  const handleLike = async () => {
    if (!user || !review) return;

    try {
      setIsLiking(true);

      if (hasLiked) {
        // Unlike
        const { error } = await supabase
          .from("review_likes")
          .delete()
          .eq("review_id", review.id)
          .eq("user_id", user.id);

        if (error) throw error;

        setLikeCount((prev) => prev - 1);
        setHasLiked(false);
      } else {
        // Like
        const { error } = await supabase.from("review_likes").insert({
          review_id: review.id,
          user_id: user.id,
        });

        if (error) throw error;

        setLikeCount((prev) => prev + 1);
        setHasLiked(true);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setIsLiking(false);
    }
  };

  const fetchRatings = async () => {
    if (!review) return;

    try {
      // Fetch average rating
      const { data: avgData } = await supabase.rpc("get_restaurant_rating", {
        restaurant_id: review.restaurant.id,
      });

      setAverageRating(Number(avgData) || 0);

      // Fetch rating count
      const { data: countData, error: countError } = await supabase
        .from("ratings")
        .select("id", { count: "exact" })
        .eq("restaurant_id", review.restaurant.id);

      if (countError) throw countError;
      setRatingCount(countData?.length || 0);

      // Fetch user's rating if logged in
      if (user) {
        const { data: userRatingData, error: userRatingError } = await supabase
          .from("ratings")
          .select("score")
          .eq("restaurant_id", review.restaurant.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (userRatingError && userRatingError.code !== "PGRST116") {
          throw userRatingError;
        }

        setUserRating(userRatingData?.score || null);
      }
    } catch (err) {
      console.error("Error fetching ratings:", err);
    }
  };

  const handleRating = async (score: number) => {
    if (!user || !review) return;

    try {
      setIsSubmittingRating(true);

      const { error } = await supabase.from("ratings").upsert(
        {
          restaurant_id: review.restaurant.id,
          user_id: user.id,
          score,
        },
        {
          onConflict: "restaurant_id,user_id",
        }
      );

      if (error) throw error;

      // Refresh ratings after update
      fetchRatings();
    } catch (err) {
      console.error("Error submitting rating:", err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const fetchComments = async () => {
    if (!review) return;

    try {
      setLoading(true);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("restaurant_id", review.restaurant.id)
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      // Fetch reactions for all comments
      const { data: reactionsData, error: reactionsError } = await supabase
        .from("comment_reactions")
        .select("comment_id, emoji, user_id")
        .in("comment_id", commentsData?.map((c) => c.id) || []);

      if (reactionsError) throw reactionsError;

      // Fetch replies for all comments
      const { data: repliesData, error: repliesError } = await supabase
        .from("comment_replies")
        .select("*")
        .in("comment_id", commentsData?.map((c) => c.id) || [])
        .order("created_at", { ascending: true });

      if (repliesError) throw repliesError;

      // Process reactions
      const reactionsByComment: {
        [commentId: string]: { [emoji: string]: CommentReaction };
      } = {};
      reactionsData?.forEach((reaction) => {
        if (!reactionsByComment[reaction.comment_id]) {
          reactionsByComment[reaction.comment_id] = {};
        }
        if (!reactionsByComment[reaction.comment_id][reaction.emoji]) {
          reactionsByComment[reaction.comment_id][reaction.emoji] = {
            emoji: reaction.emoji,
            count: 0,
            users: [],
          };
        }
        reactionsByComment[reaction.comment_id][reaction.emoji].count++;
        reactionsByComment[reaction.comment_id][reaction.emoji].users.push(
          reaction.user_id
        );
      });

      // Process replies
      const repliesByComment: { [commentId: string]: CommentReply[] } = {};
      await Promise.all(
        (repliesData || []).map(async (reply) => {
          try {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", reply.user_id)
              .maybeSingle();

            if (!repliesByComment[reply.comment_id]) {
              repliesByComment[reply.comment_id] = [];
            }

            repliesByComment[reply.comment_id].push({
              ...reply,
              user_email: profileData?.username || "Anonymous User",
              user_avatar: profileData?.avatar_url,
            });
          } catch (err) {
            console.error("Error fetching reply user data:", err);
          }
        })
      );

      // Combine comments with user info, reactions, and replies
      const commentsWithUsers = await Promise.all(
        (commentsData || []).map(async (comment) => {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", comment.user_id)
              .maybeSingle();

            if (profileError && profileError.code !== "PGRST116") {
              throw profileError;
            }

            return {
              ...comment,
              user_email: profileData?.username || "Anonymous User",
              user_avatar: profileData?.avatar_url,
              reactions: reactionsByComment[comment.id] || {},
              replies: repliesByComment[comment.id] || [],
            };
          } catch (err) {
            console.error("Error fetching user data:", err);
            return {
              ...comment,
              user_email: "Anonymous User",
              reactions: reactionsByComment[comment.id] || {},
              replies: repliesByComment[comment.id] || [],
            };
          }
        })
      );

      setComments(commentsWithUsers);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (commentId: string, emoji: string) => {
    if (!user) return;

    try {
      const reaction = comments.find((c) => c.id === commentId)?.reactions[
        emoji
      ];

      const hasReacted = reaction?.users.includes(user.id);

      if (hasReacted) {
        // Remove reaction
        const { error } = await supabase
          .from("comment_reactions")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id)
          .eq("emoji", emoji);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase.from("comment_reactions").insert({
          comment_id: commentId,
          user_id: user.id,
          emoji,
        });

        if (error) throw error;
      }

      // Refresh comments to update reactions
      fetchComments();
    } catch (err) {
      console.error("Error managing reaction:", err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !review || !newComment.trim()) return;

    try {
      setSubmitting(true);
      const { error } = await supabase.from("comments").insert({
        restaurant_id: review.restaurant.id,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Error submitting comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (commentId: string) => {
    if (!user || !newReply.trim()) return;

    try {
      setSubmittingReply(true);
      const { error } = await supabase.from("comment_replies").insert({
        comment_id: commentId,
        user_id: user.id,
        content: newReply.trim(),
      });

      if (error) throw error;

      setNewReply("");
      setReplyingTo(null);
      fetchComments();
    } catch (err) {
      console.error("Error submitting reply:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("comment_replies")
        .delete()
        .eq("id", replyId)
        .eq("user_id", user.id);

      if (error) throw error;

      fetchComments();
    } catch (err) {
      console.error("Error deleting reply:", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;

      fetchComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  if (!isOpen || !review) return null;

  const mapUrl = getGoogleMapsUrl(review.restaurant.address);
  const directionsUrl = getGoogleMapsDirectionsUrl(review.restaurant.address);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img
            src={
              review.restaurant.image_url ||
              "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
            }
            alt={review.restaurant.name}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {review.restaurant.name}
              </h2>
              <div className="mt-2">
                <RestaurantMood
                  text={review.comment}
                  time={review.created_at}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full mb-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="ml-1 font-semibold text-yellow-700">
                  {averageRating.toFixed(1)} ({ratingCount})
                </span>
              </div>
              <button
                onClick={handleLike}
                disabled={!user || isLiking}
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                  hasLiked
                    ? "bg-red-100 text-red-500"
                    : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"
                }`}
              >
                {isLiking ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <Heart
                    className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`}
                  />
                )}
                <span className="text-sm">{likeCount}</span>
              </button>
              {user && (
                <div className="flex items-center justify-end space-x-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleRating(score)}
                      disabled={isSubmittingRating}
                      className={`p-1 rounded-full transition-colors ${
                        score <= (userRating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300 hover:text-yellow-400"
                      }`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <MapPin className="h-5 w-5" />
              <span className="ml-2">{review.restaurant.address}</span>
            </button>

            {showMap && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 hover:bg-gray-50 transition-colors"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>

          {review.restaurant.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Mô tả quán</h3>
              <p className="text-gray-600">{review.restaurant.description}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Nhận xét</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {review.comment}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t mb-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {reviewerAvatar ? (
                  <img
                    src={reviewerAvatar}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-gray-600" />
                )}
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">{review.user.email}</p>
                <p className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
          {/* Comment */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Bình luận</h3>

            <div className="space-y-4 mb-6">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Chưa có bình luận nào.
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="space-y-4">
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {comment.user_avatar ? (
                            <img
                              src={comment.user_avatar}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="bg-gray-50 rounded-lg px-4 py-2">
                          <p className="font-medium text-sm text-gray-900">
                            {comment.user_email}
                          </p>
                          <p className="text-gray-600">{comment.content}</p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(comment.reactions).map(
                              ([emoji, reaction]) => (
                                <button
                                  key={emoji}
                                  onClick={() =>
                                    user && handleReaction(comment.id, emoji)
                                  }
                                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm ${
                                    user && reaction.users.includes(user.id)
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  <span>{reaction.count}</span>
                                </button>
                              )
                            )}

                            {user && (
                              <>
                                <div className="relative inline-block">
                                  <button
                                    onClick={() =>
                                      setActiveEmojiPicker(
                                        activeEmojiPicker === comment.id
                                          ? null
                                          : comment.id
                                      )
                                    }
                                    className="p-1 rounded-full hover:bg-gray-200"
                                  >
                                    <Smile className="h-4 w-4 text-gray-500" />
                                  </button>

                                  {activeEmojiPicker === comment.id && (
                                    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 flex space-x-2">
                                      {EMOJI_OPTIONS.map((emoji) => (
                                        <button
                                          key={emoji}
                                          onClick={() => {
                                            handleReaction(comment.id, emoji);
                                            setActiveEmojiPicker(null);
                                          }}
                                          className="hover:bg-gray-100 rounded p-1"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <button
                                  onClick={() =>
                                    setReplyingTo(
                                      replyingTo === comment.id
                                        ? null
                                        : comment.id
                                    )
                                  }
                                  className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
                                >
                                  <Reply className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {/* Delete comment */}
                            {user && user.id === comment.user_id && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>

                        {/* Replies */}
                        <div className="mt-2 space-y-2">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex space-x-3 ml-8">
                              <div className="flex-shrink-0">
                                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                  {reply.user_avatar ? (
                                    <img
                                      src={reply.user_avatar}
                                      alt="Profile"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <User className="h-3 w-3 text-gray-600" />
                                  )}
                                </div>
                              </div>
                              <div className="flex-grow">
                                <div className="bg-gray-50 rounded-lg px-3 py-2">
                                  <p className="font-medium text-sm text-gray-900">
                                    {reply.user_email}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {reply.content}
                                  </p>
                                </div>
                                <div className="flex items-center mt-1 space-x-4">
                                  <p className="text-xs text-gray-500">
                                    {new Date(
                                      reply.created_at
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                  {/* Delete Reply comment */}
                                  {user && user.id === reply.user_id && (
                                    <button
                                      onClick={() =>
                                        handleDeleteReply(reply.id)
                                      }
                                      className="text-red-500 hover:text-red-600"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Reply Form */}
                        {replyingTo === comment.id && (
                          <div className="mt-2 ml-8">
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={newReply}
                                onChange={(e) => setNewReply(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-grow px-3 py-1 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                              <button
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={submittingReply || !newReply.trim()}
                                className="bg-orange-500 text-white p-1.5 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50"
                              >
                                {submittingReply ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {user ? (
              <form
                onSubmit={handleSubmitComment}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Hãy viết bình luận của bạn..."
                  className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </form>
            ) : (
              <p className="text-center text-gray-500">
                Please sign in to comment.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
