import { router, useFocusEffect } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import { ConversationItem, fetchUserConversations } from '@/src/lib/chat/conversations';

export default function BuyerMessagesScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<ConversationItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadConversations() {
        if (!user?.id) return;

        try {
          const data = await fetchUserConversations(user.id);
          if (active) {
            setItems(data);
          }
        } catch (error) {
          console.error('Failed to load buyer conversations:', error);
        }
      }

      loadConversations();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <AppText style={styles.title}>Messages</AppText>

        {items.length === 0 ? (
          <AppCard>
            <View style={styles.cardContent}>
              <AppText style={styles.cardTitle}>No conversations yet</AppText>
              <AppText>
                Start by contacting an owner from a property listing.
              </AppText>
            </View>
          </AppCard>
        ) : (
          items.map((item) => (
            <AppCard key={item.id}>
              <View style={styles.cardContent}>
                <AppText style={styles.cardTitle}>{item.property_title}</AppText>
                <AppText>{item.property_location}</AppText>
                <AppText>
                  With: {item.counterpart_name} ({item.counterpart_role})
                </AppText>
                <AppText>{item.last_message_text ?? 'No messages yet'}</AppText>
                <AppButton
                  title="Open Conversation"
                  onPress={() => router.push(`/messages/${item.id}`)}
                />
              </View>
            </AppCard>
          ))
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
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
  cardContent: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
});
