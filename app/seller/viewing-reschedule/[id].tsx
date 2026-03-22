import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { PropertyContextCard } from '@/src/components/property/PropertyContextCard';
import { getViewingLeadById, rescheduleViewingLead } from '@/src/lib/seller/lead-actions';
import { formatPrice } from '@/src/lib/properties/live-properties';
import { spacing } from '@/src/theme/spacing';

export default function SellerViewingRescheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [request, setRequest] = useState<any | null>(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!id) return;

      try {
        const row = await getViewingLeadById(id);
        if (!active || !row) return;

        setRequest(row);
        setPreferredDate(row.preferred_date ?? '');
        setPreferredTime(row.preferred_time ?? '');
        setNotes(row.notes ?? '');
      } catch (error) {
        console.error('Failed to load viewing request:', error);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  const priceLabel = useMemo(() => {
    if (request?.property_price_snapshot == null) return null;
    return formatPrice(request.property_price_snapshot);
  }, [request?.property_price_snapshot]);

  async function handleSave() {
    if (!preferredDate.trim() || !preferredTime.trim()) {
      Alert.alert('Missing details', 'Enter the new date and time for the rescheduled viewing.');
      return;
    }

    try {
      setSubmitting(true);
      await rescheduleViewingLead(id, preferredDate.trim(), preferredTime.trim(), notes.trim());
      Alert.alert('Viewing rescheduled', 'The viewing request has been updated.');
      router.back();
    } catch (error: any) {
      Alert.alert('Reschedule failed', error?.message ?? 'Could not reschedule viewing.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AppHeader
          title="Reschedule Viewing"
          subtitle="Update the date and time for this property viewing request"
        />

        {request ? (
          <PropertyContextCard
            title={request.property_title_snapshot ?? request.property_title ?? 'Viewing request'}
            locationText={request.property_location_snapshot ?? 'Property location'}
            address={request.property_address_snapshot}
            listingType={request.property_listing_type_snapshot}
            priceLabel={priceLabel}
            imageUrl={request.property_cover_image_snapshot}
          />
        ) : null}

        <AppCard>
          <View style={styles.form}>
            <AppInput
              label="New preferred date"
              value={preferredDate}
              onChangeText={setPreferredDate}
              placeholder="e.g. 2026-03-30"
            />

            <AppInput
              label="New preferred time"
              value={preferredTime}
              onChangeText={setPreferredTime}
              placeholder="e.g. 2:00 PM"
            />

            <AppInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional note for the buyer"
              multiline
            />
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton
            title={submitting ? 'Saving...' : 'Save Reschedule'}
            onPress={handleSave}
            icon="time-outline"
          />
          <AppButton
            title="Cancel"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>
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
  form: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
});
