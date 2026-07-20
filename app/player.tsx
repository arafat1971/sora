import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Defs, Ellipse, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Orb } from '@/components/Orb';
import { Screen } from '@/components/Screen';
import { VoiceSheet } from '@/components/VoiceSheet';
import { colors, fonts } from '@/constants/theme';
import { generateStory } from '@/lib/api';
import { useOnboarding } from '@/store/onboarding';
import {
  CUSTOM_CAPTION,
  DEFAULT_CAPTION,
  SPEEDS,
  STORY_DURATION,
  STORY_SECONDS,
  usePlayback,
} from '@/store/playback';

// Reference: Story player overlay in Sora Prototype.dc.html. Full-screen (not
// a sheet). Audio is simulated at the prototype's tick rate until the
// ElevenLabs pipeline lands.

export default function PlayerScreen() {
  const router = useRouter();
  const pb = usePlayback();
  const name = useOnboarding((s) => s.name) || 'Julia';
  const voice = useOnboarding((s) => s.voice);
  const [voiceSheet, setVoiceSheet] = useState(false);
  const [modifySheet, setModifySheet] = useState(false);
  const [modText, setModText] = useState('');
  const [rewriting, setRewriting] = useState(false);

  // The playback tick runs globally at the app shell (usePlaybackTick), so
  // progress keeps advancing when the player is backgrounded to the mini-player.

  const secs = Math.round((STORY_SECONDS * pb.prog) / 100);
  const progTime = `0${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  const done = pb.prog >= 100;
  const caption = pb.isCustom ? CUSTOM_CAPTION : DEFAULT_CAPTION;

  const storyP1 = `The kettle exhales, and ${name} does too. Morning light spills across the floorboards of a place that is unmistakably, legally, gloriously yours. No alarm dragged you here — you simply woke, easy, the way people do when nothing is chasing them.`;
  const storyP2 = `You carry your coffee to the window and watch the street below without needing anything from it. This is what arrived when you stopped rushing: not a bigger life, exactly — a truer one. And it fits.`;

  return (
    <Screen>
      {/* warm radial glow at 50% 24% */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="24%" r="50%">
            <Stop offset="0%" stopColor="rgba(255,240,224,0.4)" />
            <Stop offset="70%" stopColor="rgba(255,240,224,0)" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="50%" cy="24%" rx="190" ry="150" fill="url(#glow)" />
      </Svg>

      <View style={styles.root}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Svg width={20} height={20} viewBox="0 0 20 20">
              <Path d="M4 7.5 10 13.5 16 7.5" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Text style={styles.headerEyebrow}>NOW PLAYING</Text>
          <Pressable onPress={pb.toggleFav} style={[styles.headerBtn, styles.headerBtnRight]}>
            <Svg width={21} height={19} viewBox="0 0 24 22">
              <Path
                d="M12 20.5S2.5 15 1.2 8.7A5.6 5.6 0 0 1 12 5a5.6 5.6 0 0 1 10.8 3.7C21.5 15 12 20.5 12 20.5z"
                fill={pb.fav ? '#c76d8b' : 'none'}
                stroke="#c76d8b"
                strokeWidth={1.6}
              />
            </Svg>
          </Pressable>
        </View>

        <Text style={styles.title}>{pb.title}</Text>
        {pb.modified && (
          <View style={styles.rewrittenBadge}>
            <Text style={styles.rewrittenText}>Rewritten with your changes — just now</Text>
          </View>
        )}

        {pb.reading ? (
          <ScrollView style={styles.readWrap} contentContainerStyle={styles.readContent}>
            <Text style={styles.readP}>{storyP1}</Text>
            <Text style={styles.readP}>{storyP2}</Text>
          </ScrollView>
        ) : (
          <View style={styles.orbWrap}>
            <Orb size={170} breatheDuration={5000} style={styles.playerOrb} />
            <Text style={styles.caption}>{caption}</Text>
            <Pressable onPress={() => setVoiceSheet(true)} style={styles.voiceChip}>
              <Svg width={12} height={14} viewBox="0 0 12 14">
                <Rect x={3.5} y={1} width={5} height={8} rx={2.5} fill="none" stroke={colors.primary} strokeWidth={1.5} />
                <Path d="M1 7a5 5 0 0 0 10 0M6 12v1.5" fill="none" stroke={colors.primary} strokeWidth={1.5} strokeLinecap="round" />
              </Svg>
              <Text style={styles.voiceChipText}>{voice} · change voice</Text>
            </Pressable>
          </View>
        )}

        {/* Scrubber */}
        <View style={styles.scrubWrap}>
          <View style={styles.scrubTrack}>
            <View style={[styles.scrubFill, { width: `${pb.prog}%` }]} />
          </View>
          <View style={styles.timesRow}>
            <Text style={styles.time}>{progTime}</Text>
            <Text style={styles.time}>{STORY_DURATION}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            onPress={pb.toggleLoop}
            style={[styles.ctrlSm, { backgroundColor: pb.loop ? colors.primary : 'rgba(255,255,255,0.6)' }]}>
            <Svg width={18} height={18} viewBox="0 0 19 19">
              <Path
                d="M4 7.5V6a3 3 0 0 1 3-3h8m0 0-2.5-2.5M15 3l-2.5 2.5M15 11.5V13a3 3 0 0 1-3 3H4m0 0 2.5 2.5M4 16l2.5-2.5"
                stroke={pb.loop ? colors.white : colors.ink}
                strokeWidth={1.7}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
          <Pressable onPress={() => pb.seek(-10)} style={styles.ctrlMd}>
            <Svg width={20} height={16} viewBox="0 0 20 16">
              <Path d="M10 2 3.5 8l6.5 6M17 2l-6.5 6L17 14" stroke={colors.ink} strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Pressable onPress={pb.togglePlay} style={styles.playBtn}>
            {pb.playing ? (
              <Svg width={22} height={22} viewBox="0 0 20 20">
                <Rect x={4.5} y={3.5} width={3.6} height={13} rx={1.4} fill={colors.white} />
                <Rect x={11.9} y={3.5} width={3.6} height={13} rx={1.4} fill={colors.white} />
              </Svg>
            ) : (
              <Svg width={22} height={22} viewBox="0 0 20 20">
                <Path d="M6.5 3.5v13l10-6.5z" fill={colors.white} />
              </Svg>
            )}
          </Pressable>
          <Pressable onPress={() => pb.seek(10)} style={styles.ctrlMd}>
            <Svg width={20} height={16} viewBox="0 0 20 16">
              <Path d="M10 2l6.5 6-6.5 6M3 2l6.5 6L3 14" stroke={colors.ink} strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Pressable onPress={pb.cycleSpeed} style={styles.ctrlSm}>
            <Text style={styles.speedText}>{SPEEDS[pb.speedIdx]}x</Text>
          </Pressable>
        </View>

        {/* End-of-story seal */}
        {done && (
          <View style={styles.sealCard}>
            <Text style={styles.sealTitle}>It is done.</Text>
            <Text style={styles.sealSub}>
              You just lived it once. The world tends to echo — watch for the sign today.
            </Text>
            <View style={styles.sealBtns}>
              <Pressable onPress={() => router.push('/log-sign')} style={styles.sealBtnLight}>
                <Text style={styles.sealBtnLightText}>I noticed a sign</Text>
              </Pressable>
              <Pressable style={styles.sealBtnGhost}>
                <Text style={styles.sealBtnGhostText}>Share this feeling</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.linksRow}>
          <Pressable onPress={pb.toggleRead} style={styles.linkBtn}>
            <Text style={styles.linkText}>{pb.reading ? 'Listen instead' : 'Read instead'}</Text>
          </Pressable>
          <Pressable onPress={() => setModifySheet(true)} style={styles.linkBtn}>
            <Text style={styles.linkText}>Modify story</Text>
          </Pressable>
          <Pressable style={styles.linkBtn}>
            <Text style={styles.linkText}>Share</Text>
          </Pressable>
        </View>
      </View>

      {voiceSheet && <VoiceSheet onClose={() => setVoiceSheet(false)} />}

      {/* Modify sheet — regenerates the story around the user's change */}
      {modifySheet && (
        <Pressable style={styles.scrim} onPress={() => !rewriting && setModifySheet(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitle}>What should change?</Text>
            <Text style={styles.sheetSub}>
              Sora rewrites this story around your words — instantly.
            </Text>
            <TextInput
              value={modText}
              onChangeText={setModText}
              placeholder="e.g. Make it a tiny cabin by the sea, and my sister is there…"
              placeholderTextColor="rgba(46,36,64,0.34)"
              multiline
              editable={!rewriting}
              style={styles.modInput}
            />
            <View style={styles.sheetBtns}>
              <Pressable
                onPress={() => setModifySheet(false)}
                disabled={rewriting}
                style={styles.sheetCancel}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (!modText.trim() || rewriting) return;
                  setRewriting(true);
                  try {
                    const result = await generateStory(
                      { mode: 'modify', story_id: 'current', change_note: modText.trim() },
                      '',
                    );
                    pb.modify(
                      result.title ||
                        'A quiet morning inside the little place by the sea',
                    );
                  } finally {
                    setRewriting(false);
                    setModifySheet(false);
                    setModText('');
                  }
                }}
                style={styles.sheetConfirm}>
                {rewriting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.sheetConfirmText}>Rewrite my story</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 64, paddingHorizontal: 26, paddingBottom: 34 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerBtn: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnRight: { marginLeft: 0, marginRight: -10 },
  headerEyebrow: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 2.4,
    color: 'rgba(46,36,64,0.45)',
  },
  title: {
    fontFamily: fonts.serifItalic,
    fontSize: 23,
    lineHeight: 23 * 1.3,
    textAlign: 'center',
    marginTop: 14,
    color: colors.ink,
  },
  readWrap: { flex: 1, marginTop: 16 },
  readContent: { paddingBottom: 8 },
  readP: {
    fontFamily: fonts.serif,
    fontSize: 16.5,
    lineHeight: 16.5 * 1.75,
    color: '#3a2f50',
    marginBottom: 16,
  },
  orbWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 },
  playerOrb: {
    shadowColor: 'rgba(122,104,180,1)',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 44,
    elevation: 12,
  },
  caption: {
    fontFamily: fonts.serifItalic,
    fontSize: 19,
    lineHeight: 19 * 1.45,
    textAlign: 'center',
    color: '#3a2f50',
    paddingHorizontal: 12,
  },
  voiceChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voiceChipText: { fontSize: 12.5, fontWeight: '600', color: colors.primary },
  scrubWrap: { marginTop: 12, gap: 7 },
  scrubTrack: { height: 2, backgroundColor: 'rgba(46,36,64,0.1)', overflow: 'hidden' },
  scrubFill: { height: '100%', backgroundColor: colors.primary },
  timesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontSize: 11, color: 'rgba(46,36,64,0.5)' },
  controls: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  ctrlSm: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  ctrlMd: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
  },
  speedText: { fontSize: 12.5, fontWeight: '700', color: colors.ink },
  sealCard: {
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(84,60,110,0.95)',
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 8,
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 28,
    elevation: 10,
  },
  sealTitle: { fontFamily: fonts.serifItalic, fontSize: 17, color: colors.white },
  sealSub: { fontSize: 12.5, lineHeight: 12.5 * 1.5, color: 'rgba(255,255,255,0.75)' },
  sealBtns: { flexDirection: 'row', gap: 8, marginTop: 2 },
  sealBtnLight: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealBtnLightText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  sealBtnGhost: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealBtnGhostText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  linksRow: { flexDirection: 'row', justifyContent: 'center', gap: 26, marginTop: 18 },
  linkBtn: {
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,36,64,0.2)',
  },
  linkText: { fontSize: 12.5, fontWeight: '600', color: colors.muted },
  rewrittenBadge: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(62,125,90,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(62,125,90,0.3)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  rewrittenText: { fontSize: 11, fontWeight: '600', color: colors.green },
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
  sheetTitle: { fontFamily: fonts.serifItalic, fontSize: 20, textAlign: 'center', color: colors.ink },
  sheetSub: { fontSize: 12.5, color: colors.muted, textAlign: 'center', marginTop: 4 },
  modInput: {
    minHeight: 84,
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
  sheetBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  sheetCancel: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(46,36,64,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelText: { fontSize: 14.5, fontWeight: '600', color: colors.ink },
  sheetConfirm: {
    flex: 1.4,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetConfirmText: { fontSize: 14.5, fontWeight: '600', color: colors.white },
});
