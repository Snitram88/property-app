import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { colors } from '@/src/theme/colors';

export default function WelcomeScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.hero}>
          <AppText style={styles.badge}>Nigeria Property Super App</AppText>
          <AppText style={styles.title}>Find, manage, and close property deals smarter.</AppText>
          <AppText style={styles.subtitle}>
            Premium real-estate discovery, landlord tools, smart messaging, and verified listings.
          </AppText>
        </View>

        <View style={styles.actions}>
          <AppButton title="Get Started" onPress={() => router.push('/(auth)/login')} />
          <AppButton
            title="Browse Properties"
            variant="secondary"
            onPress={() => router.push('/(tabs)')}
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: colors.background,
  },
  hero: {
    marginTop: 80,
    gap: 16,
  },
  badge: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  secondaryButton: {
    marginTop: 0,
  },
});
