import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import Heart from '../../components/common/Heart';
import Chip from '../../components/common/Chip';
import DdayCard from './DdayCard';
import { useMemories } from '../../contexts/MemoryContext';

const quickActions = [
  { emoji: '📷', label: '추억 앨범',  bg: colors.pinkTint,     route: '앨범' },
  { emoji: '🤖', label: 'AI 리포트',  bg: colors.blueTint,     route: 'ReportView' },
  { emoji: '💌', label: '타임캡슐',   bg: colors.yellowTint,   route: 'TimeCapsuleScreen' },
  { emoji: '❓', label: '데일리 Q&A', bg: colors.greenTint,    route: 'DailyQAScreen' },
  { emoji: '📍', label: '위치 공유',  bg: colors.lavenderTint, route: 'LocationShare' },
  { emoji: '🤔', label: '만약에 AI',  bg: colors.pinkTint,     route: 'WhatIfScreen' },
];

const HomeScreen = ({ navigation }) => {
  const emojiScale = useRef(new Animated.Value(1)).current;

  // 앨범과 동일한 공유 메모리 소스를 사용해 최근 추억을 표시한다.
  const { memories, refresh } = useMemories();

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  // 가장 최근 4개만 홈 피드에 노출.
  const recentMemories = useMemo(() => memories.slice(0, 4), [memories]);

  const [memLeft, memRight] = useMemo(() => {
    const l = [];
    const r = [];
    let lH = 0;
    let rH = 0;
    recentMemories.forEach((m) => {
      const h = m.h ?? 160;
      if (lH <= rH) {
        l.push(m);
        lH += h;
      } else {
        r.push(m);
        rH += h;
      }
    });
    return [l, r];
  }, [recentMemories]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(emojiScale, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(emojiScale, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Heart size={24} color={colors.pink} pulse />
          <Text style={styles.logoText}>Hear2</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('SearchScreen')}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('NotificationsScreen')}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>🔔</Text>
            <View style={styles.bellBadge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* D-Day Hero Card */}
        <DdayCard
          daysCount={247}
          startDate="2025.08.03"
          myName="예진"
          partnerName="지호"
          onCharacterPress={() => navigation.navigate('CharacterScreen')}
        />

        {/* 오늘의 우리 감정 Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ReportView')}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>오늘의 우리 감정</Text>
            <View style={styles.cardHeaderRight}>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI 분석</Text>
              </View>
              <Text style={styles.cardChevron}>›</Text>
            </View>
          </View>

          <View style={styles.emotionRow}>
            <Animated.Text style={[styles.bigEmoji, { transform: [{ scale: emojiScale }] }]}>
              😊
            </Animated.Text>
            <View style={styles.emotionChips}>
              <Chip label="긍정 68%" variant="green" />
              <Chip label="부정 22%" variant="pink" />
              <Chip label="중립 10%" variant="gray" />
            </View>
          </View>

          {/* Stacked emotion bar */}
          <View style={styles.emotionBar}>
            <View style={[styles.emotionSeg, { flex: 68, backgroundColor: colors.green }]} />
            <View style={[styles.emotionSeg, { flex: 22, backgroundColor: colors.pink }]} />
            <View style={[styles.emotionSeg, { flex: 10, backgroundColor: colors.line }]} />
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { icon: '💬', value: '32', label: '대화' },
              { icon: '📸', value: '4', label: '사진' },
              { icon: '💞', value: '12', label: '감정 기록' },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.aiSummary}>
            오늘 대화에서 긍정적인 감정이 주를 이뤘어요. 서로에 대한 배려가 느껴지는 하루네요! 💕
          </Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        {[quickActions.slice(0, 3), quickActions.slice(3, 6)].map((row, ri) => (
          <View
            key={ri}
            style={[styles.quickActionsRow, ri > 0 && { marginTop: 12 }]}
          >
            {row.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.quickAction, { backgroundColor: action.bg }]}
                onPress={() => action.route && navigation.navigate(action.route)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* 1년 전 오늘 Banner */}
        <LinearGradient
          colors={[colors.pink, colors.pinkSoft]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}
        >
          <Text style={styles.bannerEmoji}>🌸</Text>
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>1년 전 오늘</Text>
            <Text style={styles.bannerSubtitle}>서울숲에서 봄나들이</Text>
          </View>
          <Text style={styles.bannerArrow}>›</Text>
        </LinearGradient>

        {/* 최근 추억 Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 추억</Text>
          <TouchableOpacity onPress={() => navigation.navigate('앨범')} hitSlop={8}>
            <Text style={styles.seeAll}>더보기</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.feedRow}>
          {[memLeft, memRight].map((col, ci) => (
            <View key={ci} style={styles.feedCol}>
              {col.map((m, i) => (
                <TouchableOpacity
                  key={`${ci}-${i}`}
                  activeOpacity={0.85}
                  style={[styles.feedCard, { height: m.h ?? 160, backgroundColor: m.tint }]}
                  onPress={() => navigation.navigate('앨범')}
                >
                  {m.photoUri ? (
                    <Image
                      source={{ uri: m.photoUri }}
                      style={styles.feedImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.feedEmojiWrap}>
                      <Text style={styles.feedEmoji}>{m.emoji}</Text>
                    </View>
                  )}
                  <View style={styles.feedTagPill}>
                    <Text style={styles.feedTagText}>{m.tag}</Text>
                  </View>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.45)']}
                    style={styles.feedFade}
                  >
                    <Text style={styles.feedMeta}>{m.place} · {m.date}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: colors.bgApp,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.pink,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.heartRed,
    borderWidth: 1.5,
    borderColor: colors.bgSoft,
  },
  iconText: {
    fontSize: 18,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.bgApp,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.pinkTint,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.pink,
  },
  cardChevron: {
    fontSize: 18,
    color: colors.inkMute,
    fontWeight: '300',
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bigEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  emotionChips: {
    flexDirection: 'column',
    gap: 6,
    flex: 1,
  },
  emotionBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  emotionSeg: {
    height: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: colors.bgSoft,
    borderRadius: 12,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
  },
  statLabel: {
    fontSize: 10,
    color: colors.inkMute,
    marginTop: 1,
  },
  aiSummary: {
    fontSize: 13,
    color: colors.ink3,
    lineHeight: 20,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  quickActionEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink2,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
  },
  bannerEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 2,
  },
  bannerArrow: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '300',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  seeAll: {
    fontSize: 13,
    color: colors.pink,
    fontWeight: '500',
  },
  feedRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 10,
  },
  feedCol: {
    flex: 1,
    gap: 10,
  },
  feedCard: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  feedTagPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    zIndex: 2,
  },
  feedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.pink,
  },
  feedImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  feedEmojiWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedEmoji: {
    fontSize: 48,
    opacity: 0.75,
  },
  feedFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 18,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  feedMeta: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default HomeScreen;
