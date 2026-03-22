import { useEffect } from 'react';
import { router } from 'expo-router';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/public');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80' }}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(15,23,42,0.25)', 'rgba(15,23,42,0.72)']}
        style={styles.overlay}
      >
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
      </LinearGradient>
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
