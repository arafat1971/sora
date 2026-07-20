import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Orb } from '@/components/Orb';
import { Screen } from '@/components/Screen';
import { colors, fonts } from '@/constants/theme';
import { OnboardingAnswers, useOnboarding } from '@/store/onboarding';

// Reference: design_handoff_sora_app/Sora Prototype.dc.html (onboarding +
// personalizing) + Sora Quiz Onboarding UI.dc.html. All copy and values are
// copied verbatim from the files.

type Step = {
  q: string;
  sub?: string;
  ph?: string;
  key?: keyof OnboardingAnswers;
  quiz?: string[];
  mirror?: boolean;
  belief?: boolean;
  multi?: boolean;
  chips?: string[];
  input?: boolean;
  voice?: boolean;
};

const STEPS: Step[] = [
  { q: 'First, what should I call you?', ph: 'Your name', key: 'name' },
  { q: 'Where does your story take place?', sub: 'Your city, your streets — the stories happen where you live.', ph: 'Your city', key: 'city' },
  { q: 'Tell me what you want most right now.', sub: "Don't be realistic. Be honest. The detail is what makes it work.", ph: 'I want…', key: 'want' },
  { q: 'How long have you wanted it?', sub: 'Older wants need gentler pacing.', quiz: ['Just named it', 'About a year', 'Years — it keeps returning', 'As long as I can remember'], key: 'wantAge' },
  { q: 'When doubt shows up, it usually sounds like…', sub: 'Your affirmations will answer this exact voice.', quiz: ['“Who are you to have this?”', '“It’s too late”', '“Be realistic”', 'It’s quieter — a flinch, not a voice'], key: 'doubt' },
  { q: 'That voice is the most common one we hear.', sub: '62% of members named the same doubt. Your stories are built to move past it without arguing with it.', mirror: true },
  { q: 'What fills your days right now?', sub: 'Work, study, care — whatever your days are made of.', ph: "I'm a…", key: 'work' },
  { q: 'Why does this matter so much to you?', sub: 'Sora keeps this close. You can edit or delete it anytime.', ph: 'Because…', key: 'why' },
  { q: "What's been weighing on you lately?", sub: 'Naming it lets the story lift it.', ph: 'Lately…', key: 'struggle' },
  { q: 'When could belief fit into your day?', sub: 'This sets your ritual and reminders.', quiz: ['First thing, before the phone', 'On the commute', 'Last thing, in bed', 'It has to find me'], key: 'ritual' },
  { q: 'And the day it all arrives — what does that morning look like?', sub: 'Paint it in detail. Sora will read it back to you.', ph: 'That morning…', key: 'success' },
  { q: "You're in the right place.", sub: 'People who wanted what you want — and got it:', belief: true },
  { q: 'Which parts of your life are we transforming?', sub: 'Pick as many as you feel.', multi: true, chips: ['Love', 'Career', 'Money', 'Health', 'Inner peace', 'Home', 'Family', 'Freedom'] },
  { q: 'Who matters most in your life?', sub: "They'll appear in your stories — by name.", ph: 'My partner Sam, my mom, my dog Miso…', key: 'people' },
  { q: "Describe the home you're waking up in.", sub: 'Pick one — or write your own below. Your words always win.', chips: ['Sunlit loft', 'Cozy cottage', 'Beachfront villa', 'Penthouse', 'Farmhouse', 'Historic townhouse'], input: true, ph: 'Or describe it your way…', key: 'homeText' },
  { q: 'Whose voice should carry your story?', voice: true },
];

const VOICES = [
  { name: 'Nova', desc: 'Warm, bright — like a best friend who believes you' },
  { name: 'Wren', desc: 'Calm, low, unhurried' },
  { name: 'Atlas', desc: 'Grounded, steady, deep' },
  { name: 'Mara', desc: 'Soft, motherly, soothing' },
  { name: 'Your voice', desc: 'Record 2 minutes — hear your dreams in your own voice' },
];

const PREVIEW_TEXT = 'Everything I want is already quietly on its way to me.';
const PREVIEW_WORDS = PREVIEW_TEXT.split(' ');
const LOADING_MSGS = ['Weaving your first story…', 'Learning your world…', "Almost there — it's beautiful."];

const BELIEF_ROWS = [
  { n: '12,482', t: 'members wanted exactly what you just wrote', bold: null },
  { n: '9,107', t: 'of them have logged it — ', bold: 'manifested' },
  { n: '94%', t: 'notice their first sign within 14 days', bold: null },
];

