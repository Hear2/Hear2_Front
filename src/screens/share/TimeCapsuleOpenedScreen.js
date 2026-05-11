import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';

const CONFETTI = [
  { left: '12%', top: 40,   size: 16, color: '#FFD700', delay: 0,    glyph: '✨' },
  { left: '88%', top: 70,   size: 14, color: '#FFFFFF', delay: 400,  glyph: '★' },
  { left: '20%', top: 160,  size: 12, color: '#FF6B9D', delay: 800,  glyph: '🎉' },
  { left: '80%', top: 220,  size: 16, color: '#A78BFA', delay: 200,  glyph: '✨' },
  { left: '8%',  top: 360,  size: 12, color: '#FFD700', delay: 600,  glyph: '★' },
  { left: '92%', top: 420,  size: 14, color: '#FFB590', delay: 300,  glyph: '🎉' },
  { left: '14%', top: 540,  size: 16, color: '#FFFFFF', delay: 900,  glyph: '✨' },
  { left: '86%', top: 600,  size: 12, color: '#FF6B9D', delay: 500,  glyph: '★' },
];

const ConfettiSparkle = ({ left, top, size, color, delay, glyph }) => {
  const op = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(op, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [delay, op]);

  return (
    <Animated.Text
      pointerEvents="none"
      style={{
        position: 'absolute',
        left,
        top,
        fontSize: size,
        color,
        opacity: op,
      }}
    >
      {glyph}
    </Animated.Text>
  );
};

