import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse, Circle, Path } from 'react-native-svg';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';

const xpStats = [
  { label: '대화', value: '+24' },
  { label: '기록', value: '+12' },
  { label: '감정', value: '😊' },
];

const growthLog = [
  { icon: '💬', text: '"사랑해"라고 말한 횟수가 32번이에요', xp: '+25 XP' },
  { icon: '🌸', text: '함께 봄나들이 사진을 추가했어요', xp: '+15 XP' },
  { icon: '☕', text: '예진님이 지호님에게 커피를 사줬어요', xp: '+10 XP' },
];

const Mascot = () => (
  <Svg width={170} height={170} viewBox="0 0 200 200">
    <Ellipse cx={100} cy={120} rx={70} ry={60} fill="#FFE08A" />
    <Circle cx={78} cy={105} r={6} fill="#1E2152" />
    <Circle cx={122} cy={105} r={6} fill="#1E2152" />
    <Circle cx={80} cy={103} r={2} fill="#fff" />
    <Circle cx={124} cy={103} r={2} fill="#fff" />
    <Path
      d="M86 130 Q 100 142 114 130"
      stroke="#1E2152"
      strokeWidth={3}
      fill="none"
      strokeLinecap="round"
    />
    <Ellipse cx={62} cy={120} rx={10} ry={6} fill="#FFB3CE" opacity={0.7} />
    <Ellipse cx={138} cy={120} rx={10} ry={6} fill="#FFB3CE" opacity={0.7} />
    <Path d="M96 80 L100 70 L104 80 Z" fill="#FFA94D" />
    <Path
      d="M75 60 L86 75 L100 55 L114 75 L125 60 L120 78 L80 78 Z"
      fill="#FFD93D"
    />
    <Circle cx={100} cy={55} r={3} fill="#FF6B9D" />
  </Svg>
);

const CharacterScreen = ({ navigation }) => {
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.05,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(xpAnim, {
      toValue: 1,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const xpWidth = xpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '74%'],
  });

  return (
    <View style={styles.container}>
      <LovelyBackground intensity={0.9} />
      <Header title="우리의 캐릭터" showBack onBack={() => navigation?.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Mascot */}
        <View style={styles.mascotWrap}>
          <Animated.View style={[styles.mascotBubble, { transform: [{ scale: breatheAnim }] }]}>
            <LinearGradient
              colors={['#FFE4EE', '#FFB590']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mascotGradient}
            >
              <Mascot />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Level pill */}
        <View style={styles.levelPillWrap}>
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>Lv.12</Text>
            <View style={styles.levelDivider} />
            <Text style={styles.levelName}>해피</Text>
          </View>
          <Text style={styles.moodLine}>감정: 😊 기쁨 · 활발한 성격</Text>
        </View>

        {/* XP card */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpHeaderLabel}>다음 레벨까지</Text>
            <Text style={styles.xpHeaderValue}>740 / 1000 XP</Text>
          </View>
          <View style={styles.xpBarBg}>
            <Animated.View style={[styles.xpBarFillWrap, { width: xpWidth }]}>
              <LinearGradient
                colors={[colors.pink, colors.peach]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.xpBarFill}
              />
            </Animated.View>
          </View>
          <View style={styles.xpStatsRow}>
            {xpStats.map((s, i) => (
              <View key={i} style={styles.xpStatItem}>
                <Text style={styles.xpStatLabel}>{s.label}</Text>
                <Text style={styles.xpStatValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Growth log */}
        <Text style={styles.sectionTitle}>오늘의 성장 기록</Text>
        {growthLog.map((g, i) => (
          <View key={i} style={styles.logRow}>
            <View style={styles.logIconBox}>
              <Text style={styles.logIcon}>{g.icon}</Text>
            </View>
            <Text style={styles.logText}>{g.text}</Text>
            <Text style={styles.logXp}>{g.xp}</Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F8',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
  },
  mascotWrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  mascotBubble: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotGradient: {
    width: 200,
    height: 200,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.heartRed,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 8,
  },
  levelPillWrap: {
    alignItems: 'center',
    marginTop: 6,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.pink,
  },
  levelDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.line,
  },
  levelName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  moodLine: {
    marginTop: 8,
    fontSize: 12,
    color: '#7A4A5E',
  },
  xpCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE4EE',
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpHeaderLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink3,
  },
  xpHeaderValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.pink,
  },
  xpBarBg: {
    marginTop: 8,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.pinkTint,
    overflow: 'hidden',
  },
  xpBarFillWrap: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  xpBarFill: {
    flex: 1,
  },
  xpStatsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  xpStatItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.pinkTint,
    alignItems: 'center',
  },
  xpStatLabel: {
    fontSize: 11,
    color: '#999',
  },
  xpStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.heartRed,
    marginTop: 2,
  },
  sectionTitle: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink3,
  },
  logRow: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFE4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logIcon: {
    fontSize: 16,
  },
  logText: {
    flex: 1,
    fontSize: 12,
    color: colors.ink,
  },
  logXp: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.pink,
  },
});

export default CharacterScreen;
