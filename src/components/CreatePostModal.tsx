import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  Sun,
  Coffee,
  Utensils,
  Cookie,
  Moon,
  Beer,
  Monitor,
  Eclipse,
  Store,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { ImageUpload } from "./ImageUpload";

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Tag {
  id: string;
  name: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(5);
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState("");
  const { user } = useAuthStore();

  const categoryIcons: { [key: string]: React.ReactNode } = {
    "Bữa sáng": <Sun className="h-5 w-5" />,
    "Bữa trưa": <Utensils className="h-5 w-5" />,
    "Bữa tối": <Moon className="h-5 w-5" />,
    Coffee: <Coffee className="h-5 w-5" />,
    "Quán ăn vặt": <Cookie className="h-5 w-5" />,
    Beer: <Beer className="h-5 w-5" />,
    Billard: <Eclipse className="h-5 w-5" />,
    "Siêu thị": <Store className="h-5 w-5" />,
    Cyber: <Monitor className="h-5 w-5" />,
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategoriesAndTags();
    } else {
      // Reset form when modal is closed
      setTitle("");
      setDescription("");
      setRating(5);
      setAddress("");
      setImageUrl("");
      setCategoryId("");
      setSelectedTags([]);
      setError("");
    }
  }, [isOpen]);

  const fetchCategoriesAndTags = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch tags
      const { data: tagsData, error: tagsError } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (tagsError) throw tagsError;
      setTags(tagsData || []);
    } catch (err) {
      console.error("Error fetching categories and tags:", err);
      setError("Failed to load categories and tags");
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !categoryId) return;

    try {
      // First ensure the user exists in the users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (userCheckError || !existingUser) {
        // Create the user if they don't exist
        const { error: createUserError } = await supabase.from("users").insert([
          {
            id: user.id,
            email: user.email,
            role: "user",
          },
        ]);

        if (createUserError) throw createUserError;
      }

      // Create the restaurant
      const { data: restaurant, error: restaurantError } = await supabase
        .from("restaurants")
        .insert([
          {
            name: title,
            description,
            address,
            image_url: imageUrl,
            category_id: categoryId,
          },
        ])
        .select()
        .single();

      if (restaurantError) throw restaurantError;

      // Add tags
      if (selectedTags.length > 0) {
        const { error: tagsError } = await supabase
          .from("restaurant_tags")
          .insert(
            selectedTags.map((tagId) => ({
              restaurant_id: restaurant.id,
              tag_id: tagId,
            }))
          );

        if (tagsError) throw tagsError;
      }

      // Create the review
      const { error: reviewError } = await supabase.from("reviews").insert([
        {
          restaurant_id: restaurant.id,
          user_id: user.id,
          rating,
          comment: description,
        },
      ]);

      if (reviewError) throw reviewError;

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating post");
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Tạo bài viết</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Thể loại <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryId(category.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
                    categoryId === category.id
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {categoryIcons[category.name] || <Sun className="h-6 w-6" />}
                  <span className="text-sm font-medium mt-2">
                    {category.name}
                  </span>
                  <span className="text-xs mt-1 text-center opacity-75">
                    {category.description}
                  </span>
                </button>
              ))}
            </div>
            {!categoryId && <p className="mt-2 text-sm text-red-500">Hãy</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tên cửa hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag.id)
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`p-2 rounded-full ${
                    rating >= value ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-32"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Ảnh
            </label>
            <ImageUpload onImageUploaded={setImageUrl} className="mt-1" />
          </div>

          <button
            type="submit"
            disabled={!categoryId}
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Đăng bài
          </button>
        </form>
      </div>
    </div>
  );
}
