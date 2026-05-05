import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
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

const quickActions = [
  { emoji: '📷', label: '3초 기록', bg: colors.pinkTint, route: 'RecordScreen' },
  { emoji: '🤖', label: 'AI 리포트', bg: colors.blueTint, route: 'ReportView' },
  { emoji: '💌', label: '타임캡슐', bg: colors.yellowTint, route: 'TimeCapsuleScreen' },
];

const recentMemories = [
  { emoji: '🌸', tag: '#데이트', place: '서울숲', date: '3.15' },
  { emoji: '🍜', tag: '#음식', place: '신촌', date: '3.14' },
  { emoji: '🎡', tag: '#데이트', place: '롯데월드', date: '3.1' },
  { emoji: '🌅', tag: '#여행', place: '해운대', date: '2.20' },
];

const HomeScreen = ({ navigation }) => {
  const emojiScale = useRef(new Animated.Value(1)).current;

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
        <DdayCard daysCount={247} startDate="2025.08.03" myName="예진" partnerName="지호" />

        {/* 오늘의 우리 감정 Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>오늘의 우리 감정</Text>
          <View style={styles.emotionRow}>
            <Animated.Text style={[styles.bigEmoji, { transform: [{ scale: emojiScale }] }]}>
              😊
            </Animated.Text>
            <View style={styles.emotionChips}>
              <Chip label="긍정 68%" variant="green" />
              <Chip label="부정 22%" variant="pink" />
            </View>
          </View>
          <Text style={styles.aiSummary}>
            오늘 대화에서 긍정적인 감정이 주를 이뤘어요. 서로에 대한 배려가 느껴지는 하루네요! 💕
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          {quickActions.map((action, idx) => (
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
        <View style={styles.memoryGrid}>
          {recentMemories.map((mem, idx) => (
            <TouchableOpacity key={idx} style={styles.memoryCard}>
              <View style={styles.memoryImagePlaceholder}>
                <Text style={styles.memoryEmoji}>{mem.emoji}</Text>
              </View>
              <View style={styles.memoryInfo}>
                <Text style={styles.memoryTag}>{mem.tag}</Text>
                <Text style={styles.memoryMeta}>{mem.place} · {mem.date}</Text>
              </View>
            </TouchableOpacity>
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 12,
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
    gap: 8,
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
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    gap: 8,
  },
  memoryCard: {
    width: '47%',
    marginHorizontal: 4,
    borderRadius: 14,
    backgroundColor: colors.bgSoft,
    overflow: 'hidden',
    marginBottom: 4,
  },
  memoryImagePlaceholder: {
    height: 120,
    backgroundColor: colors.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoryEmoji: {
    fontSize: 40,
  },
  memoryInfo: {
    padding: 10,
  },
  memoryTag: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.pink,
    marginBottom: 2,
  },
  memoryMeta: {
    fontSize: 11,
    color: colors.inkMute,
  },
});

export default HomeScreen;
