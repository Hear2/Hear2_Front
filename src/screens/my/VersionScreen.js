import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import SettingsShell from './SettingsShell';
import Heart from '../../components/common/Heart';

const META = [
  { label: '버전', value: '1.0.0 (build 1024)' },
  { label: '배포일', value: '2026.05.01' },
  { label: '업데이트 확인', value: '최신', color: '#1F8A5B' },
];

const CHANGELOG = [
  '정식 출시 ✨',
  'AI 판사 정확도 개선',
  '주간/월간 리포트 추가',
  '타임캡슐 콘페티 효과',
];

const VersionScreen = ({ navigation }) => {
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
    <SettingsShell navigation={navigation} title="버전 정보">
      {/* hero */}
      <View style={styles.hero}>
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: breathe }] }]}>
          <LinearGradient
            colors={[colors.pink, colors.heartRed]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Heart size={44} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.appName}>Hear2</Text>
        <Text style={styles.appSub}>커플을 위한 따뜻한 AI 메신저</Text>
        <View style={styles.versionPill}>
          <Text style={styles.versionPillText}>최신 버전 · 1.0.0</Text>
        </View>
      </View>

      {/* meta */}
      <View style={styles.card}>
        {META.map((r, i, a) => (
          <View
            key={r.label}
            style={[styles.metaRow, i < a.length - 1 && styles.divider]}
          >
            <Text style={styles.metaLabel}>{r.label}</Text>
            <Text style={[styles.metaValue, r.color && { color: r.color }]}>
              {r.value}
            </Text>
          </View>
        ))}
      </View>

      {/* changelog */}
      <View style={styles.changeCard}>
        <Text style={styles.changeTitle}>📝 변경사항 (1.0.0)</Text>
        {CHANGELOG.map((line) => (
          <View key={line} style={styles.changeRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.changeText}>{line}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.copyright}>© 2026 Hear2. All rights reserved.</Text>
    </SettingsShell>
  );
};

const styles = StyleSheet.create({
  hero: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  logoWrap: {},
  logo: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.heartRed,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 8,
  },
  appName: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  appSub: { marginTop: 4, fontSize: 11, color: '#888' },
  versionPill: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFE4EE',
  },
  versionPillText: {
    color: colors.heartRed,
    fontSize: 11,
    fontWeight: '800',
  },

  card: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
    overflow: 'hidden',
  },
  metaRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: '#F4EEF1' },
  metaLabel: { flex: 1, fontSize: 12, color: '#888' },
  metaValue: { fontSize: 12, fontWeight: '700', color: colors.ink },

  changeCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
  },
  changeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 10,
  },
  changeRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  bullet: { color: '#555', fontSize: 11 },
  changeText: { flex: 1, fontSize: 11, color: '#555', lineHeight: 19 },

  copyright: {
    marginTop: 18,
    fontSize: 10,
    color: '#BBB',
    textAlign: 'center',
  },
});

export default VersionScreen;
