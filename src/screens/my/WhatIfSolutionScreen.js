import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import colors from '../../constants/colors';
import WhatIfShell from './WhatIfShell';

const STEPS = [
  { title: '서로 진정하기', desc: '20분 떨어져서 호흡 정돈. 감정이 가라앉을 때까지.', dur: '20분', icon: '🌬', color: '#7ED7A0' },
  { title: '"나" 메시지로 시작', desc: '"네가" 대신 "나는 …해서 …느꼈어"로 감정 공유.', dur: '5분', icon: '💬', color: colors.blue },
  { title: '상대 입장 듣기', desc: '말 끊지 않고 끝까지 듣기. 마지막에 한 줄로 요약.', dur: '10분', icon: '👂', color: '#A78BFA' },
  { title: '공통 합의안 만들기', desc: '둘 다 양보 가능한 한 가지를 약속으로.', dur: '10분', icon: '🤝', color: colors.pink },
  { title: '회복 의식', desc: '포옹·산책·좋아하는 음료. 화해의 작은 신호.', dur: '자유', icon: '💗', color: colors.heartRed },
];

const withAlpha = (hex, alpha) => {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const WhatIfSolutionScreen = ({ navigation }) => (
  <WhatIfShell
    navigation={navigation}
    tag="해결 방법"
    tagIcon="✨"
    tagTint="#FDF0F5"
    tagColor={colors.heartRed}
    title="우리에게 맞는 화해 플레이북"
  >
    {/* hero */}
    <LinearGradient
      colors={[colors.pink, colors.heartRed]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.heroAurora} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 200 200">
          <Defs>
            <RadialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="100" cy="100" r="100" fill="url(#heroGlow)" />
        </Svg>
      </View>
      <Text style={styles.heroTag}>HEAR2 화해 가이드</Text>
      <Text style={styles.heroTitle}>5단계로 풀어보는{'\n'}약속 갈등 해결법</Text>
      <Text style={styles.heroSub}>전체 약 45분 · 평균 만족도 +28%</Text>
    </LinearGradient>

    {/* steps timeline */}
    <View style={styles.timeline}>
      <View style={styles.timelineLine} />
      {STEPS.map((s, i) => (
        <View
          key={i}
          style={[
            styles.stepRow,
            { marginBottom: i < STEPS.length - 1 ? 12 : 0 },
          ]}
        >
          <View style={[styles.stepIcon, { borderColor: s.color }]}>
            <Text style={{ fontSize: 20 }}>{s.icon}</Text>
          </View>
          <View style={styles.stepCard}>
            <View style={styles.stepHead}>
              <View style={styles.stepTitleWrap}>
                <Text style={[styles.stepIndex, { color: s.color }]}>
                  STEP {i + 1}
                </Text>
                <Text style={styles.stepTitle}>{s.title}</Text>
              </View>
              <View
                style={[
                  styles.durChip,
                  { backgroundColor: withAlpha(s.color, 0.14) },
                ]}
              >
                <Text style={[styles.durText, { color: s.color }]}>{s.dur}</Text>
              </View>
            </View>
            <Text style={styles.stepDesc}>{s.desc}</Text>
          </View>
        </View>
      ))}
    </View>

    {/* expected outcome */}
    <LinearGradient
      colors={[colors.greenTint, '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.outcome}
    >
      <View style={styles.outcomeHead}>
        <Text style={styles.outcomeSparkle}>🌱</Text>
        <Text style={styles.outcomeTitle}>기대 효과</Text>
      </View>
      <Text style={styles.outcomeBody}>
        이 플레이북을 따른 커플의{' '}
        <Text style={styles.outcomeAccent}>89%</Text>가 24시간 내 화해했어요.
        다음 갈등 발생 빈도도{' '}
        <Text style={styles.outcomeAccent}>−42%</Text>.
      </Text>
    </LinearGradient>

    {/* CTAs */}
    <View style={styles.ctaRow}>
      <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.85}>
        <Text style={styles.ctaSecondaryText}>저장</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.ctaPrimary} activeOpacity={0.85}>
        <LinearGradient
          colors={[colors.pink, colors.heartRed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaPrimaryGradient}
        >
          <Text style={styles.ctaPrimaryText}>💞 함께 시작하기</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  </WhatIfShell>
);

const styles = StyleSheet.create({
  hero: {
    padding: 18,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.heartRed,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  heroAurora: {
    position: 'absolute',
    right: -80,
    top: -80,
    width: 240,
    height: 240,
  },
  heroTag: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heroTitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 26,
  },
  heroSub: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.95)',
    fontSize: 11,
  },

  timeline: {
    marginTop: 16,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 23,
    top: 24,
    bottom: 24,
    width: 2,
    backgroundColor: withAlpha(colors.heartRed, 0.25),
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stepCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
  },
  stepHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  stepIndex: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  stepTitle: { fontSize: 13, fontWeight: '800', color: colors.ink, flexShrink: 1 },
  durChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durText: { fontSize: 10, fontWeight: '700' },
  stepDesc: {
    marginTop: 6,
    fontSize: 11,
    color: '#666',
    lineHeight: 17,
  },

  outcome: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#C9EAD3',
  },
  outcomeHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  outcomeSparkle: { fontSize: 12 },
  outcomeTitle: { fontSize: 11, fontWeight: '800', color: '#1F8A5B' },
  outcomeBody: {
    marginTop: 6,
    fontSize: 12,
    color: colors.ink,
    lineHeight: 19,
  },
  outcomeAccent: { fontWeight: '800', color: '#1F8A5B' },

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
  ctaPrimaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});

export default WhatIfSolutionScreen;
