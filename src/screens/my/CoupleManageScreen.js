import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import colors from '../../constants/colors';
import SettingsShell from './SettingsShell';
import Heart from '../../components/common/Heart';
import { useCouple } from '../../contexts/CoupleContext';

const NICKNAMES = [
  {
    label: '예진이 부르는 지호',
    value: '자기야',
    color: colors.pinkDeep,
    bg: '#FFF5F8',
  },
  {
    label: '지호가 부르는 예진',
    value: '우리 예지니',
    color: colors.blue,
    bg: '#F5F8FF',
  },
];

const withAlpha = (hex, alpha) => {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const dotDate = (iso) => iso.replace(/-/g, '.');
const ddayLabel = (iso) => {
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((target - now) / (1000 * 60 * 60 * 24));
  if (diff > 0) return `D-${diff}`;
  if (diff < 0) return `D+${Math.abs(diff)}`;
  return 'D-DAY';
};

const sortByUpcoming = (list) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return [...list].sort((a, b) => {
    const da = new Date(a.date) - now;
    const db = new Date(b.date) - now;
    // upcoming (>= 0) first, then most-recent past
    if (da >= 0 && db < 0) return -1;
    if (da < 0 && db >= 0) return 1;
    if (da >= 0) return da - db;
    return db - da;
  });
};

const CoupleManageScreen = ({ navigation }) => {
  const { anniversaries } = useCouple();
  const sorted = useMemo(() => sortByUpcoming(anniversaries), [anniversaries]);
  return (
  <SettingsShell navigation={navigation} title="커플 관리">
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
            <RadialGradient id="cmGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="100" cy="100" r="100" fill="url(#cmGlow)" />
        </Svg>
      </View>

      <View style={styles.coupleRow}>
        <View style={[styles.avatar, { backgroundColor: '#FFE4EE' }]}>
          <Text style={[styles.avatarText, { color: colors.pinkDeep }]}>예</Text>
        </View>
        <View style={styles.heartWrap}>
          <Heart size={20} color="#FFFFFF" pulse />
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.blueTint, marginLeft: -8 }]}>
          <Text style={[styles.avatarText, { color: colors.blue }]}>지</Text>
        </View>
        <View style={styles.coupleInfo}>
          <Text style={styles.coupleName}>예진 ♥ 지호</Text>
          <Text style={styles.coupleSub}>2024.12.20 시작 · 485일째</Text>
        </View>
      </View>
    </LinearGradient>

    {/* nicknames */}
    <Text style={styles.sectionLabel}>우리만의 호칭</Text>
    <View style={styles.nickCard}>
      {NICKNAMES.map((n) => (
        <View
          key={n.label}
          style={[styles.nickCell, { backgroundColor: n.bg }]}
        >
          <Text style={styles.nickLabel}>{n.label}</Text>
          <Text style={[styles.nickValue, { color: n.color }]}>
            "{n.value}"
          </Text>
        </View>
      ))}
    </View>

    {/* anniversaries */}
    <View style={styles.annHeader}>
      <Text style={styles.sectionLabel}>기념일 · D-DAY</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation?.navigate('AnniversaryAddScreen')}
        style={styles.addBtn}
      >
        <Text style={styles.addAction}>+ 추가</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.card}>
      {sorted.map((a, i, arr) => (
        <View
          key={a.id}
          style={[styles.annRow, i < arr.length - 1 && styles.divider]}
        >
          <View
            style={[
              styles.annIcon,
              { backgroundColor: withAlpha(a.color, 0.13) },
            ]}
          >
            <Text style={{ fontSize: 16 }}>{a.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.annLabel}>
              {a.name}
              {a.auto ? <Text style={styles.autoTag}>  · 자동</Text> : null}
            </Text>
            <Text style={styles.annDate}>{dotDate(a.date)}</Text>
          </View>
          <Text style={[styles.annDDay, { color: a.color }]}>
            {ddayLabel(a.date)}
          </Text>
        </View>
      ))}
    </View>

    {/* unlink notice */}
    <View style={styles.notice}>
      <Text style={styles.noticeText}>
        💔 연인 연결 해제는{' '}
        <Text style={styles.noticeAccent}>설정 &gt; 계정</Text> 에서
      </Text>
    </View>
  </SettingsShell>
  );
};

const styles = StyleSheet.create({
  hero: {
    padding: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.heartRed,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
  heroAurora: {
    position: 'absolute',
    right: -60,
    top: -80,
    width: 200,
    height: 200,
  },
  coupleRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800' },
  heartWrap: { marginHorizontal: -8, zIndex: 2 },
  coupleInfo: { flex: 1, marginLeft: 12 },
  coupleName: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  coupleSub: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
    marginTop: 2,
  },

  sectionLabel: {
    marginTop: 18,
    paddingHorizontal: 4,
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  annHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addBtn: {
    marginTop: 18,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginRight: -8,
  },
  addAction: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.heartRed,
  },

  nickCard: {
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
    flexDirection: 'row',
    gap: 10,
  },
  nickCell: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
  },
  nickLabel: { fontSize: 9, color: '#888', fontWeight: '700' },
  nickValue: { marginTop: 4, fontSize: 14, fontWeight: '800' },

  card: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
    overflow: 'hidden',
  },
  annRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: '#F4EEF1' },
  annIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  annLabel: { fontSize: 13, fontWeight: '700', color: colors.ink },
  autoTag: { fontSize: 10, fontWeight: '600', color: '#AAA' },
  annDate: { fontSize: 10, color: '#888', marginTop: 2 },
  annDDay: { fontSize: 12, fontWeight: '800' },

  notice: {
    marginTop: 18,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FFD0E0',
    alignItems: 'center',
  },
  noticeText: { fontSize: 11, color: '#888' },
  noticeAccent: { color: colors.heartRed, fontWeight: '800' },
});

export default CoupleManageScreen;
