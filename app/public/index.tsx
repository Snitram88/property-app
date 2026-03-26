import { ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { GuestAuthGate } from '@/src/components/auth/GuestAuthGate';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppText } from '@/src/components/ui/AppText';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { PublicPropertyCard } from '@/src/components/public/PublicPropertyCard';
import {
  PropertyWithMedia,
  formatPrice,
  searchPublishedProperties,
} from '@/src/lib/properties/live-properties';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

const LISTING_TYPES = [
  { label: 'Buy', value: 'sale' },
  { label: 'Rent', value: 'rent' },
  { label: 'Lease', value: 'lease' },
] as const;

function HeroChip({
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

export default function PublicHomeScreen() {
  const [properties, setProperties] = useState<PropertyWithMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [authGateVisible, setAuthGateVisible] = useState(false);
  const [authGateReason, setAuthGateReason] = useState('');

  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [stateValue, setStateValue] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [listingType, setListingType] = useState<'' | 'rent' | 'lease' | 'sale'>('');

  async function loadListings() {
    try {
      setLoading(true);

      const listings = await searchPublishedProperties({
        city,
        area,
        state: stateValue,
        propertyType,
        listingType,
      });

      setProperties(listings);
    } catch (error: any) {
      console.error('Failed to load public listings:', error?.message ?? error, error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [])
  );

  function clearFilters() {
    setCity('');
    setArea('');
    setStateValue('');
    setPropertyType('');
    setListingType('');
    setShowMoreFilters(false);
  }

  function openAuthGate(reason: string) {
    setAuthGateReason(reason);
    setAuthGateVisible(true);
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCardWrap}>
          <Image
            source="https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=80"
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={styles.heroOverlay}>
            <AppBadge label="Public Discovery" variant="premium" />
            <AppText style={styles.heroTitle}>
              Explore premium property listings before you sign in.
            </AppText>
            <AppText style={styles.heroSubtitle}>
              Browse first. Register only when you want to save, message, schedule, or list a property.
            </AppText>

            <View style={styles.heroActionsRow}>
              <View style={styles.heroActionHalf}>
                <AppButton
                  title="Sign In"
                  onPress={() => router.push('/(auth)/login')}
                  icon="log-in-outline"
                />
              </View>
              <View style={styles.heroActionHalf}>
                <AppButton
                  title="List Property"
                  variant="secondary"
                  onPress={() =>
                    openAuthGate(
                      'Listing a property requires an account so we can onboard you as a seller and verify your identity.'
                    )
                  }
                  icon="add-circle-outline"
                />
              </View>
            </View>
          </View>
        </View>

        <AppCard style={styles.searchPanel}>
          <View style={styles.searchHeader}>
            <View style={styles.searchTitleRow}>
              <Ionicons name="search-outline" size={18} color={colors.primary} />
              <AppText variant="h3">Search Listings</AppText>
            </View>
            <AppText color={colors.textMuted}>
              {loading
                ? 'Searching listings...'
                : `${properties.length} listing${properties.length === 1 ? '' : 's'} available`}
            </AppText>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <AppInput
                label="City"
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Ikeja"
                autoCapitalize="words"
              />
            </View>
            <View style={styles.col}>
              <AppInput
                label="Area / Address"
                value={area}
                onChangeText={setArea}
                placeholder="e.g. Yaba, Lekki"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.filterSection}>
            <AppText variant="title">Preference</AppText>
            <View style={styles.preferenceRow}>
              {LISTING_TYPES.map((item) => (
                <View key={item.value} style={styles.preferenceButton}>
                  <HeroChip
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

          <View style={styles.moreFilterRow}>
            <View style={styles.moreFilterButton}>
              <AppButton
                title={showMoreFilters ? 'Hide Filters' : 'More Filters'}
                variant="secondary"
                onPress={() => setShowMoreFilters((prev) => !prev)}
                icon={showMoreFilters ? 'chevron-up-outline' : 'options-outline'}
              />
            </View>
          </View>

          {showMoreFilters ? (
            <View style={styles.row}>
              <View style={styles.col}>
                <AppInput
                  label="State"
                  value={stateValue}
                  onChangeText={setStateValue}
                  placeholder="e.g. Lagos"
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.col}>
                <AppInput
                  label="Property Type"
                  value={propertyType}
                  onChangeText={setPropertyType}
                  placeholder="e.g. Duplex, Flat, Land"
                  autoCapitalize="words"
                />
              </View>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <View style={styles.actionHalf}>
              <AppButton
                title={loading ? 'Searching...' : 'Search'}
                onPress={loadListings}
                icon="search-outline"
              />
            </View>
            <View style={styles.actionHalf}>
              <AppButton
                title="Clear"
                variant="secondary"
                onPress={clearFilters}
                icon="refresh-outline"
              />
            </View>
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.infoBlock}>
            <AppBadge label="Guest Browsing Enabled" variant="verified" />
            <AppText variant="h3">See value before registration</AppText>
            <AppText color={colors.textMuted}>
              Anyone can browse and search properties. Sign in only when you want to save, message, schedule a viewing, or list a property.
            </AppText>
          </View>
        </AppCard>

        <View style={styles.sectionHeader}>
          <View>
            <AppText variant="h2">Featured listings</AppText>
            <AppText color={colors.textMuted}>
              Publicly visible approved properties across your search preferences.
            </AppText>
          </View>
        </View>

        {properties.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No listings found"
            message="Try changing your search filters to see more available properties."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <View style={styles.list}>
            {properties.map((property) => (
              <PublicPropertyCard
                key={property.id}
                title={property.title}
                location={property.location_text}
                price={
                  property.listing_type === 'sale'
                    ? formatPrice(property.price)
                    : `${formatPrice(property.price)} / year`
                }
                listingType={
                  property.listing_type.charAt(0).toUpperCase() + property.listing_type.slice(1)
                }
                beds={property.bedrooms}
                baths={property.bathrooms}
                imageUrl={property.cover_image_url}
                onPress={() => router.push(`/property/${property.id}`)}
                onAuthPrompt={() =>
                  openAuthGate('Save, contact, and viewing actions are reserved for registered users.')
                }
              />
            ))}
          </View>
        )}
      </ScrollView>

      <GuestAuthGate
        visible={authGateVisible}
        reason={authGateReason}
        onClose={() => setAuthGateVisible(false)}
        onSignIn={() => {
          setAuthGateVisible(false);
          router.push('/(auth)/login');
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 60,
  },
  heroCardWrap: {
    overflow: 'hidden',
    borderRadius: radius.xl,
    minHeight: 360,
    backgroundColor: colors.backgroundMuted,
  },
  heroImage: {
    width: '100%',
    height: 360,
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.56)',
    padding: spacing.xl,
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    color: colors.white,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.9)',
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroActionHalf: {
    flex: 1,
  },
  searchPanel: {
    gap: spacing.sm,
  },
  searchHeader: {
    gap: 4,
  },
  searchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  col: {
    flex: 1,
  },
  filterSection: {
    gap: spacing.xs,
  },
  preferenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  preferenceButton: {
    minWidth: 92,
    flexGrow: 1,
  },
  moreFilterRow: {
    alignItems: 'flex-start',
  },
  moreFilterButton: {
    minWidth: 150,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionHalf: {
    flex: 1,
  },
  infoBlock: {
    gap: spacing.sm,
  },
  sectionHeader: {
    gap: spacing.xs,
  },
  list: {
    gap: spacing.lg,
  },
});