// fadeUp: 0.55s cubic-bezier(0.22,1,0.36,1), translateY 10 (fadeUpB: 14)
function useFadeUp(trigger: number, delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    opacity.setValue(0);
    translate.setValue(trigger % 2 ? 14 : 10);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 550, delay, easing: Easing.bezier(0.22, 1, 0.36, 1), useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 550, delay, easing: Easing.bezier(0.22, 1, 0.36, 1), useNativeDriver: true }),
    ]).start();
  }, [trigger, opacity, translate, delay]);
  return { opacity, transform: [{ translateY: translate }] };
}

export default function OnboardingScreen() {
  const router = useRouter();
  const store = useOnboarding();
  const [step, setStep] = useState(0);
  const [text, setText] = useState('');
  const [typedLen, setTypedLen] = useState(0);
  const [phase, setPhase] = useState<'steps' | 'loading'>('steps');
  const [loadIdx, setLoadIdx] = useState(0);
  const [previewOn, setPreviewOn] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(-1);

  const current = STEPS[step];
  const question =
    step === 2 ? `${store.name || 'Julia'}, tell me what you want most right now.` : current.q;

  // Typewriter: +2 chars every 32ms
  useEffect(() => {
    if (phase !== 'steps') return;
    setTypedLen(0);
    const id = setInterval(() => {
      setTypedLen((n) => {
        if (n >= question.length) {
          clearInterval(id);
          return n;
        }
        return Math.min(question.length, n + 2);
      });
    }, 32);
    return () => clearInterval(id);
  }, [question, phase]);

  // Blinking cursor (0.9s step-end)
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 0, delay: 450, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 0, delay: 450, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [cursorOpacity]);

  // Voice preview karaoke: one word per 320ms
  useEffect(() => {
    if (!previewOn) return;
    const id = setInterval(() => {
      setPreviewIdx((i) => {
        if (i + 1 >= PREVIEW_WORDS.length) {
          clearInterval(id);
          setPreviewOn(false);
          return -1;
        }
        return i + 1;
      });
    }, 320);
    return () => clearInterval(id);
  }, [previewOn]);

  const mainAnim = useFadeUp(step);
  const secondAnim = useFadeUp(step, 120);

  const advance = useCallback(() => {
    const s = STEPS[step];
    if (s.key && !s.quiz) store.setAnswer(s.key, text.trim() as never);
    if (step >= STEPS.length - 1) {
      setPhase('loading');
      setLoadIdx(0);
      setTimeout(() => setLoadIdx(1), 1300);
      setTimeout(() => setLoadIdx(2), 2600);
      setTimeout(() => {
        store.complete();
        router.replace('/(tabs)');
      }, 3900);
    } else {
      setStep(step + 1);
      setText('');
    }
  }, [step, text, store, router]);

  const back = useCallback(() => {
    setStep((n) => Math.max(0, n - 1));
    setText('');
  }, []);

  if (phase === 'loading') {
    return (
      <Screen>
        <View style={styles.loading}>
          <Orb size={140} breatheDuration={4500} style={styles.loadingOrb} />
          <Text style={styles.loadingMsg}>{LOADING_MSGS[loadIdx]}</Text>
          <Text style={styles.loadingSub}>Sora is writing something only you could live.</Text>
        </View>
      </Screen>
    );
  }

  const showInput = (!current.chips && !current.voice && !current.belief && !current.quiz && !current.mirror) || !!current.input;
  const showContinue = (!!current.chips && !current.input) || !!current.voice || !!current.belief || !!current.mirror;
  const continueLabel = current.voice
    ? 'Create my first story'
    : current.belief
      ? "I'm ready"
      : current.mirror
        ? 'Keep going'
        : 'Continue';
  const typing = typedLen < question.length;

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.root}>
        {/* Back chevron + progress bar */}
        <View style={styles.topRow}>
          <Pressable onPress={back} style={styles.backBtn}>
            <Svg width={20} height={20} viewBox="0 0 20 20">
              <Path d="M12.5 4 6.5 10l6 6" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(((step + 1) / STEPS.length) * 100)}%` }]} />
          </View>
        </View>

        {/* Question + step body */}
        <Animated.View style={[styles.body, mainAnim]}>
          <Text style={styles.question}>
            {question.slice(0, typedLen)}
            {typing && <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />}
          </Text>
          {!!current.sub && <Text style={styles.sub}>{current.sub}</Text>}

          {current.belief && (
            <View style={styles.beliefWrap}>
              {BELIEF_ROWS.map((row) => (
                <View key={row.n} style={styles.beliefRow}>
                  <Text style={styles.beliefNum}>{row.n}</Text>
                  <Text style={styles.beliefText}>
                    {row.t}
                    {row.bold && <Text style={styles.beliefBold}>{row.bold}</Text>}
                  </Text>
                </View>
              ))}
              <Text style={styles.beliefQuote}>
                "I wrote almost the same sentence in March. It's my life now." — R, Melbourne
              </Text>
            </View>
          )}

          {current.mirror && (
            <View style={styles.mirrorWrap}>
              <Orb size={52} small breatheDuration={2600} style={styles.mirrorOrb} />
            </View>
          )}

          {current.quiz && (
            <Animated.View style={[styles.quizWrap, secondAnim]}>
              {current.quiz.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => {
                    if (current.key) store.setAnswer(current.key, opt as never);
                    setStep(step + 1);
                    setText('');
                  }}
                  style={styles.quizRow}>
                  <View style={styles.quizDot} />
                  <Text style={styles.quizText}>{opt}</Text>
                </Pressable>
              ))}
            </Animated.View>
          )}

          {current.chips && (
            <Animated.View style={[styles.chipsWrap, secondAnim]}>
              {current.chips.map((label) => {
                const on = current.multi ? store.areas.includes(label) : store.home === label;
                return (
                  <Pressable
                    key={label}
                    onPress={() => {
                      if (current.multi) store.toggleArea(label);
                      else store.setAnswer('home', label);
                    }}
                    style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                    <Text style={[styles.chipText, { color: on ? colors.white : colors.ink }]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </Animated.View>
          )}

          {current.voice && (
            <View style={styles.voiceWrap}>
              <View style={styles.previewCard}>
                <Pressable
                  onPress={() => {
                    setPreviewIdx(-1);
                    setPreviewOn((v) => !v);
                  }}
                  style={styles.previewBtn}>
                  {previewOn ? (
                    <Svg width={14} height={14} viewBox="0 0 20 20">
                      <Rect x={4.5} y={3.5} width={3.6} height={13} rx={1.4} fill={colors.white} />
                      <Rect x={11.9} y={3.5} width={3.6} height={13} rx={1.4} fill={colors.white} />
                    </Svg>
                  ) : (
                    <Svg width={14} height={14} viewBox="0 0 24 24">
                      <Path d="M8 5.5v13l11-6.5z" fill={colors.white} />
                    </Svg>
                  )}
                </Pressable>
                <Text style={styles.previewText}>
                  {PREVIEW_WORDS.map((w, i) => (
                    <Text
                      key={i}
                      style={{
                        color: previewOn
                          ? i <= previewIdx
                            ? colors.ink
                            : 'rgba(46,36,64,0.3)'
                          : 'rgba(46,36,64,0.65)',
                      }}>
                      {w}{' '}
                    </Text>
                  ))}
                </Text>
              </View>
              {VOICES.map((v) => {
                const sel = store.voice === v.name;
                return (
                  <Pressable
                    key={v.name}
                    onPress={() => store.setAnswer('voice', v.name)}
                    style={[styles.voiceRow, sel ? styles.voiceRowOn : styles.voiceRowOff]}>
                    <View
                      style={[
                        styles.voiceDot,
                        {
                          borderColor: sel ? colors.primary : 'rgba(46,36,64,0.3)',
                          backgroundColor: sel ? colors.primary : 'transparent',
                        },
                      ]}
                    />
                    <View style={styles.voiceMeta}>
                      <Text style={styles.voiceName}>{v.name}</Text>
                      <Text style={styles.voiceDesc}>{v.desc}</Text>
                    </View>
                    <Svg width={26} height={26} viewBox="0 0 26 26">
                      <Circle cx={13} cy={13} r={12} fill="rgba(80,58,107,0.1)" />
                      <Path d="M11 9.5v7l5.5-3.5z" fill={colors.primary} />
                    </Svg>
                  </Pressable>
                );
              })}
              <Text style={styles.voiceNote}>
                You can change the voice anytime — it updates every story, even old ones.
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Bottom: pill input + arrow, or continue button */}
        {showInput && (
          <Animated.View style={[styles.inputRow, secondAnim]}>
            <TextInput
              value={text}
              onChangeText={setText}
              onSubmitEditing={advance}
              placeholder={current.ph}
              placeholderTextColor="rgba(46,36,64,0.34)"
              style={styles.input}
              returnKeyType="done"
            />
            <Pressable onPress={advance} style={styles.arrowBtn}>
              <Svg width={20} height={20} viewBox="0 0 20 20">
                <Path d="M4 10h11M11 5.5 15.5 10 11 14.5" stroke={colors.white} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          </Animated.View>
        )}
        {showContinue && (
          <Pressable onPress={advance} style={styles.continueBtn}>
            <Text style={styles.continueText}>{continueLabel}</Text>
          </Pressable>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 72, paddingHorizontal: 26, paddingBottom: 30 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: {
    width: 44,
    height: 44,
    marginLeft: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: { flex: 1, height: 2, backgroundColor: 'rgba(46,36,64,0.1)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  body: { flex: 1, justifyContent: 'center', gap: 14 },
  question: {
    fontFamily: fonts.serifItalic,
    fontSize: 29,
    lineHeight: 29 * 1.3,
    color: colors.headline,
    minHeight: 76,
  },
  cursor: {
    width: 2.5,
    height: 22,
    borderRadius: 1,
    backgroundColor: colors.primary,
    marginLeft: 4,
  },
  sub: { fontSize: 14.5, lineHeight: 14.5 * 1.5, color: 'rgba(46,36,64,0.6)' },
  beliefWrap: { marginTop: 6 },
  beliefRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 14,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  beliefNum: {
    fontFamily: fonts.serifMedium,
    fontSize: 26,
    color: colors.headline,
    minWidth: 74,
  },
  beliefText: { flex: 1, fontSize: 13, lineHeight: 13 * 1.45, color: 'rgba(46,36,64,0.6)' },
  beliefBold: { fontWeight: '700' },
  beliefQuote: {
    fontFamily: fonts.serifItalic,
    fontSize: 14.5,
    lineHeight: 14.5 * 1.55,
    color: 'rgba(46,36,64,0.6)',
    paddingTop: 16,
  },
  mirrorWrap: { marginTop: 8 },
  mirrorOrb: {
    shadowColor: 'rgba(122,104,180,1)',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 26,
    elevation: 8,
  },
  quizWrap: { marginTop: 4 },
  quizRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 16,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,36,64,0.1)',
  },
  quizDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(80,58,107,0.2)' },
  quizText: { fontSize: 15.5, color: colors.ink, lineHeight: 15.5 * 1.35, flex: 1 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  chip: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipOff: { backgroundColor: 'rgba(255,255,255,0.62)', borderColor: 'rgba(255,255,255,0.95)' },
  chipText: { fontSize: 14.5, fontWeight: '600' },
  voiceWrap: { gap: 10, marginTop: 8 },
  previewCard: {
    borderRadius: 18,
    backgroundColor: colors.cardFill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 6,
  },
  previewText: { flex: 1, fontFamily: fonts.serifItalic, fontSize: 14.5, lineHeight: 14.5 * 1.55 },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    minHeight: 58,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  voiceRowOn: { borderColor: colors.primary, backgroundColor: 'rgba(80,58,107,0.1)' },
  voiceRowOff: { borderColor: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(255,255,255,0.6)' },
  voiceDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  voiceMeta: { flex: 1, gap: 1 },
  voiceName: { fontSize: 15.5, fontWeight: '600', color: colors.ink },
  voiceDesc: { fontSize: 12.5, color: colors.muted },
  voiceNote: { fontSize: 12.5, color: colors.muted, lineHeight: 12.5 * 1.5 },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 20,
    fontSize: 15.5,
    color: colors.ink,
  },
  arrowBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  continueBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  continueText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    paddingHorizontal: 44,
  },
  loadingOrb: {
    shadowColor: 'rgba(122,104,180,1)',
    shadowOpacity: 0.38,
    shadowOffset: { width: 0, height: 20 },
    shadowRadius: 55,
    elevation: 12,
  },
  loadingMsg: {
    fontFamily: fonts.serifItalic,
    fontSize: 22,
    lineHeight: 22 * 1.4,
    color: colors.ink,
    textAlign: 'center',
  },
  loadingSub: { fontSize: 13, color: 'rgba(46,36,64,0.5)', textAlign: 'center' },
});
