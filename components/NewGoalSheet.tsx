import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { GOAL_AREAS, useGoals } from '@/store/goals';
import { useToast } from '@/store/toast';

// Reference: New goal sheet in Sora Prototype.dc.html. Each goal begins its
// own story thread; the first story "arrives tonight".

export function NewGoalSheet({ onClose }: { onClose: () => void }) {
  const addGoal = useGoals((s) => s.addGoal);
  const showToast = useToast((s) => s.show);
  const [text, setText] = useState('');
  const [area, setArea] = useState('Freedom');

  const submit = () => {
    if (!text.trim()) return;
    addGoal(text.trim());
    showToast('New thread begun. Your first story arrives tonight.');
    onClose();
  };

  return (
    <Pressable style={styles.scrim} onPress={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrap}
        pointerEvents="box-none">
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.dragHandle} />
          <Text style={styles.title}>What are we manifesting next?</Text>
          <Text style={styles.sub}>Each goal gets its own story thread. Don't be realistic.</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="e.g. A book with my name on the spine…"
            placeholderTextColor="rgba(46,36,64,0.34)"
            multiline
            style={styles.textarea}
          />
          <View style={styles.chips}>
            {GOAL_AREAS.map((a) => {
              const on = area === a;
              return (
                <Pressable
                  key={a}
                  onPress={() => setArea(a)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: on ? colors.primary : 'rgba(255,255,255,0.8)',
                      borderColor: on ? colors.primary : 'rgba(46,36,64,0.12)',
                    },
                  ]}>
                  <Text style={[styles.chipText, { color: on ? colors.white : colors.ink }]}>
                    {a}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.btns}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={submit} style={styles.beginBtn}>
              <Text style={styles.beginText}>Begin this thread</Text>
            </Pressable>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
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
  wrap: { justifyContent: 'flex-end' },
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
  textarea: {
    minHeight: 72,
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(46,36,64,0.14)',
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14.5,
    lineHeight: 14.5 * 1.5,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: {
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  btns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(46,36,64,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 14.5, fontWeight: '600', color: colors.ink },
  beginBtn: {
    flex: 1.4,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beginText: { fontSize: 14.5, fontWeight: '600', color: colors.white },
});
