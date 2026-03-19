import { StyleProp, StyleSheet, TextInput, TextInputProps, TextStyle, View } from 'react-native';
import { AppText } from './AppText';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';

type AppInputProps = TextInputProps & {
  label?: string;
  style?: StyleProp<TextStyle>;
};

export function AppInput({ label, style, multiline, ...props }: AppInputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <AppText style={styles.label}>{label}</AppText> : null}
      <TextInput
        {...props}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, style]}
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
  multiline: {
    minHeight: 120,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
});
