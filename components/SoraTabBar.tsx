import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, shadows } from '@/constants/theme';

// Floating pill tab bar — Sora Prototype.dc.html line "TAB BAR":
// left/right 16, bottom 24, h 64, r 32, rgba(255,255,255,0.62) + blur(18),
// 1px rgba(255,255,255,0.4) border, shadow 0 10px 32 rgba(80,58,107,0.16).
// Active tab: #503a6b pill, white icon/label; inactive: muted ink.

const ICONS: Record<string, string> = {
  index: 'M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z',
  affirm:
    'M12 20s-7.5-4.8-9.3-9.4C1.2 6.6 4 3.5 7.3 3.5c2 0 3.7 1 4.7 2.6a5.5 5.5 0 0 1 4.7-2.6c3.3 0 6.1 3.1 4.6 7.1C19.5 15.2 12 20 12 20z',
  vision: 'M4 4h6.5v6.5H4zM13.5 4H20v4h-6.5zM13.5 11H20v9h-6.5zM4 13.5h6.5V20H4z',
  progress: 'M4 20v-8M10 20V6M16 20v-11M21 20H3',
  profile:
    'M12 11.5a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6zM4.5 20.5c.9-3.4 3.8-5.4 7.5-5.4s6.6 2 7.5 5.4',
};

// Minimal slice of react-navigation's BottomTabBarProps (expo-router vendors
// the package and doesn't export the type publicly).
type TabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string; params?: object }[];
  };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string, params?: object) => void;
  };
};

export function SoraTabBar({ state, descriptors, navigation }: TabBarProps) {
  return (
    <View style={styles.wrap}>
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.fill} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const active = state.index === index;
        const fg = active ? colors.white : colors.muted;
        return (
          <Pressable
            key={route.key}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!active && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            style={[styles.tab, active && styles.tabActive]}>
            <Svg width={21} height={21} viewBox="0 0 24 24">
              <Path
                d={ICONS[route.name] ?? ICONS.index}
                stroke={fg}
                strokeWidth={1.9}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={[styles.label, { color: fg }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    overflow: 'hidden',
    ...shadows.tabBar,
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  tab: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
