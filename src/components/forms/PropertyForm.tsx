import { ReactNode, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { PropertyFormValues } from '@/src/lib/properties/live-properties';

type PropertyFormProps = {
  initialValues?: Partial<PropertyFormValues>;
  submitLabel: string;
  onSubmit: (values: PropertyFormValues) => Promise<void>;
  children?: ReactNode;
};

const defaultValues: PropertyFormValues = {
  title: '',
  listingType: 'rent',
  propertyType: 'flat',
  price: '',
  state: '',
  city: '',
  address: '',
  description: '',
  bedrooms: '',
  bathrooms: '',
  latitude: '',
  longitude: '',
  isPublished: true,
};

export function PropertyForm({
  initialValues,
  submitLabel,
  onSubmit,
  children,
}: PropertyFormProps) {
  const [values, setValues] = useState<PropertyFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!values.title.trim() || !values.state.trim() || !values.city.trim() || !values.price.trim()) {
      Alert.alert('Missing details', 'Title, price, state, and city are required.');
      return;
    }

    try {
      setSaving(true);
      await onSubmit(values);
    } catch (error: any) {
      Alert.alert('Save failed', error?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <AppCard>
        <View style={styles.form}>
          <AppInput
            label="Listing title"
            value={values.title}
            onChangeText={(text) => updateField('title', text)}
            placeholder="e.g. 3 Bedroom Duplex in Lekki"
            autoCapitalize="words"
          />

          <View style={styles.group}>
            <AppText style={styles.groupLabel}>Listing type</AppText>
            <View style={styles.toggleRow}>
              {(['rent', 'lease', 'sale'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.choice, values.listingType === type && styles.choiceActive]}
                  onPress={() => updateField('listingType', type)}
                >
                  <AppText
                    style={[styles.choiceText, values.listingType === type && styles.choiceTextActive]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <AppInput
            label="Property type"
            value={values.propertyType}
            onChangeText={(text) => updateField('propertyType', text)}
            placeholder="e.g. flat, duplex, land"
            autoCapitalize="words"
          />

          <AppInput
            label="Price"
            value={values.price}
            onChangeText={(text) => updateField('price', text)}
            placeholder="e.g. 8000000"
            keyboardType="numeric"
          />

          <View style={styles.twoCol}>
            <View style={styles.col}>
              <AppInput
                label="State"
                value={values.state}
                onChangeText={(text) => updateField('state', text)}
                placeholder="Lagos"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.col}>
              <AppInput
                label="City"
                value={values.city}
                onChangeText={(text) => updateField('city', text)}
                placeholder="Lekki"
                autoCapitalize="words"
              />
            </View>
          </View>

          <AppInput
            label="Address"
            value={values.address}
            onChangeText={(text) => updateField('address', text)}
            placeholder="Optional detailed address"
            autoCapitalize="words"
          />

          <AppInput
            label="Description"
            value={values.description}
            onChangeText={(text) => updateField('description', text)}
            placeholder="Describe the property"
            multiline
          />

          <View style={styles.twoCol}>
            <View style={styles.col}>
              <AppInput
                label="Bedrooms"
                value={values.bedrooms}
                onChangeText={(text) => updateField('bedrooms', text)}
                placeholder="3"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.col}>
              <AppInput
                label="Bathrooms"
                value={values.bathrooms}
                onChangeText={(text) => updateField('bathrooms', text)}
                placeholder="4"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.group}>
            <AppText style={styles.groupLabel}>Map coordinates</AppText>
            <AppText style={styles.helper}>
              Add latitude and longitude so buyers can open the property in Maps.
            </AppText>

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <AppInput
                  label="Latitude"
                  value={values.latitude}
                  onChangeText={(text) => updateField('latitude', text)}
                  placeholder="e.g. 6.5244"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.col}>
                <AppInput
                  label="Longitude"
                  value={values.longitude}
                  onChangeText={(text) => updateField('longitude', text)}
                  placeholder="e.g. 3.3792"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.group}>
            <AppText style={styles.groupLabel}>Publishing</AppText>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.choice, values.isPublished && styles.choiceActive]}
                onPress={() => updateField('isPublished', true)}
              >
                <AppText style={[styles.choiceText, values.isPublished && styles.choiceTextActive]}>
                  Publish now
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.choice, !values.isPublished && styles.choiceActive]}
                onPress={() => updateField('isPublished', false)}
              >
                <AppText style={[styles.choiceText, !values.isPublished && styles.choiceTextActive]}>
                  Save as draft
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </AppCard>

      {children}

      <AppButton
        title={saving ? 'Saving listing...' : submitLabel}
        onPress={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  form: {
    gap: 16,
  },
  group: {
    gap: 10,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  helper: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  choice: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  choiceActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  choiceTextActive: {
    color: colors.white,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
});
