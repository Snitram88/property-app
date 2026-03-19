import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import { colors } from '@/src/theme/colors';

export default function SellerDashboardScreen() {
  const { profile } = useAuth();
  const incompleteProfile = !profile?.full_name || !profile?.phone || !profile?.whatsapp_number;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText style={styles.eyebrow}>Seller Mode</AppText>
          <AppText style={styles.title}>
            Dashboard{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </AppText>
          <AppText style={styles.subtitle}>
            Leads, listings, reminders, and operations will live here as the seller experience expands.
          </AppText>
        </View>

        {incompleteProfile ? (
          <AppCard>
            <View style={styles.banner}>
              <AppText style={styles.bannerTitle}>Complete your seller profile</AppText>
              <AppText style={styles.bannerText}>
                Add your phone and WhatsApp details so leads, inquiries, and notifications work properly.
              </AppText>
              <AppButton title="Edit Profile" onPress={() => router.push('/profile/edit')} />
            </View>
          </AppCard>
        ) : null}

        <View style={styles.grid}>
          <AppCard>
            <View style={styles.metricCard}>
              <AppText style={styles.metricLabel}>Active Listings</AppText>
              <AppText style={styles.metricValue}>0</AppText>
            </View>
          </AppCard>

          <AppCard>
            <View style={styles.metricCard}>
              <AppText style={styles.metricLabel}>New Leads</AppText>
              <AppText style={styles.metricValue}>0</AppText>
            </View>
          </AppCard>

          <AppCard>
            <View style={styles.metricCard}>
              <AppText style={styles.metricLabel}>Viewing Requests</AppText>
              <AppText style={styles.metricValue}>0</AppText>
            </View>
          </AppCard>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
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
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  banner: {
    gap: 10,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  bannerText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  grid: {
    gap: 16,
  },
  metricCard: {
    gap: 10,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
  },
});
