import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgLG, Stop, Path, Line, Circle } from 'react-native-svg';
import colors from '../../constants/colors';
import WhatIfShell from './WhatIfShell';

const FACTORS = [
  { label: '주말 일정 충돌', value: 84, tone: '높음' },
  { label: '메시지 톤 변화', value: 62, tone: '중간' },
  { label: '응답 지연', value: 48, tone: '중간' },
  { label: '취미 관심도 차이', value: 31, tone: '낮음' },
];

const toneColor = (v) => (v >= 70 ? '#FC2648' : v >= 50 ? '#FFB05B' : '#7ED7A0');

const RiskGauge = ({ value = 72 }) => {
  const ratio = Math.max(0, Math.min(1, value / 100));
  const arcLen = 251;
  const offset = arcLen * (1 - ratio);
  const angle = Math.PI - ratio * Math.PI;
  const nx = 100 + Math.cos(angle) * 64;
  const ny = 100 - Math.sin(angle) * 64;

  return (
    <View style={styles.gaugeWrap}>
      <Svg viewBox="0 0 200 110" width="100%" height={120}>
        <Defs>
          <SvgLG id="riskArc" x1="0" x2="1" y1="0" y2="0">
            <Stop offset="0%" stopColor="#7ED7A0" />
            <Stop offset="50%" stopColor="#FFB05B" />
            <Stop offset="100%" stopColor="#FC2648" />
          </SvgLG>
        </Defs>
        <Path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#F5F5F5"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <Path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#riskArc)"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${arcLen}`}
          strokeDashoffset={offset}
        />
        <Line
          x1="100"
          y1="100"
          x2={nx}
          y2={ny}
          stroke={colors.ink}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Circle cx="100" cy="100" r="6" fill={colors.ink} />
      </Svg>
      <View style={styles.gaugeLabel}>
        <Text style={styles.gaugePct}>{value}%</Text>
        <Text style={styles.gaugeSub}>갈등 가능성</Text>
      </View>
    </View>
  );
};

const WhatIfConflictScreen = ({ navigation }) => (
  <WhatIfShell
    navigation={navigation}
    tag="갈등 예측"
    tagIcon="⚠️"
    tagTint="#FDF0F5"
    tagColor={colors.heartRed}
    title="이 주제로 대화하면?"
  >
    {/* scenario + gauge */}
    <View style={styles.card}>
      <Text style={styles.cardLead}>분석한 시나리오</Text>
      <Text style={styles.scenario}>
        "이번 주말 일정을 미리 안 정한 채 만나면?"
      </Text>

      <RiskGauge value={72} />
      <View style={styles.scaleRow}>
        <Text style={styles.scaleLabel}>안전</Text>
        <Text style={styles.scaleLabel}>주의</Text>
        <Text style={styles.scaleLabel}>위험</Text>
      </View>
    </View>

    {/* factors */}
    <View style={[styles.card, { marginTop: 12 }]}>
      <Text style={styles.cardTitle}>주요 요인 분석</Text>
      {FACTORS.map((f, i) => (
        <View key={f.label} style={{ marginTop: i === 0 ? 4 : 12 }}>
          <View style={styles.factorHead}>
            <Text style={styles.factorLabel}>{f.label}</Text>
            <Text style={[styles.factorValue, { color: toneColor(f.value) }]}>
              {f.tone} · {f.value}%
            </Text>
          </View>
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                { width: `${f.value}%`, backgroundColor: toneColor(f.value) },
              ]}
            />
          </View>
        </View>
      ))}
    </View>

    {/* past pattern */}
    <LinearGradient
      colors={['#FFF5F8', '#FFE4EE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.pastCard}
    >
      <View style={styles.pastHead}>
        <Text style={styles.pastSparkle}>✨</Text>
        <Text style={styles.pastTitle}>과거 패턴</Text>
      </View>
      <Text style={styles.pastBody}>
        지난 4번 중 <Text style={styles.pastBold}>3번</Text>이 의견 차이로 만남이 늦어졌어요.
        미리 한 곳을 정하고 만나면 만족도가{' '}
        <Text style={styles.pastBoost}>+28%</Text> 올라가요.
      </Text>
    </LinearGradient>

    {/* CTAs */}
    <View style={styles.ctaRow}>
      <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.85}>
        <Text style={styles.ctaSecondaryText}>다시 시뮬</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.ctaPrimary}
        activeOpacity={0.85}
        onPress={() => navigation?.navigate('WhatIfCoachScreen')}
      >
        <LinearGradient
          colors={[colors.pink, colors.heartRed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaPrimaryGradient}
        >
          <Text style={styles.ctaPrimaryText}>💭 대화 코칭 받기</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  </WhatIfShell>
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE4EE',
  },
  cardLead: { fontSize: 11, color: '#888', fontWeight: '700' },
  scenario: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
    lineHeight: 22,
  },

  gaugeWrap: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeLabel: {
    marginTop: 6,
    alignItems: 'center',
  },
  gaugePct: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.heartRed,
    letterSpacing: -1,
    lineHeight: 34,
  },
  gaugeSub: { fontSize: 11, color: '#888', fontWeight: '600', marginTop: 2 },
  scaleRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  scaleLabel: { fontSize: 9, color: '#888' },

  cardTitle: { fontSize: 13, fontWeight: '800', color: colors.ink, marginBottom: 6 },
  factorHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorLabel: { fontSize: 12, fontWeight: '700', color: colors.ink },
  factorValue: { fontSize: 12, fontWeight: '700' },
  barBg: {
    marginTop: 4,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },

  pastCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFD0E0',
  },
  pastHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pastSparkle: { fontSize: 12 },
  pastTitle: { fontSize: 11, fontWeight: '700', color: colors.heartRed },
  pastBody: {
    marginTop: 6,
    fontSize: 12,
    color: colors.ink,
    lineHeight: 20,
  },
  pastBold: { fontWeight: '800', color: colors.ink },
  pastBoost: { fontWeight: '800', color: '#1F8A5B' },

  ctaRow: { marginTop: 14, flexDirection: 'row', gap: 8 },
  ctaSecondary: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSecondaryText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  ctaPrimary: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaPrimaryGradient: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimaryText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
});

export default WhatIfConflictScreen;
