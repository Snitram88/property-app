import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ExpoLinking from 'expo-linking';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { useAuth } from '@/src/providers/AuthProvider';
import { fetchSavedPropertyRefs, toggleSavedProperty } from '@/src/lib/properties/saved-properties';
import {
  PropertyWithMedia,
  fetchPropertyById,
  formatPrice,
  propertyToSnapshot,
} from '@/src/lib/properties/live-properties';

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyWithMedia | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      if (!id) return;

      try {
        const item = await fetchPropertyById(id);
        if (active) {
          setProperty(item);
        }

        if (user?.id && item?.id) {
          const refs = await fetchSavedPropertyRefs(user.id);
          if (active) {
            setSaved(refs.has(item.id));
          }
        }
      } catch (error) {
        console.error('Failed to load property details:', error);
      }
    }

    loadProperty();

    return () => {
      active = false;
    };
  }, [id, user?.id]);

  async function handleSave() {
    if (!user?.id || !property) {
      Alert.alert('Sign in required', 'Please sign in to save properties.');
      return;
    }

    try {
      const next = await toggleSavedProperty(user.id, propertyToSnapshot(property));
      setSaved(next);
    } catch (error: any) {
      Alert.alert('Save failed', error?.message ?? 'Please try again.');
    }
  }

  async function openMap() {
    if (!property?.latitude || !property?.longitude) {
      Alert.alert('Map unavailable', 'This listing does not have map coordinates yet.');
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`;
    await ExpoLinking.openURL(url);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader
          title="Property Details"
          subtitle={property?.location_text ?? 'Live listing'}
          rightSlot={
            <Pressable style={styles.saveIconButton} onPress={handleSave}>
              <Ionicons
                name={saved ? 'heart' : 'heart-outline'}
                size={20}
                color={saved ? '#DC2626' : colors.text}
              />
            </Pressable>
          }
        />

        <AppText style={styles.propertyTitle}>{property?.title ?? 'Property Details'}</AppText>

        {property?.images?.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
            {property.images.map((image) => (
              <Image
                key={image.id}
                source={image.image_url}
                style={styles.galleryImage}
                contentFit="cover"
              />
            ))}
          </ScrollView>
        ) : null}

        <AppCard>
          <View style={styles.content}>
            <AppText style={styles.price}>
              {property
                ? property.listing_type === 'sale'
                  ? formatPrice(property.price)
                  : `${formatPrice(property.price)} / year`
                : 'Price on request'}
            </AppText>
            <AppText style={styles.meta}>
              {property?.bedrooms ?? 0} beds • {property?.bathrooms ?? 0} baths • {property?.listing_type ?? 'listing'}
            </AppText>
            <AppText style={styles.description}>
              {property?.description ?? 'This listing will display its live property details here.'}
            </AppText>
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.content}>
            <AppText style={styles.mapTitle}>Location & Map</AppText>
            <AppText style={styles.mapText}>
              {property?.address ?? property?.location_text ?? 'Location unavailable'}
            </AppText>
            <AppButton title="Open in Maps" variant="secondary" onPress={openMap} />
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton title="Contact Owner" onPress={() => router.push(`/inquiry/${id}`)} />
          <AppButton
            title="Schedule Viewing"
            variant="secondary"
            onPress={() => router.push(`/viewing/${id}`)}
          />
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
  saveIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  propertyTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text,
  },
  galleryRow: {
    gap: 12,
  },
  galleryImage: {
    width: 280,
    height: 220,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
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
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  mapText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  actions: {
    gap: 12,
  },
});
