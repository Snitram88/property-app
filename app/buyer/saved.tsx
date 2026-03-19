import { router, useFocusEffect } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import { fetchSavedProperties, toggleSavedProperty } from '@/src/lib/properties/saved-properties';

export default function BuyerSavedScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadSaved() {
        if (!user?.id) return;

        try {
          const data = await fetchSavedProperties(user.id);
          if (active) {
            setItems(data);
          }
        } catch (error) {
          console.error('Failed to load wishlist:', error);
        }
      }

      loadSaved();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  async function handleRemove(item: any) {
    if (!user?.id) return;

    try {
      await toggleSavedProperty(user.id, {
        id: item.property_ref,
        title: item.property_title,
        location: item.property_location ?? '',
        price: item.property_price ?? '',
        badge: item.property_badge ?? '',
        listingType: item.property_listing_type ?? '',
      });

      const refreshed = await fetchSavedProperties(user.id);
      setItems(refreshed);
    } catch (error: any) {
      Alert.alert('Remove failed', error?.message ?? 'Please try again.');
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <AppText style={styles.title}>Wishlist</AppText>

        {items.length === 0 ? (
          <AppCard>
            <View style={styles.cardContent}>
              <AppText style={styles.cardTitle}>Nothing saved yet</AppText>
              <AppText>
                Save properties you want to revisit, compare later, or contact later.
              </AppText>
            </View>
          </AppCard>
        ) : (
          items.map((item) => (
            <AppCard key={item.id}>
              <View style={styles.cardContent}>
                <AppText style={styles.cardTitle}>{item.property_title}</AppText>
                <AppText>{item.property_price}</AppText>
                <AppText>{item.property_location}</AppText>

                <View style={styles.actions}>
                  <AppButton
                    title="View Property"
                    onPress={() => router.push(`/property/${item.property_ref}`)}
                  />
                  <AppButton
                    title="Remove"
                    variant="secondary"
                    onPress={() => handleRemove(item)}
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
