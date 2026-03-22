import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type GuestAuthGateProps = {
  visible: boolean;
  title?: string;
  message?: string;
  reason?: string;
  onClose: () => void;
  onSignIn: () => void;
};

export function GuestAuthGate({
  visible,
  title = 'Create an account to continue',
  message = 'Browse properties freely. Sign in when you want to save homes, message owners, schedule viewings, or list a property.',
  reason,
  onClose,
  onSignIn,
}: GuestAuthGateProps) {
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
            <View style={styles.iconWrap}>
              <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
            </View>

            <View style={styles.header}>
              <AppBadge label="Guest browsing" variant="premium" />
              <AppText variant="h2">{title}</AppText>
              <AppText color={colors.textMuted}>{message}</AppText>
            </View>

            {reason ? (
              <View style={styles.reasonBox}>
                <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
                <AppText color={colors.textMuted}>{reason}</AppText>
              </View>
            ) : null}

            <View style={styles.benefits}>
              <View style={styles.benefitItem}>
                <Ionicons name="heart-outline" size={18} color={colors.primary} />
                <AppText color={colors.textMuted}>Save listings to wishlist</AppText>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
                <AppText color={colors.textMuted}>Message owners and track conversations</AppText>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <AppText color={colors.textMuted}>Schedule viewings and manage requests</AppText>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="business-outline" size={18} color={colors.primary} />
                <AppText color={colors.textMuted}>List properties as a seller</AppText>
              </View>
            </View>

            <View style={styles.actions}>
              <AppButton
                title="Sign In / Create Account"
                onPress={onSignIn}
                icon="log-in-outline"
              />
              <AppButton
                title="Continue Browsing"
                variant="secondary"
                onPress={onClose}
                icon="eye-outline"
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
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
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
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  header: {
    gap: spacing.sm,
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  benefits: {
    gap: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
