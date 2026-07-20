import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Orb } from '@/components/Orb';
import { Screen } from '@/components/Screen';
import { colors, fonts, motion } from '@/constants/theme';
import { isInvestedToday, isSealedToday, REWARDS, useSeal } from '@/store/seal';

// Reference: Sora Progress UI v3.dc.html (canonical). Ritual above the fold,
// evidence below as flat editorial rows. Goal/sign rows are the reference's
// demo data until the backend drives them (Dev Handoff §3).

const GOALS = [
  { t: 'The flat with the window seat', p: 62, sessions: 11, signs: 2, last: 'story today', chip: 'SURGING', chipFg: colors.green },
  { t: "Calm that doesn't crack under deadlines", p: 44, sessions: 7, signs: 1, last: '2 days ago', chip: 'STEADY', chipFg: colors.amberText },
  { t: 'The studio paying my rent', p: 18, sessions: 3, signs: 0, last: '5 days ago', chip: 'WARMING UP', chipFg: colors.primary },
];

const SIGNS = [
  { t: 'Landlord emailed back first — viewing booked for the exact street from my story.', d: 'Today', goal: 'The flat' },
  { t: "Stayed calm through the launch review. Didn't even notice until after.", d: 'Yesterday', goal: 'Calm' },
];

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// glowPulse: box-shadow ring 0→10px fading, 2.4s infinite
function GlowRing({ size }: { size: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: motion.glowPulse.duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: motion.glowPulse.duration / 2, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  const ring = motion.glowPulse.ringPx;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size + ring * 2,
        height: size + ring * 2,
        borderRadius: (size + ring * 2) / 2,
        backgroundColor: 'rgba(80,58,107,0.25)',
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
        transform: [
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [size / (size + ring * 2), 1] }) },
        ],
      }}
    />
  );
}

// revealIn: scale 0.96→1 + fade, 0.4s
function useRevealIn(active: boolean, delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  useEffect(() => {
    if (!active) {
      opacity.setValue(0);
      scale.setValue(0.96);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: motion.revealIn.duration, delay, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: motion.revealIn.duration, delay, useNativeDriver: true }),
    ]).start();
  }, [active, opacity, scale, delay]);
  return { opacity, transform: [{ scale }] };
}

