import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { PLANS } from '@/lib/purchases';
import { useToast } from '@/store/toast';

// Reference: Trial reminder sheet in Sora Prototype.dc.html. The day-5
// in-app surface of the trial promise — honesty as the conversion strategy,
// cancel in two taps, no dark patterns (Dev Handoff §5).

export function TrialReminderSheet({ onClose }: { onClose: () => void }) {
  const showToast = useToast((s) => s.show);
  const weekly = PLANS.find((p) => p.id === 'weekly')!.price;

  return (
    <Pressable style={styles.scrim} onPress={onClose}>
      <Pressable style={styles.sheet} onPress={() => {}}>
        <View style={styles.dragHandle} />
        <Text style={styles.title}>As promised: your trial ends in 2 days.</Text>
        <Text style={styles.sub}>
          No surprises, ever. Choose what happens next — or cancel in two taps below.
        </Text>
        <View style={styles.options}>
          <Pressable
            onPress={() => {
              showToast('Annual it is — a whole year of becoming');
              onClose();
            }}
            style={styles.annualBtn}>
            <View style={styles.annualMeta}>
              <Text style={styles.annualTitle}>Annual — $49.99/year</Text>
              <Text style={styles.annualSub}>Under $1/week · one calm decision, then just live it</Text>
            </View>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>SAVE 86%</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => {
              showToast('Staying weekly. Cancel anytime, truly.');
              onClose();
            }}
            style={styles.weeklyBtn}>
            <Text style={styles.weeklyTitle}>Keep weekly — {weekly}/week</Text>
            <Text style={styles.weeklySub}>Continue as-is, cancel anytime</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              showToast('Trial canceled. Your stories stay free until day 7.');
              onClose();
            }}
            style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel my trial</Text>
          </Pressable>
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
  title: { fontFamily: fonts.serifItalic, fontSize: 21, textAlign: 'center', color: colors.ink },
  sub: {
    fontSize: 13,
    color: 'rgba(46,36,64,0.6)',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 13 * 1.5,
  },
  options: { gap: 10, marginTop: 16 },
  annualBtn: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'rgba(80,58,107,0.08)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  annualMeta: { flex: 1, gap: 2 },
  annualTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  annualSub: { fontSize: 12.5, color: 'rgba(46,36,64,0.6)' },
  saveBadge: {
    backgroundColor: colors.green,
    borderRadius: 11,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  saveText: { fontSize: 11, fontWeight: '700', color: colors.white },
  weeklyBtn: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(46,36,64,0.14)',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 2,
  },
  weeklyTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  weeklySub: { fontSize: 12.5, color: 'rgba(46,36,64,0.6)' },
  cancelBtn: { padding: 10, alignItems: 'center' },
  cancelText: { fontSize: 13.5, fontWeight: '600', color: 'rgba(46,36,64,0.55)' },
});
