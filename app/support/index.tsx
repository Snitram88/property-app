import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { EmptyState } from '@/src/components/ui/EmptyState';
import {
  escalateSupportToAdmin,
  getMySupportConversation,
  getSupportMessages,
  sendBotReply,
  sendSupportMessage,
  startSupportConversation,
  SupportConversation,
  SupportMessage,
} from '@/src/lib/support/support-chat';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

function Bubble({ message }: { message: SupportMessage }) {
  const isUser = message.sender_role === 'user';
  const isBot = message.sender_role === 'bot';
  const isSystem = message.sender_role === 'system';

  return (
    <View
      style={[
        styles.bubble,
        isUser && styles.userBubble,
        isBot && styles.botBubble,
        isSystem && styles.systemBubble,
      ]}
    >
      <AppText
        color={
          isUser ? colors.textInverse : isSystem ? colors.textMuted : colors.text
        }
      >
        {message.body}
      </AppText>
    </View>
  );
}

export default function SupportChatScreen() {
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadConversation() {
    try {
      const convo = await getMySupportConversation();
      setConversation(convo);

      if (convo?.id) {
        const rows = await getSupportMessages(convo.id);
        setMessages(rows);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load support conversation:', error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadConversation();
    }, [])
  );

  async function ensureConversation() {
    if (conversation?.id) return conversation.id;

    const conversationId = await startSupportConversation('General Support', null);
    const next = await getMySupportConversation();
    setConversation(next);

    if (next?.id) {
      const rows = await getSupportMessages(next.id);
      setMessages(rows);
    }

    return conversationId;
  }

  async function handleQuickStart(topic: string, text: string) {
    try {
      setLoading(true);
      const conversationId = await startSupportConversation(topic, text);
      await sendBotReply(conversationId, text);
      await loadConversation();
    } catch (error: any) {
      Alert.alert('Support unavailable', error?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!message.trim()) return;

    try {
      setLoading(true);
      const conversationId = await ensureConversation();
      const userMessage = message.trim();
      setMessage('');

      await sendSupportMessage(conversationId, userMessage);

      if (conversation?.escalated_to_human) {
        await loadConversation();
      } else {
        await sendBotReply(conversationId, userMessage);
        await loadConversation();
      }
    } catch (error: any) {
      Alert.alert('Message failed', error?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEscalate() {
    try {
      setLoading(true);
      const conversationId = await ensureConversation();
      await escalateSupportToAdmin(conversationId);
      await loadConversation();
      Alert.alert('Escalated', 'Your support chat has been escalated to a human admin.');
    } catch (error: any) {
      Alert.alert('Escalation failed', error?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.page}>
        <AppHeader
          title="Support Chat"
          subtitle="Bot-first support with admin escalation when needed"
        />

        <View style={styles.hero}>
          <AppBadge
            label={conversation?.escalated_to_human ? 'Human support requested' : 'Bot support active'}
            variant={conversation?.escalated_to_human ? 'warning' : 'primary'}
          />
          <AppText variant="h2">Need help with the app?</AppText>
          <AppText color={colors.textMuted}>
            Ask about KYC, listings, messages, viewings, or escalate to a human admin.
          </AppText>
        </View>

        {!conversation ? (
          <View style={styles.quickStarts}>
            <EmptyState
              icon="chatbubble-ellipses-outline"
              title="Start support"
              message="Choose a quick support topic or type your own message below."
            />

            <AppCard>
              <View style={styles.quickActions}>
                <AppButton
                  title="KYC help"
                  variant="secondary"
                  onPress={() => handleQuickStart('KYC Help', 'I need help with KYC')}
                  icon="shield-checkmark-outline"
                />
                <AppButton
                  title="Listing help"
                  variant="secondary"
                  onPress={() => handleQuickStart('Listing Help', 'I need help with my listing')}
                  icon="home-outline"
                />
                <AppButton
                  title="Messages help"
                  variant="secondary"
                  onPress={() => handleQuickStart('Messages Help', 'I need help with messages')}
                  icon="chatbubble-outline"
                />
                <AppButton
                  title="Viewing help"
                  variant="secondary"
                  onPress={() => handleQuickStart('Viewing Help', 'I need help with viewing requests')}
                  icon="calendar-outline"
                />
              </View>
            </AppCard>
          </View>
        ) : (
          <AppCard style={styles.chatCard}>
            <ScrollView contentContainerStyle={styles.chatBody} showsVerticalScrollIndicator={false}>
              {messages.map((item) => (
                <Bubble key={item.id} message={item} />
              ))}
            </ScrollView>
          </AppCard>
        )}

        <AppCard>
          <View style={styles.composer}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your support message..."
              placeholderTextColor={colors.textSoft}
              style={styles.input}
              multiline
            />

            <View style={styles.composerActions}>
              <AppButton
                title={loading ? 'Working...' : 'Send'}
                onPress={handleSend}
                icon="send-outline"
              />
              <AppButton
                title="Escalate to human"
                variant="secondary"
                onPress={handleEscalate}
                icon="person-outline"
              />
            </View>
          </View>
        </AppCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  hero: {
    gap: spacing.sm,
  },
  quickStarts: {
    gap: spacing.lg,
  },
  quickActions: {
    gap: spacing.sm,
  },
  chatCard: {
    flex: 1,
    minHeight: 320,
  },
  chatBody: {
    gap: spacing.sm,
  },
  bubble: {
    maxWidth: '84%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  systemBubble: {
    alignSelf: 'center',
    backgroundColor: colors.backgroundMuted,
  },
  composer: {
    gap: spacing.md,
  },
  input: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    color: colors.text,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  composerActions: {
    gap: spacing.sm,
  },
});
