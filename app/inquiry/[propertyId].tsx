import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppText } from '@/src/components/ui/AppText';
import { mockProperties } from '@/src/constants/mockProperties';
import { colors } from '@/src/theme/colors';
import { useAuth } from '@/src/providers/AuthProvider';
import { supabase } from '@/src/lib/supabase/client';

export default function InquiryComposerScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const { user, profile } = useAuth();

  const property = useMemo(
    () => mockProperties.find((item) => item.id === propertyId),
    [propertyId]
  );

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [preferredContact, setPreferredContact] = useState<'phone' | 'whatsapp' | 'email'>('phone');
  const [message, setMessage] = useState(
    property?.title
      ? `Hello, I’m interested in ${property.title}. Please share more details.`
      : 'Hello, I’m interested in this property. Please share more details.'
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }

    if (profile?.phone) {
      setPhone(profile.phone);
    }
  }, [profile?.full_name, profile?.phone]);

  async function submitInquiry() {
    if (!fullName.trim() || !phone.trim() || !message.trim()) {
      Alert.alert('Missing details', 'Please complete your name, phone number, and message.');
      return;
    }

    try {
      setSubmitting(true);

      const { data: liveProperty } = await supabase
        .from('properties')
        .select('id, owner_id')
        .eq('id', propertyId)
        .maybeSingle();

      if (liveProperty?.id && liveProperty?.owner_id) {
        const composedMessage = `${message.trim()}\n\nPreferred contact: ${preferredContact}`;

        const { error } = await supabase.from('inquiries').insert({
          property_id: liveProperty.id,
          landlord_id: liveProperty.owner_id,
          sender_name: fullName.trim(),
          sender_email: user?.email ?? null,
          sender_phone: phone.trim(),
          message: composedMessage,
        });

        if (error) {
          Alert.alert('Inquiry failed', error.message);
          return;
        }

        Alert.alert('Inquiry sent', 'Your message has been sent to the seller dashboard.');
        router.replace('/buyer/messages');
        return;
      }

      Alert.alert(
        'Inquiry composer ready',
        'You just used the new premium inquiry flow. Live delivery activates when listings are connected to the database.'
      );
      router.replace('/buyer/messages');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <AppText style={styles.eyebrow}>Inquiry Composer</AppText>
          <AppText style={styles.title}>Contact owner</AppText>
          <AppText style={styles.subtitle}>
            {property?.title ?? 'Property inquiry'}
          </AppText>
        </View>

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
              numberOfLines={5}
              style={styles.messageInput}
            />
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton
            title={submitting ? 'Sending...' : 'Send Inquiry'}
            onPress={submitInquiry}
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
  header: {
    gap: 8,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
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
