import { Platform } from 'react-native';

export const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {
  display: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900' as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900' as const,
  },
  h2: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800' as const,
  },
  h3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800' as const,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700' as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
  button: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800' as const,
  },
};
