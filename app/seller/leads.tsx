import { StyleSheet, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';

export default function SellerLeadsScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <AppText style={styles.title}>Leads & Inquiries</AppText>

        <AppCard>
          <View style={styles.cardContent}>
            <AppText style={styles.cardTitle}>Incoming leads will land here</AppText>
            <AppText>
              Buyer inquiries, dashboard conversations, and WhatsApp-triggered lead alerts will feed into this space.
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
