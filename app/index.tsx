import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { FullScreenLoader } from '@/src/components/common/FullScreenLoader';
import { colors } from '@/src/theme/colors';
import { useAuth } from '@/src/providers/AuthProvider';
import { getHomeRoute } from '@/src/lib/app-routing';

export default function WelcomeScreen() {
  const { user, profile, roles, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (user) {
    return <Redirect href={getHomeRoute(profile, roles)} />;
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <AppText style={styles.badge}>Smart Property • Buyer & Seller Modes</AppText>
          <AppText style={styles.title}>
            Discover, manage, and close property deals like a premium platform.
          </AppText>
          <AppText style={styles.subtitle}>
            Built for modern real-estate discovery, landlord operations, verified listings, and
            better conversations.
          </AppText>
        </View>

        <View style={styles.actions}>
          <AppButton title="Get Started" onPress={() => router.push('/login')} />
          <AppButton
            title="Preview Buyer Experience"
            variant="secondary"
            onPress={() => router.push('/buyer')}
          />
        </View>

        <View style={styles.grid}>
          <AppCard>
            <View style={styles.cardContent}>
              <AppText style={styles.cardTitle}>Buyer Mode</AppText>
              <AppText style={styles.cardText}>
                Browse premium listings, save favorites, and contact owners with clean workflows.
              </AppText>
            </View>
          </AppCard>

          <AppCard>
            <View style={styles.cardContent}>
              <AppText style={styles.cardTitle}>Seller Mode</AppText>
              <AppText style={styles.cardText}>
                Manage leads, listings, and landlord workflows from a dedicated dashboard.
              </AppText>
            </View>
          </AppCard>

          <AppCard>
            <View style={styles.cardContent}>
              <AppText style={styles.cardTitle}>Smart Messaging</AppText>
              <AppText style={styles.cardText}>
                Inquiry composer now, AI + human handoff next, and WhatsApp alerts behind the scenes.
              </AppText>
            </View>
          </AppCard>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
  },
  hero: {
    marginTop: 24,
    gap: 14,
  },
  badge: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
  actions: {
    gap: 12,
  },
  grid: {
    gap: 16,
    paddingBottom: 16,
  },
  cardContent: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
});
