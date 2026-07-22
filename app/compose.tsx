import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Orb } from '@/components/Orb';
import { colors, fonts } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { generateVisions, Vision } from '@/lib/api';
import { usePlayback } from '@/store/playback';

// Reference: Composing story + Vision picker overlays in Sora Prototype.dc.html.
// Free-text desire → composing progress → 3-vision swipe picker → player.

const VISION_GRADIENTS: readonly (readonly [string, string, string])[] = [
  ['#f6d8b4', '#eab2a9', '#c795b4'],
  ['#ddd0f2', '#b8a5dd', '#8d7ab8'],
  ['#cfe4da', '#b7d3d8', '#6f8fb4'],
];

export default function ComposeScreen() {
  const router = useRouter();
  const { text } = useLocalSearchParams<{ text: string }>();
  const composeText = (text ?? '').toString();
  const open = usePlayback((s) => s.open);

  const [phase, setPhase] = useState<'composing' | 'visions'>('composing');
  const [pct, setPct] = useState(0);
  const [visions, setVisions] = useState<Vision[]>([]);

  // Progress bar advances while generation runs; reveal the picker once both
  // the visions are back and the bar has filled (min ~2s for the felt moment).
  const doneRef = useRef(false);
  useEffect(() => {
    let mounted = true;
    generateVisions(composeText, '')
      .then((v) => {
        if (mounted) setVisions(v);
      })
      .catch(() => {
        if (mounted) setVisions([]);
      });
    const id = setInterval(() => {
      setPct((p) => {
        const next = Math.min(100, p + 6);
        if (next >= 100 && !doneRef.current) {
          doneRef.current = true;
          clearInterval(id);
          setTimeout(() => mounted && setPhase('visions'), 200);
        }
        return next;
      });
    }, 120);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [composeText]);

  const pickVision = (v: Vision) => {
    track('story_generated', { kind: 'on_demand', latency_ms: 0 });
    open(v.title);
    router.replace('/player');
  };

  if (phase === 'composing') {
    return (
      <LinearGradient
        colors={['#f7e6d9', '#eedbe8', '#dcd8f4']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bg}>
        <View style={styles.root}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Svg width={20} height={20} viewBox="0 0 20 20">
              <Path d="M12.5 4 6.5 10l6 6" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={styles.composingCenter}>
            <Orb size={110} breatheDuration={2200} style={styles.composingOrb} />
            <Text style={styles.composeTitle}>{composeText.trim() || 'Your next vision'}</Text>
            <Text style={styles.composeSub}>Your vision is taking shape…</Text>
          </View>
          <View style={styles.progressBlock}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Composing your story…</Text>
              <Text style={styles.progressLabel}>{pct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={['#c98d3f', '#b06a9a', '#7a68b4']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.progressFill, { width: `${pct}%` }]}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#fdf0e4', '#f4dde6', '#dedaf6']}
      locations={[0, 0.5, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.bg}>
      <View style={styles.visionsRoot}>
        <View style={styles.visionsHeader}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Svg width={20} height={20} viewBox="0 0 20 20">
              <Path d="M12.5 4 6.5 10l6 6" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        </View>
        <Text style={styles.visionsTitle}>Swipe to the vision you want to step into…</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.visionsRow}>
          {visions.map((v, i) => (
            <View key={v.title} style={styles.visionCard}>
              <LinearGradient colors={VISION_GRADIENTS[i % 3]} style={styles.visionHeader}>
                <Text style={styles.visionTag}>VISION 0{i + 1} · 3 MIN</Text>
              </LinearGradient>
              <View style={styles.visionBody}>
                <Text style={styles.visionText}>{v.title}</Text>
                <Pressable onPress={() => pickVision(v)} style={styles.visionPlay}>
                  <Svg width={18} height={18} viewBox="0 0 24 24">
                    <Path d="M8 5.5v13l11-6.5z" fill={colors.white} />
                  </Svg>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
        <Text style={styles.swipeHint}>‹ SWIPE ›</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  root: { flex: 1, paddingTop: 64, paddingHorizontal: 28, paddingBottom: 44 },
  back: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  composingOrb: {
    shadowColor: 'rgba(122,104,180,1)',
    shadowOpacity: 0.38,
    shadowOffset: { width: 0, height: 20 },
    shadowRadius: 50,
    elevation: 12,
  },
  composeTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 24,
    lineHeight: 24 * 1.35,
    maxWidth: 290,
    textAlign: 'center',
    color: colors.ink,
  },
  composeSub: { fontSize: 13, color: colors.muted },
  progressBlock: { gap: 8 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12, color: colors.muted },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(46,36,64,0.12)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  visionsRoot: { flex: 1, paddingTop: 64, paddingBottom: 36 },
  visionsHeader: { paddingHorizontal: 28 },
  visionsTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 25,
    lineHeight: 25 * 1.3,
    textAlign: 'center',
    paddingHorizontal: 44,
    color: colors.ink,
  },
  visionsRow: { alignItems: 'center', gap: 14, paddingHorizontal: 26, paddingVertical: 20 },
  visionCard: {
    width: 240,
    borderRadius: 24,
    backgroundColor: 'rgba(255,250,243,0.9)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 36,
    elevation: 8,
  },
  visionHeader: { height: 130, paddingVertical: 12, paddingHorizontal: 14 },
  visionTag: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: 'rgba(46,36,64,0.6)' },
  visionBody: { padding: 16, gap: 14 },
  visionText: {
    fontFamily: fonts.serifItalic,
    fontSize: 16.5,
    lineHeight: 16.5 * 1.35,
    minHeight: 66,
    color: colors.ink,
  },
  visionPlay: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: 'rgba(46,36,64,0.45)',
  },
});
