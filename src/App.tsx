import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Star,
  Camera,
  User,
  LogOut,
  Trash2,
  Coffee,
  Sun,
  Utensils,
  Cookie,
  Moon,
  Beer,
  Monitor,
  Eclipse,
  Store,
  X,
  Heart,
} from "lucide-react";
import { AuthModal } from "./components/AuthModal";
import { CreatePostModal } from "./components/CreatePostModal";
import { ReviewDetailsModal } from "./components/ReviewDetailsModal";
import { ProfilePage } from "./components/ProfilePage";
import { useAuthStore } from "./store/authStore";
import { supabase } from "./lib/supabase";
import { RestaurantMood } from "./components/RestaurantMood";

interface Review {
  id: string;
  restaurant: {
    id: string;
    name: string;
    description: string;
    address: string;
    image_url: string;
    category: {
      id: string;
      name: string;
    };
    tags: {
      id: string;
      name: string;
    }[];
  };
  user: {
    id: string;
    email: string;
    avatar_url?: string;
  };
  rating: number;
  comment: string;
  created_at: string;
}

interface RestaurantRating {
  [key: string]: {
    average: number;
    count: number;
  };
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface RestaurantLikes {
  [key: string]: {
    count: number;
    hasLiked: boolean;
  };
}

function App() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [restaurantRatings, setRestaurantRatings] = useState<RestaurantRating>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Review[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [restaurantLikes, setRestaurantLikes] = useState<RestaurantLikes>({});
  const [likingRestaurant, setLikingRestaurant] = useState<string | null>(null);
  const { user, setUser, signOut } = useAuthStore();
  const [userProfile, setUserProfile] = useState<{
    username: string;
    avatar_url: string | null;
  } | null>(null);

  const categories: Category[] = [
    { id: "Bữa sáng", name: "Bữa sáng", icon: <Sun className="h-6 w-6" /> },
    {
      id: "Bữa trưa",
      name: "Bữa trưa",
      icon: <Utensils className="h-6 w-6" />,
    },
    { id: "Bữa tối", name: "Bữa tối", icon: <Moon className="h-6 w-6" /> },
    { id: "Coffee", name: "Coffee", icon: <Coffee className="h-6 w-6" /> },
    {
      id: "Quán ăn vặt",
      name: "Quán ăn vặt",
      icon: <Cookie className="h-6 w-6" />,
    },
    { id: "Beer", name: "Beer", icon: <Beer className="h-6 w-6" /> },
    { id: "Billard", name: "Billard", icon: <Eclipse className="h-6 w-6" /> },
    { id: "Siêu thị", name: "Siêu thị", icon: <Store className="h-6 w-6" /> },
    { id: "Cyber", name: "Cyber", icon: <Monitor className="h-6 w-6" /> },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  useEffect(() => {
    fetchReviews();
  }, [activeCategory]);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery) {
        setIsSearching(true);
        const query = searchQuery.toLowerCase();
        const results = reviews.filter((review) => {
          const matchName = review.restaurant.name
            .toLowerCase()
            .includes(query);
          const matchCategory = review.restaurant.category?.name
            .toLowerCase()
            .includes(query);
          const matchTags = review.restaurant.tags.some((tag) =>
            tag.name.toLowerCase().includes(query)
          );
          const matchAddress = review.restaurant.address
            .toLowerCase()
            .includes(query);
          const matchDescription = review.restaurant.description
            ?.toLowerCase()
            .includes(query);

          return (
            matchName ||
            matchCategory ||
            matchTags ||
            matchAddress ||
            matchDescription
          );
        });
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, reviews]);

