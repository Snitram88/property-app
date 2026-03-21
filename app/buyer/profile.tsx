import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/ui/Screen';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type ActionRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
};

function ActionRow({ icon, title, subtitle, onPress }: ActionRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.actionRow}>
      <View style={styles.actionLeft}>
        <View style={styles.actionIconWrap}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>

        <View style={styles.actionText}>
          <AppText variant="title">{title}</AppText>
          <AppText color={colors.textMuted}>{subtitle}</AppText>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textSoft} />
    </Pressable>
  );
}

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
  const initials =
    (profile?.full_name ?? user?.email ?? 'U')
      .split(' ')
      .slice(0, 2)
      .map((item) => item.charAt(0).toUpperCase())
      .join('') || 'U';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <AppText variant="h1">Profile</AppText>

        <AppCard>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <AppText variant="h2" color={colors.textInverse}>
                {initials}
              </AppText>
            </View>

            <View style={styles.profileText}>
              <AppText variant="h3">{profile?.full_name ?? 'Your account'}</AppText>
              <AppText color={colors.textMuted}>{user?.email ?? 'No email available'}</AppText>

              <View style={styles.badgeRow}>
                <AppBadge label="Buyer" variant="primary" />
                {isAdmin ? <AppBadge label="Admin" variant="premium" /> : null}
                {hasSellerAccess ? <AppBadge label="Seller access" variant="neutral" /> : null}
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={colors.textMuted} />
            <AppText color={colors.textMuted}>Phone: {profile?.phone ?? 'Not set yet'}</AppText>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
            <AppText color={colors.textMuted}>
              Preferred locations: {profile?.preferred_locations ?? 'Not set yet'}
            </AppText>
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.group}>
            <AppText variant="title">Account Actions</AppText>

            <ActionRow
              icon="create-outline"
              title="Edit Profile"
              subtitle="Refine your buyer details and preferences"
              onPress={() => router.push('/profile/edit')}
            />

            <ActionRow
              icon="business-outline"
              title="Company Home"
              subtitle="View the shared premium brand page"
              onPress={() => router.push('/home')}
            />

            <ActionRow
              icon="help-buoy-outline"
              title="Contact Support"
              subtitle="Chat with the support bot or escalate to human admin"
              onPress={() => router.push('/support')}
            />

            <ActionRow
              icon="game-controller-outline"
              title="Play X and O"
              subtitle="Challenge the computer in easy or hard mode"
              onPress={() => router.push('/game')}
            />

            {isAdmin ? (
              <>
                <ActionRow
                  icon="shield-checkmark-outline"
                  title="Admin Console"
                  subtitle="Review KYC and listing approvals"
                  onPress={() => router.push('/admin')}
                />
                <ActionRow
                  icon="headset-outline"
                  title="Support Inbox"
                  subtitle="Reply to escalated buyer and seller support threads"
                  onPress={() => router.push('/admin/support')}
                />
              </>
            ) : null}

            {hasSellerAccess ? (
              <ActionRow
                icon="swap-horizontal-outline"
                title="Switch to Seller Mode"
                subtitle="Open your seller tools and dashboard"
                onPress={switchToSeller}
              />
            ) : null}

            <ActionRow
              icon="log-out-outline"
              title="Sign Out"
              subtitle="Sign out of this device"
              onPress={handleSignOut}
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
    paddingBottom: 120,
  },
  profileTop: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    flex: 1,
    gap: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  group: {
    gap: spacing.md,
  },
  actionRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  actionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
});
