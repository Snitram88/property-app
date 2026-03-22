import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { PropertyContextCard } from '@/src/components/property/PropertyContextCard';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { useAuth } from '@/src/providers/AuthProvider';
import { supabase } from '@/src/lib/supabase/client';
import { fetchPropertyById, formatPrice } from '@/src/lib/properties/live-properties';

export default function ScheduleViewingScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const { user, profile } = useAuth();

  const [property, setProperty] = useState<any | null>(null);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      if (!propertyId) return;
      try {
        const data = await fetchPropertyById(propertyId);
        if (!active) return;
        setProperty(data);
      } catch (error) {
        console.error('Failed to load viewing property:', error);
      }
    }

    loadProperty();

    return () => {
      active = false;
    };
  }, [propertyId]);

  const priceLabel = useMemo(() => {
    if (!property) return null;
    return property.listing_type === 'sale'
      ? formatPrice(property.price)
      : `${formatPrice(property.price)} / year`;
  }, [property]);

  async function submitViewingRequest() {
    if (!fullName.trim() || !phone.trim() || !preferredDate.trim() || !preferredTime.trim()) {
      Alert.alert('Missing details', 'Please complete your name, phone, preferred date, and preferred time.');
      return;
    }

    try {
      setSubmitting(true);

      const { data: liveProperty, error: propertyError } = await supabase
        .from('properties')
        .select('id, owner_id, title, location_text, address, listing_type, price, latitude, longitude')
        .eq('id', propertyId)
        .maybeSingle();

      if (propertyError) {
        Alert.alert('Property error', propertyError.message);
        return;
      }

      if (!liveProperty?.id || !liveProperty?.owner_id) {
        Alert.alert('Unavailable', 'This property is no longer available for viewing requests.');
        return;
      }

      const coverImage =
        property?.images?.find((item: any) => item.is_cover)?.image_url ??
        property?.cover_image_url ??
        null;

      const { error } = await supabase.from('viewing_requests').insert({
        seller_id: liveProperty.owner_id,
        buyer_id: user?.id ?? null,
        property_ref: liveProperty.id,
        property_title: liveProperty.title,
        requester_name: fullName.trim(),
        phone: phone.trim(),
        preferred_date: preferredDate.trim(),
        preferred_time: preferredTime.trim(),
        notes: notes.trim() || null,
        status: 'pending',
        property_title_snapshot: liveProperty.title,
        property_location_snapshot: liveProperty.location_text,
        property_address_snapshot: liveProperty.address,
        property_listing_type_snapshot: liveProperty.listing_type,
        property_price_snapshot: liveProperty.price,
        property_cover_image_snapshot: coverImage,
        property_latitude_snapshot: liveProperty.latitude,
        property_longitude_snapshot: liveProperty.longitude,
      });

      if (error) {
        Alert.alert('Viewing request failed', error.message);
        return;
      }

      Alert.alert('Viewing requested', 'Your viewing request has been sent with the property details attached.');
      router.back();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AppHeader title="Schedule Viewing" subtitle="Your request will include the selected property details automatically" />

        {property ? (
          <PropertyContextCard
            title={property.title}
            locationText={property.location_text}
            address={property.address}
            listingType={property.listing_type?.toUpperCase?.() ?? property.listing_type}
            priceLabel={priceLabel}
            imageUrl={property.cover_image_url}
          />
        ) : null}

        <AppCard>
          <View style={styles.form}>
            <AppInput
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              autoCapitalize="words"
            />

            <AppInput
              label="Phone number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <AppInput
              label="Preferred date"
              value={preferredDate}
              onChangeText={setPreferredDate}
              placeholder="e.g. 2026-03-25"
            />

            <AppInput
              label="Preferred time"
              value={preferredTime}
              onChangeText={setPreferredTime}
              placeholder="e.g. 11:00 AM"
            />

            <AppInput
              label="Additional notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything the seller should know?"
              multiline
            />
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton
            title={submitting ? 'Sending...' : 'Send Viewing Request'}
            onPress={submitViewingRequest}
            icon="calendar-outline"
          />
          <AppButton title="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20,
  },
  form: {
    gap: 16,
  },
  actions: {
    gap: 12,
  },
});
