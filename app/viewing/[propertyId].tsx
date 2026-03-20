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
import { PropertyWithMedia, fetchPropertyById } from '@/src/lib/properties/live-properties';

export default function ScheduleViewingScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const { user, profile } = useAuth();
  const [property, setProperty] = useState<PropertyWithMedia | null>(null);

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

        if (!active) return;

        setProperty(data);

        if (data?.owner_id && user?.id && data.owner_id === user.id) {
          Alert.alert(
            'Seller Preview Mode',
            'You cannot schedule a viewing for your own listing.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      } catch (error) {
        console.error('Failed to load viewing property:', error);
      }
    }

    loadProperty();

    return () => {
      active = false;
    };
  }, [propertyId, user?.id]);

  async function handleSubmit() {
    if (!preferredDate.trim() || !preferredTime.trim() || !phone.trim()) {
      Alert.alert('Missing details', 'Date, time, and phone number are required.');
      return;
    }

    if (!user?.id || !property?.id) {
      Alert.alert('Unavailable', 'This property is not ready for viewing requests yet.');
      return;
    }

    if (property.owner_id === user.id) {
      Alert.alert('Seller Preview Mode', 'You cannot schedule a viewing for your own listing.');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.rpc('start_viewing_request', {
        p_property_id: property.id,
        p_phone: phone.trim(),
        p_preferred_date: preferredDate.trim(),
        p_preferred_time: preferredTime.trim(),
        p_notes: notes.trim(),
      });

      if (error) {
        Alert.alert('Request failed', error.message);
        return;
      }

      Alert.alert('Viewing scheduled', 'Your viewing request has been sent to the seller.');
      router.replace('/buyer/messages');
    } finally {
      setSubmitting(false);
    }
  }

  const isOwner = property?.owner_id && user?.id ? property.owner_id === user.id : false;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AppHeader
          title="Schedule Viewing"
          subtitle={property?.title ?? 'Book a property inspection'}
        />

        {isOwner ? (
          <AppCard>
            <View style={styles.notice}>
              <AppText style={styles.noticeTitle}>Seller Preview Mode</AppText>
              <AppText style={styles.noticeText}>
                You cannot schedule a viewing for your own listing.
              </AppText>
              <AppButton title="Back" onPress={() => router.back()} />
            </View>
          </AppCard>
        ) : (
          <>
            <AppCard>
              <View style={styles.form}>
                <AppText style={styles.helper}>
                  Request a date and time that works for you. This will be sent to the seller as a viewing request.
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
          </>
        )}
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
  notice: {
    gap: 12,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
  },
});
