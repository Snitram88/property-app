import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import { formatRole } from '@/src/lib/app-routing';
import { formatVerificationStatus } from '@/src/lib/admin/verification';

export default function SellerProfileScreen() {
  const { user, profile, roles, signOut, setActiveMode } = useAuth();

  async function switchToBuyer() {
    try {
      await setActiveMode('buyer');
      router.replace('/buyer');
    } catch (error: any) {
      Alert.alert('Mode switch failed', error?.message ?? 'Please try again.');
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      router.replace('/');
    } catch {
      Alert.alert('Sign out failed', 'Please try again.');
    }
  }

  const isAdmin = roles.includes('admin');

  return (
    <Screen>
      <View style={styles.container}>
        <AppText style={styles.title}>Profile</AppText>

        <AppCard>
          <View style={styles.section}>
            <AppText style={styles.name}>{profile?.full_name ?? 'Your seller account'}</AppText>
            <AppText>{user?.email ? `Email: ${user.email}` : 'No email available'}</AppText>
            <AppText>Phone: {profile?.phone ?? 'Not set yet'}</AppText>
            <AppText>WhatsApp: {profile?.whatsapp_number ?? 'Not set yet'}</AppText>
            <AppText>Seller type: {profile?.seller_type ?? 'Not set yet'}</AppText>
            <AppText>Company: {profile?.company_name ?? 'Not set yet'}</AppText>
            <AppText>
              Seller verification: {formatVerificationStatus(profile?.seller_verification_status)}
            </AppText>
            <AppText>Roles: {roles.length ? roles.map(formatRole).join(', ') : 'Buyer'}</AppText>
            <AppText>Current mode: Seller</AppText>
          </View>
        </AppCard>

        <AppButton title="Open KYC" onPress={() => router.push('/kyc')} />
        <AppButton title="Edit Profile" onPress={() => router.push('/profile/edit')} />
        <AppButton title="Open Company Home" variant="secondary" onPress={() => router.push('/home')} />
        <AppButton title="Contact Support" variant="secondary" onPress={() => router.push('/support')} />
        {isAdmin ? (
          <>
            <AppButton title="Open Admin Console" variant="secondary" onPress={() => router.push('/admin')} />
            <AppButton title="Open Support Inbox" variant="secondary" onPress={() => router.push('/admin/support')} />
          </>
        ) : null}
        <AppButton title="Switch to Buyer Mode" onPress={switchToBuyer} />
        <AppButton title="Sign Out" variant="secondary" onPress={handleSignOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
  section: {
    gap: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
  },
});
