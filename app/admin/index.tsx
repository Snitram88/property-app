import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/ui/Screen';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppText } from '@/src/components/ui/AppText';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { useAuth } from '@/src/providers/AuthProvider';
import {
  AdminKycQueueItem,
  AdminListingQueueItem,
  fetchAdminKycQueue,
  fetchAdminListingQueue,
  formatVerificationStatus,
  reviewKycSubmission,
  reviewListing,
} from '@/src/lib/admin/verification';
import { formatPrice } from '@/src/lib/properties/live-properties';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

export default function AdminConsoleScreen() {
  const { roles } = useAuth();
  const [kycQueue, setKycQueue] = useState<AdminKycQueueItem[]>([]);
  const [listingQueue, setListingQueue] = useState<AdminListingQueueItem[]>([]);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const isAdmin = roles.includes('admin');

  async function loadQueues() {
    if (!isAdmin) return;

    try {
      const [kycData, listingData] = await Promise.all([
        fetchAdminKycQueue(),
        fetchAdminListingQueue(),
      ]);

      setKycQueue(kycData);
      setListingQueue(listingData);
    } catch (error) {
      console.error('Failed to load admin queues:', error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadQueues();
    }, [isAdmin])
  );

  async function handleReviewKyc(submissionId: string, decision: 'approved' | 'rejected') {
    try {
      setWorkingId(submissionId);
      await reviewKycSubmission({ submissionId, decision });
      await loadQueues();
    } catch (error: any) {
      Alert.alert('Review failed', error?.message ?? 'Please try again.');
    } finally {
      setWorkingId(null);
    }
  }

  async function handleReviewListing(propertyId: string, decision: 'approved' | 'rejected') {
    try {
      setWorkingId(propertyId);
      await reviewListing({ propertyId, decision });
      await loadQueues();
    } catch (error: any) {
      Alert.alert('Review failed', error?.message ?? 'Please try again.');
    } finally {
      setWorkingId(null);
    }
  }

  if (!isAdmin) {
    return (
      <Screen>
        <View style={styles.restrictedWrap}>
          <AppHeader title="Admin Console" subtitle="Restricted area" />
          <EmptyState
            icon="shield-outline"
            title="Admin access required"
            message="This area is reserved for moderation, KYC review, and listing approval."
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Admin Console"
          subtitle="Moderate trust, approve listings, and keep quality high"
        />

        <View style={styles.hero}>
          <AppBadge label="Moderator Mode" variant="premium" />
          <AppText variant="display">Trust operations at a glance.</AppText>
          <AppText color={colors.textMuted}>
            Review seller KYC, inspect listing media, and approve only what matches the marketplace standard.
          </AppText>
        </View>

        <View style={styles.countRow}>
          <AppBadge label={`KYC Queue ${kycQueue.length}`} variant="warning" />
          <AppBadge label={`Listing Queue ${listingQueue.length}`} variant="primary" />
        </View>

        <SectionHeader
          title="Pending Seller KYC"
          subtitle="Review trust documents before a seller is marked credible."
        />

        {kycQueue.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No pending KYC submissions"
            message="New seller verification requests will appear here."
          />
        ) : (
          <View style={styles.sectionList}>
            {kycQueue.map((item) => (
              <AppCard key={item.submission_id}>
                <View style={styles.queueCard}>
                  <View style={styles.queueHeader}>
                    <View style={styles.queueIcon}>
                      <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.queueText}>
                      <AppText variant="h3">{item.full_name ?? 'Seller'}</AppText>
                      <AppText color={colors.textMuted}>{item.email ?? 'No email'}</AppText>
                    </View>
                  </View>

                  <View style={styles.badgeLine}>
                    <AppBadge label={item.seller_type ?? 'Seller type not set'} variant="neutral" />
                    <AppBadge label="Pending KYC" variant="warning" />
                  </View>

                  <View style={styles.detailList}>
                    <AppText>Phone: {item.phone ?? 'No phone'}</AppText>
                    <AppText>Business: {item.business_name ?? 'Not provided'}</AppText>
                    <AppText>Company reg: {item.company_registration_number ?? 'Not provided'}</AppText>
                    <AppText>Government ID: {item.government_id_number ?? 'Not provided'}</AppText>
                    <AppText>Address: {item.contact_address ?? 'Not provided'}</AppText>
                    <AppText>
                      {item.city ?? 'No city'}, {item.state ?? 'No state'}
                    </AppText>
                    {item.notes ? <AppText>Notes: {item.notes}</AppText> : null}
                  </View>

                  <View style={styles.actionStack}>
                    <AppButton
                      title={workingId === item.submission_id ? 'Working...' : 'Approve KYC'}
                      onPress={() => handleReviewKyc(item.submission_id, 'approved')}
                      icon="checkmark-circle-outline"
                    />
                    <AppButton
                      title="Reject KYC"
                      variant="secondary"
                      onPress={() => handleReviewKyc(item.submission_id, 'rejected')}
                      icon="close-circle-outline"
                    />
                  </View>
                </View>
              </AppCard>
            ))}
          </View>
        )}

        <SectionHeader
          title="Pending Listing Review"
          subtitle="Inspect imagery, seller trust level, and listing quality before approval."
        />

        {listingQueue.length === 0 ? (
          <EmptyState
            icon="home-outline"
            title="No pending listings"
            message="Listings waiting for moderation will appear here."
          />
        ) : (
          <View style={styles.sectionList}>
            {listingQueue.map((item) => (
              <AppCard key={item.property_id}>
                <View style={styles.queueCard}>
                  {item.image_urls.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.galleryRow}
                    >
                      {item.image_urls.map((url, index) => (
                        <Image
                          key={`${item.property_id}-${index}`}
                          source={url}
                          style={styles.galleryImage}
                          contentFit="cover"
                        />
                      ))}
                    </ScrollView>
                  ) : null}

                  <View style={styles.queueHeader}>
                    <View style={styles.queueIcon}>
                      <Ionicons name="home-outline" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.queueText}>
                      <AppText variant="h3">{item.title}</AppText>
                      <AppText color={colors.textMuted}>{item.location_text}</AppText>
                    </View>
                  </View>

                  <View style={styles.badgeLine}>
                    <AppBadge label={formatVerificationStatus(item.owner_verification_status)} variant="verified" />
                    <AppBadge label={item.listing_type.toUpperCase()} variant="neutral" />
                    <AppBadge label={`${item.image_count} Images`} variant="primary" />
                  </View>

                  <View style={styles.detailList}>
                    <AppText>{formatPrice(item.price)}</AppText>
                    <AppText>
                      {item.bedrooms} beds • {item.bathrooms} baths • {item.property_type}
                    </AppText>
                    {item.description ? <AppText>{item.description}</AppText> : null}
                    <AppText>Owner: {item.owner_name ?? 'Seller'}</AppText>
                    <AppText>{item.owner_email ?? 'No email'}</AppText>
                    <AppText>{item.owner_phone ?? 'No phone'}</AppText>
                  </View>

                  <View style={styles.actionStack}>
                    <AppButton
                      title={workingId === item.property_id ? 'Working...' : 'Approve Listing'}
                      onPress={() => handleReviewListing(item.property_id, 'approved')}
                      icon="checkmark-circle-outline"
                    />
                    <AppButton
                      title="Reject Listing"
                      variant="secondary"
                      onPress={() => handleReviewListing(item.property_id, 'rejected')}
                      icon="close-circle-outline"
                    />
                  </View>
                </View>
              </AppCard>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  restrictedWrap: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 60,
  },
  hero: {
    gap: spacing.md,
  },
  countRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sectionList: {
    gap: spacing.lg,
  },
  queueCard: {
    gap: spacing.md,
  },
  queueHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  queueIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueText: {
    flex: 1,
    gap: 4,
  },
  badgeLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  detailList: {
    gap: 6,
  },
  actionStack: {
    gap: spacing.sm,
  },
  galleryRow: {
    gap: spacing.sm,
  },
  galleryImage: {
    width: 150,
    height: 112,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundMuted,
  },
});
