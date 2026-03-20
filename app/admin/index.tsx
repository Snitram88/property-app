import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
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
        <View style={styles.container}>
          <AppHeader title="Admin Console" subtitle="Restricted area" />
          <AppCard>
            <View style={styles.cardContent}>
              <AppText style={styles.cardTitle}>Admin access required</AppText>
              <AppText>You do not currently have the admin role for this app.</AppText>
            </View>
          </AppCard>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader
          title="Admin Console"
          subtitle="Review seller KYC and approve or reject listings"
        />

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Pending Seller KYC</AppText>

          {kycQueue.length === 0 ? (
            <AppCard>
              <View style={styles.cardContent}>
                <AppText style={styles.cardTitle}>No pending KYC submissions</AppText>
                <AppText>New seller verification requests will appear here.</AppText>
              </View>
            </AppCard>
          ) : (
            kycQueue.map((item) => (
              <AppCard key={item.submission_id}>
                <View style={styles.cardContent}>
                  <AppText style={styles.cardTitle}>{item.full_name ?? 'Seller'}</AppText>
                  <AppText>{item.email ?? 'No email'}</AppText>
                  <AppText>{item.phone ?? 'No phone'}</AppText>
                  <AppText>Seller type: {item.seller_type ?? 'Not set'}</AppText>
                  <AppText>Business: {item.business_name ?? 'Not provided'}</AppText>
                  <AppText>Company reg: {item.company_registration_number ?? 'Not provided'}</AppText>
                  <AppText>Government ID: {item.government_id_number ?? 'Not provided'}</AppText>
                  <AppText>Address: {item.contact_address ?? 'Not provided'}</AppText>
                  <AppText>
                    {item.city ?? 'No city'}, {item.state ?? 'No state'}
                  </AppText>
                  {item.notes ? <AppText>Notes: {item.notes}</AppText> : null}

                  <View style={styles.actions}>
                    <AppButton
                      title={workingId === item.submission_id ? 'Working...' : 'Approve KYC'}
                      onPress={() => handleReviewKyc(item.submission_id, 'approved')}
                    />
                    <AppButton
                      title="Reject KYC"
                      variant="secondary"
                      onPress={() => handleReviewKyc(item.submission_id, 'rejected')}
                    />
                  </View>
                </View>
              </AppCard>
            ))
          )}
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Pending Listing Review</AppText>

          {listingQueue.length === 0 ? (
            <AppCard>
              <View style={styles.cardContent}>
                <AppText style={styles.cardTitle}>No pending listings</AppText>
                <AppText>Listings submitted for review will appear here.</AppText>
              </View>
            </AppCard>
          ) : (
            listingQueue.map((item) => (
              <AppCard key={item.property_id}>
                <View style={styles.cardContent}>
                  <AppText style={styles.cardTitle}>{item.title}</AppText>
                  <AppText>{formatPrice(item.price)}</AppText>
                  <AppText>{item.location_text}</AppText>
                  <AppText>Owner: {item.owner_name ?? 'Seller'}</AppText>
                  <AppText>{item.owner_email ?? 'No email'}</AppText>
                  <AppText>{item.owner_phone ?? 'No phone'}</AppText>
                  <AppText>
                    Owner verification: {formatVerificationStatus(item.owner_verification_status)}
                  </AppText>

                  <View style={styles.actions}>
                    <AppButton
                      title={workingId === item.property_id ? 'Working...' : 'Approve Listing'}
                      onPress={() => handleReviewListing(item.property_id, 'approved')}
                    />
                    <AppButton
                      title="Reject Listing"
                      variant="secondary"
                      onPress={() => handleReviewListing(item.property_id, 'rejected')}
                    />
                  </View>
                </View>
              </AppCard>
            ))
          )}
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
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  cardContent: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
});
