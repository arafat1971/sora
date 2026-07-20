import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { Screen } from '@/components/Screen';
import { colors, fonts, gradients } from '@/constants/theme';
import { useOnboarding } from '@/store/onboarding';
import { DEFAULT_TITLE, usePlayback } from '@/store/playback';
import { useSeal } from '@/store/seal';

// Reference: Home in Sora Prototype.dc.html. Copy, demo data, and section
// order are final. Goal/recent data becomes server truth with the backend.

const FOR_YOU = [
  {
    tag: 'DEEP CONNECTION',
    t: 'Shared Sunday mornings at a sunlit library desk',
    g: ['#f6d8b4', '#eab2a9', '#c795b4'] as const,
  },
  {
    tag: 'ABUNDANCE',
    t: "The month the studio's waitlist opened — and filled",
    g: ['#ded1f3', '#b8a5dd', '#8d7ab8'] as const,
  },
  {
    tag: 'INNER PEACE',
    t: 'Discussing future blueprints while the skyline glows',
    g: ['#d3e6dc', '#b7d3d8', '#6f8fb4'] as const,
  },
];

const GOALS = [
  { t: 'Inner peace that stays', n: '7 stories', p: 64 },
  { t: 'The studio takes off', n: '5 stories', p: 40 },
  { t: 'A home that feels like me', n: '4 stories', p: 28 },
];

const RECENT = [
  { t: 'That evening I stopped rushing and the world slowed down with me', d: '03:18 · yesterday' },
  { t: 'The way my heart stayed steady during the hard conversation', d: '02:41 · Tuesday' },
];

function useRefreshClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return `08:01:${String(59 - now.getSeconds()).padStart(2, '0')}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const name = useOnboarding((s) => s.name) || 'Julia';
  const voice = useOnboarding((s) => s.voice);
  const streak = useSeal((s) => s.streak);
  const open = usePlayback((s) => s.open);
  const [composeText, setComposeText] = useState('');
  const [favs, setFavs] = useState<Record<number, boolean>>({});
  const refreshIn = useRefreshClock();

  const play = (title?: string) => {
    open(title);
    router.push('/player');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Greeting + streak chip */}
        <View style={styles.greetRow}>
          <View style={styles.greetCol}>
            <Text style={styles.greeting}>Good morning, {name}</Text>
            <Text style={styles.greetSub}>Everything you want is already on its way.</Text>
          </View>
          <View style={styles.streakChip}>
            <Svg width={13} height={15} viewBox="0 0 13 15">
              <Path
                d="M6.5 0C7 3 10.5 4.5 10.5 8.5a4 4 0 0 1-8 0C2.5 5.5 4.5 4 4.5 1.5 5.5 2 6.3 2.6 6.5 0z"
                fill={colors.amber}
                transform="translate(1,1) scale(0.9)"
              />
            </Svg>
            <Text style={styles.streakText}>Day {streak}</Text>
          </View>
        </View>

        {/* Manifest composer */}
        <View style={styles.composer}>
          <Text style={styles.composerTitle}>What do you want to manifest?</Text>
          <View style={styles.composerRow}>
            <TextInput
              value={composeText}
              onChangeText={setComposeText}
              placeholder="him obsessed with me…"
              placeholderTextColor="rgba(46,36,64,0.34)"
              style={styles.composerInput}
            />
            <Pressable style={styles.composerBtn}>
              <Svg width={18} height={18} viewBox="0 0 20 20">
                <Path d="M10 16V4M10 4 5.5 8.5M10 4l4.5 4.5" stroke={colors.white} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          </View>
        </View>

        {/* Today's Moment */}
        <View style={styles.momentCard}>
          <LinearGradient
            colors={gradients.hero.colors}
            locations={gradients.hero.locations}
            style={StyleSheet.absoluteFill}
          />
          {/* sun glow at 73% 30% */}
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="sun" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#fff3d9" />
                <Stop offset="48%" stopColor="#fff3d9" />
                <Stop offset="58%" stopColor="rgba(255,243,217,0.45)" />
                <Stop offset="64%" stopColor="rgba(255,243,217,0)" />
                <Stop offset="100%" stopColor="rgba(255,243,217,0)" />
              </RadialGradient>
            </Defs>
            <Circle cx="73%" cy="30%" r={54} fill="url(#sun)" />
          </Svg>
          <LinearGradient
            colors={['rgba(40,30,60,0)', 'rgba(40,30,60,0.52)']}
            locations={[0.34, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.momentInner}>
            <View style={styles.momentTop}>
              <Text style={styles.momentEyebrow}>TODAY'S MOMENT</Text>
              <View style={styles.momentPill}>
                <Text style={styles.momentPillText}>new in 14h 22m</Text>
              </View>
            </View>
            <View style={styles.momentBody}>
              <Text style={styles.momentTitle}>{DEFAULT_TITLE}</Text>
              <View style={styles.momentPlayRow}>
                <Pressable onPress={() => play()} style={styles.momentPlayBtn}>
                  <Svg width={20} height={20} viewBox="0 0 24 24">
                    <Path d="M8 5.5v13l11-6.5z" fill={colors.primary} />
                  </Svg>
                </Pressable>
                <Text style={styles.momentMeta}>03:12 · narrated by {voice}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rituals row */}
        <View style={styles.ritualsRow}>
          <Pressable onPress={() => play()} style={styles.ritualCard}>
            <LinearGradient colors={['#f5c497', '#dd9cab']} style={styles.ritualIcon}>
              <Svg width={17} height={17} viewBox="0 0 26 26">
                <Circle cx={13} cy={13} r={5} fill="none" stroke={colors.white} strokeWidth={1.9} />
                <Path d="M13 2.5v3M13 20.5v3M2.5 13h3M20.5 13h3M5.6 5.6l2.1 2.1M18.3 18.3l2.1 2.1M20.4 5.6l-2.1 2.1M7.7 18.3l-2.1 2.1" stroke={colors.white} strokeWidth={1.9} strokeLinecap="round" />
              </Svg>
            </LinearGradient>
            <View>
              <Text style={styles.ritualTitle}>Morning ritual</Text>
              <Text style={styles.ritualSub}>2 min · rise</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => play()} style={styles.ritualCard}>
            <LinearGradient colors={['#9480bd', '#4e3f72']} style={styles.ritualIcon}>
              <Svg width={17} height={17} viewBox="0 0 24 24">
                <Path d="M20 13.5A8 8 0 0 1 9.5 3a8 8 0 1 0 10.5 10.5z" fill="none" stroke={colors.white} strokeWidth={1.9} strokeLinejoin="round" />
              </Svg>
            </LinearGradient>
            <View>
              <Text style={styles.ritualTitle}>Wind-down</Text>
              <Text style={styles.ritualSub}>3 min · release</Text>
            </View>
          </Pressable>
        </View>

        {/* Journal link */}
        <View style={styles.journalRow}>
          <Pressable style={styles.journalBtn}>
            <Text style={styles.journalText}>Journal</Text>
          </Pressable>
        </View>

        {/* Future-self letter */}
        <Pressable onPress={() => router.push('/letter')} style={styles.letterWrap}>
          <LinearGradient
            colors={['rgba(255,248,238,0.9)', 'rgba(244,230,246,0.85)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.letterCard}>
            <Text style={styles.letterEyebrow}>A NOTE FROM FUTURE {name.toUpperCase()}</Text>
            <Text style={styles.letterLine}>
              "The flat is real. The calm became the way we live. Keep going — I'm writing this
              from the window seat…"
            </Text>
            <Text style={styles.letterLink}>Read the letter →</Text>
          </LinearGradient>
        </Pressable>

        {/* For you */}
        <Text style={styles.sectionTitle}>For you</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}>
          {FOR_YOU.map((f, i) => (
            <View key={f.tag} style={styles.forYouCard}>
              <LinearGradient colors={f.g} style={styles.forYouHeader}>
                <Text style={styles.forYouTag}>{f.tag} · 3 MIN</Text>
              </LinearGradient>
              <View style={styles.forYouBody}>
                <Text style={styles.forYouTitle}>{f.t}</Text>
                <View style={styles.forYouActions}>
                  <Pressable onPress={() => play(f.t)} style={styles.forYouPlay}>
                    <Svg width={15} height={15} viewBox="0 0 24 24">
                      <Path d="M8 5.5v13l11-6.5z" fill={colors.white} />
                    </Svg>
                  </Pressable>
                  <Pressable
                    onPress={() => setFavs((p) => ({ ...p, [i]: !p[i] }))}
                    style={styles.forYouFav}>
                    <Svg width={19} height={17} viewBox="0 0 24 22">
                      <Path
                        d="M12 20.5S2.5 15 1.2 8.7A5.6 5.6 0 0 1 12 5a5.6 5.6 0 0 1 10.8 3.7C21.5 15 12 20.5 12 20.5z"
                        fill={favs[i] ? '#c76d8b' : 'none'}
                        stroke="#c76d8b"
                        strokeWidth={1.6}
                      />
                    </Svg>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Refresh countdown */}
        <View style={styles.refreshWrap}>
          <Text style={styles.refreshEyebrow}>ALL STORIES REFRESH IN</Text>
          <Text style={styles.refreshClock}>{refreshIn}</Text>
          <View style={styles.refreshTrack}>
            <LinearGradient
              colors={[colors.primary, '#b06a9a']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.refreshFill}
            />
          </View>
        </View>

        {/* Manifesting now */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitleInline}>Manifesting now</Text>
          <Pressable>
            <Text style={styles.sectionLink}>+ New goal</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}>
          {GOALS.map((g) => (
            <Pressable key={g.t} onPress={() => play()} style={styles.goalCard}>
              <Text style={styles.goalTitle}>{g.t}</Text>
              <Text style={styles.goalMeta}>{g.n}</Text>
              <View style={styles.goalTrack}>
                <LinearGradient
                  colors={[colors.amber, '#b06a9a']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.goalFill, { width: `${g.p}%` }]}
                />
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Recently played */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitleInline}>Recently played</Text>
          <Pressable>
            <Text style={styles.sectionLink}>Library →</Text>
          </Pressable>
        </View>
        <View style={styles.recentList}>
          {RECENT.map((r) => (
            <View key={r.t} style={styles.recentRow}>
              <View style={styles.recentBody}>
                <Text style={styles.recentTitle}>{r.t}</Text>
                <Text style={styles.recentMeta}>{r.d}</Text>
              </View>
              <Pressable onPress={() => play(r.t)} style={styles.recentPlay}>
                <Svg width={16} height={16} viewBox="0 0 16 16">
                  <Path d="M5 3v10l8-5z" fill={colors.primary} />
                </Svg>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 66, paddingHorizontal: 22, paddingBottom: 130 },
  greetRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greetCol: { flex: 1 },
  greeting: { fontFamily: fonts.serifItalic, fontSize: 28, color: colors.ink },
  greetSub: { fontSize: 13, color: 'rgba(46,36,64,0.58)', marginTop: 2 },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: 'rgba(201,141,63,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(201,141,63,0.25)',
  },
  streakText: { fontSize: 13, fontWeight: '700', color: colors.amberText },
  composer: { marginTop: 16, gap: 10 },
  composerTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 21,
    lineHeight: 21 * 1.3,
    color: colors.ink,
  },
  composerRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  composerInput: {
    flex: 1,
    minWidth: 0,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 18,
    fontSize: 14.5,
    fontStyle: 'italic',
    color: colors.ink,
  },
  composerBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  momentCard: {
    marginTop: 14,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: 'rgba(70,50,100,1)',
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 32,
    elevation: 8,
  },
  momentInner: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 20, gap: 38 },
  momentTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  momentEyebrow: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.88)',
    textShadowColor: 'rgba(40,30,60,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  momentPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 11,
  },
  momentPillText: { fontSize: 11, fontWeight: '600', color: colors.white },
  momentBody: { gap: 12 },
  momentTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 22,
    lineHeight: 22 * 1.3,
    color: colors.white,
    textShadowColor: 'rgba(40,30,60,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 16,
  },
  momentPlayRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  momentPlayBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(30,22,44,1)',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 6,
  },
  momentMeta: { fontSize: 12, color: 'rgba(255,255,255,0.82)' },
  ritualsRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  ritualCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.45)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ritualIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ritualTitle: { fontSize: 13.5, fontWeight: '600', color: colors.ink },
  ritualSub: { fontSize: 11.5, color: 'rgba(46,36,64,0.5)' },
  journalRow: { flexDirection: 'row', justifyContent: 'center', gap: 26, marginTop: 16 },
  journalBtn: {
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,36,64,0.2)',
  },
  journalText: { fontSize: 12.5, fontWeight: '600', color: colors.muted },
  letterWrap: { marginTop: 14 },
  letterCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    padding: 18,
    gap: 7,
  },
  letterEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: colors.muted },
  letterLine: {
    fontFamily: fonts.serifItalic,
    fontSize: 16,
    lineHeight: 16 * 1.45,
    color: colors.ink,
  },
  letterLink: { fontSize: 13, fontWeight: '600', color: colors.primary },
  sectionTitle: { fontFamily: fonts.serifItalic, fontSize: 20, marginTop: 24, color: colors.ink },
  carousel: { marginTop: 12, marginHorizontal: -22 },
  carouselContent: { paddingHorizontal: 22, paddingVertical: 2, gap: 12, paddingBottom: 8 },
  forYouCard: {
    width: 196,
    borderRadius: 22,
    backgroundColor: 'rgba(255,250,243,0.9)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  forYouHeader: { height: 96, paddingVertical: 10, paddingHorizontal: 13 },
  forYouTag: { fontSize: 9.5, fontWeight: '700', letterSpacing: 1.3, color: 'rgba(46,36,64,0.6)' },
  forYouBody: { padding: 13, gap: 11, flex: 1 },
  forYouTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 14.5,
    lineHeight: 14.5 * 1.35,
    color: colors.ink,
    flex: 1,
  },
  forYouActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  forYouPlay: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forYouFav: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  refreshWrap: { alignItems: 'center', gap: 4, marginTop: 14 },
  refreshEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: 'rgba(46,36,64,0.45)',
  },
  refreshClock: {
    fontFamily: fonts.serifMedium,
    fontSize: 30,
    color: colors.primary,
    letterSpacing: 1,
  },
  refreshTrack: {
    width: 170,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(46,36,64,0.1)',
    overflow: 'hidden',
  },
  refreshFill: { height: '100%', width: '41%', borderRadius: 2 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  sectionTitleInline: { fontFamily: fonts.serifItalic, fontSize: 20, color: colors.ink },
  sectionLink: { fontSize: 13, fontWeight: '600', color: colors.primary },
  goalCard: {
    width: 170,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: colors.cardFill,
    padding: 15,
    gap: 9,
  },
  goalTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 15.5,
    lineHeight: 15.5 * 1.3,
    minHeight: 40,
    color: colors.ink,
  },
  goalMeta: { fontSize: 11.5, color: 'rgba(46,36,64,0.5)' },
  goalTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(80,58,107,0.12)',
    overflow: 'hidden',
  },
  goalFill: { height: '100%', borderRadius: 2 },
  recentList: { gap: 10, marginTop: 12 },
  recentRow: {
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
  recentBody: { flex: 1 },
  recentTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 14.5,
    lineHeight: 14.5 * 1.35,
    color: colors.ink,
  },
  recentMeta: { fontSize: 11.5, color: 'rgba(46,36,64,0.5)', marginTop: 3 },
  recentPlay: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(80,58,107,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
