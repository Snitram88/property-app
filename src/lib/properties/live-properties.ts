import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/src/lib/supabase/client';

export type DatabaseProperty = {
  id: string;
  owner_id: string;
  title: string;
  listing_type: 'rent' | 'lease' | 'sale';
  property_type: string;
  price: number;
  state: string;
  city: string;
  address: string | null;
  location_text: string;
  description: string | null;
  bedrooms: number;
  bathrooms: number;
  is_published: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
};

export type PropertyImageRecord = {
  id: string;
  property_id: string;
  image_url: string;
  storage_path: string | null;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
};

export type PropertyWithMedia = DatabaseProperty & {
  images: PropertyImageRecord[];
  cover_image_url: string | null;
};

export type PropertyFormValues = {
  title: string;
  listingType: 'rent' | 'lease' | 'sale';
  propertyType: string;
  price: string;
  state: string;
  city: string;
  address: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  latitude: string;
  longitude: string;
  isPublished: boolean;
};

export type SelectedListingImage = {
  id?: string;
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
  base64?: string | null;
  existing?: boolean;
  image_url?: string | null;
  storage_path?: string | null;
};

export type SellerInquiryItem = {
  id: string;
  sender_name: string;
  sender_email: string | null;
  sender_phone: string | null;
  message: string;
  status: string;
  created_at: string;
  property_id: string;
  conversation_id: string | null;
  property_title: string;
  property_location: string;
};

export type SellerViewingItem = {
  id: string;
  property_ref: string;
  property_title: string;
  preferred_date: string;
  preferred_time: string;
  phone: string;
  notes: string | null;
  status: string;
  created_at: string;
};