const ContentsLetter = () => (
  <View style={styles.contentCard}>
    <View style={styles.letterHeader}>
      <Text style={styles.letterLead}>💌 1년 전 우리가 쓴 편지</Text>
      <Text style={styles.letterDate}>2025.05.16</Text>
    </View>
    <LinearGradient
      colors={['#FFF5F8', '#FFE4EE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.letterBody}
    >
      <Text style={styles.openQuote}>"</Text>
      <Text style={styles.letterText}>
        지금 이 순간이 너무 행복해서 1년 뒤에도 기억하고 싶어 봉인해. 작은 카페에서 우연히 만난 너에게,
        우리가 1년 후에도 여전히 같이 있길.{'\n\n'}
        <Text style={styles.letterSign}>— 2025.05.16, 예진</Text>
      </Text>
    </LinearGradient>
  </View>
);

const Photos = () => {
  const PHOTOS = [
    { colors: ['#FFE4EE', '#FFB590'], emoji: '🌸', cap: '벚꽃 데이트' },
    { colors: ['#C5E8D5', '#E8F5E9'], emoji: '🥂', cap: '1주년 와인' },
    { colors: ['#E8F0FF', '#C5B8FF'], emoji: '🎢', cap: '에버랜드' },
  ];
  return (
    <View style={styles.contentCard}>
      <View style={styles.subRow}>
        <Text style={styles.subLabel}>📷 봉인했던 사진 3장</Text>
        <Text style={styles.subAction}>모두 보기</Text>
      </View>
      <View style={styles.photoRow}>
        {PHOTOS.map((p, i) => (
          <View key={i} style={{ flex: 1 }}>
            <LinearGradient
              colors={p.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.photoTile}
            >
              <Text style={styles.photoEmoji}>{p.emoji}</Text>
            </LinearGradient>
            <Text style={styles.photoCap}>{p.cap}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const Voice = () => (
  <View style={styles.voiceCard}>
    <LinearGradient
      colors={['#FFB05B', colors.heartRed]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.playBtn}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 14 }}>▶</Text>
    </LinearGradient>
    <View style={{ flex: 1 }}>
      <Text style={styles.voiceTitle}>예진의 음성 메시지</Text>
      <Svg viewBox="0 0 160 16" width="100%" height="14" style={{ marginTop: 4 }}>
        {Array.from({ length: 28 }).map((_, i) => {
          const h = 3 + Math.abs(Math.sin(i * 0.7)) * 10;
          return (
            <Rect
              key={i}
              x={i * 6}
              y={(16 - h) / 2}
              width="3"
              height={h}
              rx="1.5"
              fill={i < 14 ? colors.heartRed : '#FFD0E0'}
            />
          );
        })}
      </Svg>
    </View>
    <Text style={styles.voiceTime}>0:18</Text>
  </View>
);

const NowVsThen = () => {
  const rows = [
    { label: '연애 일수', then: '120일', now: '485일', delta: '+365' },
    { label: '주고받은 말', then: '8.4k', now: '23.7k', delta: '+182%' },
    { label: '함께한 사진', then: '64장', now: '283장', delta: '+342%' },
    { label: '캐릭터', then: 'Lv.3', now: 'Lv.13', delta: '+10' },
  ];
  return (
    <View style={styles.contentCard}>
      <Text style={styles.nowTitle}>✨ 그때와 지금</Text>
      <View style={styles.gridWrap}>
        {rows.map((r, i) => (
          <View key={i} style={styles.gridCell}>
            <Text style={styles.gridLabel}>{r.label}</Text>
            <View style={styles.gridValueRow}>
              <Text style={styles.gridNow}>{r.now}</Text>
              <Text style={styles.gridDelta}>▲ {r.delta}</Text>
            </View>
            <Text style={styles.gridThen}>1년 전: {r.then}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const TimeCapsuleOpenedScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E2152', '#3B3F8F', '#FF6B9D']}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LovelyBackground intensity={0.7} hearts sparkles />

      {/* Confetti layer */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {CONFETTI.map((c, i) => (
          <ConfettiSparkle key={i} {...c} />
        ))}
      </View>

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={8}>
          <Text style={styles.topIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>HEAR2 TIME CAPSULE</Text>
        <Text style={styles.topIcon}>⋯</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Opened envelope hero */}
        <View style={styles.heroWrap}>
          <Animated.View style={[styles.envelope, { transform: [{ scale: breathe }] }]}>
            <Text style={styles.envelopeEmoji}>💌</Text>
            <Text style={[styles.envelopeSparkle, { top: -8, right: -6 }]}>✨</Text>
            <Text style={[styles.envelopeSparkle, { bottom: -6, left: -8, fontSize: 16 }]}>✨</Text>
          </Animated.View>
          <Text style={styles.heroTitle}>1주년 기념 캡슐이 열렸어요 💕</Text>
          <Text style={styles.heroSub}>1년 전 오늘, 우리가 봉인한 추억</Text>
          <View style={styles.timestampPill}>
            <Text style={styles.timestampText}>
              🔒 봉인: 2025.05.16 → 🔓 오픈: 2026.05.16
            </Text>
          </View>
        </View>

        <ContentsLetter />
        <Photos />
        <Voice />
        <NowVsThen />

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.85}>
            <Text style={styles.ctaSecondaryText}>📥 추억함에 보관</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ctaPrimary}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate('TimeCapsuleCreateScreen')}
          >
            <Text style={styles.ctaPrimaryText}>💌 새 캡슐 만들기</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 + insets.bottom }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E2152' },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topIcon: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', width: 28 },
  topTitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  heroWrap: { alignItems: 'center', marginTop: 8 },
  envelope: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  envelopeEmoji: { fontSize: 48 },
  envelopeSparkle: { position: 'absolute', fontSize: 22, color: '#FFFFFF' },
  heroTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroSub: {
    marginTop: 4,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  timestampPill: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  timestampText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  contentCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.96)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 4,
  },
  letterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letterLead: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: colors.heartRed,
  },
  letterDate: { fontSize: 10, color: '#888', fontWeight: '600' },
  letterBody: {
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  openQuote: {
    position: 'absolute',
    top: -8,
    left: 8,
    fontSize: 40,
    color: colors.pink,
    opacity: 0.4,
    fontWeight: '800',
  },
  letterText: {
    paddingLeft: 18,
    fontSize: 12,
    color: colors.ink,
    lineHeight: 22,
  },
  letterSign: { color: colors.heartRed, fontWeight: '700' },

  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subLabel: { fontSize: 12, fontWeight: '800', color: colors.ink },
  subAction: { fontSize: 10, color: colors.heartRed, fontWeight: '700' },
  photoRow: { flexDirection: 'row', gap: 6 },
  photoTile: {
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: { fontSize: 26 },
  photoCap: {
    marginTop: 4,
    fontSize: 9,
    color: '#888',
    textAlign: 'center',
    fontWeight: '600',
  },

  voiceCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceTitle: { fontSize: 12, fontWeight: '800', color: colors.ink },
  voiceTime: { fontSize: 10, color: '#888', fontWeight: '700' },

  nowTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 10,
  },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridCell: {
    width: '48%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF5F8',
  },
  gridLabel: {
    fontSize: 9,
    color: '#888',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  gridValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  gridNow: { fontSize: 14, fontWeight: '800', color: colors.ink },
  gridDelta: { fontSize: 9, color: '#1F8A5B', fontWeight: '800' },
  gridThen: { fontSize: 9, color: colors.inkMute, marginTop: 2 },

  ctaRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  ctaSecondary: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSecondaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  ctaPrimary: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimaryText: { color: colors.heartRed, fontSize: 13, fontWeight: '800' },
});

export default TimeCapsuleOpenedScreen;
