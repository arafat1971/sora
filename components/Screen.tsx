import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';

import { gradients } from '@/constants/theme';

// Standard screen background: linear-gradient(175deg, #f7f0ee 0%, #eee0e4 55%, #e2d8e8 100%)
export function Screen({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <LinearGradient
      colors={gradients.screen.colors}
      locations={gradients.screen.locations}
      start={{ x: 0.55, y: 0 }}
      end={{ x: 0.45, y: 1 }}
      style={[StyleSheet.absoluteFill, style]}>
      {children}
    </LinearGradient>
  );
}