function toNumber(value: string, fallback = 0) {
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableNumber(value: string) {
  if (!value || !value.trim()) return null;
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function getFileExtension(image: SelectedListingImage) {
  if (image.fileName && image.fileName.includes('.')) {
    return image.fileName.split('.').pop()?.toLowerCase() || 'jpg';
  }

  if (image.mimeType) {
    if (image.mimeType.includes('png')) return 'png';
    if (image.mimeType.includes('webp')) return 'webp';
  }

  return 'jpg';
}

async function fetchPropertyImagesByIds(propertyIds: string[]) {
  if (!propertyIds.length) {
    return [] as PropertyImageRecord[];
  }

  const { data, error } = await supabase
    .from('property_images')
    .select('*')
    .in('property_id', propertyIds)
    .order('is_cover', { ascending: false })
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return (data ?? []) as PropertyImageRecord[];
}

function attachImages(properties: DatabaseProperty[], images: PropertyImageRecord[]) {
  const imageMap = new Map<string, PropertyImageRecord[]>();

  for (const image of images) {
    const current = imageMap.get(image.property_id) ?? [];
    current.push(image);
    imageMap.set(image.property_id, current);
  }

  return properties.map((property) => {
    const propertyImages = imageMap.get(property.id) ?? [];
    const cover = propertyImages.find((item) => item.is_cover) ?? propertyImages[0] ?? null;

    return {
      ...property,
      images: propertyImages,
      cover_image_url: cover?.image_url ?? null,
    };
  }) as PropertyWithMedia[];
}

async function uploadPropertyImage(
  userId: string,
  propertyId: string,
  image: SelectedListingImage,
  isCover: boolean,
  sortOrder: number
) {
  const ext = getFileExtension(image);
  const filePath = `${userId}/${propertyId}/${isCover ? 'cover' : `gallery-${sortOrder}`}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  let base64String = image.base64 ?? null;

  if (!base64String && image.uri) {
    base64String = await FileSystem.readAsStringAsync(image.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  if (!base64String) {
    throw new Error('Unable to read selected image data.');
  }

  const arrayBuffer = decode(base64String);

  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(filePath, arrayBuffer, {
      contentType: image.mimeType ?? 'image/jpeg',
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicData } = supabase.storage
    .from('property-images')
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from('property_images')
    .insert({
      property_id: propertyId,
      image_url: publicData.publicUrl,
      storage_path: filePath,
      is_cover: isCover,
      sort_order: sortOrder,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as PropertyImageRecord;
}

export async function fetchPropertyImages(propertyId: string) {
  const { data, error } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', propertyId)
    .order('is_cover', { ascending: false })
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return (data ?? []) as PropertyImageRecord[];
}

export function toSelectedListingImage(image: PropertyImageRecord): SelectedListingImage {
  return {
    id: image.id,
    uri: image.image_url,
    existing: true,
    image_url: image.image_url,
    storage_path: image.storage_path,
  };
}

async function syncPropertyImages(
  userId: string,
  propertyId: string,
  coverImage: SelectedListingImage | null,
  galleryImages: SelectedListingImage[]
) {
  if (!coverImage) {
    throw new Error('A cover image is required.');
  }

  if (galleryImages.length < 1) {
    throw new Error('Add at least one gallery image to show different angles.');
  }

  const existingImages = await fetchPropertyImages(propertyId);
  const desiredExistingIds = new Set(
    [coverImage, ...galleryImages]
      .filter((image) => image.existing && image.id)
      .map((image) => image.id as string)
  );

  const imagesToDelete = existingImages.filter((image) => !desiredExistingIds.has(image.id));

  if (imagesToDelete.length) {
    const storagePaths = imagesToDelete
      .map((image) => image.storage_path)
      .filter(Boolean) as string[];

    if (storagePaths.length) {
      await supabase.storage.from('property-images').remove(storagePaths);
    }

    await supabase.from('property_images').delete().in('id', imagesToDelete.map((image) => image.id));
  }

  const orderedImages = [
    { image: coverImage, isCover: true, sortOrder: 0 },
    ...galleryImages.map((image, index) => ({
      image,
      isCover: false,
      sortOrder: index + 1,
    })),
  ];

  for (const item of orderedImages) {
    if (item.image.existing && item.image.id) {
      const { error } = await supabase
        .from('property_images')
        .update({
          is_cover: item.isCover,
          sort_order: item.sortOrder,
        })
        .eq('id', item.image.id)
        .eq('property_id', propertyId);

      if (error) throw error;
    } else {
      await uploadPropertyImage(userId, propertyId, item.image, item.isCover, item.sortOrder);
    }
  }
}

export function formatPrice(price: number | null | undefined) {
  if (price == null) return 'Price on request';

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price);
}

export function propertyToSnapshot(property: PropertyWithMedia | DatabaseProperty) {
  return {
    id: property.id,
    title: property.title,
    location: property.location_text,
    price:
      property.listing_type === 'sale'
        ? formatPrice(property.price)
        : `${formatPrice(property.price)} / year`,
    badge:
      property.verification_status === 'approved'
        ? 'Verified'
        : property.is_published
          ? 'Live'
          : 'Draft',
    listingType: property.listing_type.charAt(0).toUpperCase() + property.listing_type.slice(1),
  };
}

export async function fetchPublishedProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_published', true)
    .eq('verification_status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const properties = (data ?? []) as DatabaseProperty[];
  const images = await fetchPropertyImagesByIds(properties.map((property) => property.id));

  return attachImages(properties, images);
}

export async function fetchPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const property = data as DatabaseProperty;
  const images = await fetchPropertyImages(property.id);

  return attachImages([property], images)[0] ?? null;
}

export async function fetchSellerProperties(userId: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const properties = (data ?? []) as DatabaseProperty[];
  const images = await fetchPropertyImagesByIds(properties.map((property) => property.id));

  return attachImages(properties, images);
}

export async function createSellerProperty(
  userId: string,
  values: PropertyFormValues,
  coverImage: SelectedListingImage | null,
  galleryImages: SelectedListingImage[]
) {
  if (!coverImage || galleryImages.length < 1) {
    throw new Error('Add a cover image and at least one gallery image before saving.');
  }

  const payload = {
    owner_id: userId,
    title: values.title.trim(),
    listing_type: values.listingType,
    property_type: values.propertyType.trim() || 'flat',
    price: toNumber(values.price),
    state: values.state.trim(),
    city: values.city.trim(),
    address: values.address.trim() || null,
    location_text: `${values.city.trim()}, ${values.state.trim()}`,
    description: values.description.trim() || null,
    bedrooms: toNumber(values.bedrooms),
    bathrooms: toNumber(values.bathrooms),
    latitude: toNullableNumber(values.latitude),
    longitude: toNullableNumber(values.longitude),
    is_published: values.isPublished,
    verification_status: 'approved',
  };

  const { data, error } = await supabase.from('properties').insert(payload).select('*').single();

  if (error) throw error;

  const property = data as DatabaseProperty;

  try {
    await syncPropertyImages(userId, property.id, coverImage, galleryImages);
  } catch (imageError) {
    await supabase.from('properties').delete().eq('id', property.id).eq('owner_id', userId);
    throw imageError;
  }

  return fetchPropertyById(property.id);
}

export async function updateSellerProperty(
  propertyId: string,
  userId: string,
  values: PropertyFormValues,
  coverImage: SelectedListingImage | null,
  galleryImages: SelectedListingImage[]
) {
  if (!coverImage || galleryImages.length < 1) {
    throw new Error('Add a cover image and at least one gallery image before saving.');
  }

  const payload = {
    owner_id: userId,
    title: values.title.trim(),
    listing_type: values.listingType,
    property_type: values.propertyType.trim() || 'flat',
    price: toNumber(values.price),
    state: values.state.trim(),
    city: values.city.trim(),
    address: values.address.trim() || null,
    location_text: `${values.city.trim()}, ${values.state.trim()}`,
    description: values.description.trim() || null,
    bedrooms: toNumber(values.bedrooms),
    bathrooms: toNumber(values.bathrooms),
    latitude: toNullableNumber(values.latitude),
    longitude: toNullableNumber(values.longitude),
    is_published: values.isPublished,
    verification_status: 'approved',
  };

  const { error } = await supabase
    .from('properties')
    .update(payload)
    .eq('id', propertyId)
    .eq('owner_id', userId);

  if (error) throw error;

  await syncPropertyImages(userId, propertyId, coverImage, galleryImages);

  return fetchPropertyById(propertyId);
}

export async function fetchSellerStats(userId: string) {
  const [
    { count: propertyCount, error: propertyError },
    { count: inquiryCount, error: inquiryError },
    { count: viewingCount, error: viewingError },
  ] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('owner_id', userId),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('landlord_id', userId),
    supabase.from('viewing_requests').select('id', { count: 'exact', head: true }).eq('seller_id', userId),
  ]);

  if (propertyError) throw propertyError;
  if (inquiryError) throw inquiryError;
  if (viewingError) throw viewingError;

  return {
    propertyCount: propertyCount ?? 0,
    inquiryCount: inquiryCount ?? 0,
    viewingCount: viewingCount ?? 0,
  };
}

export async function fetchSellerInquiries(userId: string) {
  const { data: inquiryRows, error: inquiryError } = await supabase
    .from('inquiries')
    .select('*')
    .eq('landlord_id', userId)
    .order('created_at', { ascending: false });

  if (inquiryError) throw inquiryError;

  const propertyIds = Array.from(new Set((inquiryRows ?? []).map((row) => row.property_id).filter(Boolean)));

  let propertyMap = new Map<string, { title: string; location_text: string }>();

  if (propertyIds.length) {
    const { data: propertyRows, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, location_text')
      .in('id', propertyIds);

    if (propertyError) throw propertyError;

    propertyMap = new Map(
      (propertyRows ?? []).map((item) => [
        item.id,
        {
          title: item.title,
          location_text: item.location_text,
        },
      ])
    );
  }

  return (inquiryRows ?? []).map((row) => ({
    ...row,
    property_title: propertyMap.get(row.property_id)?.title ?? 'Property',
    property_location: propertyMap.get(row.property_id)?.location_text ?? 'Location unavailable',
  })) as SellerInquiryItem[];
}

export async function fetchSellerViewingRequests(userId: string) {
  const { data, error } = await supabase
    .from('viewing_requests')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []) as SellerViewingItem[];
}
