import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';
import { useOnboarding } from '@/store/onboarding';

// Reference: Letter overlay in Sora Prototype.dc.html — full-screen, warm
// paper gradient. Copy is final.

export default function LetterScreen() {
  const router = useRouter();
  const name = useOnboarding((s) => s.name) || 'Julia';

  return (
    <LinearGradient
      colors={['#f7ead9', '#f0dde6', '#e2dcf4']}
      locations={[0, 0.6, 1]}
      start={{ x: 0.45, y: 0 }}
      end={{ x: 0.55, y: 1 }}
      style={styles.bg}>
      <View style={styles.root}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Svg width={20} height={20} viewBox="0 0 20 20">
              <Path d="M4 7.5 10 13.5 16 7.5" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Text style={styles.headerEyebrow}>FROM FUTURE {name.toUpperCase()}</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <Text style={[styles.p, styles.pItalic]}>Hey — it's you. Three years from now.</Text>
          <Text style={styles.p}>
            I'm writing this from the window seat you're going to love. The flat is real. The
            morning light does exactly what you hoped it would. And the calm you're practicing
            right now, on the hard days when it feels like nothing is moving? It became the way we
            live.
          </Text>
          <Text style={styles.p}>
            Every small morning you show up is a brick in the life I'm living. None of it was
            wasted. Not one day.
          </Text>
          <Text style={styles.p}>Keep going. I'm already here, and I'm proud of you.</Text>
          <Text style={[styles.p, styles.pItalic, { marginBottom: 0 }]}>
            — {name}, from the sunlit side
          </Text>
        </ScrollView>
        <Pressable onPress={() => router.push('/player')} style={styles.cta}>
          <Svg width={14} height={14} viewBox="0 0 14 14">
            <Path d="M4 2v10l8-5z" fill={colors.white} />
          </Svg>
          <Text style={styles.ctaText}>Hear it in your future voice</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  root: { flex: 1, paddingTop: 64, paddingHorizontal: 28, paddingBottom: 34 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerBtn: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, color: 'rgba(46,36,64,0.5)' },
  body: { flex: 1, marginTop: 10 },
  bodyContent: { paddingBottom: 12 },
  p: {
    fontFamily: fonts.serif,
    fontSize: 17.5,
    lineHeight: 17.5 * 1.8,
    color: '#3a2f50',
    marginBottom: 18,
  },
  pItalic: { fontFamily: fonts.serifItalic },
  cta: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },
  ctaText: { color: colors.white, fontSize: 15, fontWeight: '600' },
});
