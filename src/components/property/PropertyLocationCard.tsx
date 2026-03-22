import { Alert, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { openPropertyMap } from '@/src/lib/maps/open-property-map';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

type PropertyLocationCardProps = {
  title?: string | null;
  locationText?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export function PropertyLocationCard({
  title,
  locationText,
  address,
  latitude,
  longitude,
}: PropertyLocationCardProps) {
  async function handleOpenMap() {
    try {
      await openPropertyMap({
        title,
        locationText,
        address,
        latitude,
        longitude,
      });
    } catch (error: any) {
      Alert.alert('Map unavailable', error?.message ?? 'Unable to open map application.');
    }
  }

  return (
    <AppCard>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Ionicons name="map-outline" size={18} color={colors.primary} />
          <AppText variant="h3">Location</AppText>
        </View>

        <View style={styles.infoGroup}>
          {locationText ? (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
              <AppText color={colors.textMuted}>{locationText}</AppText>
            </View>
          ) : null}

          {address ? (
            <View style={styles.infoRow}>
              <Ionicons name="pin-outline" size={16} color={colors.textMuted} />
              <AppText color={colors.textMuted}>{address}</AppText>
            </View>
          ) : null}

          {(latitude != null && longitude != null) ? (
            <View style={styles.infoRow}>
              <Ionicons name="navigate-outline" size={16} color={colors.textMuted} />
              <AppText color={colors.textMuted}>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </AppText>
            </View>
          ) : (
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
              <AppText color={colors.textMuted}>
                Exact coordinates are not available yet, but you can still open the location in Maps.
              </AppText>
            </View>
          )}
        </View>

        <AppButton
          title="Open in Maps"
          variant="secondary"
          onPress={handleOpenMap}
          icon="map-outline"
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoGroup: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
});
