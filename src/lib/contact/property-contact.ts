import { Linking, Platform } from 'react-native';
import { supabase } from '@/src/lib/supabase/client';

export type PropertyContactDetails = {
  seller_name: string | null;
  seller_phone: string | null;
  seller_whatsapp: string | null;
  seller_email: string | null;
  is_owner: boolean;
};

export async function fetchPropertyContactDetails(propertyId: string) {
  const { data, error } = await supabase.rpc('get_property_contact_details', {
    p_property_id: propertyId,
  });

  if (error) {
    throw error;
  }

  return data as PropertyContactDetails;
}

export function normalizeWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('234')) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `234${digits.slice(1)}`;
  }

  return digits;
}

export async function openPhoneDialer(phone: string) {
  const url = `tel:${phone}`;
  const supported = await Linking.canOpenURL(url);

  if (!supported) {
    throw new Error('Unable to open phone dialer on this device.');
  }

  await Linking.openURL(url);
}

export async function openSms(phone: string, body?: string) {
  const encodedBody = body ? encodeURIComponent(body) : '';
  const separator = Platform.OS === 'ios' ? '&' : '?';
  const url = body ? `sms:${phone}${separator}body=${encodedBody}` : `sms:${phone}`;

  const supported = await Linking.canOpenURL(url);

  if (!supported) {
    throw new Error('Unable to open text messaging on this device.');
  }

  await Linking.openURL(url);
}

export async function openWhatsApp(phone: string, body?: string) {
  const normalized = normalizeWhatsAppNumber(phone);
  const encodedBody = body ? encodeURIComponent(body) : '';
  const url = body
    ? `https://wa.me/${normalized}?text=${encodedBody}`
    : `https://wa.me/${normalized}`;

  const supported = await Linking.canOpenURL(url);

  if (!supported) {
    throw new Error('Unable to open WhatsApp on this device.');
  }

  await Linking.openURL(url);
}

export async function openEmail(email: string, subject?: string, body?: string) {
  const parts = [];
  if (subject) {
    parts.push(`subject=${encodeURIComponent(subject)}`);
  }
  if (body) {
    parts.push(`body=${encodeURIComponent(body)}`);
  }

  const query = parts.length ? `?${parts.join('&')}` : '';
  const url = `mailto:${email}${query}`;

  const supported = await Linking.canOpenURL(url);

  if (!supported) {
    throw new Error('Unable to open email app on this device.');
  }

  await Linking.openURL(url);
}
