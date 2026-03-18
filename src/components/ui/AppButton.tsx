import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  style,
}: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        style,
      ]}
    >
      <AppText style={variant === 'primary' ? styles.primaryText : styles.secondaryText}>
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryText: {
    color: colors.white,
    fontWeight: '600',
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