  useEffect(() => {
    if (reviews.length > 0) {
      fetchLikes();
    }
  }, [reviews, user]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchLikes = async () => {
    try {
      const restaurantIds = [
        ...new Set(reviews.map((review) => review.restaurant.id)),
      ];

      const { data: likesData, error: likesError } = await supabase
        .from("post_likes")
        .select("restaurant_id")
        .in("restaurant_id", restaurantIds);

      if (likesError) throw likesError;

      const { data: userLikes, error: userLikesError } = user
        ? await supabase
            .from("post_likes")
            .select("restaurant_id")
            .eq("user_id", user.id)
            .in("restaurant_id", restaurantIds)
        : { data: [], error: null };

      if (userLikesError) throw userLikesError;

      const userLikedRestaurants = new Set(
        userLikes?.map((like) => like.restaurant_id) || []
      );

      const likes: RestaurantLikes = {};
      restaurantIds.forEach((id) => {
        const count =
          likesData?.filter((like) => like.restaurant_id === id).length || 0;
        likes[id] = {
          count,
          hasLiked: userLikedRestaurants.has(id),
        };
      });

      setRestaurantLikes(likes);
    } catch (err) {
      console.error("Error fetching likes:", err);
    }
  };

  const handleLike = async (restaurantId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      setLikingRestaurant(restaurantId);
      const hasLiked = restaurantLikes[restaurantId]?.hasLiked;

      if (hasLiked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("restaurant_id", restaurantId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("post_likes").insert({
          restaurant_id: restaurantId,
          user_id: user.id,
        });

        if (error) throw error;
      }

      setRestaurantLikes((prev) => ({
        ...prev,
        [restaurantId]: {
          count: prev[restaurantId].count + (hasLiked ? -1 : 1),
          hasLiked: !hasLiked,
        },
      }));
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLikingRestaurant(null);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          restaurant:restaurants(
            id,
            name,
            description,
            address,
            image_url,
            category:categories(id, name),
            tags:restaurant_tags(
              tag:tags(id, name)
            )
          ),
          user:users(
            id,
            email
          )
        `
        )
        .order("rating", { ascending: false })
        .order("created_at", { ascending: false });

      if (activeCategory) {
        query = query.eq("restaurant.category.name", activeCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data and fetch user avatars
      const transformedData = await Promise.all(
        (data || [])
          .filter(
            (review) =>
              review.restaurant &&
              review.restaurant.category &&
              review.user &&
              review.user.email
          )
          .map(async (review) => {
            // Fetch user avatar
            const { data: profileData } = await supabase
              .from("profiles")
              .select("avatar_url")
              .eq("id", review.user.id)
              .single();

            return {
              ...review,
              restaurant: {
                ...review.restaurant,
                tags: review.restaurant.tags.map((t: any) => t.tag),
              },
              user: {
                ...review.user,
                avatar_url: profileData?.avatar_url,
              },
            };
          })
      );

      const restaurantIds = [
        ...new Set(transformedData.map((review) => review.restaurant.id)),
      ];
      const ratings: RestaurantRating = {};

      await Promise.all(
        restaurantIds.map(async (id) => {
          try {
            const { data: avgData } = await supabase.rpc(
              "get_restaurant_rating",
              { restaurant_id: id }
            );

            const { data: countData } = await supabase
              .from("ratings")
              .select("id", { count: "exact" })
              .eq("restaurant_id", id);

            ratings[id] = {
              average: Number(avgData) || 0,
              count: countData?.length || 0,
            };
          } catch (err) {
            console.error("Error fetching ratings for restaurant:", id, err);
            ratings[id] = { average: 0, count: 0 };
          }
        })
      );

      const sortedData = transformedData.sort((a, b) => {
        const ratingA = ratings[a.restaurant.id]?.average || 0;
        const ratingB = ratings[b.restaurant.id]?.average || 0;
        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      setRestaurantRatings(ratings);
      setReviews(sortedData);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;

    try {
      setDeleting(reviewId);

      // Check if user is admin
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;

      const isAdmin = userData?.email === "linhdeptrai@gmail.com";

      // Delete review if user is admin or owner
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId)
        .eq(isAdmin ? "id" : "user_id", isAdmin ? reviewId : user.id);

      if (error) throw error;

      setReviews(reviews.filter((review) => review.id !== reviewId));

      if (selectedReview?.id === reviewId) {
        setSelectedReview(null);
      }
    } catch (err) {
      console.error("Error deleting review:", err);
    } finally {
      setDeleting(null);
    }
  };

  const handleAuthClick = () => {
    if (user) {
      signOut();
      setUserProfile(null); // Clear user profile on logout
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleCreatePost = () => {
    if (user) {
      setIsCreatePostModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const displayedReviews = searchQuery ? searchResults : reviews;

  if (showProfile) {
    return <ProfilePage onClose={() => setShowProfile(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-transparent bg-clip-text">
                  Riviu HOLA
                </span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (user) {
                    setShowProfile(true);
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="text-gray-600 flex flex-col items-center"
              >
                {userProfile && (
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                      {userProfile.avatar_url ? (
                        <img
                          src={userProfile.avatar_url}
                          alt="User Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {userProfile.username}
                    </span>
                  </div>
                )}
              </button>
              <button
                onClick={handleAuthClick}
                className="flex items-center space-x-1 text-gray-600 hover:text-orange-500"
              >
                {user ? (
                  <>
                    <LogOut className="h-6 w-6" />
                    <span className="text-sm">Sign Out</span>
                  </>
                ) : (
                  <>
                    <User className="h-6 w-6" />
                    <span className="text-sm">Sign In</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-3 relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên quán, địa chỉ, món ăn..."
                className="w-full px-4 py-2 pl-10 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-3 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                setActiveCategory(
                  activeCategory === category.name ? null : category.name
                )
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                activeCategory === category.name
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-600 hover:bg-orange-50"
              }`}
            >
              {category.icon}
              <span className="mt-2 text-xs font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading reviews...</p>
            </div>
          ) : displayedReviews.length === 0 ? (
            <div className="col-span-2 text-center py-8">
              <p className="text-gray-600">
                {searchQuery
                  ? "No reviews found matching your search."
                  : activeCategory
                  ? `No reviews yet for ${activeCategory} restaurants.`
                  : "Hãy đăng nhập hoặc đăng ký để xem và đánh giá"}
              </p>
              <div>
                <div className="flex flex-col justify-center items-center h-screen">
                  <a
                    href="#"
                    onClick={handleAuthClick}
                    className="flex items-center justify-center w-20 h-20 bg-green-500 text-white rounded-full shadow-xl hover:bg-green-600 transition transform -translate-y-80"
                  >
                    {user ? (
                      <LogOut className="h-10 w-10" />
                    ) : (
                      <User className="h-10 w-10" />
                    )}
                  </a>
                  <p className="mt-4 text-lg text-gray-700 -translate-y-80">
                    Đăng Nhập
                  </p>
                </div>
              </div>
            </div>
          ) : (
            displayedReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-[1.02]"
                onClick={() => setSelectedReview(review)}
              >
                <img
                  src={
                    review.restaurant.image_url ||
                    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
                  }
                  alt={review.restaurant.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {review.restaurant.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          {review.restaurant.category?.name}
                        </span>
                        <RestaurantMood
                          text={review.comment}
                          time={review.created_at}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="ml-1 text-sm font-medium text-yellow-700">
                          {restaurantRatings[
                            review.restaurant.id
                          ]?.average.toFixed(1)}{" "}
                          ({restaurantRatings[review.restaurant.id]?.count})
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(review.restaurant.id);
                        }}
                        disabled={likingRestaurant === review.restaurant.id}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                          restaurantLikes[review.restaurant.id]?.hasLiked
                            ? "bg-red-100 text-red-500"
                            : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"
                        }`}
                      >
                        {likingRestaurant === review.restaurant.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <Heart
                            className={`h-4 w-4 ${
                              restaurantLikes[review.restaurant.id]?.hasLiked
                                ? "fill-current"
                                : ""
                            }`}
                          />
                        )}
                        <span className="text-sm">
                          {restaurantLikes[review.restaurant.id]?.count || 0}
                        </span>
                      </button>
                    </div>
                  </div>

                  {review.restaurant.tags &&
                    review.restaurant.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {review.restaurant.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                  <div className="flex items-center mt-2 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span className="ml-1 text-sm">
                      {review.restaurant.address}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600 line-clamp-2">
                    {review.comment}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {review.user.avatar_url ? (
                          <img
                            src={review.user.avatar_url}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <span className="ml-2 text-sm font-medium">
                        {review.user.email}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      {(user?.id === review.user.id ||
                        user?.email === "linhdeptrai@gmail.com") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReview(review.id);
                          }}
                          disabled={deleting === review.id}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          {deleting === review.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-3">
            <button className="text-orange-500 flex flex-col items-center">
              <Star className="h-6 w-6" />
              <span className="text-xs mt-1">Reviews</span>
            </button>
            <button
              onClick={handleCreatePost}
              className="text-gray-600 flex flex-col items-center"
            >
              <Camera className="h-6 w-6" />
              <span className="text-xs mt-1">Đăng bài Review</span>
            </button>
            <button
              onClick={() => {
                if (user) {
                  setShowProfile(true);
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="text-gray-600 flex flex-col items-center"
            >
              <User className="h-6 w-6" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          fetchReviews();
        }}
      />
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => {
          setIsCreatePostModalOpen(false);
          fetchReviews();
        }}
      />
      <ReviewDetailsModal
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        review={selectedReview}
      />
    </div>
  );
}

export default App;
