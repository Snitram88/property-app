import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { useAuth } from '@/src/providers/AuthProvider';
import { PropertyWithMedia, fetchPropertyById } from '@/src/lib/properties/live-properties';
import { startPropertyConversation } from '@/src/lib/chat/conversations';

export default function InquiryComposerScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const { user, profile } = useAuth();
  const [property, setProperty] = useState<PropertyWithMedia | null>(null);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [preferredContact, setPreferredContact] = useState<'phone' | 'whatsapp' | 'email'>('phone');
  const [message, setMessage] = useState('Hello, I’m interested in this property. Please share more details.');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
    if (profile?.phone) setPhone(profile.phone);
  }, [profile?.full_name, profile?.phone]);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      if (!propertyId) return;

      try {
        const data = await fetchPropertyById(propertyId);
        if (active) {
          setProperty(data);
          if (data?.title) {
            setMessage(`Hello, I’m interested in ${data.title}. Please share more details.`);
          }
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

  async function submitInquiry() {
    if (!fullName.trim() || !phone.trim() || !message.trim()) {
      Alert.alert('Missing details', 'Please complete your name, phone number, and message.');
      return;
    }

    if (!property?.id || !property.owner_id || !user?.id) {
      Alert.alert('Unavailable', 'This property is not ready for conversations yet.');
      return;
    }

    try {
      setSubmitting(true);

      const conversationId = await startPropertyConversation({
        propertyId: property.id,
        landlordId: property.owner_id,
        senderName: fullName.trim(),
        senderEmail: user.email ?? null,
        senderPhone: phone.trim(),
        message: message.trim(),
        preferredContact,
      });

      Alert.alert('Conversation started', 'Your message has been sent to the seller.');
      router.replace(`/messages/${conversationId}`);
    } catch (error: any) {
      Alert.alert('Inquiry failed', error?.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AppHeader
          title="Contact Owner"
          subtitle={property?.title ?? 'Property inquiry'}
        />

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
            />
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton
            title={submitting ? 'Sending...' : 'Send Message'}
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
  actions: {
    gap: 12,
  },
});
