import { ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { PropertyCard } from '@/src/components/property/PropertyCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { useAuth } from '@/src/providers/AuthProvider';
import {
  fetchPublishedProperties,
  formatPrice,
  PropertyWithMedia,
} from '@/src/lib/properties/live-properties';
import { fetchSavedPropertyRefs, toggleSavedProperty } from '@/src/lib/properties/saved-properties';
import { spacing } from '@/src/theme/spacing';

export default function BuyerSavedScreen() {
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState<PropertyWithMedia[]>([]);
  const [savedRefs, setSavedRefs] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        if (!user?.id) return;

        try {
          const [listings, refs] = await Promise.all([
            fetchPublishedProperties(),
            fetchSavedPropertyRefs(user.id),
          ]);

          if (!active) return;

          setSavedRefs(refs);
          setSavedProperties(listings.filter((item) => refs.has(item.id)));
        } catch (error) {
          console.error('Failed to load saved properties:', error);
        }
      }

      load();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  async function handleRemove(property: PropertyWithMedia) {
    if (!user?.id) return;

    try {
      await toggleSavedProperty(user.id, {
        id: property.id,
        title: property.title,
        location: property.location_text,
        price:
          property.listing_type === 'sale'
            ? formatPrice(property.price)
            : `${formatPrice(property.price)} / year`,
        badge: property.verification_status === 'approved' ? 'Verified' : 'Awaiting review',
        listingType: property.listing_type.charAt(0).toUpperCase() + property.listing_type.slice(1),
      });

      setSavedRefs((prev) => {
        const cloned = new Set(prev);
        cloned.delete(property.id);
        return cloned;
      });

      setSavedProperties((prev) => prev.filter((item) => item.id !== property.id));
    } catch (error) {
      console.error('Failed to remove saved property:', error);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <AppText variant="h1">Wishlist</AppText>
        <AppText>Homes you want to revisit, compare, and contact later.</AppText>
      </View>

      {savedProperties.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="No saved homes yet"
          message="Tap the heart icon on any property to save it here for later."
          actionLabel="Explore listings"
          onAction={() => router.replace('/buyer')}
        />
      ) : (
        <View style={styles.list}>
          {savedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              title={property.title}
              location={property.location_text}
              price={
                property.listing_type === 'sale'
                  ? formatPrice(property.price)
                  : `${formatPrice(property.price)} / year`
              }
              badge={property.verification_status === 'approved' ? 'Verified' : null}
              listingType={property.listing_type.charAt(0).toUpperCase() + property.listing_type.slice(1)}
              beds={property.bedrooms}
              baths={property.bathrooms}
              imageUrl={property.cover_image_url}
              saved={savedRefs.has(property.id)}
              onToggleSave={() => handleRemove(property)}
              onPress={() => router.push(`/property/${property.id}`)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 120,
  },
  header: {
    gap: spacing.xs,
  },
  list: {
    gap: spacing.lg,
  },
});
