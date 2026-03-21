import { ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/ui/Screen';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { StatCard } from '@/src/components/dashboard/StatCard';
import { useAuth } from '@/src/providers/AuthProvider';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { radius } from '@/src/theme/radius';
import { fetchSellerStats } from '@/src/lib/properties/live-properties';
import { formatVerificationStatus } from '@/src/lib/admin/verification';

function verificationVariant(status?: string | null) {
  if (status === 'verified') return 'verified';
  if (status === 'pending_kyc') return 'warning';
  if (status === 'rejected' || status === 'suspended') return 'danger';
  return 'neutral';
}

function ActionTile({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <AppCard>
      <View style={styles.actionTile}>
        <View style={styles.actionIconWrap}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.actionCopy}>
          <AppText variant="title">{title}</AppText>
          <AppText color={colors.textMuted}>{subtitle}</AppText>
        </View>
        <AppButton title="Open" variant="secondary" onPress={onPress} icon="arrow-forward" />
      </View>
    </AppCard>
  );
}

export default function SellerDashboardScreen() {
  const { profile, user } = useAuth();
  const incompleteProfile = !profile?.full_name || !profile?.phone || !profile?.whatsapp_number;
  const [stats, setStats] = useState({
    propertyCount: 0,
    inquiryCount: 0,
    viewingCount: 0,
  });

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadStats() {
        if (!user?.id) return;

        try {
          const next = await fetchSellerStats(user.id);
          if (active) setStats(next);
        } catch (error) {
          console.error('Failed to load seller stats:', error);
        }
      }

      loadStats();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <AppBadge label="Seller Studio" variant="premium" />
          <AppText variant="display">
            Operate your listings with more control.
          </AppText>
          <AppText color={colors.textMuted}>
            Manage approvals, monitor leads, prepare viewings, and keep your seller presence premium.
          </AppText>
        </View>

        <AppCard style={styles.kycCard}>
          <View style={styles.kycHeader}>
            <View style={styles.kycIconWrap}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
            </View>

            <View style={styles.kycText}>
              <AppText variant="h3">Seller Verification</AppText>
              <AppText color={colors.textMuted}>
                Current status: {formatVerificationStatus(profile?.seller_verification_status)}
              </AppText>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <AppBadge
              label={formatVerificationStatus(profile?.seller_verification_status)}
              variant={verificationVariant(profile?.seller_verification_status) as any}
            />
            {profile?.seller_type ? (
              <AppBadge label={profile.seller_type === 'agent' ? 'Agent' : 'Landlord'} variant="neutral" />
            ) : null}
          </View>

          <AppButton title="Open KYC" onPress={() => router.push('/kyc')} icon="document-text-outline" />
        </AppCard>

        {incompleteProfile ? (
          <AppCard>
            <View style={styles.notice}>
              <View style={styles.noticeRow}>
                <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
                <AppText variant="title">Complete your seller profile</AppText>
              </View>
              <AppText color={colors.textMuted}>
                Add your phone and WhatsApp details so KYC, inquiries, and viewing requests work properly.
              </AppText>
              <AppButton title="Edit Profile" onPress={() => router.push('/profile/edit')} icon="create-outline" />
            </View>
          </AppCard>
        ) : null}

        <SectionHeader
          title="Performance snapshot"
          subtitle="The most important numbers from your seller operation."
        />

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard icon="home-outline" label="My Listings" value={stats.propertyCount} tone="primary" />
            <View style={styles.gap} />
            <StatCard icon="mail-open-outline" label="Buyer Leads" value={stats.inquiryCount} tone="success" />
          </View>

          <View style={styles.statsRow}>
            <StatCard icon="calendar-outline" label="Viewing Requests" value={stats.viewingCount} tone="premium" />
            <View style={styles.gap} />
            <StatCard
              icon="shield-checkmark-outline"
              label="Verification"
              value={formatVerificationStatus(profile?.seller_verification_status)}
              tone="neutral"
            />
          </View>
        </View>

        <SectionHeader
          title="Quick actions"
          subtitle="Create, review, and manage your seller workflow faster."
        />

        <View style={styles.actions}>
          <ActionTile
            icon="add-circle-outline"
            title="Create Listing"
            subtitle="Post a premium property with media, location, and review readiness."
            onPress={() => router.push('/listing/create')}
          />

          <ActionTile
            icon="grid-outline"
            title="Manage Listings"
            subtitle="See approved, pending, and rejected properties in one place."
            onPress={() => router.push('/seller/properties')}
          />

          <ActionTile
            icon="person-circle-outline"
            title="Seller Profile"
            subtitle="Control your account, company identity, and mode switching."
            onPress={() => router.push('/seller/profile')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 120,
  },
  hero: {
    gap: spacing.md,
  },
  kycCard: {
    gap: spacing.md,
  },
  kycHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  kycIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kycText: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  notice: {
    gap: spacing.md,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statsGrid: {
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
  },
  gap: {
    width: spacing.md,
  },
  actions: {
    gap: spacing.md,
  },
  actionTile: {
    gap: spacing.md,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: {
    gap: 4,
  },
});
