import { View, StyleSheet } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppText } from '@/src/components/ui/AppText';

export default function AdminScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <AppText style={styles.title}>Admin Panel</AppText>
        <AppText>Moderation, verification, abuse reports, and platform controls will live here.</AppText>
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
