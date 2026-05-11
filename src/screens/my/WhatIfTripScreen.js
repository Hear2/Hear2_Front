import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import WhatIfShell from './WhatIfShell';

const TRIPS = [
  {
    dest: '제주', flag: '🏝', days: '2박 3일', match: 92, budget: '80만원',
    months: '5–6월', vibe: ['바다', '카페', '드라이브'], color: colors.blue,
    plan: '함덕 → 카페 도렐 → 우도 → 협재 노을',
  },
  {
    dest: '교토', flag: '🏯', days: '3박 4일', match: 86, budget: '140만원',
    months: '4월', vibe: ['감성', '벚꽃', '료칸'], color: colors.pinkDeep,
    plan: '기온 → 청수사 → 아라시야마 → 료칸',
  },
  {
    dest: '강릉', flag: '☕️', days: '1박 2일', match: 78, budget: '40만원',
    months: '연중', vibe: ['로컬', '서핑', '커피'], color: '#7ED7A0',
    plan: '안목해변 → 테라로사 → 정동진',
  },
];

const withAlpha = (hex, alpha) => {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const WhatIfTripScreen = ({ navigation }) => (
  <WhatIfShell
    navigation={navigation}
    tag="여행 시뮬"
    tagIcon="✈️"
    tagTint={colors.greenTint}
    tagColor="#1F8A5B"
    title="함께 가면 어떨까?"
    bgFrom="#FAFFFB"
    bgTo="#F5FBF7"
  >
    {/* shared free window */}
    <View style={[styles.card, { borderColor: colors.greenTint }]}>
      <Text style={styles.lead}>두 사람 캘린더에서 찾은 빈 시간</Text>
      <LinearGradient
        colors={[colors.greenTint, '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.windowBox}
      >
        <Text style={styles.calIcon}>📅</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.windowDate}>5월 24일 (금) — 5월 26일 (일)</Text>
          <Text style={styles.windowSub}>2박 3일 · 두 분 모두 일정 비어 있어요</Text>
        </View>
      </LinearGradient>
      <View style={styles.dateChipsRow}>
        {['5/24', '5/25', '5/26'].map((d) => (
          <View key={d} style={styles.dateChip}>
            <Text style={styles.dateChipText}>{d}</Text>
          </View>
        ))}
      </View>
    </View>

    {/* destinations */}
    <Text style={styles.sectionTitle}>추천 목적지 3</Text>
    <View style={{ gap: 10 }}>
      {TRIPS.map((t, i) => (
        <View key={i} style={styles.tripCard}>
          <View style={styles.tripHead}>
            <View
              style={[
                styles.tripFlag,
                { backgroundColor: withAlpha(t.color, 0.12) },
              ]}
            >
              <Text style={{ fontSize: 28 }}>{t.flag}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.tripTitleRow}>
                <Text style={styles.tripDest}>{t.dest}</Text>
                <Text style={styles.tripDays}>· {t.days}</Text>
              </View>
              <Text style={styles.tripMeta}>
                예상 {t.budget} · 적기 {t.months}
              </Text>
              <View style={styles.vibeRow}>
                {t.vibe.map((v) => (
                  <View
                    key={v}
                    style={[
                      styles.vibeChip,
                      { backgroundColor: withAlpha(t.color, 0.11) },
                    ]}
                  >
                    <Text style={[styles.vibeText, { color: t.color }]}>
                      #{v}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.matchWrap}>
              <Text style={[styles.matchValue, { color: t.color }]}>
                {t.match}
              </Text>
              <Text style={styles.matchLabel}>매치</Text>
            </View>
          </View>

          <View style={styles.planBox}>
            <Text style={styles.planIcon}>🗺</Text>
            <Text style={styles.planText} numberOfLines={1}>
              {t.plan}
            </Text>
          </View>
        </View>
      ))}
    </View>

    <TouchableOpacity style={styles.cta} activeOpacity={0.85}>
      <LinearGradient
        colors={[colors.blue, '#1F8A5B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ctaGradient}
      >
        <Text style={styles.ctaText}>✈️ 캘린더에 일정 추가</Text>
      </LinearGradient>
    </TouchableOpacity>
  </WhatIfShell>
);

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
  },
  lead: { fontSize: 11, color: '#888', fontWeight: '700' },
  windowBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calIcon: { fontSize: 22 },
  windowDate: { fontSize: 14, fontWeight: '800', color: '#1F8A5B' },
  windowSub: { fontSize: 11, color: '#666', marginTop: 2 },
  dateChipsRow: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dateChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.greenTint,
  },
  dateChipText: { fontSize: 11, fontWeight: '700', color: '#1F8A5B' },

  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },

  tripCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
  },
  tripHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tripFlag: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  tripDest: { fontSize: 16, fontWeight: '800', color: colors.ink },
  tripDays: { fontSize: 10, color: '#888' },
  tripMeta: { fontSize: 11, color: '#888', marginTop: 2 },
  vibeRow: { marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  vibeChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  vibeText: { fontSize: 9, fontWeight: '700' },
  matchWrap: { alignItems: 'center', minWidth: 36 },
  matchValue: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  matchLabel: { fontSize: 9, color: '#888', fontWeight: '600' },

  planBox: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planIcon: { fontSize: 11 },
  planText: { flex: 1, fontSize: 10, color: '#555' },

  cta: {
    marginTop: 14,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#1F8A5B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaGradient: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default WhatIfTripScreen;
