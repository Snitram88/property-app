import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { SelectedImage } from '@/src/lib/properties/property-media';
import { colors } from '@/src/theme/colors';

type ListingMediaPickerProps = {
  coverImage: SelectedImage | null;
  galleryImages: SelectedImage[];
  existingCoverUrl?: string | null;
  existingGalleryUrls?: string[];
  onPickCover: () => Promise<void>;
  onPickGallery: () => Promise<void>;
  onClearNewMedia: () => void;
};

export function ListingMediaPicker({
  coverImage,
  galleryImages,
  existingCoverUrl,
  existingGalleryUrls = [],
  onPickCover,
  onPickGallery,
  onClearNewMedia,
}: ListingMediaPickerProps) {
  const coverUri = coverImage?.uri ?? existingCoverUrl ?? null;
  const galleryUris = galleryImages.length
    ? galleryImages.map((item) => item.uri)
    : existingGalleryUrls;

  return (
    <View style={styles.wrapper}>
      <AppCard>
        <View style={styles.section}>
          <AppText style={styles.title}>Listing media</AppText>
          <AppText style={styles.helper}>
            Add 1 cover image and gallery images showing different angles of the property.
          </AppText>

          <View style={styles.buttonRow}>
            <AppButton title="Choose Cover Image" onPress={onPickCover} />
            <AppButton title="Choose Gallery Images" variant="secondary" onPress={onPickGallery} />
          </View>

          <AppButton title="Clear New Selection" variant="secondary" onPress={onClearNewMedia} />

          <View style={styles.previewBlock}>
            <AppText style={styles.label}>Cover image</AppText>

            {coverUri ? (
              <Image source={{ uri: coverUri }} style={styles.coverImage} />
            ) : (
              <View style={styles.placeholder}>
                <AppText>No cover image selected yet.</AppText>
              </View>
            )}
          </View>

          <View style={styles.previewBlock}>
            <AppText style={styles.label}>Gallery</AppText>

            {galleryUris.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
                {galleryUris.map((uri, index) => (
                  <Image key={`${uri}-${index}`} source={{ uri }} style={styles.galleryImage} />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.placeholder}>
                <AppText>No gallery images selected yet.</AppText>
              </View>
            )}
          </View>
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
    gap: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  helper: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  buttonRow: {
    gap: 10,
  },
  previewBlock: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  coverImage: {
    width: '100%',
    height: 210,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  galleryRow: {
    gap: 10,
  },
  galleryImage: {
    width: 150,
    height: 110,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  placeholder: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 18,
    backgroundColor: colors.surface,
  },
});
