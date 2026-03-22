import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppText } from '@/src/components/ui/AppText';
import { AdminModerationAction } from '@/src/lib/admin/moderation';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type ModerationActionModalProps = {
  visible: boolean;
  action: AdminModerationAction | null;
  propertyTitle?: string | null;
  reason: string;
  note: string;
  loading?: boolean;
  onChangeReason: (value: string) => void;
  onChangeNote: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

function actionLabel(action: AdminModerationAction | null) {
  switch (action) {
    case 'approve':
      return 'Approve Listing';
    case 'reject':
      return 'Reject Listing';
    case 'suspend':
      return 'Suspend Listing';
    case 'remove':
      return 'Remove from Marketplace';
    case 'restore':
      return 'Restore Listing';
    default:
      return 'Moderate Listing';
  }
}

function actionDescription(action: AdminModerationAction | null) {
  switch (action) {
    case 'approve':
      return 'Approve this listing and make it visible on the marketplace.';
    case 'reject':
      return 'Reject this listing and remove it from public visibility.';
    case 'suspend':
      return 'Suspend this listing due to an issue that may be temporary or under review.';
    case 'remove':
      return 'Remove this listing from the marketplace due to a moderation or policy violation.';
    case 'restore':
      return 'Restore this listing and make it publicly visible again.';
    default:
      return 'Confirm the moderation action for this listing.';
  }
}

export function ModerationActionModal({
  visible,
  action,
  propertyTitle,
  reason,
  note,
  loading,
  onChangeReason,
  onChangeNote,
  onClose,
  onConfirm,
}: ModerationActionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheetWrap}>
          <AppCard style={styles.sheet}>
            <View style={styles.header}>
              <AppBadge label={actionLabel(action)} variant="warning" />
              <AppText variant="h2">{propertyTitle ?? 'Selected Listing'}</AppText>
              <AppText>{actionDescription(action)}</AppText>
            </View>

            <AppInput
              label="Seller-facing reason"
              value={reason}
              onChangeText={onChangeReason}
              placeholder="e.g. Duplicate listing, misleading location, policy violation"
              multiline
            />

            <AppInput
              label="Internal admin note"
              value={note}
              onChangeText={onChangeNote}
              placeholder="Optional internal moderation note"
              multiline
            />

            <View style={styles.actions}>
              <AppButton
                title={loading ? 'Saving...' : 'Confirm Action'}
                onPress={onConfirm}
              />
              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={onClose}
              />
            </View>
          </AppCard>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetWrap: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sheet: {
    gap: spacing.lg,
    borderRadius: radius.xl,
  },
  header: {
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
