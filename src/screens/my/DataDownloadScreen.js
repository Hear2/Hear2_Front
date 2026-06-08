import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import SettingsShell from './SettingsShell';

const ITEMS = [
  { key: 'chat', icon: '💬', label: '대화 기록', sub: '32,548 메시지' },
  { key: 'photo', icon: '📷', label: '사진·미디어', sub: '283장' },
  { key: 'calendar', icon: '📅', label: '일정·기념일', sub: '24개' },
  { key: 'memory', icon: '🌸', label: '추억·일기', sub: '127개' },
  { key: 'capsule', icon: '💌', label: '타임캡슐', sub: '봉인 3 · 오픈 1' },
  { key: 'settings', icon: '⚙️', label: '설정값·프로필', sub: '계정 메타데이터' },
];

const FORMATS = [
  { id: 'json', label: 'JSON', sub: '원본 구조 유지' },
  { id: 'csv', label: 'CSV', sub: '엑셀에서 열기 좋음' },
];

const Toggle = ({ on, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[
      styles.toggle,
      { backgroundColor: on ? colors.pink : '#E0E0E0' },
    ]}
  >
    <View style={[styles.toggleKnob, on ? { right: 2 } : { left: 2 }]} />
  </TouchableOpacity>
);

const DataDownloadScreen = ({ navigation }) => {
  const [selected, setSelected] = useState({
    chat: true,
    photo: true,
    calendar: true,
    memory: true,
    capsule: true,
    settings: false,
  });
  const [format, setFormat] = useState('json');

  const checkedCount = Object.values(selected).filter(Boolean).length;

  return (
    <SettingsShell navigation={navigation} title="데이터 다운로드">
      {/* hero */}
      <LinearGradient
        colors={[colors.pink, colors.heartRed]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroIcon}>
          <Text style={{ fontSize: 28 }}>📦</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>내 데이터, 한 번에 받기</Text>
          <Text style={styles.heroSub}>
            요청 후 24시간 내 가입 이메일로{'\n'}안전한 다운로드 링크를 보내요.
          </Text>
        </View>
      </LinearGradient>

      {/* items */}
      <Text style={styles.sectionLabel}>포함 항목 · {checkedCount}/{ITEMS.length}</Text>
      <View style={styles.card}>
        {ITEMS.map((it, i, a) => (
          <View
            key={it.key}
            style={[styles.row, i < a.length - 1 && styles.divider]}
          >
            <View style={styles.iconWrap}>
              <Text style={styles.iconText}>{it.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemLabel}>{it.label}</Text>
              <Text style={styles.itemSub}>{it.sub}</Text>
            </View>
            <Toggle
              on={selected[it.key]}
              onPress={() =>
                setSelected((prev) => ({ ...prev, [it.key]: !prev[it.key] }))
              }
            />
          </View>
        ))}
      </View>

      {/* format */}
      <Text style={styles.sectionLabel}>파일 형식</Text>
      <View style={styles.formatRow}>
        {FORMATS.map((f) => {
          const on = f.id === format;
          return (
            <TouchableOpacity
              key={f.id}
              activeOpacity={0.85}
              onPress={() => setFormat(f.id)}
              style={[
                styles.formatCard,
                on && {
                  borderColor: colors.heartRed,
                  backgroundColor: '#FFF5F8',
                },
              ]}
            >
              <Text
                style={[
                  styles.formatLabel,
                  on && { color: colors.heartRed },
                ]}
              >
                {f.label}
              </Text>
              <Text style={styles.formatSub}>{f.sub}</Text>
              {on && (
                <View style={styles.formatCheck}>
                  <Text style={styles.formatCheckText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* notice */}
      <View style={styles.notice}>
        <Text style={styles.noticeIcon}>🔒</Text>
        <Text style={styles.noticeText}>
          다운로드 링크는{' '}
          <Text style={styles.noticeAccent}>24시간</Text> 동안 1회만 열어볼 수 있어요.
          링크는 본인 외에 공유하지 마세요.
        </Text>
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.cta, checkedCount === 0 && { opacity: 0.5 }]}
        activeOpacity={0.85}
        disabled={checkedCount === 0}
      >
        <LinearGradient
          colors={[colors.pink, colors.heartRed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaGradient}
        >
          <Text style={styles.ctaText}>📥 다운로드 요청하기</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SettingsShell>
  );
};

const styles = StyleSheet.create({
  hero: {
    padding: 16,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  heroSub: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
    lineHeight: 17,
  },

  sectionLabel: {
    marginTop: 18,
    paddingHorizontal: 4,
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 0.5,
  },
  card: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: '#F4EEF1' },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.pinkTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 16 },
  itemLabel: { fontSize: 13, fontWeight: '700', color: colors.ink },
  itemSub: { fontSize: 10, color: '#888', marginTop: 2 },

  toggle: {
    width: 36,
    height: 20,
    borderRadius: 999,
    justifyContent: 'center',
  },
  toggleKnob: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },

  formatRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  formatCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
  },
  formatLabel: { fontSize: 14, fontWeight: '800', color: colors.ink },
  formatSub: { fontSize: 10, color: '#888', marginTop: 4 },
  formatCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.heartRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatCheckText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },

  notice: {
    marginTop: 18,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.yellowTint,
    borderWidth: 1,
    borderColor: '#F0DC8A',
    flexDirection: 'row',
    gap: 10,
  },
  noticeIcon: { fontSize: 14 },
  noticeText: {
    flex: 1,
    fontSize: 11,
    color: colors.ink,
    lineHeight: 18,
  },
  noticeAccent: { color: colors.heartRed, fontWeight: '800' },

  cta: {
    marginTop: 18,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: colors.heartRed,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaGradient: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default DataDownloadScreen;
