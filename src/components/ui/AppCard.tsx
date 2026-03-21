import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { shadows } from '@/src/theme/shadows';
import { spacing } from '@/src/theme/spacing';

type AppCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
};

export function AppCard({ children, style, padded = true }: AppCardProps) {
  return <View style={[styles.card, padded && styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  padded: {
    padding: spacing.lg,
  },
});
