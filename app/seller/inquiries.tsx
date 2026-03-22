import { ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppText } from '@/src/components/ui/AppText';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { SellerInquiryCard } from '@/src/components/seller/SellerInquiryCard';
import { useAuth } from '@/src/providers/AuthProvider';
import { fetchSellerInquiries } from '@/src/lib/properties/live-properties';
import { spacing } from '@/src/theme/spacing';

export default function SellerInquiriesScreen() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        if (!user?.id) return;

        try {
          const rows = await fetchSellerInquiries(user.id);
          if (!active) return;
          setInquiries(rows);
        } catch (error) {
          console.error('Failed to load seller inquiries:', error);
        }
      }

      load();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Buyer Inquiries"
          subtitle="Every message now shows the exact property context"
        />

        <View style={styles.hero}>
          <AppBadge label={`${inquiries.length} inquiries`} variant="primary" />
          <AppText variant="h2">Know exactly what each buyer is referring to.</AppText>
          <AppText>
            Snapshot image, title, location, price, and the buyer’s message now appear together.
          </AppText>
        </View>

        {inquiries.length === 0 ? (
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="No buyer inquiries yet"
            message="When buyers message any of your listings, the property context will show here."
          />
        ) : (
          <View style={styles.list}>
            {inquiries.map((item) => (
              <SellerInquiryCard
                key={item.id}
                senderName={item.sender_name}
                senderEmail={item.sender_email}
                senderPhone={item.sender_phone}
                message={item.message}
                status={item.status}
                createdAt={item.created_at}
                propertyTitle={item.property_title_snapshot ?? item.property_title}
                propertyLocation={item.property_location_snapshot ?? item.property_location}
                propertyAddress={item.property_address_snapshot}
                propertyListingType={item.property_listing_type_snapshot}
                propertyPrice={item.property_price_snapshot}
                propertyImage={item.property_cover_image_snapshot}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 60,
  },
  hero: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.lg,
  },
});
