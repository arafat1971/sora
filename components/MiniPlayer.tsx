import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/theme';
import { STORY_DURATION, STORY_SECONDS, usePlayback } from '@/store/playback';

// Reference: mini-player pill in Sora Prototype.dc.html — 58px dark pill above
// the tab bar, shown when a story is playing and the full player is
// backgrounded. Tapping the pill reopens the player.

export function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const playing = usePlayback((s) => s.playing);
  const title = usePlayback((s) => s.title);
  const prog = usePlayback((s) => s.prog);
  const togglePlay = usePlayback((s) => s.togglePlay);

  // Hidden while the full player is foreground, or when nothing is playing.
  if (!playing || pathname === '/player') return null;

  const secs = Math.round((STORY_SECONDS * prog) / 100);
  const progTime = `0${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  return (
    <View style={styles.pill}>
      <Pressable onPress={togglePlay} style={styles.playBtn}>
        {playing ? (
          <Svg width={16} height={16} viewBox="0 0 20 20">
            <Rect x={4.5} y={3.5} width={3.6} height={13} rx={1.4} fill={colors.white} />
            <Rect x={11.9} y={3.5} width={3.6} height={13} rx={1.4} fill={colors.white} />
          </Svg>
        ) : (
          <Svg width={16} height={16} viewBox="0 0 20 20">
            <Path d="M6.5 3.5v13l10-6.5z" fill={colors.white} />
          </Svg>
        )}
      </Pressable>
      <Pressable onPress={() => router.push('/player')} style={styles.meta}>
        <Text style={styles.nowPlaying}>NOW PLAYING</Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </Pressable>
      <Text style={styles.time}>
        {progTime} / {STORY_DURATION}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 96,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(46,36,64,0.93)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 6,
    paddingRight: 14,
    zIndex: 29,
    shadowColor: 'rgba(30,22,44,1)',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 28,
    elevation: 12,
  },
  playBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flex: 1, minWidth: 0, gap: 1 },
  nowPlaying: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.55)',
  },
  title: { fontSize: 12.5, fontWeight: '600', color: colors.white },
  time: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
});
