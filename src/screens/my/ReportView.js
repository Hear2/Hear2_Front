import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Text as SvgText,
  Line,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import Header from '../../components/common/Header';
import Chip from '../../components/common/Chip';

const FACES_DATA = [
  { time: '8시', emoji: '😐', x: 20, y: 70 },
  { time: '10시', emoji: '🙂', x: 72, y: 50 },
  { time: '12시', emoji: '😊', x: 124, y: 30 },
  { time: '14시', emoji: '😤', x: 176, y: 80 },
  { time: '16시', emoji: '😊', x: 228, y: 30 },
  { time: '18시', emoji: '🥰', x: 280, y: 15 },
];

const MOMENTS = [
  { emoji: '😤', text: '"왜 맨날 부정적이야?"', label: '부정', pct: '72%', color: colors.pink },
  { emoji: '😊', text: '"파스타 어때?"', label: '긍정', pct: '91%', color: colors.green },
  { emoji: '😢', text: '"오늘 좀 힘들었어"', label: '슬픔', pct: '65%', color: colors.blue },
];

function ProgressBar({ label, pct, color }) {
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barPct}>{pct}%</Text>
    </View>
  );
}

export default function ReportView({ navigation }) {
  const breathAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1.12, duration: 1200, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, [breathAnim]);

  const curvePath = `M ${FACES_DATA[0].x} ${FACES_DATA[0].y} C 46 ${FACES_DATA[0].y - 10}, 56 ${FACES_DATA[1].y + 10}, ${FACES_DATA[1].x} ${FACES_DATA[1].y} C 88 ${FACES_DATA[1].y - 10}, 108 ${FACES_DATA[2].y + 10}, ${FACES_DATA[2].x} ${FACES_DATA[2].y} C 140 ${FACES_DATA[2].y + 20}, 160 ${FACES_DATA[3].y - 10}, ${FACES_DATA[3].x} ${FACES_DATA[3].y} C 192 ${FACES_DATA[3].y - 20}, 212 ${FACES_DATA[4].y + 10}, ${FACES_DATA[4].x} ${FACES_DATA[4].y} C 244 ${FACES_DATA[4].y - 5}, 264 ${FACES_DATA[5].y + 5}, ${FACES_DATA[5].x} ${FACES_DATA[5].y}`;

  const fillPath = `${curvePath} L 280 100 L 20 100 Z`;

  return (
    <View style={styles.container}>
      <Header
        title="오늘의 감정 리포트"
        showBack
        onBack={() => navigation?.goBack()}
        right={<Chip label="주간" variant="outline" />}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Date */}
        <Text style={styles.date}>2026년 4월 7일 · 월요일</Text>

        {/* Today Summary */}
        <View style={styles.card}>
          <View style={styles.summaryTop}>
            <Animated.View style={[styles.emojiCircle, { transform: [{ scale: breathAnim }] }]}>
              <Text style={styles.bigEmoji}>😊</Text>
            </Animated.View>
            <Text style={styles.summaryTitle}>긍정 우세 ✨</Text>
          </View>
          <ProgressBar label="긍정" pct={68} color={colors.green} />
          <ProgressBar label="부정" pct={22} color={colors.pink} />
          <ProgressBar label="중립" pct={10} color={colors.inkMute} />
        </View>

        {/* Faces Timeline */}
        <Text style={styles.sectionTitle}>시간대별 감정 흐름</Text>
        <View style={styles.card}>
          <Svg width="320" height="130" viewBox="0 0 320 130">
            <Path d={fillPath} fill={colors.pinkTint} opacity={0.6} />
            <Path d={curvePath} stroke={colors.pink} strokeWidth={2.5} fill="none" />
            {FACES_DATA.map((f, i) => (
              <React.Fragment key={i}>
                <Circle cx={f.x} cy={f.y} r={16} fill={colors.bgApp} stroke={colors.line} strokeWidth={1} />
                <SvgText x={f.x} y={f.y + 5} fontSize={14} textAnchor="middle">{f.emoji}</SvgText>
                <SvgText x={f.x} y={115} fontSize={10} fill={colors.ink3} textAnchor="middle">{f.time}</SvgText>
              </React.Fragment>
            ))}
          </Svg>
        </View>

        {/* Key Moments */}
        <Text style={styles.sectionTitle}>주요 감정 순간</Text>
        {MOMENTS.map((m, i) => (
          <View key={i} style={styles.momentRow}>
            <Text style={styles.momentEmoji}>{m.emoji}</Text>
            <View style={styles.momentBody}>
              <Text style={styles.momentText}>{m.text}</Text>
              <View style={[styles.momentBadge, { backgroundColor: m.color + '20' }]}>
                <Text style={[styles.momentBadgeText, { color: m.color }]}>{m.label} {m.pct}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* AI Insight */}
        <LinearGradient
          colors={['#FFE4EE', colors.pinkSoft, colors.pink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.insightCard}
        >
          <View style={styles.insightAurora} pointerEvents="none">
            <Svg width="100%" height="100%" viewBox="0 0 200 200">
              <Defs>
                <RadialGradient id="insightGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                  <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.15" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="100" cy="100" r="100" fill="url(#insightGlow)" />
            </Svg>
          </View>
          <View style={styles.insightIconWrap}>
            <Text style={styles.insightIcon}>🤖</Text>
          </View>
          <Text style={styles.insightLabel}>HEAR2 AI 인사이트</Text>
          <Text style={styles.insightText}>
            점심 시간 이후 부정 감정이 살짝 늘었지만, 저녁에는 긍정으로
            전환됐어요. 오늘 잠들기 전 따뜻한 메시지를 남겨보세요 💌
          </Text>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp },
  scroll: { padding: 20, paddingBottom: 40 },
  date: { fontSize: 13, color: colors.ink3, marginBottom: 16 },

  card: { backgroundColor: colors.bgApp, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.line2 },

  summaryTop: { alignItems: 'center', marginBottom: 16 },
  emojiCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.pinkTint, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  bigEmoji: { fontSize: 32 },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: colors.ink },

  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barLabel: { width: 36, fontSize: 12, color: colors.ink3 },
  barTrack: { flex: 1, height: 8, backgroundColor: colors.line2, borderRadius: 4, marginHorizontal: 8 },
  barFill: { height: 8, borderRadius: 4 },
  barPct: { width: 36, fontSize: 12, color: colors.ink3, textAlign: 'right' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 12, marginTop: 8 },

  momentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgSoft, borderRadius: 12, padding: 14, marginBottom: 10 },
  momentEmoji: { fontSize: 28, marginRight: 12 },
  momentBody: { flex: 1 },
  momentText: { fontSize: 14, color: colors.ink2, marginBottom: 6 },
  momentBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  momentBadgeText: { fontSize: 11, fontWeight: '600' },

  insightCard: {
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    overflow: 'hidden',
    shadowColor: colors.pink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  insightAurora: {
    position: 'absolute',
    right: -80,
    top: -80,
    width: 220,
    height: 220,
  },
  insightIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  insightIcon: { fontSize: 22 },
  insightLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    fontWeight: '500',
  },
});
