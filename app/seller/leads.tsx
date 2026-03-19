import { ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import {
  SellerInquiryItem,
  SellerViewingItem,
  fetchSellerInquiries,
  fetchSellerViewingRequests,
} from '@/src/lib/properties/live-properties';

export default function SellerLeadsScreen() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<SellerInquiryItem[]>([]);
  const [viewings, setViewings] = useState<SellerViewingItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadLeads() {
        if (!user?.id) return;

        try {
          const [nextInquiries, nextViewings] = await Promise.all([
            fetchSellerInquiries(user.id),
            fetchSellerViewingRequests(user.id),
          ]);

          if (active) {
            setInquiries(nextInquiries);
            setViewings(nextViewings);
          }
        } catch (error) {
          console.error('Failed to load seller leads:', error);
        }
      }

      loadLeads();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <AppText style={styles.title}>Leads & Requests</AppText>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Buyer Inquiries</AppText>

          {inquiries.length === 0 ? (
            <AppCard>
              <View style={styles.cardContent}>
                <AppText style={styles.cardTitle}>No inquiries yet</AppText>
                <AppText>
                  New buyer messages will appear here once people contact your listings.
                </AppText>
              </View>
            </AppCard>
          ) : (
            inquiries.map((item) => (
              <AppCard key={item.id}>
                <View style={styles.cardContent}>
                  <AppText style={styles.cardTitle}>{item.sender_name}</AppText>
                  <AppText>{item.property_title}</AppText>
                  <AppText>{item.property_location}</AppText>
                  <AppText>{item.sender_phone ?? item.sender_email ?? 'No contact info'}</AppText>
                  <AppText>Status: {item.status}</AppText>
                  <AppText>{item.message}</AppText>
                </View>
              </AppCard>
            ))
          )}
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Viewing Requests</AppText>

          {viewings.length === 0 ? (
            <AppCard>
              <View style={styles.cardContent}>
                <AppText style={styles.cardTitle}>No viewing requests yet</AppText>
                <AppText>
                  Scheduled viewings will appear here after buyers book inspections.
                </AppText>
              </View>
            </AppCard>
          ) : (
            viewings.map((item) => (
              <AppCard key={item.id}>
                <View style={styles.cardContent}>
                  <AppText style={styles.cardTitle}>{item.property_title}</AppText>
                  <AppText>Date: {item.preferred_date}</AppText>
                  <AppText>Time: {item.preferred_time}</AppText>
                  <AppText>Phone: {item.phone}</AppText>
                  <AppText>Status: {item.status}</AppText>
                  {item.notes ? <AppText>Notes: {item.notes}</AppText> : null}
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
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardContent: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
});
