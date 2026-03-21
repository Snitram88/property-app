import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { PropertyWithMedia, formatPrice } from '@/src/lib/properties/live-properties';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type SellerListingCardProps = {
  property: PropertyWithMedia;
  onOpen: () => void;
  onEdit: () => void;
};

function statusVariant(status: string) {
  if (status === 'approved') return 'verified';
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'danger';
  return 'neutral';
}

function statusLabel(status: string) {
  if (status === 'approved') return 'Approved';
  if (status === 'pending') return 'Awaiting Review';
  if (status === 'rejected') return 'Rejected';
  return status;
}

export function SellerListingCard({
  property,
  onOpen,
  onEdit,
}: SellerListingCardProps) {
  return (
    <AppCard padded={false} style={styles.card}>
      <View style={styles.imageWrap}>
        {property.cover_image_url ? (
          <Image source={property.cover_image_url} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={32} color={colors.textSoft} />
          </View>
        )}

        <View style={styles.overlayTop}>
          <AppBadge
            label={statusLabel(property.verification_status)}
            variant={statusVariant(property.verification_status) as any}
          />
          <View style={styles.rightBadges}>
            <AppBadge
              label={property.is_published ? 'Submitted' : 'Hidden'}
              variant={property.is_published ? 'primary' : 'neutral'}
            />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <AppText variant="h3">{property.title}</AppText>
          <AppText variant="h2" color={colors.primary}>
            {property.listing_type === 'sale'
              ? formatPrice(property.price)
              : `${formatPrice(property.price)} / year`}
          </AppText>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={15} color={colors.textMuted} />
            <AppText color={colors.textMuted}>{property.location_text}</AppText>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="bed-outline" size={15} color={colors.textMuted} />
            <AppText color={colors.textMuted}>{property.bedrooms} Beds</AppText>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="water-outline" size={15} color={colors.textMuted} />
            <AppText color={colors.textMuted}>{property.bathrooms} Baths</AppText>
          </View>
        </View>

        {property.review_notes ? (
          <View style={styles.noteBox}>
            <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
            <AppText color={colors.textMuted}>Admin note: {property.review_notes}</AppText>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <AppButton title="Preview" variant="secondary" onPress={onOpen} icon="eye-outline" />
          <AppButton title="Edit Listing" onPress={onEdit} icon="create-outline" />
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
    height: 210,
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
  overlayTop: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  rightBadges: {
    gap: spacing.xs,
    alignItems: 'flex-end',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  metaRow: {
    gap: spacing.sm,
    flexWrap: 'wrap',
    flexDirection: 'row',
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
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  actionRow: {
    gap: spacing.sm,
  },
});
