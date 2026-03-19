import { Alert, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from '@/src/providers/AuthProvider';

export default function OnboardingModeScreen() {
  const { user, profile } = useAuth();
  const [selectedMode, setSelectedMode] = useState<'buyer' | 'seller'>(
    profile?.active_mode === 'seller' ? 'seller' : 'buyer'
  );
  const [loading, setLoading] = useState(false);

  async function continueFlow() {
    if (!user) {
      Alert.alert('Session expired', 'Please sign in again.');
      router.replace('/login');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          active_mode: selectedMode,
          onboarding_step: 'profile',
        })
        .eq('id', user.id);

      if (error) {
        Alert.alert('Unable to continue', error.message);
        return;
      }

      router.push('/onboarding/profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText style={styles.eyebrow}>Step 1 of 2</AppText>
          <AppText style={styles.title}>Choose your starting mode</AppText>
          <AppText style={styles.subtitle}>
            You can switch modes later. Seller Mode is for landlords and agents. Buyer Mode is for discovery and inquiries.
          </AppText>
        </View>

        <View style={styles.options}>
          <AppCard>
            <View style={[styles.modeCard, selectedMode === 'buyer' && styles.selected]}>
              <AppText style={styles.modeTitle}>Buyer Mode</AppText>
              <AppText style={styles.modeText}>
                Browse listings, save favorites, send inquiries, and track conversations.
              </AppText>
              <AppButton title="Choose Buyer Mode" onPress={() => setSelectedMode('buyer')} />
            </View>
          </AppCard>

          <AppCard>
            <View style={[styles.modeCard, selectedMode === 'seller' && styles.selected]}>
              <AppText style={styles.modeTitle}>Seller Mode</AppText>
              <AppText style={styles.modeText}>
                Manage listings, handle incoming leads, and prepare for landlord and agent tools.
              </AppText>
              <AppButton
                title="Choose Seller Mode"
                variant="secondary"
                onPress={() => setSelectedMode('seller')}
              />
            </View>
          </AppCard>
        </View>

        <AppButton
          title={loading ? 'Please wait...' : 'Continue'}
          onPress={continueFlow}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 20,
    justifyContent: 'space-between',
  },
  header: {
    gap: 8,
    marginTop: 24,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
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
  options: {
    gap: 16,
    flex: 1,
  },
  modeCard: {
    gap: 12,
  },
  selected: {
    borderRadius: 16,
  },
  modeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  modeText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
});