export default function ProgressScreen() {
  const store = useSeal();
  const sealed = useSeal(isSealedToday);
  const invested = useSeal(isInvestedToday);
  // Re-derive "today" when the screen is up across midnight.
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const sealAnim = useRevealIn(sealed);
  const rewardAnim = useRevealIn(sealed, 150);

  const day = store.planDay;
  const streak = store.streak;
  // Reference logic generalized: today's column follows the real weekday.
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.eyebrow}>DAY {day} OF 14</Text>
          <Text style={[styles.eyebrow, { color: colors.amberText }]}>{streak}-DAY STREAK</Text>
        </View>

        {/* Ritual: daily seal */}
        <View style={styles.ritual}>
          <Text style={styles.heroLine}>
            {sealed ? `Held. Day ${day} is yours.` : "Six days held. Don't let tonight be the gap."}
          </Text>
          {!sealed ? (
            <>
              <View style={styles.sealWrap}>
                <GlowRing size={120} />
                <Pressable onPress={store.seal}>
                  <Orb size={120} breathe={false}>
                    <View style={styles.holdBadge}>
                      <Text style={styles.holdBadgeText}>HOLD TODAY</Text>
                    </View>
                  </Orb>
                </Pressable>
              </View>
              <Text style={styles.sealHint}>One tap. Sora reads back what moved today.</Text>
            </>
          ) : (
            <>
              <Animated.View style={[styles.sealedOrb, sealAnim]}>
                <Orb size={120} breathe={false}>
                  <Svg width={32} height={32} viewBox="0 0 34 34">
                    <Path d="M8 18l6 6 12-14" stroke={colors.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </Orb>
              </Animated.View>
              <Animated.View style={[styles.reward, rewardAnim]}>
                <Text style={styles.rewardEyebrow}>TODAY SORA NOTICED</Text>
                <Text style={styles.rewardText}>{REWARDS[store.rewardIdx]}</Text>
                <Pressable onPress={store.reroll}>
                  <Text style={styles.reroll}>Read another</Text>
                </Pressable>
              </Animated.View>
            </>
          )}
        </View>

        {/* Streak strip */}
        <View style={styles.streakStrip}>
          {WEEK_LABELS.map((l, i) => {
            const done = i < todayIdx || (i === todayIdx && sealed);
            const today = i === todayIdx && !sealed;
            return (
              <View key={i} style={styles.streakDay}>
                <View
                  style={[
                    styles.dotRing,
                    i === todayIdx && sealed && { backgroundColor: 'rgba(80,58,107,0.15)' },
                  ]}>
                  <View
                    style={[
                      styles.streakDot,
                      {
                        backgroundColor: done
                          ? colors.primary
                          : today
                            ? 'rgba(80,58,107,0.25)'
                            : 'rgba(46,36,64,0.12)',
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.streakLabel,
                    { color: today ? colors.primary : 'rgba(46,36,64,0.4)' },
                  ]}>
                  {l}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.streakNudge}>
          {sealed
            ? 'Longest streak yet. Tomorrow makes it a full week.'
            : '94% of members who reach day 7 notice a sign that same week.'}
        </Text>

        {/* Goal momentum */}
        <View style={styles.sectionHead}>
          <Text style={styles.eyebrow}>GOAL MOMENTUM</Text>
          <Text style={styles.sectionMeta}>signs + sessions</Text>
        </View>
        <View style={styles.sectionBody}>
          {GOALS.map((g) => (
            <View key={g.t} style={styles.goalRow}>
              <View style={styles.goalTitleRow}>
                <Text style={styles.goalTitle}>{g.t}</Text>
                <Text style={[styles.goalChip, { color: g.chipFg }]}>{g.chip}</Text>
              </View>
              <View style={styles.goalTrack}>
                <LinearGradient
                  colors={[colors.amber, '#b06a9a']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{ height: '100%', width: `${g.p}%` }}
                />
              </View>
              <View style={styles.goalStats}>
                <Text style={styles.goalStat}>
                  <Text style={styles.goalStatStrongInk}>{g.sessions}</Text> sessions
                </Text>
                <Text style={styles.goalStat}>
                  <Text style={styles.goalStatStrongGreen}>{g.signs}</Text> signs
                </Text>
                <Text style={styles.goalLast}>{g.last}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Signs */}
        <View style={styles.sectionHead}>
          <Text style={styles.eyebrow}>SIGNS IT'S WORKING</Text>
          <Pressable>
            <Text style={styles.logSign}>+ Log a sign</Text>
          </Pressable>
        </View>
        <View style={styles.sectionBody}>
          {SIGNS.map((sg) => (
            <View key={sg.t} style={styles.signRow}>
              <View style={styles.signDotRing}>
                <View style={styles.signDot} />
              </View>
              <View style={styles.signBody}>
                <Text style={styles.signText}>{sg.t}</Text>
                <Text style={styles.signMeta}>
                  {sg.d} · {sg.goal}
                </Text>
              </View>
            </View>
          ))}
          <Text style={styles.signsFootnote}>
            Every sign makes tomorrow's story more specific — Sora writes them in.
          </Text>
        </View>

        {/* Investment */}
        <Pressable onPress={store.invest} style={styles.investRow}>
          <View style={styles.investBody}>
            <Text style={styles.investLabel}>
              {invested ? 'Detail added — the story just got sharper' : 'Add one detail from today'}
            </Text>
            <Text style={styles.investSub}>
              {invested
                ? '“She mentioned the south-facing light” is now in the plot.'
                : "One line. Tomorrow's story will quote it back."}
            </Text>
          </View>
          <View style={styles.investPlus}>
            <Svg width={12} height={12} viewBox="0 0 12 12">
              <Path d="M6 1.5v9M1.5 6h9" stroke={colors.primary} strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          </View>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 72, paddingHorizontal: 26, paddingBottom: 130 },
  topRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.4,
    color: 'rgba(46,36,64,0.45)',
  },
  ritual: { marginTop: 28, alignItems: 'center', gap: 16 },
  heroLine: {
    fontFamily: fonts.serifItalic,
    fontSize: 25,
    lineHeight: 25 * 1.3,
    color: colors.headline,
    maxWidth: 270,
    textAlign: 'center',
  },
  sealWrap: { alignItems: 'center', justifyContent: 'center' },
  holdBadge: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 14,
  },
  holdBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: colors.primary },
  sealHint: { fontSize: 12, color: 'rgba(46,36,64,0.5)' },
  sealedOrb: {
    shadowColor: 'rgba(122,104,180,1)',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 38,
    elevation: 10,
    borderRadius: 60,
  },
  reward: { gap: 9, alignItems: 'center' },
  rewardEyebrow: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 2.2,
    color: 'rgba(46,36,64,0.45)',
  },
  rewardText: {
    fontFamily: fonts.serifItalic,
    fontSize: 17,
    lineHeight: 17 * 1.5,
    color: colors.headline,
    maxWidth: 290,
    textAlign: 'center',
  },
  reroll: {
    paddingVertical: 6,
    paddingHorizontal: 2,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(46,36,64,0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,36,64,0.2)',
  },
  streakStrip: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(46,36,64,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,36,64,0.1)',
    paddingVertical: 15,
    paddingHorizontal: 2,
  },
  streakDay: { alignItems: 'center', gap: 7 },
  // box-shadow 0 0 0 3px rings from the reference, as wrapper views
  dotRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    margin: -3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakDot: { width: 8, height: 8, borderRadius: 4 },
  streakLabel: { fontSize: 9.5, fontWeight: '600', letterSpacing: 1 },
  streakNudge: {
    marginTop: 11,
    fontSize: 12.5,
    lineHeight: 12.5 * 1.55,
    color: colors.muted,
    textAlign: 'center',
  },
  sectionHead: {
    marginTop: 34,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionMeta: { fontSize: 11, color: 'rgba(46,36,64,0.4)' },
  sectionBody: { marginTop: 4 },
  goalRow: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,36,64,0.08)',
    gap: 8,
  },
  goalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalTitle: {
    flex: 1,
    fontFamily: fonts.serifItalic,
    fontSize: 16,
    lineHeight: 16 * 1.3,
    color: colors.headline,
  },
  goalChip: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  goalTrack: { height: 2, backgroundColor: 'rgba(80,58,107,0.1)', overflow: 'hidden' },
  // amber→mauve momentum line
  goalFillA: { height: '100%', backgroundColor: colors.amber },
  goalStats: { flexDirection: 'row', gap: 14, alignItems: 'baseline' },
  goalStat: { fontSize: 11.5, color: colors.muted },
  goalStatStrongInk: { fontWeight: '700', color: colors.ink },
  goalStatStrongGreen: { fontWeight: '700', color: colors.green },
  goalLast: { marginLeft: 'auto', fontSize: 11.5, color: 'rgba(46,36,64,0.45)' },
  logSign: { fontSize: 12.5, fontWeight: '600', color: colors.primary },
  signRow: {
    flexDirection: 'row',
    gap: 13,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,36,64,0.08)',
  },
  signDotRing: {
    marginTop: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(94,160,124,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  signBody: { flex: 1, gap: 3 },
  signText: { fontSize: 13.5, lineHeight: 13.5 * 1.45, color: colors.ink },
  signMeta: { fontSize: 11, color: 'rgba(46,36,64,0.45)' },
  signsFootnote: {
    paddingVertical: 13,
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: 'rgba(46,36,64,0.5)',
  },
  investRow: {
    marginTop: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(46,36,64,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,36,64,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  investBody: { flex: 1, gap: 2 },
  investLabel: { fontFamily: fonts.serifItalic, fontSize: 17, color: colors.headline },
  investSub: { fontSize: 12, color: 'rgba(46,36,64,0.5)' },
  investPlus: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(80,58,107,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
