import { Alert, ScrollView, StyleSheet, View } from 'react-native';
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

        if (!active) return;

        setProperty(data);

        if (data?.title) {
          setMessage(`Hello, I’m interested in ${data.title}. Please share more details.`);
        }

        if (data?.owner_id && user?.id && data.owner_id === user.id) {
          Alert.alert(
            'Seller Preview Mode',
            'You cannot message your own listing.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      } catch (error) {
        console.error('Failed to load inquiry property:', error);
      }
    }

    loadProperty();

    return () => {
      active = false;
    };
  }, [propertyId, user?.id]);

  async function submitInquiry() {
    if (!fullName.trim() || !phone.trim() || !message.trim()) {
      Alert.alert('Missing details', 'Please complete your name, phone number, and message.');
      return;
    }

    if (!property?.id || !property.owner_id || !user?.id) {
      Alert.alert('Unavailable', 'This property is not ready for conversations yet.');
      return;
    }

    if (property.owner_id === user.id) {
      Alert.alert('Seller Preview Mode', 'You cannot message your own listing.');
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
        preferredContact: 'in_app',
      });

      Alert.alert('Conversation started', 'Your in-app message has been sent to the seller.');
      router.replace(`/messages/${conversationId}`);
    } catch (error: any) {
      Alert.alert('Message failed', error?.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const isOwner = property?.owner_id && user?.id ? property.owner_id === user.id : false;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AppHeader
          title="Message Owner"
          subtitle={property?.title ?? 'In-app conversation'}
        />

        {isOwner ? (
          <AppCard>
            <View style={styles.notice}>
              <AppText style={styles.noticeTitle}>Seller Preview Mode</AppText>
              <AppText style={styles.noticeText}>
                This is your own listing, so in-app messaging is disabled here.
              </AppText>
              <AppButton title="Back" onPress={() => router.back()} />
            </View>
          </AppCard>
        ) : (
          <>
            <AppCard>
              <View style={styles.form}>
                <AppText style={styles.helperText}>
                  This sends an in-app message and creates or continues a conversation thread inside the app.
                </AppText>

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
                title={submitting ? 'Sending...' : 'Send In-App Message'}
                onPress={submitInquiry}
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
    gap: 20,
  },
  form: {
    gap: 16,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  notice: {
    gap: 12,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  actions: {
    gap: 12,
  },
});
