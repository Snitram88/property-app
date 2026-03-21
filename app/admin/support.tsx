import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
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
  adminSendSupportMessage,
  AdminSupportConversation,
  getAdminSupportConversations,
  getSupportMessages,
  SupportMessage,
} from '@/src/lib/support/support-chat';
import { useAuth } from '@/src/providers/AuthProvider';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

function AdminBubble({ message }: { message: SupportMessage }) {
  const isAdmin = message.sender_role === 'admin';
  const isUser = message.sender_role === 'user';

  return (
    <View
      style={[
        styles.bubble,
        isAdmin && styles.adminBubble,
        isUser && styles.userBubble,
        message.sender_role === 'bot' && styles.botBubble,
        message.sender_role === 'system' && styles.systemBubble,
      ]}
    >
      <AppText color={isAdmin ? colors.textInverse : colors.text}>{message.body}</AppText>
    </View>
  );
}

export default function AdminSupportInboxScreen() {
  const { roles } = useAuth();
  const [conversations, setConversations] = useState<AdminSupportConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = roles.includes('admin');

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.conversation_id === selectedConversationId) ?? null,
    [conversations, selectedConversationId]
  );

  async function loadInbox() {
    if (!isAdmin) return;

    try {
      const rows = await getAdminSupportConversations();
      setConversations(rows);

      if (!selectedConversationId && rows[0]?.conversation_id) {
        setSelectedConversationId(rows[0].conversation_id);
        const thread = await getSupportMessages(rows[0].conversation_id);
        setMessages(thread);
      } else if (selectedConversationId) {
        const thread = await getSupportMessages(selectedConversationId);
        setMessages(thread);
      }
    } catch (error) {
      console.error('Failed to load admin support inbox:', error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadInbox();
    }, [isAdmin, selectedConversationId])
  );

  async function openConversation(conversationId: string) {
    try {
      setSelectedConversationId(conversationId);
      const thread = await getSupportMessages(conversationId);
      setMessages(thread);
    } catch (error) {
      console.error('Failed to open support conversation:', error);
    }
  }

  async function handleReply() {
    if (!selectedConversationId || !reply.trim()) return;

    try {
      setLoading(true);
      await adminSendSupportMessage(selectedConversationId, reply.trim());
      setReply('');
      const thread = await getSupportMessages(selectedConversationId);
      setMessages(thread);
      const inbox = await getAdminSupportConversations();
      setConversations(inbox);
    } catch (error: any) {
      Alert.alert('Reply failed', error?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <Screen>
        <View style={styles.restricted}>
          <AppHeader title="Support Inbox" subtitle="Restricted area" />
          <EmptyState
            icon="shield-outline"
            title="Admin access required"
            message="Only admin users can manage escalated support conversations."
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        <AppHeader
          title="Support Inbox"
          subtitle="Escalated user support and admin replies"
        />

        <View style={styles.headerBadges}>
          <AppBadge label={`Open Threads ${conversations.length}`} variant="warning" />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inboxRow}>
          {conversations.map((item) => (
            <AppCard key={item.conversation_id} style={styles.threadCard}>
              <View style={styles.threadBody}>
                <AppText variant="title">{item.user_name ?? 'User'}</AppText>
                <AppText color={colors.textMuted}>{item.user_email ?? 'No email'}</AppText>
                <AppBadge
                  label={item.escalated_to_human ? 'Human support' : 'Bot active'}
                  variant={item.escalated_to_human ? 'warning' : 'primary'}
                />
                <AppText numberOfLines={2}>{item.last_message_text ?? 'No message yet'}</AppText>
                <AppButton
                  title="Open"
                  variant="secondary"
                  onPress={() => openConversation(item.conversation_id)}
                  icon="chatbubble-ellipses-outline"
                />
              </View>
            </AppCard>
          ))}
        </ScrollView>

        {!selectedConversation ? (
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="Select a support thread"
            message="Choose a conversation above to read messages and reply as admin."
          />
        ) : (
          <>
            <AppCard>
              <View style={styles.selectedHeader}>
                <View style={styles.selectedTitle}>
                  <AppText variant="h3">{selectedConversation.user_name ?? 'User support'}</AppText>
                  <AppText color={colors.textMuted}>{selectedConversation.user_email ?? 'No email'}</AppText>
                </View>
                <AppBadge
                  label={selectedConversation.status}
                  variant={selectedConversation.status === 'waiting_admin' ? 'warning' : 'neutral'}
                />
              </View>
            </AppCard>

            <AppCard style={styles.chatCard}>
              <ScrollView contentContainerStyle={styles.chatBody} showsVerticalScrollIndicator={false}>
                {messages.map((item) => (
                  <AdminBubble key={item.id} message={item} />
                ))}
              </ScrollView>
            </AppCard>

            <AppCard>
              <View style={styles.replyBox}>
                <TextInput
                  value={reply}
                  onChangeText={setReply}
                  placeholder="Write an admin reply..."
                  placeholderTextColor={colors.textSoft}
                  style={styles.input}
                  multiline
                />
                <AppButton
                  title={loading ? 'Sending...' : 'Send Reply'}
                  onPress={handleReply}
                  icon="send-outline"
                />
              </View>
            </AppCard>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  restricted: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  page: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  headerBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  inboxRow: {
    gap: spacing.md,
  },
  threadCard: {
    width: 260,
  },
  threadBody: {
    gap: spacing.sm,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'center',
  },
  selectedTitle: {
    flex: 1,
    gap: 4,
  },
  chatCard: {
    flex: 1,
    minHeight: 280,
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
  adminBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  userBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFEFF',
    borderWidth: 1,
    borderColor: '#A5F3FC',
  },
  systemBubble: {
    alignSelf: 'center',
    backgroundColor: colors.backgroundMuted,
  },
  replyBox: {
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
});
