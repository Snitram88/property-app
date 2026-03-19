import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppText } from '@/src/components/ui/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import {
  ChatMessage,
  fetchConversationById,
  fetchConversationMessages,
  sendConversationMessage,
  subscribeToConversationMessages,
} from '@/src/lib/chat/conversations';
import { colors } from '@/src/theme/colors';

export default function ConversationThreadScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationTitle, setConversationTitle] = useState('Conversation');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const senderRole = useMemo<'buyer' | 'seller'>(() => {
    return profile?.active_mode === 'seller' ? 'seller' : 'buyer';
  }, [profile?.active_mode]);

  async function loadThread() {
    if (!conversationId) return;

    try {
      const [conversation, nextMessages] = await Promise.all([
        fetchConversationById(conversationId),
        fetchConversationMessages(conversationId),
      ]);

      setMessages(nextMessages);
      setConversationTitle(conversation?.last_message_text ? 'Conversation' : 'Conversation');
    } catch (error) {
      console.error('Failed to load conversation thread:', error);
    }
  }

  useEffect(() => {
    loadThread();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribeToConversationMessages(conversationId, () => {
      loadThread();
    });

    return unsubscribe;
  }, [conversationId]);

  async function handleSend() {
    if (!conversationId || !user?.id || !draft.trim()) {
      return;
    }

    try {
      setSending(true);

      await sendConversationMessage({
        conversationId,
        senderUserId: user.id,
        senderRole,
        body: draft.trim(),
      });

      setDraft('');
      await loadThread();
    } catch (error: any) {
      Alert.alert('Send failed', error?.message ?? 'Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen>
      <View style={styles.container}>
        <AppHeader title={conversationTitle} subtitle="Threaded buyer and seller messages" />

        <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
          {messages.length === 0 ? (
            <AppCard>
              <View style={styles.cardContent}>
                <AppText style={styles.emptyTitle}>No messages yet</AppText>
                <AppText>The first conversation message will appear here.</AppText>
              </View>
            </AppCard>
          ) : (
            messages.map((message) => {
              const isMine = message.sender_user_id === user?.id;

              return (
                <View
                  key={message.id}
                  style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}
                >
                  <AppText style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
                    {message.body}
                  </AppText>
                  <AppText style={[styles.timestamp, isMine && styles.timestampMine]}>
                    {new Date(message.created_at).toLocaleString()}
                  </AppText>
                </View>
              );
            })
          )}
        </ScrollView>

        <AppCard>
          <View style={styles.composer}>
            <AppInput
              label="Reply"
              value={draft}
              onChangeText={setDraft}
              placeholder="Type your message"
              multiline
            />
            <AppButton
              title={sending ? 'Sending...' : 'Send Message'}
              onPress={handleSend}
            />
          </View>
        </AppCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  messages: {
    gap: 12,
    paddingBottom: 12,
  },
  cardContent: {
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  bubble: {
    maxWidth: '84%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  bubbleTextMine: {
    color: colors.white,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textMuted,
  },
  timestampMine: {
    color: '#D1FAE5',
  },
  composer: {
    gap: 14,
  },
});
