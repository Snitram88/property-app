import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { GuestAuthGate } from '@/src/components/auth/GuestAuthGate';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { ZoomViewer } from '@/src/components/media/ZoomViewer';
import { PropertyLocationCard } from '@/src/components/property/PropertyLocationCard';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';
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

function MetaPill({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.metaPill}>
      <Ionicons name={icon} size={15} color={colors.textMuted} />
      <AppText color={colors.textMuted}>{label}</AppText>
    </View>
  );
}

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [property, setProperty] = useState<PropertyWithMedia | null>(null);
  const [saved, setSaved] = useState(false);
  const [contact, setContact] = useState<PropertyContactDetails | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [authGateVisible, setAuthGateVisible] = useState(false);
  const [authGateReason, setAuthGateReason] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      if (!id) return;

      try {
        const item = await fetchPropertyById(id);
        if (active) setProperty(item);

        const details = await fetchPropertyContactDetails(id);
        if (active) setContact(details);

        if (user?.id && item?.id) {
          const refs = await fetchSavedPropertyRefs(user.id);
          if (active) setSaved(refs.has(item.id));
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

  const viewerImages = useMemo(
    () => (property?.images ?? []).map((image) => ({ uri: image.image_url })),
    [property?.images]
  );

  function openAuthGate(reason: string) {
    setAuthGateReason(reason);
    setAuthGateVisible(true);
  }

  async function handleSave() {
    if (!user?.id || !property) {
      openAuthGate('Saving properties to your wishlist requires an account.');
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

    const subject = property?.title ? `Inquiry about ${property.title}` : 'Property inquiry';
    const body = property?.title
      ? `Hello,\n\nI’m interested in ${property.title}. Please share more details.\n`
      : 'Hello,\n\nI’m interested in your property. Please share more details.\n';

    try {
      await openEmail(contact.seller_email, subject, body);
    } catch (error: any) {
      Alert.alert('Email failed', error?.message ?? 'Unable to open email app.');
    }
  }

  function openViewer(index: number) {
    setSelectedImageIndex(index);
    setViewerVisible(true);
  }

  const isGuest = !user?.id;
  const isOwner = !!contact?.is_owner;

  return (
    <>
      <Screen>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <AppHeader
            title="Property Details"
            subtitle={property?.location_text ?? 'Live listing'}
            rightSlot={
              <Pressable style={styles.iconButton} onPress={handleSave}>
                <Ionicons
                  name={saved ? 'heart' : 'heart-outline'}
                  size={20}
                  color={saved ? '#DC2626' : colors.text}
                />
              </Pressable>
            }
          />

          <View style={styles.heroBlock}>
            <AppText variant="display">{property?.title ?? 'Property Details'}</AppText>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
              {(property?.images ?? []).map((image, index) => (
                <Pressable key={image.id} onPress={() => openViewer(index)}>
                  <Image source={image.image_url} style={styles.galleryImage} contentFit="cover" />
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <AppCard>
            <View style={styles.priceBlock}>
              <View style={styles.priceHeader}>
                <AppText variant="h1" color={colors.primary}>
                  {property
                    ? property.listing_type === 'sale'
                      ? formatPrice(property.price)
                      : `${formatPrice(property.price)} / year`
                    : 'Price on request'}
                </AppText>

                {property?.verification_status === 'approved' ? (
                  <AppBadge label="Verified" variant="verified" />
                ) : null}
              </View>

              <View style={styles.metaRow}>
                <MetaPill icon="bed-outline" label={`${property?.bedrooms ?? 0} Beds`} />
                <MetaPill icon="water-outline" label={`${property?.bathrooms ?? 0} Baths`} />
                <MetaPill
                  icon="pricetag-outline"
                  label={property?.listing_type ? property.listing_type.toUpperCase() : 'LISTING'}
                />
              </View>

              <AppText>
                {property?.description ?? 'This listing will display its live property details here.'}
              </AppText>
            </View>
          </AppCard>

          <PropertyLocationCard
            title={property?.title}
            locationText={property?.location_text}
            address={property?.address}
            latitude={property?.latitude}
            longitude={property?.longitude}
          />

          {isGuest ? (
            <AppCard>
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
                  <AppText variant="h3">Browse freely. Engage after sign-in.</AppText>
                </View>
                <AppText color={colors.textMuted}>
                  You can explore listing details and images as a guest. To save this home, message the owner, or schedule a viewing, create an account first.
                </AppText>

                <View style={styles.lockedActions}>
                  <AppButton
                    title="Save Listing"
                    variant="secondary"
                    onPress={() => openAuthGate('Saving listings requires an account so you can keep your wishlist across sessions.')}
                    icon="heart-outline"
                  />
                  <AppButton
                    title="Message Owner"
                    variant="secondary"
                    onPress={() => openAuthGate('Messaging an owner requires an account so your conversation can be tracked securely.')}
                    icon="chatbubble-outline"
                  />
                  <AppButton
                    title="Schedule Viewing"
                    variant="secondary"
                    onPress={() => openAuthGate('Scheduling a viewing requires an account so your request can be tracked and confirmed.')}
                    icon="calendar-outline"
                  />
                </View>
              </View>
            </AppCard>
          ) : isOwner ? (
            <AppCard>
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="eye-outline" size={18} color={colors.primary} />
                  <AppText variant="h3">Seller Preview Mode</AppText>
                </View>
                <AppText color={colors.textMuted}>
                  You are viewing your own listing. Buyer contact actions are hidden here.
                </AppText>
                <AppButton
                  title="Edit Listing"
                  onPress={() => router.push(`/listing/edit/${property?.id}`)}
                  icon="create-outline"
                />
              </View>
            </AppCard>
          ) : (
            <>
              <AppCard>
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
                    <AppText variant="h3">In-App Contact</AppText>
                  </View>
                  <AppText color={colors.textMuted}>
                    Start a tracked conversation, keep history inside the app, and schedule a viewing.
                  </AppText>

                  <AppButton
                    title="Message Owner"
                    onPress={() => router.push(`/inquiry/${id}`)}
                    icon="chatbubble-outline"
                  />
                  <AppButton
                    title="Schedule Viewing"
                    variant="secondary"
                    onPress={() => router.push(`/viewing/${id}`)}
                    icon="calendar-outline"
                  />
                </View>
              </AppCard>

              <AppCard>
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="call-outline" size={18} color={colors.primary} />
                    <AppText variant="h3">Quick External Contact</AppText>
                  </View>
                  <AppText color={colors.textMuted}>
                    Open your phone, SMS, WhatsApp, or email app directly from here.
                  </AppText>

                  <View style={styles.quickActions}>
                    <AppButton title="Phone / SMS" variant="secondary" onPress={handlePhoneAction} icon="call-outline" />
                    <AppButton title="WhatsApp" variant="secondary" onPress={handleWhatsApp} icon="logo-whatsapp" />
                    <AppButton title="Email" variant="secondary" onPress={handleEmail} icon="mail-outline" />
                  </View>
                </View>
              </AppCard>
            </>
          )}
        </ScrollView>

        <ZoomViewer
          images={viewerImages}
          imageIndex={selectedImageIndex}
          visible={viewerVisible}
          onRequestClose={() => setViewerVisible(false)}
          onImageIndexChange={setSelectedImageIndex}
        />
      </Screen>

      <GuestAuthGate
        visible={authGateVisible}
        reason={authGateReason}
        onClose={() => setAuthGateVisible(false)}
        onSignIn={() => {
          setAuthGateVisible(false);
          router.push('/(auth)/login');
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 40,
  },
  heroBlock: {
    gap: spacing.md,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryRow: {
    gap: spacing.md,
  },
  galleryImage: {
    width: 300,
    height: 240,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundMuted,
  },
  priceBlock: {
    gap: spacing.md,
  },
  priceHeader: {
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickActions: {
    gap: spacing.sm,
  },
  lockedActions: {
    gap: spacing.sm,
  },
});
