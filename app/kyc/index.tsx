import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import {
  fetchMyKycSubmission,
  submitSellerKyc,
} from '@/src/lib/admin/verification';
import { colors } from '@/src/theme/colors';

type FriendlyKycState = {
  title: string;
  message: string;
  actionLabel: string;
};

function getFriendlyKycState(status?: string | null): FriendlyKycState {
  switch (status) {
    case 'pending_kyc':
      return {
        title: 'Pending Review',
        message: 'Your KYC has been submitted and is currently awaiting admin review.',
        actionLabel: 'Edit & Resubmit for Review',
      };
    case 'verified':
      return {
        title: 'KYC Approved',
        message: 'Your seller KYC has been approved. You can still edit and resubmit if your information changes.',
        actionLabel: 'Edit & Resubmit for Review',
      };
    case 'rejected':
      return {
        title: 'KYC Rejected',
        message: 'Your KYC was reviewed and rejected. Update the details below and resubmit for another review.',
        actionLabel: 'Edit & Resubmit for Review',
      };
    case 'suspended':
      return {
        title: 'KYC Suspended',
        message: 'Your seller verification is currently suspended. Update the details below and resubmit for review.',
        actionLabel: 'Edit & Resubmit for Review',
      };
    default:
      return {
        title: 'KYC Not Submitted',
        message: 'Submit your seller verification details for admin review.',
        actionLabel: 'Submit KYC for Review',
      };
  }
}

export default function KycScreen() {
  const { user, profile, refreshProfile } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState('');
  const [governmentIdNumber, setGovernmentIdNumber] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateValue, setStateValue] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const friendlyState = useMemo(
    () => getFriendlyKycState(profile?.seller_verification_status),
    [profile?.seller_verification_status]
  );

  useEffect(() => {
    let active = true;

    async function loadSubmission() {
      if (!user?.id) return;

      try {
        const submission = await fetchMyKycSubmission(user.id);

        if (!active || !submission) return;

        setBusinessName(submission.business_name ?? '');
        setCompanyRegistrationNumber(submission.company_registration_number ?? '');
        setGovernmentIdNumber(submission.government_id_number ?? '');
        setContactAddress(submission.contact_address ?? '');
        setCity(submission.city ?? '');
        setStateValue(submission.state ?? '');
        setNotes(submission.notes ?? '');
      } catch (error) {
        console.error('Failed to load KYC submission:', error);
      }
    }

    loadSubmission();

    return () => {
      active = false;
    };
  }, [user?.id]);

  async function handleSubmit() {
    if (!profile?.seller_type) {
      Alert.alert('Seller setup incomplete', 'Complete your seller profile before submitting KYC.');
      return;
    }

    if (!contactAddress.trim() || !city.trim() || !stateValue.trim()) {
      Alert.alert('Missing details', 'Address, city, and state are required for KYC.');
      return;
    }

    try {
      setSubmitting(true);

      await submitSellerKyc({
        businessName,
        companyRegistrationNumber,
        governmentIdNumber,
        contactAddress,
        city,
        state: stateValue,
        notes,
      });

      await refreshProfile();
      Alert.alert(
        'KYC sent for review',
        'Your KYC has been submitted or resubmitted and is now awaiting admin review.'
      );
    } catch (error: any) {
      Alert.alert('Submission failed', error?.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AppHeader
          title="Seller KYC"
          subtitle="Submit your seller verification details for admin review"
        />

        <AppCard>
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{friendlyState.title}</AppText>
            <AppText style={styles.helperText}>{friendlyState.message}</AppText>
            <AppText style={styles.helperText}>
              Seller type: {profile?.seller_type ?? 'Not set'}.
            </AppText>
            {profile?.kyc_review_notes ? (
              <AppText style={styles.helperText}>
                Admin note: {profile.kyc_review_notes}
              </AppText>
            ) : null}
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.form}>
            <AppText style={styles.sectionTitle}>Business & Identity</AppText>

            <AppInput
              label="Business / agency name"
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="Optional if you are a landlord"
              autoCapitalize="words"
            />

            <AppInput
              label="Company registration number"
              value={companyRegistrationNumber}
              onChangeText={setCompanyRegistrationNumber}
              placeholder="Optional CAC or registration number"
              autoCapitalize="characters"
            />

            <AppInput
              label="Government ID number"
              value={governmentIdNumber}
              onChangeText={setGovernmentIdNumber}
              placeholder="National ID, voter ID, or similar"
              autoCapitalize="characters"
            />

            <AppInput
              label="Contact address"
              value={contactAddress}
              onChangeText={setContactAddress}
              placeholder="Enter your business or residential address"
              autoCapitalize="words"
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <AppInput
                  label="City"
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Ikeja"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.col}>
                <AppInput
                  label="State"
                  value={stateValue}
                  onChangeText={setStateValue}
                  placeholder="e.g. Lagos"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <AppInput
              label="Notes for admin"
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional information to help review your KYC"
              multiline
            />
          </View>
        </AppCard>

        <AppButton
          title={submitting ? 'Sending...' : friendlyState.actionLabel}
          onPress={handleSubmit}
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
    gap: 8,
  },
  form: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
});
