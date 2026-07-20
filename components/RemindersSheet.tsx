import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { syncRitualReminders } from '@/lib/notifications';
import { REMINDERS, useReminders } from '@/store/reminders';

// Reference: Reminders sheet in Sora Prototype.dc.html. Toggling a ritual
// reschedules the local notifications (Sora Notifications UI.dc.html cadence).

export function RemindersSheet({ onClose }: { onClose: () => void }) {
  const rem = useReminders((s) => s.rem);
  const toggle = useReminders((s) => s.toggle);

  return (
    <Pressable style={styles.scrim} onPress={onClose}>
      <Pressable style={styles.sheet} onPress={() => {}}>
        <View style={styles.dragHandle} />
        <Text style={styles.title}>Your daily rhythm</Text>
        <Text style={styles.sub}>Gentle nudges, never nagging. Miss a day and nothing resets.</Text>
        <View style={styles.rows}>
          {REMINDERS.map((r) => {
            const on = rem[r.id];
            return (
              <View key={r.id} style={styles.row}>
                <View style={styles.rowMeta}>
                  <Text style={styles.rowTitle}>{r.t}</Text>
                  <Text style={styles.rowDesc}>{r.d}</Text>
                </View>
                <Text style={styles.rowTime}>{r.time}</Text>
                <Pressable
                  onPress={() => {
                    toggle(r.id);
                    // Reschedule from the post-toggle state.
                    syncRitualReminders({ ...rem, [r.id]: !on });
                  }}
                  style={[styles.track, { backgroundColor: on ? colors.primary : 'rgba(46,36,64,0.18)' }]}>
                  <View style={[styles.knob, { left: on ? 23 : 3 }]} />
                </Pressable>
              </View>
            );
          })}
        </View>
        <Pressable onPress={onClose} style={styles.doneBtn}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
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
  rows: { gap: 10, marginTop: 16 },
  row: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(46,36,64,0.1)',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowMeta: { flex: 1, gap: 1 },
  rowTitle: { fontSize: 14.5, fontWeight: '600', color: colors.ink },
  rowDesc: { fontSize: 12, color: colors.muted },
  rowTime: { fontSize: 13, fontWeight: '600', color: colors.primary },
  track: { width: 52, height: 32, borderRadius: 16, justifyContent: 'center' },
  knob: {
    position: 'absolute',
    top: 3,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  doneBtn: {
    marginTop: 16,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: { color: colors.white, fontSize: 14.5, fontWeight: '600' },
});
