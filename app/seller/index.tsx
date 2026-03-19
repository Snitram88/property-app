import { ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import { colors } from '@/src/theme/colors';
import { fetchSellerStats } from '@/src/lib/properties/live-properties';
import { router } from 'expo-router';

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
          if (active) {
            setStats(next);
          }
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
        <View style={styles.header}>
          <AppText style={styles.eyebrow}>Seller Mode</AppText>
          <AppText style={styles.title}>
            Dashboard{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </AppText>
          <AppText style={styles.subtitle}>
            Live inventory, incoming buyer leads, and viewing requests now flow through this dashboard.
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
              <AppText style={styles.metricValue}>{stats.propertyCount}</AppText>
            </View>
          </AppCard>

          <AppCard>
            <View style={styles.metricCard}>
              <AppText style={styles.metricLabel}>New Leads</AppText>
              <AppText style={styles.metricValue}>{stats.inquiryCount}</AppText>
            </View>
          </AppCard>

          <AppCard>
            <View style={styles.metricCard}>
              <AppText style={styles.metricLabel}>Viewing Requests</AppText>
              <AppText style={styles.metricValue}>{stats.viewingCount}</AppText>
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
