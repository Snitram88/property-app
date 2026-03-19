import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';

type FullScreenLoaderProps = {
  title?: string;
  subtitle?: string;
};

export function FullScreenLoader({
  title = 'Preparing your experience',
  subtitle = 'Please wait a moment...',
}: FullScreenLoaderProps) {
  return (
    <Screen>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.subtitle}>{subtitle}</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
