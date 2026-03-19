import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { useAuth } from '@/src/providers/AuthProvider';

export default function OnboardingProfileScreen() {
  const { profile, completeOnboarding } = useAuth();

  const initialMode = useMemo<'buyer' | 'seller'>(
    () => (profile?.active_mode === 'seller' ? 'seller' : 'buyer'),
    [profile?.active_mode]
  );

  const [activeMode] = useState<'buyer' | 'seller'>(initialMode);
  const [sellerType, setSellerType] = useState<'landlord' | 'agent'>('landlord');
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.whatsapp_number ?? '');
  const [saving, setSaving] = useState(false);

  async function finishSetup() {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert('Missing details', 'Please fill your full name and phone number.');
      return;
    }

    if (activeMode === 'seller' && !whatsappNumber.trim()) {
      Alert.alert('Missing details', 'Seller Mode requires a WhatsApp number for notifications.');
      return;
    }

    try {
      setSaving(true);

      await completeOnboarding({
        activeMode,
        sellerType: activeMode === 'seller' ? sellerType : undefined,
        fullName: fullName.trim(),
        phone: phone.trim(),
        whatsappNumber: whatsappNumber.trim(),
      });

      router.replace(activeMode === 'seller' ? '/seller' : '/buyer');
    } catch (error: any) {
      Alert.alert('Setup failed', error?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <AppText style={styles.eyebrow}>Step 2 of 2</AppText>
          <AppText style={styles.title}>Complete your profile</AppText>
          <AppText style={styles.subtitle}>
            We use this to personalize your mode, dashboard, and communication flow.
          </AppText>
        </View>

        <AppCard>
          <View style={styles.form}>
            <AppInput
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              autoCapitalize="words"
            />

            <AppInput
              label="Phone number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            {activeMode === 'seller' ? (
              <>
                <View style={styles.toggleGroup}>
                  <AppText style={styles.groupLabel}>Seller type</AppText>

                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.choice, sellerType === 'landlord' && styles.choiceActive]}
                      onPress={() => setSellerType('landlord')}
                    >
                      <AppText
                        style={[styles.choiceText, sellerType === 'landlord' && styles.choiceTextActive]}
                      >
                        Landlord
                      </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.choice, sellerType === 'agent' && styles.choiceActive]}
                      onPress={() => setSellerType('agent')}
                    >
                      <AppText
                        style={[styles.choiceText, sellerType === 'agent' && styles.choiceTextActive]}
                      >
                        Agent
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>

                <AppInput
                  label="WhatsApp number"
                  value={whatsappNumber}
                  onChangeText={setWhatsappNumber}
                  placeholder="Enter WhatsApp number"
                  keyboardType="phone-pad"
                />
              </>
            ) : null}
          </View>
        </AppCard>

        <AppButton
          title={saving ? 'Finishing setup...' : 'Finish Setup'}
          onPress={finishSetup}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20,
  },
  header: {
    gap: 8,
    marginTop: 10,
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
  form: {
    gap: 16,
  },
  toggleGroup: {
    gap: 10,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  choice: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  choiceActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  choiceTextActive: {
    color: colors.white,
  },
});
