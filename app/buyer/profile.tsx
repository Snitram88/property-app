import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import { formatRole } from '@/src/lib/app-routing';

export default function BuyerProfileScreen() {
  const { user, profile, roles, hasSellerAccess, setActiveMode, signOut } = useAuth();

  async function switchToSeller() {
    try {
      await setActiveMode('seller');
      router.replace('/seller');
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
            <AppText style={styles.name}>{profile?.full_name ?? 'Your account'}</AppText>
            <AppText>{user?.email ? `Email: ${user.email}` : 'No email available'}</AppText>
            <AppText>Phone: {profile?.phone ?? 'Not set yet'}</AppText>
            <AppText>Preferred locations: {profile?.preferred_locations ?? 'Not set yet'}</AppText>
            <AppText>Roles: {roles.length ? roles.map(formatRole).join(', ') : 'Buyer'}</AppText>
            <AppText>Current mode: Buyer</AppText>
          </View>
        </AppCard>

        <AppButton title="Edit Profile" onPress={() => router.push('/profile/edit')} />
        <AppButton title="Open Company Home" variant="secondary" onPress={() => router.push('/home')} />
        {isAdmin ? (
          <AppButton title="Open Admin Console" variant="secondary" onPress={() => router.push('/admin')} />
        ) : null}
        {hasSellerAccess ? (
          <AppButton title="Switch to Seller Mode" onPress={switchToSeller} />
        ) : null}
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
