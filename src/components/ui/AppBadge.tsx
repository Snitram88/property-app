import { StyleSheet, View } from 'react-native';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type AppBadgeVariant =
  | 'primary'
  | 'verified'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'premium';

type AppBadgeProps = {
  label: string;
  variant?: AppBadgeVariant;
};

const variantStyles: Record<AppBadgeVariant, { bg: string; text: string; border: string }> = {
  primary: {
    bg: colors.primarySoft,
    text: colors.primaryDark,
    border: '#99F6E4',
  },
  verified: {
    bg: '#ECFDF5',
    text: '#047857',
    border: '#A7F3D0',
  },
  success: {
    bg: '#ECFDF5',
    text: '#166534',
    border: '#BBF7D0',
  },
  warning: {
    bg: '#FFFBEB',
    text: '#B45309',
    border: '#FDE68A',
  },
  danger: {
    bg: '#FEF2F2',
    text: '#B91C1C',
    border: '#FECACA',
  },
  neutral: {
    bg: colors.surfaceSoft,
    text: colors.textMuted,
    border: colors.border,
  },
  premium: {
    bg: '#FFF7ED',
    text: '#B45309',
    border: '#FCD34D',
  },
};

export function AppBadge({ label, variant = 'neutral' }: AppBadgeProps) {
  const palette = variantStyles[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
      ]}
    >
      <AppText variant="caption" style={{ color: palette.text }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
