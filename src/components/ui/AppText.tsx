import { Text, TextProps, TextStyle, StyleProp } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';

type Variant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'body'
  | 'bodyStrong'
  | 'caption';

type AppTextProps = TextProps & {
  variant?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
};

const variantStyles: Record<Variant, TextStyle> = {
  display: typography.display,
  h1: typography.h1,
  h2: typography.h2,
  h3: typography.h3,
  title: typography.title,
  body: typography.body,
  bodyStrong: typography.bodyStrong,
  caption: typography.caption,
};

export function AppText({
  variant = 'body',
  color = colors.text,
  style,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        {
          color,
          letterSpacing: -0.2,
        },
        variantStyles[variant],
        style,
      ]}
    >
      {children}
    </Text>
  );
}
