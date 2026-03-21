import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  extra?: ReactNode;
};

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  extra,
}: EmptyStateProps) {
  return (
    <AppCard>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={28} color={colors.primary} />
        </View>

        <View style={styles.textGroup}>
          <AppText variant="h3">{title}</AppText>
          <AppText color={colors.textMuted}>{message}</AppText>
        </View>

        {actionLabel && onAction ? (
          <AppButton title={actionLabel} onPress={onAction} icon="arrow-forward" />
        ) : null}

        {extra}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    gap: spacing.xs,
  },
});
