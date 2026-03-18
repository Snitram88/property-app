import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppText } from '@/src/components/ui/AppText';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { colors } from '@/src/theme/colors';

const sampleProperties = [
  {
    id: '1',
    title: '2 Bedroom Flat in Yaba',
    price: '₦2,500,000 / year',
    location: 'Yaba, Lagos',
  },
  {
    id: '2',
    title: '3 Bedroom Duplex in Lekki',
    price: '₦8,000,000 / year',
    location: 'Lekki Phase 1, Lagos',
  },
];

export default function HomeTab() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <AppText style={styles.title}>Discover Properties</AppText>
          <AppText style={styles.subtitle}>
            Verified listings, direct inquiries, and smart property tools.
          </AppText>
        </View>

        <View style={styles.list}>
          {sampleProperties.map((property) => (
            <AppCard key={property.id}>
              <View style={styles.cardContent}>
                <AppText style={styles.cardTitle}>{property.title}</AppText>
                <AppText style={styles.cardPrice}>{property.price}</AppText>
                <AppText style={styles.cardLocation}>{property.location}</AppText>
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
    gap: 16,
  },
  header: {
    gap: 8,
    marginTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
  },
  list: {
    gap: 16,
  },
  cardContent: {
    gap: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  cardLocation: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
