import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppText } from '@/src/components/ui/AppText';
import { PropertyForm } from '@/src/components/forms/PropertyForm';
import { ListingImageManager } from '@/src/components/media/ListingImageManager';
import { useAuth } from '@/src/providers/AuthProvider';
import {
  SelectedListingImage,
  createSellerProperty,
} from '@/src/lib/properties/live-properties';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

function Tip({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.tip}>
      <View style={styles.tipIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.tipText}>
        <AppText variant="title">{title}</AppText>
        <AppText color={colors.textMuted}>{subtitle}</AppText>
      </View>
    </View>
  );
}

export default function CreateListingScreen() {
  const { user } = useAuth();
  const [coverImage, setCoverImage] = useState<SelectedListingImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<SelectedListingImage[]>([]);

  async function handleCreate(values: any) {
    if (!user?.id) {
      Alert.alert('Session issue', 'Please sign in again.');
      return;
    }

    const created = await createSellerProperty(user.id, values, coverImage, galleryImages);

    Alert.alert(
      'Listing saved',
      created?.verification_status === 'pending'
        ? 'Your listing has been saved and is awaiting admin verification.'
        : 'Your property has been saved.'
    );

    router.replace('/seller/properties');
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Create Listing"
          subtitle="Craft a polished listing with premium media and clean details"
        />

        <View style={styles.hero}>
          <AppBadge label="Seller Studio" variant="premium" />
          <AppText variant="display">Launch a listing that feels premium.</AppText>
          <AppText color={colors.textMuted}>
            Add a cover image, multiple gallery angles, accurate map details, and send it for admin review.
          </AppText>
        </View>

        <AppCard>
          <View style={styles.tips}>
            <Tip
              icon="image-outline"
              title="Use strong imagery"
              subtitle="One cover image and at least one gallery image are required."
            />
            <Tip
              icon="location-outline"
              title="Add accurate location"
              subtitle="Clear state, city, and coordinates improve trust and discovery."
            />
            <Tip
              icon="shield-checkmark-outline"
              title="Admin review applies"
              subtitle="Every submitted listing goes through approval before buyer confidence increases."
            />
          </View>
        </AppCard>

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
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 60,
  },
  hero: {
    gap: spacing.md,
  },
  tips: {
    gap: spacing.md,
  },
  tip: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    gap: 4,
  },
});
