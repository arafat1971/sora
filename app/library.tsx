import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { SegControl } from '@/components/SegControl';
import { colors, fonts } from '@/constants/theme';
import { usePlayback } from '@/store/playback';

// Reference: Library overlay in Sora Prototype.dc.html — Favorites / Themes /
// Rituals segments over the story archive; Rituals adds "NEXT UP TONIGHT".

type Seg = 'fav' | 'themes' | 'rituals';

const SEGMENTS = [
  { id: 'fav', label: 'Favorites' },
  { id: 'themes', label: 'Themes' },
  { id: 'rituals', label: 'Rituals' },
] as const;

const ROWS: Record<Seg, { t: string; d: string }[]> = {
  fav: [
    { t: 'A quiet morning inside your own sunlit flat', d: '03:12 · played 9 times' },
    { t: 'That evening I stopped rushing and the world slowed down with me', d: '03:18 · played 6 times' },
    { t: 'The way my heart stayed steady during the hard conversation', d: '02:41 · played 4 times' },
  ],
  themes: [
    { t: 'Serene countryside living', d: '5 stories · calm, green, unhurried' },
    { t: 'The studio takes off', d: '4 stories · your name on the door' },
    { t: 'Money moves toward me', d: '3 stories · ease, not grind' },
  ],
  rituals: [
    { t: 'Morning ritual: rise into it', d: '02:00 · daily at 7:15am' },
    { t: 'Wind-down: the day releases you', d: '03:00 · daily at 9:30pm' },
    { t: 'Sleep on it: 8-hour whispers', d: '8:00:00 · softest volume' },
  ],
};

export default function LibraryScreen() {
  const router = useRouter();
  const open = usePlayback((s) => s.open);
  const [seg, setSeg] = useState<Seg>('fav');

  const play = (title: string) => {
    open(title);
    router.push('/player');
  };

  return (
    <LinearGradient
      colors={['#fdf0e4', '#f4dde6', '#dedaf6']}
      locations={[0, 0.45, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.bg}>
      <View style={styles.root}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Svg width={20} height={20} viewBox="0 0 20 20">
              <Path d="M12.5 4 6.5 10l6 6" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Text style={styles.headerEyebrow}>LIBRARY</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <SegControl segments={SEGMENTS} value={seg} onChange={setSeg} />
          <View style={styles.list}>
            {ROWS[seg].map((r) => (
              <View key={r.t} style={styles.row}>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{r.t}</Text>
                  <Text style={styles.rowMeta}>{r.d}</Text>
                </View>
                <Pressable onPress={() => play(r.t)} style={styles.rowPlay}>
                  <Svg width={16} height={16} viewBox="0 0 16 16">
                    <Path d="M5 3v10l8-5z" fill={colors.primary} />
                  </Svg>
                </Pressable>
              </View>
            ))}
          </View>
          {seg === 'rituals' && (
            <>
              <Text style={styles.nextUpLabel}>NEXT UP TONIGHT</Text>
              <View style={styles.nextUpRow}>
                <Svg width={22} height={22} viewBox="0 0 24 24">
                  <Path d="M20 13.5A8 8 0 0 1 9.5 3a8 8 0 1 0 10.5 10.5z" fill="none" stroke="#6a5a9e" strokeWidth={1.7} strokeLinejoin="round" />
                </Svg>
                <View style={styles.rowBody}>
                  <Text style={styles.nextUpTitle}>Wind-down: the day releases you</Text>
                  <Text style={styles.rowMeta}>Queued for 9:30pm · your usual</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  root: { flex: 1, paddingTop: 64, paddingHorizontal: 22, paddingBottom: 30 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
  headerEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, color: colors.muted },
  content: { paddingTop: 6, paddingBottom: 20 },
  list: { gap: 10, marginTop: 16 },
  row: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.45)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowBody: { flex: 1 },
  rowTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 14.5,
    lineHeight: 14.5 * 1.35,
    color: colors.ink,
  },
  rowMeta: { fontSize: 11.5, color: 'rgba(46,36,64,0.5)', marginTop: 3 },
  rowPlay: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(80,58,107,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextUpLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(46,36,64,0.5)',
    marginTop: 18,
    marginBottom: 10,
  },
  nextUpRow: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.45)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextUpTitle: { fontFamily: fonts.serifItalic, fontSize: 14.5, color: colors.ink },
});
