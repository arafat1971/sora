import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';
import { useOnboarding } from '@/store/onboarding';

// Voice sheet — Sora Prototype.dc.html: bottom sheet (r28, #fbf5ee).
// "Changes apply to every story — even old ones." — writes the shared store.

export const VOICES = [
  { name: 'Nova', desc: 'Warm, bright — like a best friend who believes you' },
  { name: 'Wren', desc: 'Calm, low, unhurried' },
  { name: 'Atlas', desc: 'Grounded, steady, deep' },
  { name: 'Mara', desc: 'Soft, motherly, soothing' },
  { name: 'Your voice', desc: 'Record 2 minutes — hear your dreams in your own voice' },
];

export function VoiceSheet({ onClose }: { onClose: () => void }) {
  const voice = useOnboarding((s) => s.voice);
  const setAnswer = useOnboarding((s) => s.setAnswer);

  return (
    <Pressable style={styles.scrim} onPress={onClose}>
      <Pressable style={styles.sheet} onPress={() => {}}>
        <View style={styles.dragHandle} />
        <Text style={styles.title}>Whose voice carries your story?</Text>
        <Text style={styles.sub}>Changes apply to every story — even old ones.</Text>
        <View style={styles.rows}>
          {VOICES.map((v) => {
            const sel = voice === v.name;
            return (
              <Pressable
                key={v.name}
                onPress={() => {
                  setAnswer('voice', v.name);
                  onClose();
                }}
                style={[styles.row, sel ? styles.rowOn : styles.rowOff]}>
                <View
                  style={[
                    styles.dot,
                    {
                      borderColor: sel ? colors.primary : 'rgba(46,36,64,0.3)',
                      backgroundColor: sel ? colors.primary : 'transparent',
                    },
                  ]}
                />
                <View style={styles.meta}>
                  <Text style={styles.name}>{v.name}</Text>
                  <Text style={styles.desc}>{v.desc}</Text>
                </View>
                <Svg width={24} height={24} viewBox="0 0 26 26">
                  <Circle cx={13} cy={13} r={12} fill="rgba(80,58,107,0.1)" />
                  <Path d="M11 9.5v7l5.5-3.5z" fill={colors.primary} />
                </Svg>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30,22,44,0.35)',
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  sheet: {
    backgroundColor: colors.sheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 22,
    paddingBottom: 40,
    shadowColor: 'rgba(30,22,44,1)',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -12 },
    shadowRadius: 40,
    elevation: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(46,36,64,0.18)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: { fontFamily: fonts.serifItalic, fontSize: 20, textAlign: 'center', color: colors.ink },
  sub: { fontSize: 12.5, color: colors.muted, textAlign: 'center', marginTop: 4 },
  rows: { gap: 9, marginTop: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    minHeight: 54,
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 17,
    borderWidth: 1.5,
  },
  rowOn: { borderColor: colors.primary, backgroundColor: 'rgba(80,58,107,0.1)' },
  rowOff: { borderColor: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(255,255,255,0.6)' },
  dot: { width: 19, height: 19, borderRadius: 9.5, borderWidth: 2 },
  meta: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.ink },
  desc: { fontSize: 12, color: colors.muted },
});
