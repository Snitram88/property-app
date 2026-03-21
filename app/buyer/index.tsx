import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { PropertyCard } from '@/src/components/property/PropertyCard';
import { useAuth } from '@/src/providers/AuthProvider';
import {
  fetchPublishedProperties,
  formatPrice,
  PropertyWithMedia,
} from '@/src/lib/properties/live-properties';
import { fetchSavedPropertyRefs, toggleSavedProperty } from '@/src/lib/properties/saved-properties';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { shadows } from '@/src/theme/shadows';
import { radius } from '@/src/theme/radius';

const FILTERS = ['Verified', 'Lagos', 'Buy', 'Rent', 'Duplex'];

export default function BuyerDiscoverScreen() {
  const { user, profile } = useAuth();
  const [properties, setProperties] = useState<PropertyWithMedia[]>([]);
  const [savedRefs, setSavedRefs] = useState<Set<string>>(new Set());

  const incompleteProfile = !profile?.full_name || !profile?.phone;

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        try {
          const listings = await fetchPublishedProperties();
          const saved = user?.id ? await fetchSavedPropertyRefs(user.id) : new Set<string>();

          if (!active) return;

          setProperties(listings);
          setSavedRefs(saved);
        } catch (error) {
          console.error('Failed to load discover screen:', error);
        }
      }

      load();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  const featured = useMemo(() => properties.slice(0, 8), [properties]);

  async function handleToggleSave(property: PropertyWithMedia) {
    if (!user?.id) {
      router.push('/(auth)/login');
      return;
    }

    try {
      const next = await toggleSavedProperty(user.id, {
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
        if (next) cloned.add(property.id);
        else cloned.delete(property.id);
        return cloned;
      });
    } catch (error) {
      console.error('Failed to toggle saved property:', error);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <AppBadge label="Buyer Mode" variant="primary" />
        <AppText variant="display">Find your next address.</AppText>
        <AppText color={colors.textMuted}>
          Verified homes, stronger images, and cleaner discovery built for confident decisions.
        </AppText>

        <Pressable style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <AppText color={colors.textMuted}>Search by city, area, property type...</AppText>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((filter) => (
            <AppBadge key={filter} label={filter} variant="neutral" />
          ))}
        </ScrollView>
      </View>

      {incompleteProfile ? (
        <AppCard style={styles.profileCard}>
          <View style={styles.profileCardHeader}>
            <View style={styles.profileIconWrap}>
              <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.profileTextGroup}>
              <AppText variant="h3">Complete your profile</AppText>
              <AppText color={colors.textMuted}>
                Add your details so saved homes, messages, and viewing requests work better.
              </AppText>
            </View>
          </View>

          <AppButton title="Edit Profile" onPress={() => router.push('/profile/edit')} icon="create-outline" />
        </AppCard>
      ) : null}

      <View style={styles.sectionHeader}>
        <View>
          <AppText variant="h2">Featured listings</AppText>
          <AppText color={colors.textMuted}>Luxury visuals, trusted details, cleaner discovery.</AppText>
        </View>
      </View>

      <View style={styles.list}>
        {featured.map((property) => (
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
            onToggleSave={() => handleToggleSave(property)}
            onPress={() => router.push(`/property/${property.id}`)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 120,
  },
  hero: {
    gap: spacing.md,
  },
  searchBar: {
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.soft,
  },
  filterRow: {
    gap: spacing.sm,
  },
  profileCard: {
    gap: spacing.md,
  },
  profileCardHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  profileIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionHeader: {
    gap: spacing.xs,
  },
  list: {
    gap: spacing.lg,
  },
});
