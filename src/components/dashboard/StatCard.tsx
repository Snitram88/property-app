import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  tone?: 'primary' | 'success' | 'premium' | 'neutral';
};

const toneMap = {
  primary: {
    bg: colors.primarySoft,
    fg: colors.primary,
  },
  success: {
    bg: '#ECFDF5',
    fg: colors.success,
  },
  premium: {
    bg: '#FFF7ED',
    fg: colors.accent,
  },
  neutral: {
    bg: colors.surfaceSoft,
    fg: colors.text,
  },
};

export function StatCard({
  icon,
  label,
  value,
  tone = 'primary',
}: StatCardProps) {
  const palette = toneMap[tone];

  return (
    <AppCard style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: palette.bg }]}>
        <Ionicons name={icon} size={20} color={palette.fg} />
      </View>

      <View style={styles.textGroup}>
        <AppText variant="caption" color={colors.textMuted}>
          {label}
        </AppText>
        <AppText variant="h2">{String(value)}</AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  textGroup: {
    gap: 2,
  },
});
