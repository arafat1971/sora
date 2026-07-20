import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Orb } from '@/components/Orb';
import { colors, fonts } from '@/constants/theme';
import { useOnboarding } from '@/store/onboarding';
import { usePlayback } from '@/store/playback';

// Reference: Welcome Day 1 overlay in Sora Prototype.dc.html — the post-trial
// moment. "Begin Day 1" opens the first story; then the app.

export default function WelcomeScreen() {
  const router = useRouter();
  const name = useOnboarding((s) => s.name) || 'Julia';
  const open = usePlayback((s) => s.open);

  return (
    <LinearGradient
      colors={['#fdf0e4', '#f4dde6', '#d8dcf8']}
      locations={[0, 0.45, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.bg}>
      <View style={styles.center}>
        <Orb size={130} breatheDuration={4500} style={styles.orb} />
        <Text style={styles.title}>It's yours now, {name}.</Text>
        <Text style={styles.body}>
          This is Day 1 of your becoming. Most members feel the first shift by day 3 — and you're
          starting ahead.
        </Text>
        <Pressable
          onPress={() => {
            open();
            router.replace('/(tabs)');
            router.push('/player');
          }}
          style={styles.beginBtn}>
          <Text style={styles.beginText}>Begin Day 1 — play my story</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.tellLink}>Tell someone you love →</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    paddingHorizontal: 36,
  },
  orb: {
    shadowColor: 'rgba(122,104,180,1)',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 22 },
    shadowRadius: 55,
    elevation: 12,
  },
  title: {
    fontFamily: fonts.serifItalic,
    fontSize: 28,
    lineHeight: 28 * 1.25,
    textAlign: 'center',
    color: colors.ink,
  },
  body: {
    fontSize: 14,
    lineHeight: 14 * 1.6,
    color: 'rgba(46,36,64,0.65)',
    maxWidth: 280,
    textAlign: 'center',
  },
  beginBtn: {
    height: 54,
    paddingHorizontal: 34,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },
  beginText: { color: colors.white, fontSize: 15.5, fontWeight: '700' },
  tellLink: { fontSize: 13.5, fontWeight: '600', color: colors.primary },
});
