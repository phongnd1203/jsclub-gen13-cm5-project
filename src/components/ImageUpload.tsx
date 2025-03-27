import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadImage } from '../lib/uploadImage';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  className?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export function ImageUpload({ onImageUploaded, className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError('Image size must be less than 5MB');
        e.target.value = ''; // Reset input
        return;
      }

      setUploading(true);
      
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload image
      const publicUrl = await uploadImage(file);
      onImageUploaded(publicUrl);
    } catch (err) {
      setError('Error uploading image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`relative ${className}`}>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
        <div className="space-y-1 text-center">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="mx-auto h-32 w-32 object-cover rounded-lg"
            />
          ) : (
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
          )}
          
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-500 hover:text-orange-600">
              <span>{preview ? 'Change image' : 'Upload a file'}</span>
              <input
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
          
          {uploading && (
            <div className="mt-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-1 text-sm text-gray-500">Uploading...</p>
            </div>
          )}
          
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to {formatFileSize(MAX_FILE_SIZE)}
          </p>
        </div>
      </div>
    </div>
  );
}