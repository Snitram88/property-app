import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';
import { shadows } from '@/src/theme/shadows';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

const variantStyles = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    textColor: colors.textInverse,
    shadow: shadows.medium,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    textColor: colors.text,
    shadow: shadows.soft,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    textColor: colors.text,
    shadow: {},
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    textColor: colors.textInverse,
    shadow: shadows.medium,
  },
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
}: AppButtonProps) {
  const palette = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: isDisabled ? 0.55 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.995 : 1 }],
        },
        variant !== 'ghost' && palette.shadow,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={palette.textColor} />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={18} color={palette.textColor} /> : null}
            <AppText variant="bodyStrong" style={{ color: palette.textColor }}>
              {title}
            </AppText>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
