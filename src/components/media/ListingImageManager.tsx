import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { SelectedListingImage } from '@/src/lib/properties/live-properties';
import { colors } from '@/src/theme/colors';

type ListingImageManagerProps = {
  coverImage: SelectedListingImage | null;
  galleryImages: SelectedListingImage[];
  onChangeCoverImage: (image: SelectedListingImage | null) => void;
  onChangeGalleryImages: (images: SelectedListingImage[]) => void;
};

function normalizeAsset(asset: ImagePicker.ImagePickerAsset): SelectedListingImage {
  return {
    uri: asset.uri,
    mimeType: asset.mimeType ?? 'image/jpeg',
    fileName: asset.fileName ?? `image-${Date.now()}.jpg`,
    existing: false,
  };
}

export function ListingImageManager({
  coverImage,
  galleryImages,
  onChangeCoverImage,
  onChangeGalleryImages,
}: ListingImageManagerProps) {
  async function ensurePermission() {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!result.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to upload property images.');
      return false;
    }
    return true;
  }

  async function pickCoverImage() {
    const okay = await ensurePermission();
    if (!okay) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.length) return;

    onChangeCoverImage(normalizeAsset(result.assets[0]));
  }

  async function pickGalleryImages() {
    const okay = await ensurePermission();
    if (!okay) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 8,
    });

    if (result.canceled || !result.assets?.length) return;

    const nextImages = result.assets.map(normalizeAsset);
    onChangeGalleryImages([...galleryImages, ...nextImages].slice(0, 10));
  }

  function removeGalleryImage(index: number) {
    const next = [...galleryImages];
    next.splice(index, 1);
    onChangeGalleryImages(next);
  }

  return (
    <View style={styles.wrapper}>
      <AppCard>
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <AppText style={styles.sectionTitle}>Cover Image</AppText>
            <AppText style={styles.helper}>Required</AppText>
          </View>

          {coverImage ? (
            <View style={styles.coverWrap}>
              <Image source={coverImage.uri} style={styles.coverImage} contentFit="cover" />
              <View style={styles.imageActions}>
                <AppButton title="Replace Cover" onPress={pickCoverImage} />
                <AppButton title="Remove" variant="secondary" onPress={() => onChangeCoverImage(null)} />
              </View>
            </View>
          ) : (
            <View style={styles.emptyBlock}>
              <AppText style={styles.emptyTitle}>Add a cover image</AppText>
              <AppText style={styles.emptyText}>
                The first image buyers see should strongly represent the listing.
              </AppText>
              <AppButton title="Choose Cover Image" onPress={pickCoverImage} />
            </View>
          )}
        </View>
      </AppCard>

      <AppCard>
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <AppText style={styles.sectionTitle}>Gallery Images</AppText>
            <AppText style={styles.helper}>{galleryImages.length}/10</AppText>
          </View>

          <AppText style={styles.galleryHint}>
            Add different angles like exterior, living room, kitchen, bedrooms, bathrooms, and compound.
          </AppText>

          {galleryImages.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
              {galleryImages.map((image, index) => (
                <View key={`${image.uri}-${index}`} style={styles.galleryItem}>
                  <Image source={image.uri} style={styles.galleryImage} contentFit="cover" />
                  <Pressable style={styles.removeBadge} onPress={() => removeGalleryImage(index)}>
                    <Ionicons name="close" size={14} color={colors.white} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyBlock}>
              <AppText style={styles.emptyTitle}>Add gallery images</AppText>
              <AppText style={styles.emptyText}>
                Published listings should have multiple angles so buyers can trust what they are viewing.
              </AppText>
            </View>
          )}

          <AppButton title="Add Gallery Images" onPress={pickGalleryImages} />
        </View>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  section: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  helper: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  galleryHint: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  coverWrap: {
    gap: 10,
  },
  coverImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  imageActions: {
    gap: 10,
  },
  emptyBlock: {
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  galleryRow: {
    gap: 12,
  },
  galleryItem: {
    position: 'relative',
  },
  galleryImage: {
    width: 140,
    height: 110,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  removeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
});
