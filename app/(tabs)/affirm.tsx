import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';
import { AFFIRMATIONS, useAffirm } from '@/store/affirm';
import { useOnboarding } from '@/store/onboarding';

// Reference: Sora Affirm UI.dc.html (canonical) + the Affirm tab in
// Sora Prototype.dc.html. One numbered card at a time, neighbors peeking,
// backdrop tone shifting per card. Swipe threshold 60px, cards travel 300px.

const BGS: readonly (readonly [string, string, string])[] = [
  ['#f7efe8', '#f0dfd8', '#e5d2d8'],
  ['#f2eef1', '#e6dcec', '#d8cfe6'],
  ['#eef2ee', '#dde8df', '#cfdcd4'],
  ['#f6f0e6', '#efe2cf', '#e3d2bd'],
  ['#f0eff4', '#dfe0ee', '#cdd2e8'],
];

const SWIPE_THRESHOLD = 60;
const CARD_TRAVEL = 300;

export default function AffirmScreen() {
  const name = useOnboarding((s) => s.name) || 'Julia';
  const { favs, sleep, toggleFav, toggleSleep } = useAffirm();
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  // drag offset in px; animates to ±CARD_TRAVEL on swipe, 0 on spring-back
  const drag = useRef(new Animated.Value(0)).current;
  const idxRef = useRef(0);
  idxRef.current = idx;

  // backdrop crossfade (0.8s ease) between palette entries
  const bgFade = useRef(new Animated.Value(1)).current;
  const [bgPair, setBgPair] = useState<{ prev: number; cur: number }>({ prev: 0, cur: 0 });
  useEffect(() => {
    setBgPair((p) => ({ prev: p.cur, cur: idx % BGS.length }));
    bgFade.setValue(0);
    Animated.timing(bgFade, { toValue: 1, duration: 800, easing: Easing.ease, useNativeDriver: true }).start();
  }, [idx, bgFade]);

  const settle = (target: number, nextIdx: number) => {
    Animated.timing(drag, {
      toValue: target,
      duration: 400,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start(() => {
      if (nextIdx !== idxRef.current) {
        setIdx(nextIdx);
        setPlaying(false);
      }
      drag.setValue(0);
    });
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_e, g) => drag.setValue(g.dx),
      onPanResponderRelease: (_e, g) => {
        const i = idxRef.current;
        if (g.dx < -SWIPE_THRESHOLD && i < AFFIRMATIONS.length - 1) settle(-CARD_TRAVEL, i + 1);
        else if (g.dx > SWIPE_THRESHOLD && i > 0) settle(CARD_TRAVEL, i - 1);
        else settle(0, i);
      },
      onPanResponderTerminate: () => settle(0, idxRef.current),
    }),
  ).current;

  const step = (dir: -1 | 1) => {
    const next = Math.min(AFFIRMATIONS.length - 1, Math.max(0, idx + dir));
    if (next !== idx) {
      setIdx(next);
      setPlaying(false);
      drag.setValue(0);
    }
  };

  return (
    <View style={styles.root}>
      {/* crossfading backdrop */}
      <LinearGradient
        colors={BGS[bgPair.prev]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.55, y: 0 }}
        end={{ x: 0.45, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgFade }]}>
        <LinearGradient
          colors={BGS[bgPair.cur]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.55, y: 0 }}
          end={{ x: 0.45, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.content}>
        {/* dots + sleep moon */}
        <View style={styles.topRow}>
          <View style={styles.dots}>
            {AFFIRMATIONS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: i === idx ? 18 : 4,
                    backgroundColor:
                      i === idx
                        ? colors.primary
                        : i < idx
                          ? 'rgba(80,58,107,0.4)'
                          : 'rgba(46,36,64,0.15)',
                  },
                ]}
              />
            ))}
          </View>
          <Pressable onPress={toggleSleep} style={styles.moonBtn}>
            <Svg width={19} height={19} viewBox="0 0 24 24">
              <Path
                d="M20 13.5A8 8 0 0 1 9.5 3a8 8 0 1 0 10.5 10.5z"
                fill={sleep ? colors.primary : 'none'}
                stroke={sleep ? colors.primary : 'rgba(46,36,64,0.45)'}
                strokeWidth={1.7}
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        </View>

        {/* deck */}
        <View style={styles.deck} {...pan.panHandlers}>
          {AFFIRMATIONS.map((t, i) => {
            const off = i - idx;
            if (Math.abs(off) > 1) return null;
            const translateX = Animated.add(drag, new Animated.Value(off * CARD_TRAVEL));
            const rotate =
              off === 0
                ? drag.interpolate({
                    inputRange: [-300, 300],
                    outputRange: ['-6deg', '6deg'],
                  })
                : `${off * 2.5}deg`;
            return (
              <Animated.View
                key={i}
                style={[
                  styles.card,
                  {
                    opacity: off === 0 ? 1 : 0.55,
                    zIndex: 10 - Math.abs(off),
                    transform: [
                      { translateX },
                      { scale: off === 0 ? 1 : 0.9 },
                      { rotate },
                    ],
                  },
                ]}>
                <Text style={styles.cardNo}>№ {i + 1}</Text>
                <Text style={styles.cardText}>{t}</Text>
                <Text style={styles.cardVoice}>IN THE VOICE OF {name.toUpperCase()}</Text>
              </Animated.View>
            );
          })}
          <Pressable
            onPress={() => step(-1)}
            style={[styles.chevron, styles.chevronLeft, { opacity: idx > 0 ? 1 : 0.25 }]}>
            <Svg width={16} height={16} viewBox="0 0 20 20">
              <Path d="M12.5 4 6.5 10l6 6" stroke={colors.primary} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Pressable
            onPress={() => step(1)}
            style={[
              styles.chevron,
              styles.chevronRight,
              { opacity: idx < AFFIRMATIONS.length - 1 ? 1 : 0.25 },
            ]}>
            <Svg width={16} height={16} viewBox="0 0 20 20">
              <Path d="M7.5 4 13.5 10l-6 6" stroke={colors.primary} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        </View>

        {/* fav · play · share */}
        <View style={styles.controls}>
          <Pressable onPress={() => toggleFav(idx)} style={styles.sideBtn}>
            <Svg width={23} height={21} viewBox="0 0 24 22">
              <Path
                d="M12 20.5S2.5 15 1.2 8.7A5.6 5.6 0 0 1 12 5a5.6 5.6 0 0 1 10.8 3.7C21.5 15 12 20.5 12 20.5z"
                fill={favs[idx] ? '#c76d8b' : 'none'}
                stroke="#b06a9a"
                strokeWidth={1.6}
              />
            </Svg>
          </Pressable>
          <Pressable onPress={() => setPlaying((p) => !p)} style={styles.playBtn}>
            {playing ? (
              <Svg width={20} height={20} viewBox="0 0 20 20">
                <Rect x={4.5} y={3.5} width={3.6} height={13} rx={1.4} fill={colors.white} />
                <Rect x={11.9} y={3.5} width={3.6} height={13} rx={1.4} fill={colors.white} />
              </Svg>
            ) : (
              <Svg width={20} height={20} viewBox="0 0 20 20">
                <Path d="M6.5 3.5v13l10-6.5z" fill={colors.white} />
              </Svg>
            )}
          </Pressable>
          <Pressable style={styles.sideBtn}>
            <Svg width={19} height={20} viewBox="0 0 18 19">
              <Path d="M9 1.5v11M9 1.5 5.5 5M9 1.5 12.5 5" stroke={colors.primary} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M3.5 9v6.5a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9" stroke={colors.primary} strokeWidth={1.8} fill="none" strokeLinecap="round" />
            </Svg>
          </Pressable>
        </View>
        <Text style={styles.hint}>swipe the card · left or right</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, paddingTop: 74, paddingBottom: 118 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { height: 4, borderRadius: 2 },
  moonBtn: {
    width: 40,
    height: 40,
    marginRight: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deck: { flex: 1, marginTop: 10 },
  card: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 282,
    marginLeft: -141,
    marginTop: -170,
    minHeight: 340,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    paddingVertical: 44,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    shadowColor: 'rgba(70,50,100,1)',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 40,
    elevation: 10,
  },
  cardNo: { fontSize: 10, fontWeight: '600', letterSpacing: 2.2, color: 'rgba(46,36,64,0.4)' },
  cardText: {
    fontFamily: fonts.serifItalic,
    fontSize: 24,
    lineHeight: 24 * 1.42,
    color: colors.headline,
    textAlign: 'center',
  },
  cardVoice: { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(46,36,64,0.38)' },
  chevron: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  chevronLeft: { left: 8 },
  chevronRight: { right: 8 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 34 },
  sideBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
  },
  hint: { marginTop: 18, textAlign: 'center', fontSize: 11, color: 'rgba(46,36,64,0.4)' },
});
