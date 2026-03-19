import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import { colors } from '@/src/theme/colors';

export default function EditProfileScreen() {
  const { profile, user, updateProfile, hasSellerAccess } = useAuth();

  const initialMode = useMemo<'buyer' | 'seller'>(
    () => (profile?.active_mode === 'seller' ? 'seller' : 'buyer'),
    [profile?.active_mode]
  );

  const [activeMode, setActiveMode] = useState<'buyer' | 'seller'>(initialMode);
  const [sellerType, setSellerType] = useState<'landlord' | 'agent'>(profile?.seller_type ?? 'landlord');
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.whatsapp_number ?? '');
  const [preferredLocations, setPreferredLocations] = useState(profile?.preferred_locations ?? '');
  const [budgetMin, setBudgetMin] = useState(profile?.budget_min ? String(profile.budget_min) : '');
  const [budgetMax, setBudgetMax] = useState(profile?.budget_max ? String(profile.budget_max) : '');
  const [propertyInterestType, setPropertyInterestType] = useState(profile?.property_interest_type ?? '');
  const [companyName, setCompanyName] = useState(profile?.company_name ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert('Missing details', 'Full name and phone number are required.');
      return;
    }

    if (activeMode === 'seller' && !sellerType) {
      Alert.alert('Missing details', 'Please choose Landlord or Agent.');
      return;
    }

    if (activeMode === 'seller' && !whatsappNumber.trim()) {
      Alert.alert('Missing details', 'Seller mode requires a WhatsApp number.');
      return;
    }

    try {
      setSaving(true);

      await updateProfile({
        activeMode,
        sellerType: activeMode === 'seller' ? sellerType : profile?.seller_type ?? undefined,
        fullName,
        phone,
        whatsappNumber,
        preferredLocations,
        budgetMin,
        budgetMax,
        propertyInterestType,
        companyName,
      });

      Alert.alert('Profile updated', 'Your profile changes have been saved.');
      router.back();
    } catch (error: any) {
      Alert.alert('Update failed', error?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AppHeader title="Edit Profile" subtitle="Refine your buyer and seller experience" />

        <AppCard>
          <View style={styles.section}>
            <AppText style={styles.label}>Email</AppText>
            <AppText style={styles.readonly}>{user?.email ?? 'No email found'}</AppText>
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Mode</AppText>

            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.choice, activeMode === 'buyer' && styles.choiceActive]}
                onPress={() => setActiveMode('buyer')}
              >
                <AppText style={[styles.choiceText, activeMode === 'buyer' && styles.choiceTextActive]}>
                  Buyer
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.choice, activeMode === 'seller' && styles.choiceActive]}
                onPress={() => setActiveMode('seller')}
              >
                <AppText style={[styles.choiceText, activeMode === 'seller' && styles.choiceTextActive]}>
                  Seller
                </AppText>
              </TouchableOpacity>
            </View>

            {!hasSellerAccess && activeMode === 'seller' ? (
              <AppText style={styles.infoText}>
                Saving as Seller Mode will activate seller access for this account.
              </AppText>
            ) : null}
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.form}>
            <AppText style={styles.sectionTitle}>Basic Information</AppText>

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

            <AppInput
              label="Preferred locations"
              value={preferredLocations}
              onChangeText={setPreferredLocations}
              placeholder="e.g. Yaba, Lekki, Ikeja"
              autoCapitalize="words"
            />

            <AppInput
              label="Property interest type"
              value={propertyInterestType}
              onChangeText={setPropertyInterestType}
              placeholder="e.g. Rent, Sale, Duplex, Flat"
              autoCapitalize="words"
            />

            <View style={styles.budgetRow}>
              <View style={styles.budgetCol}>
                <AppInput
                  label="Budget min"
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                  placeholder="e.g. 2000000"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.budgetCol}>
                <AppInput
                  label="Budget max"
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                  placeholder="e.g. 6000000"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </AppCard>

        {activeMode === 'seller' ? (
          <AppCard>
            <View style={styles.form}>
              <AppText style={styles.sectionTitle}>Seller Details</AppText>

              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.choice, sellerType === 'landlord' && styles.choiceActive]}
                  onPress={() => setSellerType('landlord')}
                >
                  <AppText style={[styles.choiceText, sellerType === 'landlord' && styles.choiceTextActive]}>
                    Landlord
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.choice, sellerType === 'agent' && styles.choiceActive]}
                  onPress={() => setSellerType('agent')}
                >
                  <AppText style={[styles.choiceText, sellerType === 'agent' && styles.choiceTextActive]}>
                    Agent
                  </AppText>
                </TouchableOpacity>
              </View>

              <AppInput
                label="WhatsApp number"
                value={whatsappNumber}
                onChangeText={setWhatsappNumber}
                placeholder="Enter WhatsApp number"
                keyboardType="phone-pad"
              />

              <AppInput
                label="Agency / company name"
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Optional company or agency name"
                autoCapitalize="words"
              />
            </View>
          </AppCard>
        ) : null}

        <AppButton
          title={saving ? 'Saving profile...' : 'Save Changes'}
          onPress={handleSave}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  section: {
    gap: 10,
  },
  form: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  readonly: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
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
    fontWeight: '800',
    color: colors.text,
  },
  choiceTextActive: {
    color: colors.white,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  budgetCol: {
    flex: 1,
  },
});
