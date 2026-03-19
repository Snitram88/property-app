import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/src/lib/supabase/client';

export type SelectedImage = {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
};

export type PropertyImageRow = {
  id: string;
  property_id: string;
  image_url: string;
  storage_path: string | null;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
};

async function ensureLibraryPermission() {
  const result = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!result.granted) {
    throw new Error('Please allow media library access to upload listing images.');
  }
}

function guessExtension(asset: SelectedImage) {
  if (asset.fileName && asset.fileName.includes('.')) {
    return asset.fileName.split('.').pop() || 'jpg';
  }

  if (asset.mimeType?.includes('png')) return 'png';
  if (asset.mimeType?.includes('webp')) return 'webp';

  return 'jpg';
}

async function uploadAsset(userId: string, propertyId: string, folder: string, asset: SelectedImage, index = 0) {
  const extension = guessExtension(asset);
  const path = `${userId}/${propertyId}/${folder}-${Date.now()}-${index}.${extension}`;

  const response = await fetch(asset.uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('property-media')
    .upload(path, blob, {
      contentType: asset.mimeType ?? 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from('property-media').getPublicUrl(path);

  return {
    imageUrl: data.publicUrl,
    storagePath: path,
  };
}

export async function pickCoverImage() {
  await ensureLibraryPermission();

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [16, 10],
    quality: 0.85,
  });

  if (result.canceled || !result.assets.length) {
    return null;
  }

  const asset = result.assets[0];

  return {
    uri: asset.uri,
    mimeType: asset.mimeType,
    fileName: asset.fileName,
  } as SelectedImage;
}

export async function pickGalleryImages() {
  await ensureLibraryPermission();

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 0.85,
    selectionLimit: 8,
  });

  if (result.canceled || !result.assets.length) {
    return [];
  }

  return result.assets.map((asset) => ({
    uri: asset.uri,
    mimeType: asset.mimeType,
    fileName: asset.fileName,
  })) as SelectedImage[];
}

export async function fetchPropertyImages(propertyId: string) {
  const { data, error } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', propertyId)
    .order('sort_order', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as PropertyImageRow[];
}

async function removeExistingPropertyMedia(propertyId: string) {
  const { data: rows, error } = await supabase
    .from('property_images')
    .select('id, storage_path')
    .eq('property_id', propertyId);

  if (error) {
    throw error;
  }

  const storagePaths = (rows ?? [])
    .map((row) => row.storage_path)
    .filter(Boolean) as string[];

  if (storagePaths.length) {
    await supabase.storage.from('property-media').remove(storagePaths);
  }

  await supabase.from('property_images').delete().eq('property_id', propertyId);
}

export async function replacePropertyMedia(params: {
  userId: string;
  propertyId: string;
  coverImage: SelectedImage;
  galleryImages: SelectedImage[];
}) {
  const { userId, propertyId, coverImage, galleryImages } = params;

  await removeExistingPropertyMedia(propertyId);

  const uploadedCover = await uploadAsset(userId, propertyId, 'cover', coverImage, 0);

  const rows = [
    {
      property_id: propertyId,
      image_url: uploadedCover.imageUrl,
      storage_path: uploadedCover.storagePath,
      is_cover: true,
      sort_order: 0,
    },
  ];

  for (let index = 0; index < galleryImages.length; index += 1) {
    const uploaded = await uploadAsset(userId, propertyId, 'gallery', galleryImages[index], index + 1);

    rows.push({
      property_id: propertyId,
      image_url: uploaded.imageUrl,
      storage_path: uploaded.storagePath,
      is_cover: false,
      sort_order: index + 1,
    });
  }

  const { error: insertError } = await supabase.from('property_images').insert(rows);

  if (insertError) {
    throw insertError;
  }

  const { error: propertyError } = await supabase
    .from('properties')
    .update({ cover_image_url: uploadedCover.imageUrl })
    .eq('id', propertyId);

  if (propertyError) {
    throw propertyError;
  }
}
