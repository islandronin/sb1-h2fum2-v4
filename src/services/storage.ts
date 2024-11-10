import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

async function blobFromUrl(url: string): Promise<{ blob: Blob; contentType: string }> {
  const response = await fetch(url, {
    headers: {
      'Accept': 'image/*',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const blob = await response.blob();
  return { blob, contentType };
}

export async function uploadContactImage(file: File | null, userId: string): Promise<string | null> {
  if (!file) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${userId}/${uuidv4()}.${fileExt}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from('contact-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('contact-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    throw new Error('Upload failed');
  }
}

export async function uploadImageFromUrl(url: string, userId: string): Promise<string | null> {
  if (!url) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  try {
    // First try to download the image
    const { blob, contentType } = await blobFromUrl(url);
    
    // Create a File object from the blob
    const extension = contentType.split('/')[1] || 'jpg';
    const file = new File([blob], `linkedin-${Date.now()}.${extension}`, {
      type: contentType
    });

    // Upload the file using the existing function
    return await uploadContactImage(file, userId);
  } catch (error) {
    // Return null instead of throwing to allow fallback behavior
    console.error('Failed to process LinkedIn image:', error);
    return null;
  }
}

export async function deleteContactImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/');

    const { error } = await supabase.storage
      .from('contact-images')
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete image:', error);
  }
}