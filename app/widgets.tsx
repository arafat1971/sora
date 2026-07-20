import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Orb } from '@/components/Orb';
import { colors, fonts } from '@/constants/theme';
import { useSeal } from '@/store/seal';

// Reference: Widgets overlay in Sora Prototype.dc.html — preview of the
// lock-screen and home-screen widgets (the native widgets ship via a config
// plugin; this is the in-app gallery preview + explainer).

export default function WidgetsScreen() {
  const router = useRouter();
  const streak = useSeal((s) => s.streak);

  return (
    <LinearGradient
      colors={['#f7ead9', '#eedbe8', '#dcd8f4']}
      locations={[0, 0.55, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.bg}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Svg width={20} height={20} viewBox="0 0 20 20">
              <Path d="M12.5 4 6.5 10l6 6" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Text style={styles.headerEyebrow}>WIDGETS</Text>
          <View style={{ width: 44 }} />
        </View>
        <Text style={styles.title}>Keep the dream on your screen</Text>

        <Text style={styles.sectionLabel}>LOCK SCREEN</Text>
        <View style={styles.lockCard}>
          <Text style={styles.lockDate}>Tuesday, July 17</Text>
          <Text style={styles.lockClock}>9:41</Text>
          <View style={styles.lockWidget}>
            <Orb size={26} breathe={false} />
            <View>
              <Text style={styles.lockWidgetEyebrow}>TODAY'S MOMENT IN</Text>
              <Text style={styles.lockWidgetText}>2h 18m — it's already written</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>HOME SCREEN</Text>
        <View style={styles.homeRow}>
          <LinearGradient
            colors={['#fdf0e4', '#f4dde6', '#dedaf6']}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={styles.homeTileLight}>
            <Text style={styles.homeTileEyebrowLight}>SORA · TODAY</Text>
            <Text style={styles.homeAffirmation}>
              Everything I want is quietly finding its way to me.
            </Text>
            <Text style={styles.homeTileFooter}>Day {streak} · keep going</Text>
          </LinearGradient>
          <View style={styles.homeTileDark}>
            <Text style={styles.homeTileEyebrowDark}>NEXT RITUAL</Text>
            <View style={styles.homeTileIcon}>
              <Svg width={14} height={14} viewBox="0 0 24 24">
                <Path d="M8 5.5v13l11-6.5z" fill={colors.white} />
              </Svg>
            </View>
            <Text style={styles.homeRitualText}>Wind-down{'\n'}9:30pm</Text>
          </View>
        </View>

        <Text style={styles.footnote}>Add from the iOS widget gallery — search "Sora".</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  content: { paddingTop: 64, paddingHorizontal: 26, paddingBottom: 36 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
  headerEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, color: colors.muted },
  title: {
    fontFamily: fonts.serifItalic,
    fontSize: 22,
    lineHeight: 22 * 1.35,
    textAlign: 'center',
    marginTop: 8,
    color: colors.ink,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(46,36,64,0.5)',
    marginTop: 22,
    marginBottom: 10,
  },
  lockCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(30,22,44,0.88)',
    padding: 22,
    alignItems: 'center',
    gap: 8,
  },
  lockDate: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  lockClock: { fontFamily: fonts.serifMedium, fontSize: 52, color: colors.white, lineHeight: 52 },
  lockWidget: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lockWidgetEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.6)',
  },
  lockWidgetText: { fontSize: 14, fontWeight: '600', color: colors.white },
  homeRow: { flexDirection: 'row', gap: 12 },
  homeTileLight: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 26,
    elevation: 6,
  },
  homeTileEyebrowLight: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
    color: 'rgba(46,36,64,0.5)',
  },
  homeAffirmation: {
    fontFamily: fonts.serifItalic,
    fontSize: 14.5,
    lineHeight: 14.5 * 1.4,
    color: colors.ink,
  },
  homeTileFooter: { fontSize: 10, fontWeight: '600', color: colors.amberText },
  homeTileDark: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 26,
    backgroundColor: 'rgba(46,36,64,0.92)',
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 26,
    elevation: 6,
  },
  homeTileEyebrowDark: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
    color: 'rgba(255,255,255,0.5)',
  },
  homeTileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeRitualText: { fontSize: 12.5, fontWeight: '600', color: colors.white, lineHeight: 12.5 * 1.35 },
  footnote: {
    fontSize: 12,
    color: 'rgba(46,36,64,0.5)',
    marginTop: 16,
    lineHeight: 12 * 1.5,
    textAlign: 'center',
  },
});
