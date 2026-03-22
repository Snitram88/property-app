import { ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { PropertyCard } from '@/src/components/property/PropertyCard';
import { useAuth } from '@/src/providers/AuthProvider';
import {
  formatPrice,
  PropertyWithMedia,
  searchPublishedProperties,
} from '@/src/lib/properties/live-properties';
import { fetchSavedPropertyRefs, toggleSavedProperty } from '@/src/lib/properties/saved-properties';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { shadows } from '@/src/theme/shadows';
import { radius } from '@/src/theme/radius';

const LISTING_TYPES = [
  { label: 'Buy', value: 'sale' },
  { label: 'Rent', value: 'rent' },
  { label: 'Lease', value: 'lease' },
] as const;

const PROPERTY_TYPES = ['Flat', 'Duplex', 'Bungalow', 'Terrace', 'Land', 'Office'];

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <AppButton
      title={label}
      variant={active ? 'primary' : 'secondary'}
      onPress={onPress}
    />
  );
}

export default function BuyerDiscoverScreen() {
  const { user, profile } = useAuth();

  const [properties, setProperties] = useState<PropertyWithMedia[]>([]);
  const [savedRefs, setSavedRefs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [stateValue, setStateValue] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [listingType, setListingType] = useState<'' | 'rent' | 'lease' | 'sale'>('');

  const incompleteProfile = !profile?.full_name || !profile?.phone;

  async function loadListings() {
    try {
      setLoading(true);

      const [listings, saved] = await Promise.all([
        searchPublishedProperties({
          city,
          area,
          state: stateValue,
          propertyType,
          listingType,
        }),
        user?.id ? fetchSavedPropertyRefs(user.id) : Promise.resolve(new Set<string>()),
      ]);

      setProperties(listings);
      setSavedRefs(saved);
    } catch (error) {
      console.error('Failed to load discover screen:', error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [user?.id])
  );

  const resultCountText = useMemo(() => {
    if (loading) return 'Searching listings...';
    if (properties.length === 0) return 'No matching listings found';
    return `${properties.length} listing${properties.length === 1 ? '' : 's'} found`;
  }, [loading, properties.length]);

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

  function clearFilters() {
    setCity('');
    setArea('');
    setStateValue('');
    setPropertyType('');
    setListingType('');
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <AppBadge label="Buyer Mode" variant="primary" />
        <AppText variant="display">Find your next address.</AppText>
        <AppText color={colors.textMuted}>
          Search verified homes by city, area, state, property type, and whether you want to buy, rent, or lease.
        </AppText>
      </View>

      <AppCard style={styles.searchPanel}>
        <View style={styles.searchHeader}>
          <View style={styles.searchTitleRow}>
            <Ionicons name="search-outline" size={18} color={colors.primary} />
            <AppText variant="h3">Smart Search</AppText>
          </View>
          <AppText color={colors.textMuted}>{resultCountText}</AppText>
        </View>

        <View style={styles.formGroup}>
          <AppInput
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Ikeja"
            autoCapitalize="words"
          />

          <AppInput
            label="Area / Address"
            value={area}
            onChangeText={setArea}
            placeholder="e.g. Yaba, Lekki Phase 1"
            autoCapitalize="words"
          />

          <AppInput
            label="State"
            value={stateValue}
            onChangeText={setStateValue}
            placeholder="e.g. Lagos"
            autoCapitalize="words"
          />

          <AppInput
            label="Property Type"
            value={propertyType}
            onChangeText={setPropertyType}
            placeholder="e.g. Flat, Duplex, Land"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.filterSection}>
          <AppText variant="title">Quick property type</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {PROPERTY_TYPES.map((type) => (
              <FilterChip
                key={type}
                label={type}
                active={propertyType.toLowerCase() === type.toLowerCase()}
                onPress={() =>
                  setPropertyType((current) =>
                    current.toLowerCase() === type.toLowerCase() ? '' : type
                  )
                }
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterSection}>
          <AppText variant="title">Listing type</AppText>
          <View style={styles.listingTypeRow}>
            {LISTING_TYPES.map((item) => (
              <View key={item.value} style={styles.listingTypeButton}>
                <FilterChip
                  label={item.label}
                  active={listingType === item.value}
                  onPress={() =>
                    setListingType((current) => (current === item.value ? '' : item.value))
                  }
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionRow}>
          <AppButton title={loading ? 'Searching...' : 'Search Listings'} onPress={loadListings} icon="search-outline" />
          <AppButton title="Clear Filters" variant="secondary" onPress={clearFilters} icon="refresh-outline" />
        </View>
      </AppCard>

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
          <AppText variant="h2">Available listings</AppText>
          <AppText color={colors.textMuted}>
            Search results across approved and available properties.
          </AppText>
        </View>
      </View>

      {properties.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No matching listings"
          message="Try changing city, area, state, property type, or listing type to see more results."
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : (
        <View style={styles.list}>
          {properties.map((property) => (
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
  hero: {
    gap: spacing.md,
  },
  searchPanel: {
    gap: spacing.md,
  },
  searchHeader: {
    gap: spacing.xs,
  },
  searchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  formGroup: {
    gap: spacing.md,
  },
  filterSection: {
    gap: spacing.sm,
  },
  chipRow: {
    gap: spacing.sm,
  },
  listingTypeRow: {
    gap: spacing.sm,
  },
  listingTypeButton: {
    marginBottom: spacing.xs,
  },
  actionRow: {
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
