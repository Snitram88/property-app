import { ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import { colors } from '@/src/theme/colors';

export default function SellerDashboardScreen() {
  const { profile } = useAuth();

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
              <AppText style={styles.metricLabel}>Unread Messages</AppText>
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
