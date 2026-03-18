import { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { colors } from '@/src/theme/colors';

type AppTextProps = {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
};

export function AppText({ children, style }: AppTextProps) {
  return <Text style={[styles.text, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: colors.text,
    fontSize: 16,
  },
});
