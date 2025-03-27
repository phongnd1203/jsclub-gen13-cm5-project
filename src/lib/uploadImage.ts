import { supabase } from './supabase';

export async function uploadImage(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('restaurant-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    if (data) {
      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-images')
        .getPublicUrl(data.path);
      
      return publicUrl;
    }

    throw new Error('Failed to get public URL');
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}