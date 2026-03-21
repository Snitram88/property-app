import { ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { SellerListingCard } from '@/src/components/property/SellerListingCard';
import { useAuth } from '@/src/providers/AuthProvider';
import { fetchSellerProperties, PropertyWithMedia } from '@/src/lib/properties/live-properties';
import { spacing } from '@/src/theme/spacing';

export default function SellerPropertiesScreen() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PropertyWithMedia[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        if (!user?.id) return;

        try {
          const listings = await fetchSellerProperties(user.id);
          if (active) setProperties(listings);
        } catch (error) {
          console.error('Failed to load seller properties:', error);
        }
      }

      load();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  const approved = properties.filter((item) => item.verification_status === 'approved').length;
  const pending = properties.filter((item) => item.verification_status === 'pending').length;
  const rejected = properties.filter((item) => item.verification_status === 'rejected').length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <AppBadge label="Seller Listings" variant="primary" />
          <AppText variant="display">Manage your property portfolio.</AppText>
          <AppText>
            Review listing statuses, edit rejected properties, and keep your inventory polished for approval.
          </AppText>
        </View>

        <View style={styles.statusRow}>
          <AppBadge label={`Approved ${approved}`} variant="verified" />
          <AppBadge label={`Pending ${pending}`} variant="warning" />
          <AppBadge label={`Rejected ${rejected}`} variant="danger" />
        </View>

        <SectionHeader
          title="Your listings"
          subtitle="Every listing shows its review state, imagery, and admin feedback."
          rightSlot={
            <AppButton title="New Listing" onPress={() => router.push('/listing/create')} icon="add-outline" />
          }
        />

        {properties.length === 0 ? (
          <EmptyState
            icon="home-outline"
            title="No listings yet"
            message="Create your first premium property listing and send it for admin review."
            actionLabel="Create listing"
            onAction={() => router.push('/listing/create')}
          />
        ) : (
          <View style={styles.list}>
            {properties.map((property) => (
              <SellerListingCard
                key={property.id}
                property={property}
                onOpen={() => router.push(`/property/${property.id}`)}
                onEdit={() => router.push(`/listing/edit/${property.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
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
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  list: {
    gap: spacing.lg,
  },
});
