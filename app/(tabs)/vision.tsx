import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Screen } from '@/components/Screen';
import { SegControl } from '@/components/SegControl';
import { colors, fonts, spacing } from '@/constants/theme';
import { useJournal } from '@/store/journal';
import { useToast } from '@/store/toast';

// Reference: Vision tab in Sora Prototype.dc.html — Board / Proof / Circle.

const BOARD = [
  {
    t: 'Sunlit studio flat',
    tc: colors.ink,
    g: ['#f4cda4', '#dfa3a8', '#c08fb0'] as const,
    glow: { cx: '70%', cy: '30%', r: 24, color: '#fff3d6' },
  },
  {
    t: 'Launch day — my name on the door',
    tc: colors.white,
    g: ['#9c88c4', '#6b569a', '#453768'] as const,
    glow: { cx: '26%', cy: '26%', r: 14, color: '#fdf3dd' },
  },
  {
    t: 'Kyoto in spring, no laptop',
    tc: colors.ink,
    g: ['#e3f0e9', '#bfdcd2', '#93b8ad'] as const,
    glow: { cx: '74%', cy: '32%', r: 17, color: '#ffe9ee' },
  },
];

const CIRCLE = [
  { i: 'S', who: 'S · Berlin', win: 'signed the lease on her studio', ago: '2h' },
  { i: 'M', who: 'M · Austin', win: 'first day at the dream job', ago: '5h' },
  { i: 'L', who: 'L · Seoul', win: 'paid off the loan, fully', ago: '9h' },
  { i: 'A', who: 'A · Lagos', win: 'he finally texted back', ago: '11h' },
];

const SEGMENTS = [
  { id: 'board', label: 'Board' },
  { id: 'proof', label: 'Proof' },
  { id: 'circle', label: 'Circle' },
] as const;

