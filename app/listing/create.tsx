import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { PropertyForm } from '@/src/components/forms/PropertyForm';
import { ListingImageManager } from '@/src/components/media/ListingImageManager';
import { useAuth } from '@/src/providers/AuthProvider';
import {
  SelectedListingImage,
  createSellerProperty,
} from '@/src/lib/properties/live-properties';

export default function CreateListingScreen() {
  const { user } = useAuth();
  const [coverImage, setCoverImage] = useState<SelectedListingImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<SelectedListingImage[]>([]);

  async function handleCreate(values: any) {
    if (!user?.id) {
      Alert.alert('Session issue', 'Please sign in again.');
      return;
    }

    await createSellerProperty(user.id, values, coverImage, galleryImages);
    Alert.alert('Listing created', 'Your property has been saved with images.');
    router.replace('/seller/properties');
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AppHeader
          title="Create Listing"
          subtitle="Add cover, gallery, map coordinates, and publish"
        />

        <PropertyForm submitLabel="Create Listing" onSubmit={handleCreate}>
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
