import { useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { useAuth } from '@/src/providers/AuthProvider';

export default function AppEntryScreen() {
  const { loading, user, profile } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const hasRouted = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 1600);
    return () => clearTimeout(timer);
  }, []);

  const nextRoute = useMemo(() => {
    if (loading || !splashDone) return null;

    if (!user) {
      return '/public';
    }

    const fullName = profile?.full_name?.trim?.() ?? '';
    const phone = profile?.phone?.trim?.() ?? '';
    const activeMode =
      (profile as any)?.active_mode ??
      (profile as any)?.mode ??
      'buyer';

    const needsOnboarding = !fullName || !phone;

    if (needsOnboarding) {
      return '/onboarding';
    }

    if (activeMode === 'seller') {
      return '/seller';
    }

    return '/buyer';
  }, [loading, splashDone, user, profile]);

  useEffect(() => {
    if (!nextRoute || hasRouted.current) return;
    hasRouted.current = true;
    router.replace(nextRoute as any);
  }, [nextRoute]);

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.logoMark}>
            <View style={styles.logoBlockLarge} />
            <View style={styles.logoColumn}>
              <View style={styles.logoBlockSmall} />
              <View style={styles.logoBlockSmall} />
            </View>
          </View>

          <AppText style={styles.brand}>Smart Property</AppText>
          <AppText style={styles.tagline}>
            Discover premium homes. Manage smarter property operations.
          </AppText>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(15,23,42,0.58)',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  logoMark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  logoBlockLarge: {
    width: 26,
    height: 26,
    backgroundColor: colors.white,
    borderRadius: 6,
  },
  logoColumn: {
    gap: 8,
  },
  logoBlockSmall: {
    width: 16,
    height: 16,
    backgroundColor: colors.white,
    borderRadius: 4,
  },
  brand: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.white,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    maxWidth: 320,
  },
});
