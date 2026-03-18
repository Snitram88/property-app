import { View, StyleSheet } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppText } from '@/src/components/ui/AppText';

export default function ChatScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <AppText style={styles.title}>AI + Human Chat</AppText>
        <AppText>The assistant and human handoff system will be built in Part 2.</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
});
