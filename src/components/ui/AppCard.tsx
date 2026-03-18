import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';

type AppCardProps = {
  children: ReactNode;
};

export function AppCard({ children }: AppCardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
