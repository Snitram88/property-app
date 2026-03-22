import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { formatPrice } from '@/src/lib/properties/live-properties';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type SellerViewingCardProps = {
  requesterName?: string | null;
  phone?: string | null;
  preferredDate: string;
  preferredTime: string;
  notes?: string | null;
  status: string;
  createdAt: string;
  propertyTitle?: string | null;
  propertyLocation?: string | null;
  propertyAddress?: string | null;
  propertyListingType?: string | null;
  propertyPrice?: number | null;
  propertyImage?: string | null;
};

function statusVariant(status?: string | null) {
  const value = (status ?? '').toLowerCase();
  if (value.includes('pending')) return 'warning';
  if (value.includes('approved') || value.includes('confirmed')) return 'verified';
  if (value.includes('cancel') || value.includes('declined')) return 'danger';
  return 'neutral';
}

export function SellerViewingCard({
  requesterName,
  phone,
  preferredDate,
  preferredTime,
  notes,
  status,
  createdAt,
  propertyTitle,
  propertyLocation,
  propertyAddress,
  propertyListingType,
  propertyPrice,
  propertyImage,
}: SellerViewingCardProps) {
  const priceLabel =
    propertyPrice != null ? formatPrice(propertyPrice) : null;

  return (
    <AppCard>
      <View style={styles.wrapper}>
        <View style={styles.propertyRow}>
          {propertyImage ? (
            <Image source={propertyImage} style={styles.image} contentFit="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="image-outline" size={24} color={colors.textSoft} />
            </View>
          )}

          <View style={styles.propertyContent}>
            <AppText variant="h3">{propertyTitle ?? 'Viewing request'}</AppText>

            <View style={styles.badges}>
              {propertyListingType ? (
                <AppBadge label={propertyListingType.toUpperCase()} variant="primary" />
              ) : null}
              {priceLabel ? <AppBadge label={priceLabel} variant="premium" /> : null}
              <AppBadge label={status || 'Pending'} variant={statusVariant(status) as any} />
            </View>

            {propertyLocation ? (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={15} color={colors.textMuted} />
                <AppText color={colors.textMuted}>{propertyLocation}</AppText>
              </View>
            ) : null}

            {propertyAddress ? (
              <View style={styles.infoRow}>
                <Ionicons name="pin-outline" size={15} color={colors.textMuted} />
                <AppText color={colors.textMuted}>{propertyAddress}</AppText>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.requestBlock}>
          {requesterName ? <AppText variant="title">{requesterName}</AppText> : null}
          {phone ? <AppText color={colors.textMuted}>{phone}</AppText> : null}

          <View style={styles.timeRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <AppText>{preferredDate}</AppText>
          </View>

          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <AppText>{preferredTime}</AppText>
          </View>

          <AppText color={colors.textMuted}>
            Requested on {new Date(createdAt).toLocaleString()}
          </AppText>
        </View>

        {notes ? (
          <View style={styles.noteBox}>
            <Ionicons name="document-text-outline" size={16} color={colors.primary} />
            <AppText>{notes}</AppText>
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  propertyRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundMuted,
  },
  placeholder: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyContent: {
    flex: 1,
    gap: spacing.xs,
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  requestBlock: {
    gap: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  noteBox: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
