import { Alert, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { PropertyForm } from '@/src/components/forms/PropertyForm';
import { useAuth } from '@/src/providers/AuthProvider';
import { createSellerProperty } from '@/src/lib/properties/live-properties';

export default function CreateListingScreen() {
  const { user } = useAuth();

  async function handleCreate(values: any) {
    if (!user?.id) {
      Alert.alert('Session issue', 'Please sign in again.');
      return;
    }

    await createSellerProperty(user.id, values);
    Alert.alert('Listing created', 'Your property has been saved.');
    router.replace('/seller/properties');
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AppHeader
          title="Create Listing"
          subtitle="Add a live property to your seller inventory"
        />

        <PropertyForm submitLabel="Create Listing" onSubmit={handleCreate} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
});
