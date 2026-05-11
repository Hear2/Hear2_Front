import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import WhatIfShell from './WhatIfShell';

const PREFERENCES = ['#향기 좋아함', '#다이어리', '#폴라로이드', '#체험형', '#로맨틱'];

const GIFTS = [
  {
    rank: 1, title: '핸드메이드 향수 클래스', cat: '체험', price: '15만원',
    match: 94, why: '최근 "향" 키워드 12회', color: '#FF6B9D', icon: '🌷',
  },
  {
    rank: 2, title: '디올 립 글로우', cat: '뷰티', price: '5만원',
    match: 88, why: '인스타 저장 3회', color: '#FFB05B', icon: '💄',
  },
  {
    rank: 3, title: '가죽 다이어리', cat: '문구', price: '8만원',
    match: 82, why: '필기 좋아함', color: '#A78BFA', icon: '📓',
  },
  {
    rank: 4, title: '폴라로이드 카메라', cat: '취미', price: '12만원',
    match: 78, why: '사진 기록 24장/주', color: '#7ED7A0', icon: '📷',
  },
  {
    rank: 5, title: '서울숲 피크닉 박스', cat: '데이트', price: '6만원',
    match: 74, why: '다음 일정 매칭', color: colors.blue, icon: '🧺',
  },
];

const withAlpha = (hex, alpha) => {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const WhatIfGiftScreen = ({ navigation }) => (
  <WhatIfShell
    navigation={navigation}
    tag="선물 추천"
    tagIcon="🎁"
    tagTint={colors.blueTint}
    tagColor={colors.blue}
    title="최적의 선물 찾기"
    bgFrom="#FAFCFF"
    bgTo="#F5F8FF"
  >
    {/* context */}
    <View style={[styles.card, { borderColor: colors.blueTint }]}>
      <View style={styles.ctxRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>예</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.ctxName}>예진을 위한 선물</Text>
          <Text style={styles.ctxSub}>1주년 기념일 · D-12</Text>
        </View>
        <View style={styles.ctxBadge}>
          <Text style={styles.ctxBadgeText}>5/16</Text>
        </View>
      </View>
      <View style={styles.chipsWrap}>
        {PREFERENCES.map((t) => (
          <View key={t} style={styles.prefChip}>
            <Text style={styles.prefChipText}>{t}</Text>
          </View>
        ))}
      </View>
    </View>

    {/* budget */}
    <View style={[styles.card, { marginTop: 12 }]}>
      <View style={styles.budgetHead}>
        <Text style={styles.budgetLabel}>예산 범위</Text>
        <Text style={styles.budgetRange}>5만원 — 15만원</Text>
      </View>
      <View style={styles.sliderTrack}>
        <LinearGradient
          colors={[colors.blue, '#A78BFA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sliderActive}
        />
        <View style={[styles.sliderThumb, { left: '20%', borderColor: colors.blue }]} />
        <View style={[styles.sliderThumb, { left: '80%', borderColor: '#A78BFA' }]} />
      </View>
    </View>

    {/* ranked list */}
    <Text style={styles.sectionTitle}>✨ AI 매칭 TOP 5</Text>
    <View style={{ gap: 8 }}>
      {GIFTS.map((g) => {
        const isBest = g.rank === 1;
        return (
          <View
            key={g.rank}
            style={[
              styles.giftCard,
              isBest && { borderWidth: 2, borderColor: colors.pink },
            ]}
          >
            {isBest && (
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>BEST MATCH</Text>
              </View>
            )}
            <View
              style={[
                styles.giftIcon,
                { backgroundColor: withAlpha(g.color, 0.13) },
              ]}
            >
              <Text style={{ fontSize: 20 }}>{g.icon}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.giftTitleRow}>
                <Text style={[styles.giftRank, { color: g.color }]}>#{g.rank}</Text>
                <Text style={styles.giftTitle} numberOfLines={1}>
                  {g.title}
                </Text>
              </View>
              <Text style={styles.giftMeta}>
                {g.cat} · {g.price} · {g.why}
              </Text>
            </View>
            <View style={styles.matchWrap}>
              <Text style={[styles.matchValue, { color: g.color }]}>{g.match}</Text>
              <Text style={styles.matchLabel}>매치</Text>
            </View>
          </View>
        );
      })}
    </View>

    <TouchableOpacity style={styles.cta} activeOpacity={0.85}>
      <LinearGradient
        colors={[colors.blue, '#A78BFA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ctaGradient}
      >
        <Text style={styles.ctaText}>🎁 결제 페이지로 이동</Text>
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
  ctxRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.pinkDeep, fontWeight: '700', fontSize: 14 },
  ctxName: { fontSize: 13, fontWeight: '800', color: colors.ink },
  ctxSub: { fontSize: 11, color: '#888', marginTop: 2 },
  ctxBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#FFE4EE',
  },
  ctxBadgeText: { color: colors.pinkDeep, fontSize: 11, fontWeight: '700' },

  chipsWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  prefChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F5F8FF',
  },
  prefChipText: { color: colors.blue, fontSize: 10, fontWeight: '700' },

  budgetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetLabel: { fontSize: 12, fontWeight: '700', color: colors.ink },
  budgetRange: { fontSize: 12, fontWeight: '700', color: colors.blue },
  sliderTrack: {
    marginTop: 14,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0F4FF',
    position: 'relative',
  },
  sliderActive: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    marginLeft: -8,
  },

  sectionTitle: {
    marginTop: 14,
    marginBottom: 18,
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },

  giftCard: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  bestBadge: {
    position: 'absolute',
    top: -8,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.heartRed,
  },
  bestBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  giftIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  giftRank: { fontSize: 10, fontWeight: '800' },
  giftTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.ink },
  giftMeta: { fontSize: 10, color: '#888', marginTop: 2 },
  matchWrap: { alignItems: 'center', minWidth: 32 },
  matchValue: { fontSize: 14, fontWeight: '800', letterSpacing: -0.4 },
  matchLabel: { fontSize: 9, color: '#888', fontWeight: '600' },

  cta: {
    marginTop: 14,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
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

export default WhatIfGiftScreen;
