import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <View style={styles.container}>
        <AppText style={styles.title}>Property Details</AppText>

        <AppCard>
          <View style={styles.content}>
            <AppText style={styles.propertyTitle}>Sample Property #{id}</AppText>
            <AppText>Beautiful property details, media, features, and inquiry action will live here.</AppText>
          </View>
        </AppCard>

        <AppButton title="Contact Owner" onPress={() => router.push('/(tabs)/inbox')} />
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
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  content: {
    gap: 10,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});