export default function VisionScreen() {
  const [seg, setSeg] = useState<'board' | 'proof' | 'circle'>('board');
  const [winText, setWinText] = useState('');
  const { wins, addWin } = useJournal();
  const showToast = useToast((s) => s.show);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Vision</Text>
        <Text style={styles.sub}>See it. Log it. Watch it arrive.</Text>
        <View style={styles.segWrap}>
          <SegControl segments={SEGMENTS} value={seg} onChange={setSeg} />
        </View>

        {seg === 'board' && (
          <>
            <View style={styles.grid}>
              {BOARD.map((b) => (
                <View key={b.t} style={styles.boardCard}>
                  <LinearGradient colors={b.g} style={StyleSheet.absoluteFill} />
                  <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                    <Circle
                      cx={b.glow.cx}
                      cy={b.glow.cy}
                      r={b.glow.r}
                      fill={b.glow.color}
                      opacity={0.9}
                    />
                  </Svg>
                  <Text style={[styles.boardTitle, { color: b.tc }]}>{b.t}</Text>
                </View>
              ))}
              <Pressable style={styles.addCard}>
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Path d="M12 5v14M5 12h14" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" />
                </Svg>
                <Text style={styles.addText}>Add to your board</Text>
              </Pressable>
            </View>
            <Text style={styles.boardNote}>
              Your board feeds your stories. Add a photo and Sora will write you into it.
            </Text>
          </>
        )}

        {seg === 'proof' && (
          <>
            <Text style={styles.proofIntro}>
              Evidence that it's working. Every win goes on your wall.
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                value={winText}
                onChangeText={setWinText}
                placeholder="It happened — what came true?"
                placeholderTextColor="rgba(46,36,64,0.34)"
                style={styles.input}
              />
              <Pressable
                onPress={() => {
                  if (!winText.trim()) return;
                  addWin(winText.trim());
                  setWinText('');
                  showToast('On the wall. It happened.');
                }}
                style={styles.addBtn}>
                <Text style={styles.addBtnText}>Add</Text>
              </Pressable>
            </View>
            <View style={styles.winsList}>
              {wins.map((w) => (
                <LinearGradient
                  key={w.t}
                  colors={['rgba(84,60,110,0.94)', 'rgba(122,74,122,0.92)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.winCard}>
                  <View style={styles.winBody}>
                    <Text style={styles.winTitle}>{w.t}</Text>
                    <Text style={styles.winMeta}>{w.d} · manifested</Text>
                  </View>
                  <Pressable style={styles.winShare}>
                    <Svg width={17} height={18} viewBox="0 0 18 19">
                      <Path d="M9 1.5v11M9 1.5 5.5 5M9 1.5 12.5 5" stroke={colors.white} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M3.5 9v6.5a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9" stroke={colors.white} strokeWidth={1.8} fill="none" strokeLinecap="round" />
                    </Svg>
                  </Pressable>
                </LinearGradient>
              ))}
            </View>
          </>
        )}

        {seg === 'circle' && (
          <>
            <View style={styles.circleStat}>
              <Text style={styles.circleNum}>2,847</Text>
              <Text style={styles.circleNumSub}>manifestations logged in the circle this week</Text>
            </View>
            <View style={styles.circleList}>
              {CIRCLE.map((c) => (
                <View key={c.who} style={styles.circleRow}>
                  <View style={styles.circleAvatar}>
                    <Text style={styles.circleAvatarText}>{c.i}</Text>
                  </View>
                  <Text style={styles.circleText}>
                    <Text style={styles.circleWho}>{c.who}</Text> {c.win}
                  </Text>
                  <Text style={styles.circleAgo}>{c.ago}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.circleNote}>
              Wins are always anonymous. Yours joins the circle when you share it.
            </Text>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.screenTop,
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.screenBottom,
  },
  title: { fontFamily: fonts.serifItalic, fontSize: 28, color: colors.ink },
  sub: { fontSize: 13, color: 'rgba(46,36,64,0.58)', marginTop: 2 },
  segWrap: { marginTop: 16 },
  grid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  boardCard: {
    width: '47.8%',
    minHeight: 150,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    padding: 14,
    justifyContent: 'flex-end',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 22,
    elevation: 6,
  },
  boardTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 15,
    lineHeight: 15 * 1.3,
  },
  addCard: {
    width: '47.8%',
    minHeight: 150,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(80,58,107,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  boardNote: {
    fontSize: 12,
    color: 'rgba(46,36,64,0.5)',
    marginTop: 14,
    lineHeight: 12 * 1.5,
  },
  proofIntro: {
    fontSize: 13.5,
    color: 'rgba(46,36,64,0.6)',
    marginTop: 16,
    lineHeight: 13.5 * 1.5,
  },
  inputRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 18,
    fontSize: 14,
    color: colors.ink,
  },
  addBtn: {
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  winsList: { gap: 10, marginTop: 14 },
  winCard: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 22,
    elevation: 8,
  },
  winBody: { flex: 1 },
  winTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 15.5,
    lineHeight: 15.5 * 1.35,
    color: colors.white,
  },
  winMeta: { fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  winShare: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleStat: {
    marginTop: 16,
    borderRadius: 22,
    backgroundColor: colors.cardFill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    alignItems: 'center',
  },
  circleNum: { fontFamily: fonts.serifItalic, fontSize: 30, color: colors.primary },
  circleNumSub: { fontSize: 12.5, color: colors.muted, marginTop: 2, textAlign: 'center' },
  circleList: { gap: 10, marginTop: 14 },
  circleRow: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.45)',
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circleAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(80,58,107,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleAvatarText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  circleText: { flex: 1, fontSize: 13.5, lineHeight: 13.5 * 1.4, color: colors.ink },
  circleWho: { fontWeight: '700' },
  circleAgo: { fontSize: 11.5, color: 'rgba(46,36,64,0.45)' },
  circleNote: {
    fontSize: 12,
    color: 'rgba(46,36,64,0.5)',
    marginTop: 14,
    textAlign: 'center',
  },
});
