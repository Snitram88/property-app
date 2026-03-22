import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Screen } from '@/src/components/ui/Screen';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppText } from '@/src/components/ui/AppText';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { SellerViewingCard } from '@/src/components/seller/SellerViewingCard';
import { useAuth } from '@/src/providers/AuthProvider';
import { fetchSellerViewingRequests } from '@/src/lib/properties/live-properties';
import { updateViewingLeadStatus } from '@/src/lib/seller/lead-actions';
import { spacing } from '@/src/theme/spacing';

export default function SellerViewingsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);

  async function loadRequests() {
    if (!user?.id) return;

    try {
      const rows = await fetchSellerViewingRequests(user.id);
      setRequests(rows);
    } catch (error) {
      console.error('Failed to load seller viewing requests:', error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        if (!active) return;
        await loadRequests();
      }

      load();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  async function handleConfirmViewing(id: string) {
    try {
      await updateViewingLeadStatus(id, 'confirmed');
      await loadRequests();
    } catch (error: any) {
      Alert.alert('Update failed', error?.message ?? 'Could not confirm viewing.');
    }
  }

  async function handleCloseLead(id: string) {
    try {
      await updateViewingLeadStatus(id, 'closed');
      await loadRequests();
    } catch (error: any) {
      Alert.alert('Update failed', error?.message ?? 'Could not close viewing lead.');
    }
  }

  function handleReschedule(id: string) {
    router.push(`/seller/viewing-reschedule/${id}` as any);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Viewing Requests"
          subtitle="Each request now carries the exact property context"
        />

        <View style={styles.hero}>
          <AppBadge label={`${requests.length} requests`} variant="warning" />
          <AppText variant="h2">See the property before you even open the request.</AppText>
          <AppText>
            Snapshot image, title, location, address, and timing now appear together for every viewing request.
          </AppText>
        </View>

        {requests.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No viewing requests yet"
            message="When buyers request a viewing, the property context will show here."
          />
        ) : (
          <View style={styles.list}>
            {requests.map((item) => (
              <SellerViewingCard
                key={item.id}
                requesterName={item.requester_name}
                phone={item.phone}
                preferredDate={item.preferred_date}
                preferredTime={item.preferred_time}
                notes={item.notes}
                status={item.status}
                createdAt={item.created_at}
                propertyTitle={item.property_title_snapshot ?? item.property_title}
                propertyLocation={item.property_location_snapshot}
                propertyAddress={item.property_address_snapshot}
                propertyListingType={item.property_listing_type_snapshot}
                propertyPrice={item.property_price_snapshot}
                propertyImage={item.property_cover_image_snapshot}
                onConfirmViewing={() => handleConfirmViewing(item.id)}
                onReschedule={() => handleReschedule(item.id)}
                onCloseLead={() => handleCloseLead(item.id)}
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
    paddingBottom: 60,
  },
  hero: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.lg,
  },
});
