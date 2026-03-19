import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppCard } from '@/src/components/ui/AppCard';
import { supabase } from '@/src/lib/supabase/client';
import { colors } from '@/src/theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAction, setLoadingAction] = useState<'signin' | 'signup' | null>(null);

  async function signIn() {
    if (!email || !password) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }

    try {
      setLoadingAction('signin');

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Sign in failed', error.message);
        return;
      }

      router.replace('/');
    } finally {
      setLoadingAction(null);
    }
  }

  async function signUp() {
    if (!email || !password) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak password', 'Use at least 6 characters.');
      return;
    }

    try {
      setLoadingAction('signup');

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Sign up failed', error.message);
        return;
      }

      if (data.session) {
        router.replace('/onboarding/mode');
        return;
      }

      Alert.alert(
        'Account created',
        'Your account has been created. If email confirmation is enabled, confirm your email before signing in.'
      );
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <AppText style={styles.eyebrow}>Premium access</AppText>
          <AppText style={styles.title}>Sign in or create your account</AppText>
          <AppText style={styles.subtitle}>
            One account. Buyer Mode and Seller Mode. Clean flows from day one.
          </AppText>
        </View>

        <AppCard>
          <View style={styles.form}>
            <AppInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
            />

            <AppInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
            />

            <View style={styles.actions}>
              <AppButton
                title={loadingAction === 'signin' ? 'Signing in...' : 'Sign In'}
                onPress={signIn}
              />
              <AppButton
                title={loadingAction === 'signup' ? 'Creating account...' : 'Create Account'}
                variant="secondary"
                onPress={signUp}
              />
            </View>
          </View>
        </AppCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
  form: {
    gap: 18,
  },
  actions: {
    gap: 12,
    marginTop: 4,
  },
});
