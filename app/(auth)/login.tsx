import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppText } from '@/src/components/ui/AppText';
import { supabase } from '@/src/lib/supabase/client';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

type Mode = 'signin' | 'signup';

async function resolvePostAuthRoute(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, active_mode')
    .eq('id', userId)
    .maybeSingle();

  const fullName = profile?.full_name?.trim?.() ?? '';
  const phone = profile?.phone?.trim?.() ?? '';
  const activeMode = profile?.active_mode ?? 'buyer';

  if (!fullName || !phone) {
    return '/onboarding';
  }

  if (activeMode === 'seller') {
    return '/seller';
  }

  return '/buyer';
}

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Confirm password must match password.');
      return;
    }

    try {
      setSubmitting(true);

      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          Alert.alert('Sign in failed', error.message);
          return;
        }

        const userId = data.user?.id;
        if (!userId) {
          Alert.alert('Sign in failed', 'Could not resolve your account.');
          return;
        }

        const nextRoute = await resolvePostAuthRoute(userId);
        router.replace(nextRoute as any);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Account creation failed', error.message);
        return;
      }

      const userId = data.user?.id;
      const session = data.session;

      if (!userId) {
        Alert.alert(
          'Check your email',
          'Your account was created. Complete verification if your project requires email confirmation.'
        );
        return;
      }

      if (!session) {
        Alert.alert(
          'Check your email',
          'Your account was created. Complete verification if your project requires email confirmation.'
        );
        return;
      }

      router.replace('/onboarding');
    } catch (error: any) {
      Alert.alert('Something went wrong', error?.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <AppText variant="h1">
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </AppText>
            <AppText color={colors.textMuted}>
              {mode === 'signin'
                ? 'Access your buyer, seller, and admin experience directly.'
                : 'Create your account and continue into onboarding.'}
            </AppText>
          </View>

          <AppCard>
            <View style={styles.modeRow}>
              <View style={styles.modeButton}>
                <AppButton
                  title="Sign In"
                  variant={mode === 'signin' ? 'primary' : 'secondary'}
                  onPress={() => setMode('signin')}
                />
              </View>
              <View style={styles.modeButton}>
                <AppButton
                  title="Create Account"
                  variant={mode === 'signup' ? 'primary' : 'secondary'}
                  onPress={() => setMode('signup')}
                />
              </View>
            </View>
          </AppCard>

          <AppCard>
            <View style={styles.form}>
              <AppInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <AppInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
              />

              {mode === 'signup' ? (
                <AppInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry
                />
              ) : null}

              <AppButton
                title={
                  submitting
                    ? mode === 'signin'
                      ? 'Signing in...'
                      : 'Creating account...'
                    : mode === 'signin'
                      ? 'Sign In'
                      : 'Create Account'
                }
                onPress={handleSubmit}
              />

              <AppButton
                title="Back to Public Home"
                variant="secondary"
                onPress={() => router.replace('/public')}
              />
            </View>
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 40,
  },
  header: {
    gap: spacing.xs,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeButton: {
    flex: 1,
  },
  form: {
    gap: spacing.md,
  },
});
