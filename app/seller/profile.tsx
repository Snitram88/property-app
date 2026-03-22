import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

export default function SellerProfileScreen() {
  const { user, profile, roles, setActiveMode, signOut } = useAuth();

  const isAdmin = roles.includes('admin');

  async function handleSwitchToBuyer() {
    try {
      await setActiveMode('buyer');
      router.replace('/buyer');
    } catch (error: any) {
      Alert.alert('Switch failed', error?.message ?? 'Please try again.');
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Sign out failed', error?.message ?? 'Please try again.');
    }
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppText variant="h1">Profile</AppText>
          <AppText color={colors.textMuted}>
            Seller account, verification, admin access, and switching.
          </AppText>
        </View>

        <AppCard>
          <View style={styles.accountBlock}>
            <AppText variant="h3">Your seller account</AppText>
            <AppText>Email: {user?.email ?? 'Not available'}</AppText>
            <AppText>Phone: {profile?.phone ?? 'Not set yet'}</AppText>
            <AppText>WhatsApp: {profile?.whatsapp_number ?? 'Not set yet'}</AppText>
            <AppText>Seller type: {profile?.seller_type ?? 'Not set yet'}</AppText>
            <AppText>Company: {profile?.company_name ?? 'Not set yet'}</AppText>
            <AppText>
              Seller verification:{' '}
              {profile?.seller_verification_status ?? 'Unverified'}
            </AppText>
            <AppText>
              Roles: {roles.length ? roles.join(', ') : 'No roles found'}
            </AppText>
            <AppText>Current mode: Seller</AppText>

            <View style={styles.badgeRow}>
              <AppBadge label="Seller Mode" variant="primary" />
              {isAdmin ? <AppBadge label="Admin Access" variant="premium" /> : null}
            </View>
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton
            title="Open KYC"
            onPress={() => router.push('/kyc')}
          />

          <AppButton
            title="Edit Profile"
            onPress={() => router.push('/profile/edit')}
          />

          <AppButton
            title="Open Company Home"
            variant="secondary"
            onPress={() => router.push('/home')}
          />

          <AppButton
            title="Contact Support"
            variant="secondary"
            onPress={() => router.push('/support')}
          />

          <AppButton
            title="Play X and O"
            variant="secondary"
            onPress={() => router.push('/game')}
          />

          {isAdmin ? (
            <>
              <AppButton
                title="Open Admin Console"
                variant="secondary"
                onPress={() => router.push('/admin')}
              />

              <AppButton
                title="Open Support Inbox"
                variant="secondary"
                onPress={() => router.push('/admin/support')}
              />
            </>
          ) : null}

          <AppButton
            title="Switch to Buyer Mode"
            onPress={handleSwitchToBuyer}
          />

          <AppButton
            title="Sign Out"
            variant="secondary"
            onPress={handleSignOut}
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
    paddingBottom: 160,
  },
  header: {
    gap: spacing.xs,
  },
  accountBlock: {
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.md,
  },
});
