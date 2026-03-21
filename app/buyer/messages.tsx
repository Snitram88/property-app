import { ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { useAuth } from '@/src/providers/AuthProvider';
import { supabase } from '@/src/lib/supabase/client';
import { fetchPropertyById, PropertyWithMedia } from '@/src/lib/properties/live-properties';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type ConversationRow = {
  id: string;
  property_id: string | null;
  last_message_text: string | null;
  last_message_at: string | null;
  status: string | null;
};

type ConversationCard = {
  id: string;
  lastMessage: string;
  status: string;
  property: PropertyWithMedia | null;
};

export default function BuyerMessagesScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationCard[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        if (!user?.id) return;

        try {
          const { data, error } = await supabase
            .from('conversations')
            .select('id, property_id, last_message_text, last_message_at, status')
            .eq('buyer_id', user.id)
            .order('last_message_at', { ascending: false, nullsFirst: false });

          if (error) throw error;

          const rows = (data ?? []) as ConversationRow[];
          const propertyMap = new Map<string, PropertyWithMedia | null>();

          await Promise.all(
            rows.map(async (row) => {
              if (!row.property_id) return;
              const property = await fetchPropertyById(row.property_id);
              propertyMap.set(row.property_id, property);
            })
          );

          if (!active) return;

          setConversations(
            rows.map((row) => ({
              id: row.id,
              lastMessage: row.last_message_text ?? 'Conversation started',
              status: row.status ?? 'active',
              property: row.property_id ? propertyMap.get(row.property_id) ?? null : null,
            }))
          );
        } catch (error) {
          console.error('Failed to load buyer conversations:', error);
        }
      }

      load();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <AppText variant="h1">Messages</AppText>
        <AppText>Tracked conversations with sellers stay here so you never lose context.</AppText>
      </View>

      {conversations.length === 0 ? (
        <EmptyState
          icon="chatbubble-ellipses-outline"
          title="No conversations yet"
          message="Start by contacting an owner from any verified property listing."
          actionLabel="Explore listings"
          onAction={() => router.replace('/buyer')}
        />
      ) : (
        <View style={styles.list}>
          {conversations.map((conversation) => (
            <AppCard key={conversation.id}>
              <View style={styles.cardTop}>
                {conversation.property?.cover_image_url ? (
                  <Image
                    source={conversation.property.cover_image_url}
                    style={styles.thumbnail}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons name="image-outline" size={24} color={colors.textSoft} />
                  </View>
                )}

                <View style={styles.textBlock}>
                  <View style={styles.titleRow}>
                    <AppText variant="title">
                      {conversation.property?.title ?? 'Property conversation'}
                    </AppText>
                    <AppBadge
                      label={conversation.status === 'active' ? 'Active' : conversation.status}
                      variant={conversation.status === 'active' ? 'verified' : 'neutral'}
                    />
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={15} color={colors.textMuted} />
                    <AppText color={colors.textMuted}>
                      {conversation.property?.location_text ?? 'Location unavailable'}
                    </AppText>
                  </View>

                  <AppText numberOfLines={3}>{conversation.lastMessage}</AppText>
                </View>
              </View>

              <AppButton
                title="Open Conversation"
                onPress={() => router.push(`/messages/${conversation.id}`)}
                icon="chatbubble-ellipses-outline"
              />
            </AppCard>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 120,
  },
  header: {
    gap: spacing.xs,
  },
  list: {
    gap: spacing.lg,
  },
  cardTop: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  thumbnail: {
    width: 92,
    height: 92,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundMuted,
  },
  placeholder: {
    width: 92,
    height: 92,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
