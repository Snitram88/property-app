import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';

export default function LoginScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <AppText style={styles.title}>Login</AppText>
        <AppText style={styles.subtitle}>
          Auth UI comes next. This screen is now connected in the app flow.
        </AppText>

        <AppButton title="Continue to App" onPress={() => router.replace('/(tabs)')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
});
