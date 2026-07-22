import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

// Segmented control — Vision/Journal/Library tabs in the prototype:
// track rgba(46,36,64,0.07) r22 p4; active seg white 0.92 with soft shadow.
export function SegControl<T extends string>({
  segments,
  value,
  onChange,
}: {
  segments: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <View style={styles.track}>
      {segments.map((s) => {
        const on = s.id === value;
        return (
          <Pressable
            key={s.id}
            onPress={() => onChange(s.id)}
            style={[styles.seg, on && styles.segOn]}>
            <Text style={[styles.label, { color: on ? colors.ink : colors.muted }]}>{s.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(46,36,64,0.07)',
    borderRadius: 22,
    padding: 4,
  },
  seg: { flex: 1, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  segOn: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 3,
  },
  label: { fontSize: 13.5, fontWeight: '600' },
});
