import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import colors from '../../constants/colors';
import SettingsShell from './SettingsShell';

const LOSSES = [
  { icon: '💬', label: '채팅 기록', sub: '12,847건의 대화' },
  { icon: '📷', label: '공유 앨범', sub: '283장의 추억 사진' },
  { icon: '📅', label: '공유 캘린더', sub: '42개의 일정·기념일' },
  { icon: '💌', label: '타임캡슐', sub: '미오픈 캡슐 3개' },
  { icon: '🐣', label: '캐릭터 "해피"', sub: 'Lv.13 → 초기화' },
];

const UnlinkScreen = ({ navigation }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <SettingsShell navigation={navigation} title="연인 연결 해제">
      {/* hero */}
      <LinearGradient
        colors={[colors.ink, '#3B3F8F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroAurora} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="unlinkGlow" cx="50%" cy="30%" r="50%">
                <Stop offset="0%" stopColor={colors.heartRed} stopOpacity="0.4" />
                <Stop offset="60%" stopColor={colors.heartRed} stopOpacity="0.1" />
                <Stop offset="100%" stopColor={colors.heartRed} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="100" cy="60" r="100" fill="url(#unlinkGlow)" />
          </Svg>
        </View>
        <Text style={styles.heroEmoji}>💔</Text>
        <Text style={styles.heroTitle}>연인과의 연결을 해제할까요?</Text>
        <Text style={styles.heroSub}>
          함께한 따뜻한 시간이 끝나요.{'\n'}한 번 더 생각해볼까요? 🥺
        </Text>
      </LinearGradient>

      {/* losses */}
      <Text style={styles.sectionLabel}>이런 점들이 사라져요</Text>
      <View style={styles.lossCard}>
        {LOSSES.map((l, i, a) => (
          <View
            key={l.label}
            style={[styles.lossRow, i < a.length - 1 && styles.lossDivider]}
          >
            <Text style={styles.lossIcon}>{l.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.lossLabel}>{l.label}</Text>
              <Text style={styles.lossSub}>{l.sub}</Text>
            </View>
            <Text style={styles.lossTag}>삭제됨</Text>
          </View>
        ))}
      </View>

      {/* alternative */}
      <View style={styles.altBox}>
        <Text style={styles.altText}>
          💡 <Text style={styles.altBold}>대안</Text> · 데이터를 보관하고 싶다면{' '}
          <Text style={styles.altAccent}>추억 다운로드</Text> 후 해제하세요.
        </Text>
      </View>

      {/* agree */}
      <TouchableOpacity
        style={styles.agreeRow}
        activeOpacity={0.7}
        onPress={() => setAgreed((v) => !v)}
      >
        <View
          style={[
            styles.checkbox,
            agreed && { backgroundColor: colors.heartRed },
          ]}
        >
          {agreed && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <Text style={styles.agreeText}>위 내용을 모두 이해했어요</Text>
      </TouchableOpacity>

      {/* CTAs */}
      <View style={styles.ctaRow}>
        <TouchableOpacity
          style={styles.keepBtn}
          activeOpacity={0.85}
          onPress={() => navigation?.goBack()}
        >
          <LinearGradient
            colors={[colors.pink, colors.heartRed]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.keepGradient}
          >
            <Text style={styles.keepText}>💕 그대로 둘게요</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.unlinkBtn, !agreed && { opacity: 0.45 }]}
          activeOpacity={0.85}
          disabled={!agreed}
        >
          <Text style={styles.unlinkText}>연결 해제</Text>
        </TouchableOpacity>
      </View>
    </SettingsShell>
  );
};

const styles = StyleSheet.create({
  hero: {
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroAurora: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  heroSub: {
    marginTop: 6,
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 17,
  },

  sectionLabel: {
    marginTop: 14,
    paddingHorizontal: 4,
    fontSize: 11,
    fontWeight: '800',
    color: colors.heartRed,
    letterSpacing: 0.4,
  },
  lossCard: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFD0E0',
    overflow: 'hidden',
  },
  lossRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  lossDivider: { borderBottomWidth: 1, borderBottomColor: '#FFE4EE' },
  lossIcon: { fontSize: 18 },
  lossLabel: { fontSize: 12, fontWeight: '700', color: colors.ink },
  lossSub: { fontSize: 10, color: '#888', marginTop: 2 },
  lossTag: { fontSize: 11, color: colors.heartRed, fontWeight: '700' },

  altBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF5F8',
    borderWidth: 1,
    borderColor: '#FFD0E0',
  },
  altText: { fontSize: 11, color: colors.ink, lineHeight: 17 },
  altBold: { fontWeight: '800', color: colors.ink },
  altAccent: { color: colors.heartRed, fontWeight: '800' },

  agreeRow: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.heartRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  agreeText: { fontSize: 12, color: colors.ink, fontWeight: '600' },

  ctaRow: { marginTop: 14, flexDirection: 'row', gap: 8 },
  keepBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.heartRed,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 6,
  },
  keepGradient: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  unlinkBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFD0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlinkText: { color: colors.heartRed, fontSize: 13, fontWeight: '800' },
});

export default UnlinkScreen;
