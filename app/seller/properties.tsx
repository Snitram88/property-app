import { router, useFocusEffect } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import {
  DatabaseProperty,
  fetchSellerProperties,
  formatPrice,
} from '@/src/lib/properties/live-properties';

export default function SellerPropertiesScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<DatabaseProperty[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadProperties() {
        if (!user?.id) return;

        try {
          const data = await fetchSellerProperties(user.id);
          if (active) {
            setItems(data);
          }
        } catch (error) {
          console.error('Failed to load seller properties:', error);
        }
      }

      loadProperties();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <AppText style={styles.title}>My Properties</AppText>

        <AppButton title="Add New Listing" onPress={() => router.push('/listing/create')} />

        {items.length === 0 ? (
          <AppCard>
            <View style={styles.cardContent}>
              <AppText style={styles.cardTitle}>No listings yet</AppText>
              <AppText>
                Create your first property listing to activate the live buyer marketplace.
              </AppText>
            </View>
          </AppCard>
        ) : (
          items.map((property) => (
            <AppCard key={property.id}>
              <View style={styles.cardContent}>
                <AppText style={styles.cardTitle}>{property.title}</AppText>
                <AppText>
                  {property.listing_type === 'sale'
                    ? formatPrice(property.price)
                    : `${formatPrice(property.price)} / year`}
                </AppText>
                <AppText>{property.location_text}</AppText>
                <AppText>
                  {property.is_published ? 'Published' : 'Draft'} • {property.verification_status}
                </AppText>

                <View style={styles.actions}>
                  <AppButton
                    title="Edit"
                    onPress={() => router.push(`/listing/edit/${property.id}`)}
                  />
                  <AppButton
                    title="View"
                    variant="secondary"
                    onPress={() => router.push(`/property/${property.id}`)}
                  />
                </View>
              </View>
            </AppCard>
          ))
        )}
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
    fontSize: 26,
    fontWeight: '900',
  },
  cardContent: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
});
