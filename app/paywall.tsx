import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Orb } from '@/components/Orb';
import { Screen } from '@/components/Screen';
import { colors, fonts, gradients } from '@/constants/theme';
import { PlanId, usePurchases } from '@/lib/purchases';
import { useOnboarding } from '@/store/onboarding';

// Reference: Sora Paywall v2.dc.html (canonical layout) + the wired paywall in
// Sora Prototype.dc.html (dynamic name/voice copy). Annual pre-selected.

const TIMELINE = [
  {
    t: 'Today — hear your story',
    d: 'Full access. Your first story, rituals, and affirmations unlock now.',
    dot: colors.primary,
    line: true,
  },
  {
    t: 'Day 5 — we remind you',
    d: 'A notification before anything happens. No surprise charges, ever.',
    dot: colors.amberText,
    line: true,
  },
  // Day 7 description follows the selected plan.
  { t: 'Day 7 — trial ends', d: '', dot: colors.green, line: false },
];

// fadeUp 0.5s ease with per-block delay (0 / 0.1 / 0.2 / 0.3s backwards)
function useFadeUp(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, easing: Easing.ease, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 500, delay, easing: Easing.ease, useNativeDriver: true }),
    ]).start();
  }, [opacity, translate, delay]);
  return { opacity, transform: [{ translateY: translate }] };
}

export default function PaywallScreen() {
  const router = useRouter();
  const { plans, startTrial } = usePurchases();
  const name = useOnboarding((s) => s.name) || 'Julia';
  const voice = useOnboarding((s) => s.voice);
  const complete = useOnboarding((s) => s.complete);
  const [selected, setSelected] = useState<PlanId>('annual');

  const plan = plans.find((p) => p.id === selected)!;
  const anim0 = useFadeUp(0);
  const anim1 = useFadeUp(100);
  const anim2 = useFadeUp(200);
  const anim3 = useFadeUp(300);

  const onStart = async () => {
    await startTrial(selected);
    complete();
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={[styles.header, anim0]}>
          <Text style={styles.title}>Your first story is ready, {name}.</Text>
          <Text style={styles.subtitle}>
            Three minutes, set in the life you described. Narrated for you.
          </Text>
        </Animated.View>

        {/* Story behind glass */}
        <Animated.View style={[styles.heroCard, anim1]}>
          <LinearGradient
            colors={gradients.hero.colors}
            locations={gradients.hero.locations}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroInner}>
            <Orb size={76} breatheDuration={5000} style={styles.heroOrb} />
            <Text style={styles.heroLine}>
              "The kettle clicks off as the morning light crosses the window seat — your window
              seat…"
            </Text>
            <Text style={styles.heroMeta}>03:12 · narrated by {voice} · unlocks with your trial</Text>
          </View>
        </Animated.View>

        {/* 1-5-7 honesty timeline */}
        <Animated.View style={[styles.timeline, anim2]}>
          {TIMELINE.map((step) => (
            <View key={step.t} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View style={[styles.timelineDot, { backgroundColor: step.dot }]} />
                {step.line && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineBody}>
                <Text style={styles.timelineTitle}>{step.t}</Text>
                <Text style={styles.timelineDesc}>{step.d || plan.billLine}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <View style={styles.spacer} />

        {/* Plan cards — annual pre-selected */}
        <Animated.View style={[styles.plansRow, anim3]}>
          {plans.map((p) => {
            const on = selected === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setSelected(p.id)}
                style={[styles.planCard, on ? styles.planCardOn : styles.planCardOff]}>
                {!!p.badge && (
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{p.badge}</Text>
                  </View>
                )}
                <Text style={styles.planLabel}>{p.label}</Text>
                <Text style={styles.planPrice}>{p.price}</Text>
                <Text style={styles.planSub}>{p.sub}</Text>
              </Pressable>
            );
          })}
        </Animated.View>

        <Pressable onPress={onStart} style={styles.cta}>
          <Text style={styles.ctaText}>Start 7 days free</Text>
        </Pressable>
        <Text style={styles.footnote}>{plan.footnote} · Cancel in two taps, anytime.</Text>
        <View style={styles.linksRow}>
          <Text style={styles.link}>Privacy</Text>
          <Text style={styles.link}>Terms</Text>
          <Text style={styles.link}>Restore</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingTop: 74,
    paddingHorizontal: 28,
    paddingBottom: 44,
  },
  header: { gap: 8 },
  title: {
    fontFamily: fonts.serifItalic,
    fontSize: 30,
    lineHeight: 30 * 1.2,
    color: colors.headline,
  },
  subtitle: { fontSize: 14, lineHeight: 14 * 1.6, color: 'rgba(46,36,64,0.6)' },
  heroCard: {
    marginTop: 22,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: 'rgba(70,50,100,1)',
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 32,
    elevation: 8,
  },
  heroInner: {
    paddingVertical: 26,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 14,
  },
  heroOrb: {
    shadowColor: 'rgba(60,45,90,1)',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 30,
    elevation: 10,
  },
  heroLine: {
    fontFamily: fonts.serifItalic,
    fontSize: 19,
    lineHeight: 19 * 1.35,
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(40,30,60,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
  heroMeta: { fontSize: 11.5, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  timeline: { marginTop: 26 },
  timelineRow: { flexDirection: 'row', gap: 14 },
  timelineRail: { width: 20, alignItems: 'center' },
  timelineDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  timelineLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: 'rgba(46,36,64,0.12)',
    marginVertical: 4,
  },
  timelineBody: { flex: 1, gap: 1, paddingBottom: 16 },
  timelineTitle: { fontSize: 13.5, fontWeight: '600', color: colors.headline },
  timelineDesc: { fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.muted },
  spacer: { flex: 1 },
  plansRow: { flexDirection: 'row', gap: 10 },
  planCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 2,
  },
  planCardOn: { borderColor: colors.primary, backgroundColor: 'rgba(80,58,107,0.08)' },
  planCardOff: { borderColor: 'rgba(46,36,64,0.1)', backgroundColor: colors.cardFill },
  planBadge: {
    position: 'absolute',
    top: -9,
    right: 12,
    backgroundColor: colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 9,
  },
  planBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1, color: colors.white },
  planLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1.4, color: 'rgba(46,36,64,0.5)' },
  planPrice: { fontFamily: fonts.serifMedium, fontSize: 24, color: colors.headline },
  planSub: { fontSize: 11, color: 'rgba(46,36,64,0.5)' },
  cta: {
    marginTop: 14,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 6,
  },
  ctaText: { color: colors.white, fontSize: 15.5, fontWeight: '600' },
  footnote: { marginTop: 10, fontSize: 12, textAlign: 'center', color: 'rgba(46,36,64,0.5)' },
  linksRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'center', gap: 22 },
  link: { fontSize: 11.5, color: 'rgba(46,36,64,0.4)' },
});
