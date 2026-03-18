import { View, StyleSheet } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppText } from '@/src/components/ui/AppText';

export default function ProfileTab() {
  return (
    <Screen>
      <View style={styles.container}>
        <AppText style={styles.title}>Profile</AppText>
        <AppText>User profile, settings, roles, and notification preferences go here.</AppText>
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
    fontSize: 24,
    fontWeight: '800',
  },
});
