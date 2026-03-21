import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
};

export function SectionHeader({ title, subtitle, rightSlot }: SectionHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.textGroup}>
        <AppText variant="h2">{title}</AppText>
        {subtitle ? <AppText color={colors.textMuted}>{subtitle}</AppText> : null}
      </View>

      {rightSlot ? <View>{rightSlot}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  textGroup: {
    gap: 4,
  },
});
