import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { PropertyContextCard } from '@/src/components/property/PropertyContextCard';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { useAuth } from '@/src/providers/AuthProvider';
import { supabase } from '@/src/lib/supabase/client';
import { fetchPropertyById, formatPrice } from '@/src/lib/properties/live-properties';

export default function InquiryComposerScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const { user, profile } = useAuth();

  const [property, setProperty] = useState<any | null>(null);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [preferredContact, setPreferredContact] = useState<'phone' | 'whatsapp' | 'email'>('phone');
  const [message, setMessage] = useState('Hello, I’m interested in this property. Please share more details.');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      if (!propertyId) return;
      try {
        const data = await fetchPropertyById(propertyId);
        if (!active) return;
        setProperty(data);

        if (data?.title) {
          setMessage(`Hello, I’m interested in ${data.title} located at ${data.location_text}. Please share more details.`);
        }
      } catch (error) {
        console.error('Failed to load inquiry property:', error);
      }
    }

    loadProperty();

    return () => {
      active = false;
    };
  }, [propertyId]);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
    if (profile?.phone) setPhone(profile.phone);
  }, [profile?.full_name, profile?.phone]);

  const priceLabel = useMemo(() => {
    if (!property) return null;
    return property.listing_type === 'sale'
      ? formatPrice(property.price)
      : `${formatPrice(property.price)} / year`;
  }, [property]);

  async function submitInquiry() {
    if (!fullName.trim() || !phone.trim() || !message.trim()) {
      Alert.alert('Missing details', 'Please complete your name, phone number, and message.');
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
        Alert.alert('Unavailable', 'This property is no longer available for inquiry.');
        return;
      }

      const coverImage =
        property?.images?.find((item: any) => item.is_cover)?.image_url ??
        property?.cover_image_url ??
        null;

      const composedMessage = `${message.trim()}\n\nPreferred contact: ${preferredContact}`;

      const { error } = await supabase.from('inquiries').insert({
        property_id: liveProperty.id,
        landlord_id: liveProperty.owner_id,
        sender_name: fullName.trim(),
        sender_email: user?.email ?? null,
        sender_phone: phone.trim(),
        message: composedMessage,
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
        Alert.alert('Inquiry failed', error.message);
        return;
      }

      Alert.alert('Inquiry sent', 'Your message has been sent with the property context attached.');
      router.replace('/buyer/messages');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AppHeader title="Message Owner" subtitle="Your inquiry will include the property details automatically" />

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

            <View style={styles.contactGroup}>
              <AppText style={styles.groupLabel}>Preferred contact method</AppText>

              <View style={styles.options}>
                {(['phone', 'whatsapp', 'email'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.option, preferredContact === option && styles.optionActive]}
                    onPress={() => setPreferredContact(option)}
                  >
                    <AppText
                      style={[styles.optionText, preferredContact === option && styles.optionTextActive]}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <AppInput
              label="Message"
              value={message}
              onChangeText={setMessage}
              placeholder="Write your message"
              multiline
              style={styles.messageInput}
            />
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton
            title={submitting ? 'Sending...' : 'Send Inquiry'}
            onPress={submitInquiry}
            icon="send-outline"
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
  contactGroup: {
    gap: 10,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  optionTextActive: {
    color: colors.white,
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  actions: {
    gap: 12,
  },
});
