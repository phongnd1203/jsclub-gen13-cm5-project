import React, { useState, useEffect } from 'react';
import { User, Camera, Mail, Edit2, Check, X, ArrowLeft, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { ImageUpload } from './ImageUpload';

interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

export function ProfilePage({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Edit form state
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // If profile doesn't exist, create one
      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              username: user.email?.split('@')[0] || 'user',
              bio: '',
              avatar_url: '',
              phone_number: '',
              updated_at: new Date().toISOString(),
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        
        setProfile(newProfile);
        setUsername(newProfile.username);
        setBio(newProfile.bio || '');
        setAvatarUrl(newProfile.avatar_url || '');
        setPhoneNumber(newProfile.phone_number || '');
      } else {
        setProfile(profileData);
        setUsername(profileData.username);
        setBio(profileData.bio || '');
        setAvatarUrl(profileData.avatar_url || '');
        setPhoneNumber(profileData.phone_number || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const validateUsername = (username: string) => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 30) return 'Username must be less than 30 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  };

  const handleSave = async () => {
    if (!user) return;

    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Check if username is taken (if changed)
      if (username !== profile?.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .single();

        if (existingUser) {
          throw new Error('Username is already taken');
        }
      }

      const updates = {
        username,
        bio: bio.trim(),
        avatar_url: avatarUrl,
        phone_number: phoneNumber.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mt-20"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        </div>
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setUsername(profile?.username || '');
                setBio(profile?.bio || '');
                setAvatarUrl(profile?.avatar_url || '');
                setPhoneNumber(profile?.phone_number || '');
                setError(null);
              }}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-orange-400 to-orange-600">
            <div className="absolute -bottom-12 left-6">
              <div className="relative">
                {isEditing ? (
                  <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                    <ImageUpload
                      onImageUploaded={setAvatarUrl}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 px-6 pb-6">
            <div className="mb-6">
              <div className="flex flex-col space-y-2">
                {isEditing ? (
                  <>
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="text-lg font-bold text-gray-900 bg-gray-100 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter username"
                    />
                  </>
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">{profile?.username}</h2>
                )}
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-gray-100 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <span>{profile?.phone_number || 'No phone number added'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
                {isEditing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full h-32 px-3 py-2 bg-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-600">{profile?.bio || 'No bio yet'}</p>
                )}
              </div>

              {!isEditing && profile?.updated_at && (
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(profile.updated_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}