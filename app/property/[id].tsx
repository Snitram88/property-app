import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { useAuth } from '@/src/providers/AuthProvider';
import { fetchSavedPropertyRefs, toggleSavedProperty } from '@/src/lib/properties/saved-properties';
import {
  PropertyWithMedia,
  fetchPropertyById,
  formatPrice,
  propertyToSnapshot,
} from '@/src/lib/properties/live-properties';
import {
  PropertyContactDetails,
  fetchPropertyContactDetails,
  openEmail,
  openPhoneDialer,
  openSms,
  openWhatsApp,
} from '@/src/lib/contact/property-contact';

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyWithMedia | null>(null);
  const [saved, setSaved] = useState(false);
  const [contact, setContact] = useState<PropertyContactDetails | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      if (!id) return;

      try {
        const item = await fetchPropertyById(id);
        if (active) {
          setProperty(item);
        }

        const details = await fetchPropertyContactDetails(id);
        if (active) {
          setContact(details);
        }

        if (user?.id && item?.id) {
          const refs = await fetchSavedPropertyRefs(user.id);
          if (active) {
            setSaved(refs.has(item.id));
          }
        }
      } catch (error) {
        console.error('Failed to load property details:', error);
      }
    }

    loadProperty();

    return () => {
      active = false;
    };
  }, [id, user?.id]);

  async function handleSave() {
    if (!user?.id || !property) {
      Alert.alert('Sign in required', 'Please sign in to save properties.');
      return;
    }

    try {
      const next = await toggleSavedProperty(user.id, propertyToSnapshot(property));
      setSaved(next);
    } catch (error: any) {
      Alert.alert('Save failed', error?.message ?? 'Please try again.');
    }
  }

  async function handlePhoneAction() {
    if (!contact?.seller_phone) {
      Alert.alert('Unavailable', 'Seller phone number is not available.');
      return;
    }

    const phone = contact.seller_phone;
    const message = property?.title
      ? `Hello, I’m interested in ${property.title}.`
      : 'Hello, I’m interested in your property.';

    Alert.alert('Phone Contact', 'Choose how you want to reach the seller.', [
      {
        text: 'Call',
        onPress: async () => {
          try {
            await openPhoneDialer(phone);
          } catch (error: any) {
            Alert.alert('Call failed', error?.message ?? 'Unable to open dialer.');
          }
        },
      },
      {
        text: 'Send SMS',
        onPress: async () => {
          try {
            await openSms(phone, message);
          } catch (error: any) {
            Alert.alert('SMS failed', error?.message ?? 'Unable to open messaging app.');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function handleWhatsApp() {
    if (!contact?.seller_whatsapp) {
      Alert.alert('Unavailable', 'Seller WhatsApp number is not available.');
      return;
    }

    const message = property?.title
      ? `Hello, I’m interested in ${property.title}.`
      : 'Hello, I’m interested in your property.';

    try {
      await openWhatsApp(contact.seller_whatsapp, message);
    } catch (error: any) {
      Alert.alert('WhatsApp failed', error?.message ?? 'Unable to open WhatsApp.');
    }
  }

  async function handleEmail() {
    if (!contact?.seller_email) {
      Alert.alert('Unavailable', 'Seller email is not available.');
      return;
    }

    const subject = property?.title
      ? `Inquiry about ${property.title}`
      : 'Property inquiry';

    const body = property?.title
      ? `Hello,\n\nI’m interested in ${property.title}. Please share more details.\n`
      : 'Hello,\n\nI’m interested in your property. Please share more details.\n';

    try {
      await openEmail(contact.seller_email, subject, body);
    } catch (error: any) {
      Alert.alert('Email failed', error?.message ?? 'Unable to open email app.');
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader
          title="Property Details"
          subtitle={property?.location_text ?? 'Live listing'}
          rightSlot={
            <Pressable style={styles.saveIconButton} onPress={handleSave}>
              <Ionicons
                name={saved ? 'heart' : 'heart-outline'}
                size={20}
                color={saved ? '#DC2626' : colors.text}
              />
            </Pressable>
          }
        />

        <AppText style={styles.propertyTitle}>{property?.title ?? 'Property Details'}</AppText>

        {property?.images?.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
            {property.images.map((image) => (
              <Image
                key={image.id}
                source={image.image_url}
                style={styles.galleryImage}
                contentFit="cover"
              />
            ))}
          </ScrollView>
        ) : null}

        <AppCard>
          <View style={styles.content}>
            <AppText style={styles.price}>
              {property
                ? property.listing_type === 'sale'
                  ? formatPrice(property.price)
                  : `${formatPrice(property.price)} / year`
                : 'Price on request'}
            </AppText>
            <AppText style={styles.meta}>
              {property?.bedrooms ?? 0} beds • {property?.bathrooms ?? 0} baths • {property?.listing_type ?? 'listing'}
            </AppText>
            <AppText style={styles.description}>
              {property?.description ?? 'This listing will display its live property details here.'}
            </AppText>
          </View>
        </AppCard>

        {contact?.is_owner ? (
          <AppCard>
            <View style={styles.content}>
              <AppText style={styles.contactTitle}>Seller Preview Mode</AppText>
              <AppText style={styles.contactText}>
                You are viewing your own listing. Buyer contact actions are hidden here.
              </AppText>
              <View style={styles.actions}>
                <AppButton title="Edit Listing" onPress={() => router.push(`/listing/edit/${property?.id}`)} />
              </View>
            </View>
          </AppCard>
        ) : (
          <>
            <AppCard>
              <View style={styles.content}>
                <AppText style={styles.contactTitle}>In-App Contact</AppText>
                <AppText style={styles.contactText}>
                  Use this to start or continue a tracked conversation inside the app.
                </AppText>

                <View style={styles.actions}>
                  <AppButton title="Message Owner" onPress={() => router.push(`/inquiry/${id}`)} />
                  <AppButton
                    title="Schedule Viewing"
                    variant="secondary"
                    onPress={() => router.push(`/viewing/${id}`)}
                  />
                </View>
              </View>
            </AppCard>

            <AppCard>
              <View style={styles.content}>
                <AppText style={styles.contactTitle}>Quick External Contact</AppText>
                <AppText style={styles.contactText}>
                  These buttons open your phone, SMS, WhatsApp, or email app directly and do not create an in-app message.
                </AppText>

                <View style={styles.actions}>
                  <AppButton title="Phone / SMS" variant="secondary" onPress={handlePhoneAction} />
                  <AppButton title="WhatsApp" variant="secondary" onPress={handleWhatsApp} />
                  <AppButton title="Email" variant="secondary" onPress={handleEmail} />
                </View>
              </View>
            </AppCard>
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
  saveIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  propertyTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text,
  },
  galleryRow: {
    gap: 12,
  },
  galleryImage: {
    width: 280,
    height: 220,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  content: {
    gap: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  meta: {
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  contactText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  actions: {
    gap: 12,
  },
});
