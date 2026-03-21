import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, style }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
