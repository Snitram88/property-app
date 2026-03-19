import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { mockProperties } from '@/src/constants/mockProperties';
import { colors } from '@/src/theme/colors';

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const property = mockProperties.find((item) => item.id === id);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <AppText style={styles.title}>{property?.title ?? 'Property Details'}</AppText>
        <AppText style={styles.subtitle}>{property?.location ?? 'Premium listing details'}</AppText>

        <AppCard>
          <View style={styles.content}>
            <AppText style={styles.price}>{property?.price ?? 'Price on request'}</AppText>
            <AppText style={styles.meta}>
              {property?.beds ?? 0} beds • {property?.baths ?? 0} baths • {property?.listingType ?? 'Listing'}
            </AppText>
            <AppText style={styles.description}>
              {property?.description ??
                'A premium property detail experience with media, features, agent trust signals, and inquiry actions.'}
            </AppText>
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton title="Contact Owner" onPress={() => router.push(`/inquiry/${id}`)} />
          <AppButton title="Back to Discover" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
  },
  content: {
    gap: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  meta: {
    fontSize: 14,
    color: colors.textMuted,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  actions: {
    gap: 12,
  },
});
