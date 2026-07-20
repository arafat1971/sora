import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Screen } from '@/components/Screen';
import { SegControl } from '@/components/SegControl';
import { colors, fonts, spacing } from '@/constants/theme';
import { useJournal } from '@/store/journal';
import { useSeal } from '@/store/seal';

// Reference: Journal in Sora Prototype.dc.html — gratitude + signs segments.
// Journal is a text link from Home, not a tab.

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const SEGMENTS = [
  { id: 'grat', label: 'Gratitude' },
  { id: 'signs', label: 'Signs' },
] as const;

export default function JournalScreen() {
  const router = useRouter();
  const streak = useSeal((s) => s.streak);
  const { gratitudes, evid, addGratitude, addEvid } = useJournal();
  const [seg, setSeg] = useState<'grat' | 'signs'>('grat');
  const [gratText, setGratText] = useState('');
  const [evidText, setEvidText] = useState('');

  const submitGrat = () => {
    if (!gratText.trim()) return;
    addGratitude(gratText.trim());
    setGratText('');
  };
  const submitEvid = () => {
    if (!evidText.trim()) return;
    addEvid(evidText.trim());
    setEvidText('');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Svg width={20} height={20} viewBox="0 0 20 20">
            <Path d="M12.5 4 6.5 10l6 6" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.title}>Journal</Text>
        <Text style={styles.sub}>Gratitude rewires. Signs confirm.</Text>

        {/* Streak card */}
        <View style={styles.streakCard}>
          <View style={styles.streakLeft}>
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakLabel}>DAY STREAK</Text>
          </View>
          <View style={styles.week}>
            {WEEK.map((l, i) => {
              const done = i < 6;
              return (
                <View key={i} style={styles.weekDay}>
                  <View
                    style={[
                      styles.weekDot,
                      {
                        backgroundColor: done ? colors.amberText : 'rgba(255,255,255,0.7)',
                        borderColor: done ? colors.amberText : 'rgba(46,36,64,0.15)',
                      },
                    ]}>
                    {done && (
                      <Svg width={11} height={9} viewBox="0 0 11 9">
                        <Path d="M1 4.5 4 7.5 10 1" stroke={colors.white} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    )}
                  </View>
                  <Text style={styles.weekLabel}>{l}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.segWrap}>
          <SegControl segments={SEGMENTS} value={seg} onChange={setSeg} />
        </View>

        {seg === 'grat' ? (
          <>
            <Text style={styles.prompt}>What are you grateful for today?</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={gratText}
                onChangeText={setGratText}
                onSubmitEditing={submitGrat}
                placeholder="My health, my people, this morning's light…"
                placeholderTextColor="rgba(46,36,64,0.34)"
                style={styles.input}
              />
              <Pressable onPress={submitGrat} style={styles.addBtn}>
                <Text style={styles.addBtnText}>Add</Text>
              </Pressable>
            </View>
            <View style={styles.list}>
              {gratitudes.map((g) => (
                <View key={g} style={styles.row}>
                  <Svg width={16} height={15} viewBox="0 0 24 22">
                    <Path d="M12 20.5S2.5 15 1.2 8.7A5.6 5.6 0 0 1 12 5a5.6 5.6 0 0 1 10.8 3.7C21.5 15 12 20.5 12 20.5z" fill="#c76d8b" />
                  </Svg>
                  <Text style={styles.rowText}>{g}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.prompt}>Small signs it's already working</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={evidText}
                onChangeText={setEvidText}
                onSubmitEditing={submitEvid}
                placeholder="A coincidence, a compliment, a door opening…"
                placeholderTextColor="rgba(46,36,64,0.34)"
                style={styles.input}
              />
              <Pressable onPress={submitEvid} style={styles.addBtn}>
                <Text style={styles.addBtnText}>Add</Text>
              </Pressable>
            </View>
            <View style={styles.list}>
              {evid.map((e) => (
                <View key={e} style={styles.row}>
                  <Svg width={16} height={16} viewBox="0 0 16 16">
                    <Path d="M8 0l1.8 5.4L15.4 6 11 9.4l1.6 5.8L8 11.8l-4.6 3.4L5 9.4.6 6l5.6-.6z" fill={colors.amber} />
                  </Svg>
                  <Text style={styles.rowText}>{e}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.note}>
              Sora weaves your signs into tomorrow's story — proof compounds belief.
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
    paddingBottom: 60,
  },
  backBtn: {
    width: 44,
    height: 44,
    marginLeft: -12,
    marginTop: -8,
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.serifItalic, fontSize: 28, color: colors.ink },
  sub: { fontSize: 13, color: 'rgba(46,36,64,0.58)', marginTop: 2 },
  streakCard: {
    marginTop: 16,
    borderRadius: 22,
    backgroundColor: colors.cardFill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  streakLeft: { alignItems: 'center' },
  streakNum: {
    fontFamily: fonts.serifMedium,
    fontSize: 34,
    color: colors.amberText,
    lineHeight: 36,
  },
  streakLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1, color: 'rgba(46,36,64,0.5)' },
  week: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  weekDay: { alignItems: 'center', gap: 5 },
  weekDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(46,36,64,0.5)' },
  segWrap: { marginTop: 16 },
  prompt: { fontFamily: fonts.serifItalic, fontSize: 18, marginTop: 18, color: colors.ink },
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
  list: { gap: 10, marginTop: 14 },
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
  rowText: { flex: 1, fontSize: 14, lineHeight: 14 * 1.4, color: colors.ink },
  note: {
    fontSize: 12,
    color: 'rgba(46,36,64,0.5)',
    marginTop: 14,
    lineHeight: 12 * 1.5,
  },
});
