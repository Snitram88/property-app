import { Linking, Platform } from 'react-native';

type PropertyMapPayload = {
  title?: string | null;
  locationText?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

function encode(value: string) {
  return encodeURIComponent(value);
}

export async function openPropertyMap({
  title,
  locationText,
  address,
  latitude,
  longitude,
}: PropertyMapPayload) {
  const label = [title, address, locationText].filter(Boolean).join(', ');
  const fallbackText = label || locationText || address || 'Property location';

  const urls: string[] = [];

  if (latitude != null && longitude != null) {
    if (Platform.OS === 'ios') {
      urls.push(`http://maps.apple.com/?ll=${latitude},${longitude}&q=${encode(label || 'Property')}`);
    }

    if (Platform.OS === 'android') {
      urls.push(`geo:0,0?q=${latitude},${longitude}(${encode(label || 'Property')})`);
    }

    urls.push(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
  }

  if (fallbackText) {
    if (Platform.OS === 'ios') {
      urls.push(`http://maps.apple.com/?q=${encode(fallbackText)}`);
    }

    if (Platform.OS === 'android') {
      urls.push(`geo:0,0?q=${encode(fallbackText)}`);
    }

    urls.push(`https://www.google.com/maps/search/?api=1&query=${encode(fallbackText)}`);
  }

  for (const url of urls) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      continue;
    }
  }

  throw new Error('No map application was available for this property location.');
}
