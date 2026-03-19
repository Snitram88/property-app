import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { PropertyForm } from '@/src/components/forms/PropertyForm';
import { ListingImageManager } from '@/src/components/media/ListingImageManager';
import { FullScreenLoader } from '@/src/components/common/FullScreenLoader';
import { useAuth } from '@/src/providers/AuthProvider';
import {
  PropertyFormValues,
  SelectedListingImage,
  fetchPropertyById,
  toSelectedListingImage,
  updateSellerProperty,
} from '@/src/lib/properties/live-properties';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [initialValues, setInitialValues] = useState<PropertyFormValues | null>(null);
  const [coverImage, setCoverImage] = useState<SelectedListingImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<SelectedListingImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      if (!id) return;

      try {
        const property = await fetchPropertyById(id);

        if (!active || !property) return;

        setInitialValues({
          title: property.title,
          listingType: property.listing_type,
          propertyType: property.property_type,
          price: String(property.price ?? ''),
          state: property.state,
          city: property.city,
          address: property.address ?? '',
          description: property.description ?? '',
          bedrooms: String(property.bedrooms ?? ''),
          bathrooms: String(property.bathrooms ?? ''),
          latitude: property.latitude != null ? String(property.latitude) : '',
          longitude: property.longitude != null ? String(property.longitude) : '',
          isPublished: property.is_published,
        });

        const cover = property.images.find((image) => image.is_cover) ?? property.images[0] ?? null;
        const gallery = property.images.filter((image) => !cover || image.id !== cover.id);

        setCoverImage(cover ? toSelectedListingImage(cover) : null);
        setGalleryImages(gallery.map(toSelectedListingImage));
      } catch (error) {
        console.error('Failed to load property for edit:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProperty();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleUpdate(values: PropertyFormValues) {
    if (!user?.id || !id) {
      Alert.alert('Session issue', 'Please sign in again.');
      return;
    }

    await updateSellerProperty(id, user.id, values, coverImage, galleryImages);
    Alert.alert('Listing updated', 'Your property changes have been saved.');
    router.replace('/seller/properties');
  }

  if (loading || !initialValues) {
    return <FullScreenLoader title="Loading listing" subtitle="Preparing editor..." />;
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AppHeader
          title="Edit Listing"
          subtitle="Refine your live seller listing"
        />

        <PropertyForm
          initialValues={initialValues}
          submitLabel="Save Changes"
          onSubmit={handleUpdate}
        >
          <ListingImageManager
            coverImage={coverImage}
            galleryImages={galleryImages}
            onChangeCoverImage={setCoverImage}
            onChangeGalleryImages={setGalleryImages}
          />
        </PropertyForm>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
});
