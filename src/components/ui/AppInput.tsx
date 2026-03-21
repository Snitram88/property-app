import { ComponentProps, forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle, StyleProp } from 'react-native';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type AppInputProps = TextInputProps & {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
  { label, style, containerStyle, multiline, ...props },
  ref
) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <AppText variant="title" style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <TextInput
        ref={ref}
        placeholderTextColor={colors.textSoft}
        autoCapitalize={props.autoCapitalize ?? 'none'}
        multiline={multiline}
        style={[
          styles.input,
          multiline ? styles.inputMultiline : null,
          style,
        ]}
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 124,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
});
