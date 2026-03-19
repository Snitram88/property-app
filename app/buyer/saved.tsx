import { StyleSheet, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';

export default function BuyerSavedScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <AppText style={styles.title}>Saved Properties</AppText>

        <AppCard>
          <View style={styles.cardContent}>
            <AppText style={styles.cardTitle}>Nothing saved yet</AppText>
            <AppText>
              Your premium shortlist will appear here once you start saving listings.
            </AppText>
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
