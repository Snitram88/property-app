import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { AppText } from './AppText';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';

type AppInputProps = TextInputProps & {
  label?: string;
};

export function AppInput({ label, ...props }: AppInputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <AppText style={styles.label}>{label}</AppText> : null}
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor={colors.textMuted}
        autoCapitalize={props.autoCapitalize ?? 'none'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
  },
});
