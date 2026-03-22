import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type PublicPropertyCardProps = {
  title: string;
  location: string;
  price: string;
  listingType?: string | null;
  beds?: number | null;
  baths?: number | null;
  imageUrl?: string | null;
  onPress: () => void;
  onAuthPrompt: () => void;
};

export function PublicPropertyCard({
  title,
  location,
  price,
  listingType,
  beds,
  baths,
  imageUrl,
  onPress,
  onAuthPrompt,
}: PublicPropertyCardProps) {
  return (
    <AppCard padded={false} style={styles.card}>
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={imageUrl} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={30} color={colors.textSoft} />
          </View>
        )}

        <View style={styles.overlay}>
          <AppBadge label="Verified Listing" variant="verified" />
          <Pressable style={styles.saveGhost} onPress={onAuthPrompt}>
            <Ionicons name="heart-outline" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <AppText variant="h3">{title}</AppText>
        <AppText variant="h2" color={colors.primary}>
          {price}
        </AppText>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={colors.textMuted} />
          <AppText color={colors.textMuted}>{location}</AppText>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="bed-outline" size={15} color={colors.textMuted} />
            <AppText color={colors.textMuted}>{beds ?? 0} Beds</AppText>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="water-outline" size={15} color={colors.textMuted} />
            <AppText color={colors.textMuted}>{baths ?? 0} Baths</AppText>
          </View>

          {listingType ? (
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={15} color={colors.textMuted} />
              <AppText color={colors.textMuted}>{listingType}</AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <AppButton title="View Property" onPress={onPress} icon="arrow-forward" />
          <AppButton title="Save / Contact" variant="secondary" onPress={onAuthPrompt} icon="lock-closed-outline" />
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  imageWrap: {
    height: 220,
    backgroundColor: colors.backgroundMuted,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveGhost: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: {
    gap: spacing.sm,
  },
});
