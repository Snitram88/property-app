import { ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { useAuth } from '@/src/providers/AuthProvider';
import { PropertyWithMedia, fetchPublishedProperties } from '@/src/lib/properties/live-properties';

export default function CompanyHomeScreen() {
  const { user, profile, hasSellerAccess } = useAuth();
  const [featured, setFeatured] = useState<PropertyWithMedia | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadFeatured() {
        try {
          const properties = await fetchPublishedProperties();
          if (active) {
            setFeatured(properties[0] ?? null);
          }
        } catch (error) {
          console.error('Failed to load company home:', error);
        }
      }

      loadFeatured();

      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Company Home"
          subtitle="Shared buyer and seller experience"
        />

        <View style={styles.hero}>
          {featured?.cover_image_url ? (
            <Image source={featured.cover_image_url} style={styles.heroImage} contentFit="cover" />
          ) : (
            <View style={styles.heroPlaceholder} />
          )}

          <View style={styles.overlay}>
            <AppText style={styles.heroEyebrow}>Smart Property Platform</AppText>
            <AppText style={styles.heroTitle}>Premium discovery and smarter property operations.</AppText>
            <AppText style={styles.heroText}>
              This shared home introduces the brand, showcases live listings, and gives both buyers and sellers a premium company-facing entry point.
            </AppText>
          </View>
        </View>

        <View style={styles.actions}>
          {user ? (
            <>
              <AppButton title="Open Buyer Mode" onPress={() => router.push('/buyer')} />
              {hasSellerAccess ? (
                <AppButton title="Open Seller Mode" variant="secondary" onPress={() => router.push('/seller')} />
              ) : null}
            </>
          ) : (
            <AppButton title="Get Started" onPress={() => router.push('/login')} />
          )}
        </View>

        <View style={styles.grid}>
          <AppCard>
            <View style={styles.cardContent}>
              <AppText style={styles.cardTitle}>Verified-looking presentation</AppText>
              <AppText style={styles.cardText}>
                Live imagery, map-aware properties, stronger listing quality, and a cleaner visual brand.
              </AppText>
            </View>
          </AppCard>

          <AppCard>
            <View style={styles.cardContent}>
              <AppText style={styles.cardTitle}>Buyer confidence</AppText>
              <AppText style={styles.cardText}>
                Save listings, schedule viewings, contact owners, and review richer property galleries.
              </AppText>
            </View>
          </AppCard>

          <AppCard>
            <View style={styles.cardContent}>
              <AppText style={styles.cardTitle}>Seller control</AppText>
              <AppText style={styles.cardText}>
                Create listings with cover images, gallery angles, map coordinates, and preview the buyer-facing result.
              </AppText>
            </View>
          </AppCard>
        </View>

        {profile?.full_name ? (
          <AppCard>
            <View style={styles.cardContent}>
              <AppText style={styles.cardTitle}>Welcome back, {profile.full_name.split(' ')[0]}</AppText>
              <AppText style={styles.cardText}>
                Use this shared home as your company-facing overview, while Buyer and Seller modes remain your operational workspaces.
              </AppText>
            </View>
          </AppCard>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20,
  },
  hero: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  heroImage: {
    width: '100%',
    height: 260,
  },
  heroPlaceholder: {
    width: '100%',
    height: 260,
    backgroundColor: '#0F172A',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    padding: 20,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.36)',
    gap: 8,
  },
  heroEyebrow: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  heroText: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    gap: 12,
  },
  grid: {
    gap: 16,
  },
  cardContent: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
});
