import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { mockProperties } from '@/src/constants/mockProperties';
import { colors } from '@/src/theme/colors';
import { useAuth } from '@/src/providers/AuthProvider';

export default function BuyerHomeScreen() {
  const { profile } = useAuth();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <AppText style={styles.eyebrow}>Buyer Mode</AppText>
          <AppText style={styles.title}>
            Welcome{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.
          </AppText>
          <AppText style={styles.subtitle}>
            Discover curated listings and contact owners through a cleaner premium flow.
          </AppText>
        </View>

        <View style={styles.list}>
          {mockProperties.map((property) => (
            <AppCard key={property.id}>
              <View style={styles.cardContent}>
                <View style={styles.badgeRow}>
                  <AppText style={styles.badge}>{property.badge}</AppText>
                  <AppText style={styles.type}>{property.listingType}</AppText>
                </View>

                <AppText style={styles.cardTitle}>{property.title}</AppText>
                <AppText style={styles.price}>{property.price}</AppText>
                <AppText style={styles.location}>{property.location}</AppText>
                <AppText style={styles.meta}>
                  {property.beds} beds • {property.baths} baths
                </AppText>

                <AppButton
                  title="View Property"
                  onPress={() => router.push(`/property/${property.id}`)}
                />
              </View>
            </AppCard>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 18,
  },
  hero: {
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
  list: {
    gap: 16,
  },
  cardContent: {
    gap: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  type: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
  location: {
    fontSize: 14,
    color: colors.textMuted,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
