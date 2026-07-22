import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { gradients, motion } from '@/constants/theme';

// The Orb — radial-gradient circle at 32% 28% (CLAUDE.md tokens).
// `small` uses the 3-stop mirror-interstitial variant from the prototype:
// #fff8ef 0% → #f6d9c8 40% → #dcc4ec 100%.
export function Orb({
  size,
  small = false,
  breathe = true,
  breatheDuration = motion.breathe.duration,
  style,
  children,
}: {
  size: number;
  small?: boolean;
  breathe?: boolean;
  breatheDuration?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!breathe) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: motion.breathe.scaleTo,
          duration: breatheDuration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: breatheDuration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scale, breathe, breatheDuration]);

  const stops = small
    ? [
        { offset: '0%', color: '#fff8ef' },
        { offset: '40%', color: '#f6d9c8' },
        { offset: '100%', color: '#dcc4ec' },
      ]
    : gradients.orb.colors.map((color, i) => ({
        offset: `${gradients.orb.locations[i] * 100}%`,
        color,
      }));

  return (
    <Animated.View
      style={[
        { width: size, height: size, borderRadius: size / 2, transform: [{ scale }] },
        style,
      ]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="orb" cx="32%" cy="28%" r="85%">
            {stops.map((s) => (
              <Stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#orb)" />
      </Svg>
      {children != null && (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          {children}
        </View>
      )}
    </Animated.View>
  );
}
