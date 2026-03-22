import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type PropertyContextCardProps = {
  title: string;
  locationText: string;
  address?: string | null;
  listingType?: string | null;
  priceLabel?: string | null;
  imageUrl?: string | null;
};

export function PropertyContextCard({
  title,
  locationText,
  address,
  listingType,
  priceLabel,
  imageUrl,
}: PropertyContextCardProps) {
  return (
    <AppCard>
      <View style={styles.wrapper}>
        {imageUrl ? (
          <Image source={imageUrl} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={26} color={colors.textSoft} />
          </View>
        )}

        <View style={styles.content}>
          <AppText variant="h3">{title}</AppText>

          <View style={styles.badges}>
            {listingType ? <AppBadge label={listingType} variant="primary" /> : null}
            {priceLabel ? <AppBadge label={priceLabel} variant="premium" /> : null}
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
            <AppText color={colors.textMuted}>{locationText}</AppText>
          </View>

          {address ? (
            <View style={styles.infoRow}>
              <Ionicons name="pin-outline" size={16} color={colors.textMuted} />
              <AppText color={colors.textMuted}>{address}</AppText>
            </View>
          ) : null}
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundMuted,
  },
  placeholder: {
    width: '100%',
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
});
