import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { shadows } from '@/src/theme/shadows';
import { spacing } from '@/src/theme/spacing';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightSlot?: ReactNode;
};

export function AppHeader({
  title,
  subtitle,
  showBack = true,
  onBackPress,
  rightSlot,
}: AppHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.leftArea}>
        {showBack ? (
          <Pressable
            onPress={onBackPress ?? (() => router.back())}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
        ) : null}

        <View style={styles.textGroup}>
          <AppText variant="h2">{title}</AppText>
          {subtitle ? (
            <AppText variant="body" color={colors.textMuted}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>

      {rightSlot ? <View>{rightSlot}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  leftArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
});
