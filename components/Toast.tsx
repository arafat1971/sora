import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';

import { useToast } from '@/store/toast';

// Toast — Sora Prototype.dc.html: dark pill, bottom 104, fadeUp 0.25s.
export function Toast() {
  const message = useToast((s) => s.message);
  const opacity = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (!message) return;
    opacity.setValue(0);
    ty.setValue(12);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, easing: Easing.ease, useNativeDriver: true }),
      Animated.timing(ty, { toValue: 0, duration: 250, easing: Easing.ease, useNativeDriver: true }),
    ]).start();
  }, [message, opacity, ty]);

  if (!message) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { opacity, transform: [{ translateY: ty }] }]}>
      <Text style={styles.pill}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 104,
    alignItems: 'center',
    zIndex: 60,
  },
  pill: {
    backgroundColor: 'rgba(46,36,64,0.92)',
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: 'rgba(30,22,44,1)',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 10,
  },
});
