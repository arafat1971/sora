import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { RemindersSheet } from '@/components/RemindersSheet';
import { Screen } from '@/components/Screen';
import { TrialReminderSheet } from '@/components/TrialReminderSheet';
import { VoiceSheet } from '@/components/VoiceSheet';
import { colors, fonts, spacing } from '@/constants/theme';
import { useOnboarding } from '@/store/onboarding';
import { useProfile } from '@/store/profile';
import { remindersOnCount, useReminders } from '@/store/reminders';
import { useToast } from '@/store/toast';

// Reference: Profile in Sora Prototype.dc.html. Deleting a memory fact
// excludes it from the next generation (QA gate).

function Chevron() {
  return (
    <Svg width={7} height={12} viewBox="0 0 8 14">
      <Path d="M1 1l6 6-6 6" stroke="rgba(46,36,64,0.3)" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export default function ProfileScreen() {
  const router = useRouter();
  const name = useOnboarding((s) => s.name) || 'Julia';
  const city = useOnboarding((s) => s.city);
  const work = useOnboarding((s) => s.work);
  const voice = useOnboarding((s) => s.voice);
  const { memory, people, deleteMemory, addMemory, addPerson } = useProfile();
  const showToast = useToast((s) => s.show);
  const [personName, setPersonName] = useState('');
  const [personRel, setPersonRel] = useState('');
  const [know, setKnow] = useState('');
  const [pronounce, setPronounce] = useState('');
  const [voiceSheet, setVoiceSheet] = useState(false);
  const [remindersSheet, setRemindersSheet] = useState(false);
  const [trialSheet, setTrialSheet] = useState(false);
  const rem = useReminders((s) => s.rem);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <LinearGradient
            colors={['#e2b98a', '#b790c8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}>
            <Text style={styles.avatarText}>{name[0]}</Text>
          </LinearGradient>
          <View style={styles.headerCol}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.headerSub}>The more Sora knows, the truer your stories feel.</Text>
          </View>
        </View>

        {/* Sora's memory */}
        <SectionLabel>SORA'S MEMORY</SectionLabel>
        <View style={styles.card}>
          {memory.map((m, i) => (
            <View key={`${m}-${i}`} style={styles.memoryRow}>
              <Text style={styles.memoryText}>{m}</Text>
              <Pressable
                onPress={() => {
                  deleteMemory(i);
                  showToast('Forgotten. Your stories update.');
                }}
                style={styles.memoryDel}>
                <Svg width={12} height={12} viewBox="0 0 12 12">
                  <Path d="M2 2l8 8M10 2l-8 8" stroke="rgba(46,36,64,0.45)" strokeWidth={1.8} strokeLinecap="round" />
                </Svg>
              </Pressable>
            </View>
          ))}
          <Text style={styles.memoryNote}>
            Remove anything and Sora forgets it instantly. Your stories update.
          </Text>
        </View>

        {/* The basics */}
        <SectionLabel>THE BASICS</SectionLabel>
        <View style={styles.cardTight}>
          <View style={styles.settingRow}>
            <Text style={styles.settingKey}>Name</Text>
            <Text style={styles.settingVal}>{name}</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingKey}>City</Text>
            <Text style={styles.settingVal}>{city || 'New York City'}</Text>
          </View>
          <View style={[styles.settingRow, styles.settingRowLast]}>
            <Text style={styles.settingKey}>Career</Text>
            <Text style={styles.settingVal}>{work || 'Designer, building a studio'}</Text>
          </View>
        </View>

        {/* Voice */}
        <SectionLabel>VOICE</SectionLabel>
        <View style={styles.cardTight}>
          <Pressable onPress={() => setVoiceSheet(true)} style={styles.settingRow}>
            <Text style={styles.settingKey}>Narrator</Text>
            <View style={styles.settingValRow}>
              <Text style={styles.settingVal}>{voice}</Text>
              <Chevron />
            </View>
          </Pressable>
          <View style={styles.pronounceBlock}>
            <Text style={styles.settingKey}>How do we say your name?</Text>
            <TextInput
              value={pronounce}
              onChangeText={setPronounce}
              placeholder="e.g. 'SHIV-on' for Siobhán"
              placeholderTextColor="rgba(46,36,64,0.34)"
              style={styles.pronounceInput}
            />
          </View>
        </View>

        {/* My people */}
        <SectionLabel>MY PEOPLE</SectionLabel>
        <View style={styles.peopleCard}>
          {people.map((p, i) => (
            <View key={`${p.name}-${i}`} style={styles.personRow}>
              <Svg width={16} height={15} viewBox="0 0 24 22">
                <Path d="M12 20.5S2.5 15 1.2 8.7A5.6 5.6 0 0 1 12 5a5.6 5.6 0 0 1 10.8 3.7C21.5 15 12 20.5 12 20.5z" fill="#b790c8" />
              </Svg>
              <Text style={styles.personName}>{p.name}</Text>
              <Text style={styles.personRel}>{p.rel}</Text>
            </View>
          ))}
          <View style={styles.personInputs}>
            <TextInput
              value={personName}
              onChangeText={setPersonName}
              placeholder="Name"
              placeholderTextColor="rgba(46,36,64,0.34)"
              style={[styles.personInput, { flex: 1 }]}
            />
            <TextInput
              value={personRel}
              onChangeText={setPersonRel}
              placeholder="Who are they to you?"
              placeholderTextColor="rgba(46,36,64,0.34)"
              style={[styles.personInput, { flex: 1.4 }]}
            />
            <Pressable
              onPress={() => {
                if (!personName.trim()) return;
                addPerson(personName.trim(), personRel.trim());
                setPersonName('');
                setPersonRel('');
              }}
              style={styles.personAdd}>
              <Text style={styles.personAddText}>Add</Text>
            </Pressable>
          </View>
        </View>

        {/* Anything Sora should know */}
        <SectionLabel>ANYTHING SORA SHOULD KNOW?</SectionLabel>
        <View style={styles.peopleCard}>
          <TextInput
            value={know}
            onChangeText={setKnow}
            placeholder="I actually prefer iced lattes. My dog's name is Miso…"
            placeholderTextColor="rgba(46,36,64,0.34)"
            multiline
            style={styles.knowInput}
          />
          <Pressable
            onPress={() => {
              if (!know.trim()) return;
              addMemory(know.trim());
              setKnow('');
              showToast('Saved. Sora knows you a little better.');
            }}
            style={styles.knowSave}>
            <Text style={styles.knowSaveText}>Save to memory</Text>
          </Pressable>
        </View>

        {/* Daily rhythm */}
        <SectionLabel>DAILY RHYTHM</SectionLabel>
        <View style={styles.cardTight}>
          <Pressable onPress={() => setRemindersSheet(true)} style={styles.settingRow}>
            <Text style={styles.settingKey}>Reminders</Text>
            <View style={styles.settingValRow}>
              <Text style={styles.settingVal}>{remindersOnCount(rem)} of 3 on</Text>
              <Chevron />
            </View>
          </Pressable>
          <Pressable
            onPress={() => router.push('/widgets')}
            style={[styles.settingRow, styles.settingRowLast]}>
            <Text style={styles.settingKey}>Widgets</Text>
            <View style={styles.settingValRow}>
              <Text style={styles.settingVal}>Lock screen & home</Text>
              <Chevron />
            </View>
          </Pressable>
        </View>

        {/* Referral */}
        <LinearGradient
          colors={['rgba(201,141,63,0.16)', 'rgba(183,144,200,0.18)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.referralCard}>
          <Text style={styles.referralTitle}>Give a week, get a week</Text>
          <Text style={styles.referralSub}>
            Invite a friend into their dream life. When they join, you both get 7 days free.
          </Text>
          <Pressable
            onPress={() => showToast('Link copied. Give a week, get a week.')}
            style={styles.referralBtn}>
            <Text style={styles.referralBtnText}>Copy my invite link</Text>
          </Pressable>
        </LinearGradient>

        {/* Subscription */}
        <View style={[styles.cardTight, { marginTop: 20 }]}>
          <View style={styles.settingRow}>
            <Text style={styles.settingKey}>Subscription</Text>
            <Pressable onPress={() => setTrialSheet(true)} style={styles.settingValRow}>
              <Text style={styles.trialText}>Free trial · 2 days left</Text>
              <Chevron />
            </Pressable>
          </View>
          <Pressable style={styles.settingRow}>
            <Text style={styles.settingKey}>Manage or cancel</Text>
            <Chevron />
          </Pressable>
          <Pressable style={[styles.settingRow, styles.settingRowLast]}>
            <Text style={styles.settingKey}>Restore purchases</Text>
            <Chevron />
          </Pressable>
        </View>
      </ScrollView>
      {voiceSheet && <VoiceSheet onClose={() => setVoiceSheet(false)} />}
      {remindersSheet && <RemindersSheet onClose={() => setRemindersSheet(false)} />}
      {trialSheet && <TrialReminderSheet onClose={() => setTrialSheet(false)} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.screenTop,
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.screenBottom,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.serifItalic, fontSize: 24, color: colors.white },
  headerCol: { flex: 1 },
  name: { fontFamily: fonts.serifItalic, fontSize: 26, color: colors.ink },
  headerSub: { fontSize: 12.5, color: colors.muted },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(46,36,64,0.5)',
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    borderRadius: 22,
    backgroundColor: colors.cardFill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cardTight: {
    borderRadius: 22,
    backgroundColor: colors.cardFill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 2,
    paddingHorizontal: 16,
  },
  memoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 46,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,36,64,0.07)',
  },
  memoryText: { flex: 1, fontSize: 13.5, lineHeight: 13.5 * 1.4, color: colors.ink },
  memoryDel: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  memoryNote: {
    fontSize: 11.5,
    color: 'rgba(46,36,64,0.5)',
    paddingVertical: 10,
    lineHeight: 11.5 * 1.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,36,64,0.07)',
  },
  settingRowLast: { borderBottomWidth: 0 },
  settingKey: { fontSize: 14, color: colors.ink },
  settingVal: { fontSize: 14, color: colors.muted },
  settingValRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trialText: { fontSize: 13, color: colors.green, fontWeight: '600' },
  pronounceBlock: { gap: 6, paddingVertical: 12 },
  pronounceInput: {
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(46,36,64,0.12)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 16,
    fontSize: 13.5,
    color: colors.ink,
  },
  peopleCard: {
    borderRadius: 22,
    backgroundColor: colors.cardFill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  personName: { fontSize: 14, fontWeight: '600', color: colors.ink },
  personRel: { fontSize: 12.5, color: 'rgba(46,36,64,0.5)' },
  personInputs: { flexDirection: 'row', gap: 8 },
  personInput: {
    minWidth: 0,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(46,36,64,0.12)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 14,
    fontSize: 13.5,
    color: colors.ink,
  },
  personAdd: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personAddText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  knowInput: {
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(46,36,64,0.12)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 13.5,
    lineHeight: 13.5 * 1.5,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  knowSave: {
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knowSaveText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  referralCard: {
    marginTop: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(201,141,63,0.25)',
    padding: 18,
    gap: 8,
  },
  referralTitle: { fontFamily: fonts.serifItalic, fontSize: 18, color: colors.ink },
  referralSub: { fontSize: 13, color: 'rgba(46,36,64,0.6)', lineHeight: 13 * 1.5 },
  referralBtn: {
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  referralBtnText: { color: colors.white, fontSize: 14, fontWeight: '600' },
});
