import { router, useFocusEffect } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { mockProperties } from '@/src/constants/mockProperties';
import { colors } from '@/src/theme/colors';
import { useAuth } from '@/src/providers/AuthProvider';
import { fetchSavedPropertyRefs, toggleSavedProperty } from '@/src/lib/properties/saved-properties';

export default function BuyerHomeScreen() {
  const { profile, user } = useAuth();
  const [savedRefs, setSavedRefs] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadSaved() {
        if (!user?.id) return;

        try {
          const refs = await fetchSavedPropertyRefs(user.id);
          if (active) {
            setSavedRefs(refs);
          }
        } catch (error) {
          console.error('Failed to load saved properties:', error);
        }
      }

      loadSaved();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  async function handleToggleSave(property: (typeof mockProperties)[number]) {
    if (!user?.id) {
      Alert.alert('Sign in required', 'Please sign in to save properties.');
      return;
    }

    try {
      const saved = await toggleSavedProperty(user.id, {
        id: property.id,
        title: property.title,
        location: property.location,
        price: property.price,
        badge: property.badge,
        listingType: property.listingType,
      });

      const next = new Set(savedRefs);
      if (saved) {
        next.add(property.id);
      } else {
        next.delete(property.id);
      }
      setSavedRefs(next);
    } catch (error: any) {
      Alert.alert('Save failed', error?.message ?? 'Please try again.');
    }
  }

  const incompleteProfile = !profile?.full_name || !profile?.phone;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <AppText style={styles.eyebrow}>Buyer Mode</AppText>
          <AppText style={styles.title}>
            Welcome{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.
          </AppText>
          <AppText style={styles.subtitle}>
            Discover curated listings and contact owners through a cleaner premium flow.
          </AppText>
        </View>

        {incompleteProfile ? (
          <AppCard>
            <View style={styles.banner}>
              <AppText style={styles.bannerTitle}>Complete your profile</AppText>
              <AppText style={styles.bannerText}>
                Add your details now so inquiries, saved properties, and viewing requests work better.
              </AppText>
              <AppButton title="Edit Profile" onPress={() => router.push('/profile/edit')} />
            </View>
          </AppCard>
        ) : null}

        <View style={styles.list}>
          {mockProperties.map((property) => {
            const isSaved = savedRefs.has(property.id);

            return (
              <AppCard key={property.id}>
                <View style={styles.cardContent}>
                  <View style={styles.badgeRow}>
                    <AppText style={styles.badge}>{property.badge}</AppText>

                    <Pressable style={styles.saveButton} onPress={() => handleToggleSave(property)}>
                      <Ionicons
                        name={isSaved ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isSaved ? '#DC2626' : colors.text}
                      />
                      <AppText style={styles.saveText}>{isSaved ? 'Saved' : 'Save'}</AppText>
                    </Pressable>
                  </View>

                  <AppText style={styles.cardTitle}>{property.title}</AppText>
                  <AppText style={styles.price}>{property.price}</AppText>
                  <AppText style={styles.location}>{property.location}</AppText>
                  <AppText style={styles.meta}>
                    {property.beds} beds • {property.baths} baths • {property.listingType}
                  </AppText>

                  <View style={styles.cardActions}>
                    <AppButton
                      title="View Property"
                      onPress={() => router.push(`/property/${property.id}`)}
                    />
                  </View>
                </View>
              </AppCard>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 18,
  },
  hero: {
    gap: 8,
    marginTop: 10,
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
    lineHeight: 22,
    color: colors.textMuted,
  },
  banner: {
    gap: 10,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  bannerText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  list: {
    gap: 16,
  },
  cardContent: {
    gap: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
  location: {
    fontSize: 14,
    color: colors.textMuted,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  cardActions: {
    gap: 10,
  },
});
