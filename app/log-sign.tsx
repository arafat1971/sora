import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Orb } from '@/components/Orb';
import { colors, fonts } from '@/constants/theme';
import { useOnboarding } from '@/store/onboarding';
import { SIGN_GOALS, SIGN_KINDS, useSigns } from '@/store/signs';

// Reference: Sora Log a Sign UI.dc.html. Step 1 is a bottom sheet over the
// current screen (transparent modal); step 2 is the full-screen written-in
// confirmation. Copy is final.

function useFadeUp(delay = 0, translate = 12) {
  const opacity = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(translate)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, easing: Easing.ease, useNativeDriver: true }),
      Animated.timing(ty, { toValue: 0, duration: 500, delay, easing: Easing.ease, useNativeDriver: true }),
    ]).start();
  }, [opacity, ty, delay]);
  return { opacity, transform: [{ translateY: ty }] };
}

export default function LogSignScreen() {
  const router = useRouter();
  const voice = useOnboarding((s) => s.voice);
  const log = useSigns((s) => s.log);
  const [step, setStep] = useState<'entry' | 'confirm'>('entry');
  const [kind, setKind] = useState(0);
  const [goal, setGoal] = useState(0);
  const [text, setText] = useState('');
  const [signNum, setSignNum] = useState(0);

  const sheetAnim = useFadeUp(0);
  const c0 = useFadeUp(0);
  const c1 = useFadeUp(100);
  const c2 = useFadeUp(200);
  const c3 = useFadeUp(300);

  if (step === 'confirm') {
    return (
      <LinearGradient
        colors={['#f5eeec', '#ecdfe6', '#e0d6ea']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.55, y: 0 }}
        end={{ x: 0.45, y: 1 }}
        style={styles.confirmRoot}>
        <Orb size={120} breatheDuration={4000} style={styles.confirmOrb} />
        <Animated.Text style={[styles.confirmTitle, c0]}>Sign #{signNum} — logged.</Animated.Text>
        <Animated.Text style={[styles.confirmBody, c1]}>
          Tomorrow's story now opens <Text style={styles.confirmItalic}>after</Text> the viewing on
          that street. Sora writes your evidence into the plot.
        </Animated.Text>
        <Animated.View style={[styles.previewCard, c2]}>
          <Text style={styles.previewEyebrow}>TOMORROW'S MOMENT · PREVIEW</Text>
          <Text style={styles.previewLine}>
            "You almost laugh when you see the street name on the confirmation email — the same one
            from…"
          </Text>
          <Text style={styles.previewMeta}>unlocks in 14h 22m · narrated by {voice}</Text>
        </Animated.View>
        <Animated.View style={[styles.confirmBtns, c3]}>
          <Pressable onPress={() => router.back()} style={styles.doneBtn}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
          <Pressable style={styles.shareBtn}>
            <Text style={styles.shareText}>Share as a card</Text>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <Pressable style={styles.scrim} onPress={() => router.back()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}
        pointerEvents="box-none">
        <Animated.View style={sheetAnim}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitle}>What happened?</Text>
            <Text style={styles.sheetSub}>Small counts. Coincidences count. Feelings count.</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.kindsScroll}
              contentContainerStyle={styles.kindsContent}>
              {SIGN_KINDS.map((label, i) => {
                const on = kind === i;
                return (
                  <Pressable
                    key={label}
                    onPress={() => setKind(i)}
                    style={[
                      styles.kindChip,
                      {
                        backgroundColor: on ? 'rgba(80,58,107,0.12)' : 'rgba(255,255,255,0.85)',
                        borderColor: on ? 'rgba(80,58,107,0.4)' : 'rgba(46,36,64,0.12)',
                      },
                    ]}>
                    <Text style={[styles.kindText, { color: on ? colors.primary : colors.ink }]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="The landlord emailed back first — viewing on the exact street from my story…"
              placeholderTextColor="rgba(46,36,64,0.34)"
              multiline
              style={styles.textarea}
            />
            <View style={styles.goalsBlock}>
              <Text style={styles.goalsEyebrow}>WHICH MANIFESTATION?</Text>
              <View style={styles.goalsList}>
                {SIGN_GOALS.map((t, i) => {
                  const on = goal === i;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setGoal(i)}
                      style={[
                        styles.goalRow,
                        {
                          backgroundColor: on ? 'rgba(80,58,107,0.08)' : 'rgba(255,255,255,0.85)',
                          borderColor: on ? 'rgba(80,58,107,0.45)' : 'rgba(46,36,64,0.1)',
                        },
                      ]}>
                      <View
                        style={[
                          styles.goalDot,
                          {
                            borderColor: on ? colors.primary : 'rgba(46,36,64,0.25)',
                            backgroundColor: on ? colors.primary : 'transparent',
                          },
                        ]}
                      />
                      <Text style={styles.goalText}>{t}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <Pressable
              onPress={() => {
                setSignNum(log({ text: text.trim(), kind, goal }));
                setStep('confirm');
              }}
              style={styles.submitBtn}>
              <Text style={styles.submitText}>Log it — write it into tomorrow</Text>
            </Pressable>
            <Text style={styles.privacyNote}>Signs stay private unless you choose to share.</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(30,22,44,0.35)', justifyContent: 'flex-end' },
  sheetWrap: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.sheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 22,
    paddingBottom: 44,
    shadowColor: 'rgba(30,22,44,1)',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -8 },
    shadowRadius: 28,
    elevation: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(46,36,64,0.18)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 21,
    lineHeight: 21 * 1.3,
    textAlign: 'center',
    color: colors.ink,
  },
  sheetSub: { fontSize: 12.5, color: colors.muted, textAlign: 'center', marginTop: 4 },
  kindsScroll: { marginTop: 16, marginHorizontal: -22 },
  kindsContent: { paddingHorizontal: 22, paddingVertical: 2, gap: 8, paddingBottom: 4 },
  kindChip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kindText: { fontSize: 13, fontWeight: '600' },
  textarea: {
    marginTop: 12,
    height: 96,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(46,36,64,0.12)',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14.5,
    fontStyle: 'italic',
    lineHeight: 14.5 * 1.5,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  goalsBlock: { marginTop: 12, gap: 8 },
  goalsEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: 'rgba(46,36,64,0.5)' },
  goalsList: { gap: 8 },
  goalRow: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goalDot: { width: 18, height: 18, borderRadius: 10, borderWidth: 1.5 },
  goalText: { fontFamily: fonts.serifItalic, fontSize: 14.5, color: colors.ink },
  submitBtn: {
    marginTop: 16,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 6,
  },
  submitText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  privacyNote: { fontSize: 11.5, color: 'rgba(46,36,64,0.45)', textAlign: 'center', marginTop: 10 },
  confirmRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  confirmOrb: {
    shadowColor: 'rgba(122,104,180,1)',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 38,
    elevation: 10,
  },
  confirmTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 27,
    lineHeight: 27 * 1.3,
    marginTop: 30,
    textAlign: 'center',
    color: colors.ink,
  },
  confirmBody: {
    fontSize: 14,
    lineHeight: 14 * 1.6,
    color: 'rgba(46,36,64,0.65)',
    marginTop: 10,
    maxWidth: 290,
    textAlign: 'center',
  },
  confirmItalic: { fontStyle: 'italic' },
  previewCard: {
    marginTop: 22,
    width: '100%',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 7,
  },
  previewEyebrow: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 2.2,
    color: 'rgba(46,36,64,0.45)',
  },
  previewLine: {
    fontFamily: fonts.serifItalic,
    fontSize: 15,
    lineHeight: 15 * 1.5,
    color: colors.ink,
  },
  previewMeta: { fontSize: 11.5, color: 'rgba(46,36,64,0.45)' },
  confirmBtns: { width: '100%', gap: 10, marginTop: 22 },
  doneBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 6,
  },
  doneText: { color: colors.white, fontSize: 14.5, fontWeight: '600' },
  shareBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(46,36,64,0.14)',
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: { color: colors.ink, fontSize: 13.5, fontWeight: '600' },
});
