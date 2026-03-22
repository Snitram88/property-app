import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { formatPrice } from '@/src/lib/properties/live-properties';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type SellerInquiryCardProps = {
  senderName: string;
  senderEmail?: string | null;
  senderPhone?: string | null;
  message: string;
  status: string;
  createdAt: string;
  propertyTitle?: string | null;
  propertyLocation?: string | null;
  propertyAddress?: string | null;
  propertyListingType?: string | null;
  propertyPrice?: number | null;
  propertyImage?: string | null;
  onMarkContacted?: () => void;
  onCloseLead?: () => void;
};

function statusVariant(status?: string | null) {
  const value = (status ?? '').toLowerCase();
  if (value.includes('new') || value.includes('pending')) return 'warning';
  if (value.includes('contact')) return 'verified';
  if (value.includes('closed') || value.includes('resolved')) return 'neutral';
  return 'primary';
}

export function SellerInquiryCard({
  senderName,
  senderEmail,
  senderPhone,
  message,
  status,
  createdAt,
  propertyTitle,
  propertyLocation,
  propertyAddress,
  propertyListingType,
  propertyPrice,
  propertyImage,
  onMarkContacted,
  onCloseLead,
}: SellerInquiryCardProps) {
  const priceLabel =
    propertyPrice != null ? formatPrice(propertyPrice) : null;

  const normalizedStatus = (status ?? '').toLowerCase();

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
            <AppText variant="h3">{propertyTitle ?? 'Property inquiry'}</AppText>

            <View style={styles.badges}>
              {propertyListingType ? (
                <AppBadge label={propertyListingType.toUpperCase()} variant="primary" />
              ) : null}
              {priceLabel ? <AppBadge label={priceLabel} variant="premium" /> : null}
              <AppBadge label={status || 'Active'} variant={statusVariant(status) as any} />
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

        <View style={styles.senderBlock}>
          <AppText variant="title">{senderName}</AppText>
          {senderEmail ? <AppText color={colors.textMuted}>{senderEmail}</AppText> : null}
          {senderPhone ? <AppText color={colors.textMuted}>{senderPhone}</AppText> : null}
          <AppText color={colors.textMuted}>
            {new Date(createdAt).toLocaleString()}
          </AppText>
        </View>

        <View style={styles.messageBox}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
          <AppText>{message}</AppText>
        </View>

        <View style={styles.actions}>
          {normalizedStatus !== 'contacted' && normalizedStatus !== 'closed' ? (
            <AppButton
              title="Mark Contacted"
              variant="secondary"
              onPress={onMarkContacted ?? (() => {})}
              icon="call-outline"
            />
          ) : null}

          {normalizedStatus !== 'closed' ? (
            <AppButton
              title="Close Lead"
              onPress={onCloseLead ?? (() => {})}
              icon="checkmark-done-outline"
            />
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
  senderBlock: {
    gap: 2,
  },
  messageBox: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: {
    gap: spacing.sm,
  },
});
