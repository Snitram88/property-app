import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import { supabase } from '@/src/lib/supabase/client';
import { DatabaseProperty, fetchPropertyById } from '@/src/lib/properties/live-properties';

export default function ScheduleViewingScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const { user, profile } = useAuth();
  const [property, setProperty] = useState<DatabaseProperty | null>(null);

  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      if (!propertyId) return;

      try {
        const data = await fetchPropertyById(propertyId);
        if (active) {
          setProperty(data);
        }
      } catch (error) {
        console.error('Failed to load viewing property:', error);
      }
    }

    loadProperty();

    return () => {
      active = false;
    };
  }, [propertyId]);

  async function handleSubmit() {
    if (!preferredDate.trim() || !preferredTime.trim() || !phone.trim()) {
      Alert.alert('Missing details', 'Date, time, and phone number are required.');
      return;
    }

    if (!user?.id || !property?.id || !property.owner_id) {
      Alert.alert('Unavailable', 'This property is not ready for viewings yet.');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.from('viewing_requests').insert({
        user_id: user.id,
        seller_id: property.owner_id,
        property_id: property.id,
        property_ref: property.id,
        property_title: property.title,
        preferred_date: preferredDate.trim(),
        preferred_time: preferredTime.trim(),
        phone: phone.trim(),
        notes: notes.trim() || null,
      });

      if (error) {
        Alert.alert('Request failed', error.message);
        return;
      }

      Alert.alert('Viewing scheduled', 'Your viewing request has been recorded.');
      router.replace('/buyer/messages');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AppHeader
          title="Schedule Viewing"
          subtitle={property?.title ?? 'Book a property inspection'}
        />

        <AppCard>
          <View style={styles.form}>
            <AppText style={styles.helper}>
              Ask for a date and time that works for you. This now feeds directly into seller leads.
            </AppText>

            <AppInput
              label="Preferred date"
              value={preferredDate}
              onChangeText={setPreferredDate}
              placeholder="YYYY-MM-DD"
            />

            <AppInput
              label="Preferred time"
              value={preferredTime}
              onChangeText={setPreferredTime}
              placeholder="e.g. 2:00 PM"
            />

            <AppInput
              label="Phone number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <AppInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything the seller should know?"
              multiline
            />
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton
            title={submitting ? 'Scheduling...' : 'Schedule Viewing'}
            onPress={handleSubmit}
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
    gap: 16,
  },
  form: {
    gap: 16,
  },
  helper: {
    fontSize: 14,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
  },
});
