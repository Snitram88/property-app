import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import { fetchMyKycSubmission, submitSellerKyc } from '@/src/lib/admin/verification';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type FriendlyKycState = {
  title: string;
  message: string;
  actionLabel: string;
  badgeVariant: 'neutral' | 'warning' | 'verified' | 'danger';
};

function getFriendlyKycState(status?: string | null): FriendlyKycState {
  switch (status) {
    case 'pending_kyc':
      return {
        title: 'Pending Review',
        message: 'Your KYC has been submitted and is currently awaiting admin review.',
        actionLabel: 'Edit & Resubmit for Review',
        badgeVariant: 'warning',
      };
    case 'verified':
      return {
        title: 'KYC Approved',
        message: 'Your seller KYC has been approved. You can still edit and resubmit if your information changes.',
        actionLabel: 'Edit & Resubmit for Review',
        badgeVariant: 'verified',
      };
    case 'rejected':
      return {
        title: 'KYC Rejected',
        message: 'Your KYC was reviewed and rejected. Update the details below and resubmit for another review.',
        actionLabel: 'Edit & Resubmit for Review',
        badgeVariant: 'danger',
      };
    case 'suspended':
      return {
        title: 'KYC Suspended',
        message: 'Your seller verification is currently suspended. Update the details below and resubmit for review.',
        actionLabel: 'Edit & Resubmit for Review',
        badgeVariant: 'danger',
      };
    default:
      return {
        title: 'KYC Not Submitted',
        message: 'Submit your seller verification details for admin review.',
        actionLabel: 'Submit KYC for Review',
        badgeVariant: 'neutral',
      };
  }
}

function InfoPoint({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.infoPoint}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.infoText}>
        <AppText variant="title">{title}</AppText>
        <AppText color={colors.textMuted}>{subtitle}</AppText>
      </View>
    </View>
  );
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Seller KYC"
          subtitle="Submit your verification details with a premium trust-first flow"
        />

        <View style={styles.hero}>
          <AppBadge label={friendlyState.title} variant={friendlyState.badgeVariant as any} />
          <AppText variant="display">Trust is part of the product.</AppText>
          <AppText color={colors.textMuted}>
            Verified sellers build stronger buyer confidence and unlock a more credible marketplace.
          </AppText>
        </View>

        <AppCard>
          <View style={styles.statusBlock}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIconWrap}>
                <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
              </View>

              <View style={styles.statusText}>
                <AppText variant="h3">{friendlyState.title}</AppText>
                <AppText color={colors.textMuted}>{friendlyState.message}</AppText>
              </View>
            </View>

            <View style={styles.badgeRow}>
              <AppBadge label={profile?.seller_type ?? 'Seller type not set'} variant="neutral" />
              {profile?.kyc_review_notes ? (
                <AppBadge label="Admin note available" variant="warning" />
              ) : null}
            </View>

            {profile?.kyc_review_notes ? (
              <View style={styles.noteBox}>
                <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
                <AppText color={colors.textMuted}>Admin note: {profile.kyc_review_notes}</AppText>
              </View>
            ) : null}
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.infoPoints}>
            <InfoPoint
              icon="person-outline"
              title="Identity quality"
              subtitle="Provide accurate identification details that match your seller profile."
            />
            <InfoPoint
              icon="business-outline"
              title="Business credibility"
              subtitle="Agents should include business or registration details where available."
            />
            <InfoPoint
              icon="location-outline"
              title="Clear address"
              subtitle="A strong address helps admin review and strengthens trust signals."
            />
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.form}>
            <AppText variant="h3">Business & Identity</AppText>

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

            <AppButton
              title={submitting ? 'Sending...' : friendlyState.actionLabel}
              onPress={handleSubmit}
              icon="shield-checkmark-outline"
            />
          </View>
        </AppCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 60,
  },
  hero: {
    gap: spacing.md,
  },
  statusBlock: {
    gap: spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statusIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  noteBox: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoPoints: {
    gap: spacing.md,
  },
  infoPoint: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    gap: 4,
  },
  form: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  col: {
    flex: 1,
  },
});
