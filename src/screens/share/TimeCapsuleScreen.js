import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';
import { fetchCapsules } from '../../api/timeCapsuleAPI';

const TimeCapsuleScreen = ({ navigation }) => {
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const [capsules, setCapsules] = useState({ sealed: [], open: [] });

  // 화면 포커스마다 재조회 → 캡슐을 새로 봉인하고 돌아오면 바로 반영.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      fetchCapsules()
        .then((res) => {
          if (alive) setCapsules(res);
        })
        .catch(() => {});
      return () => {
        alive = false;
      };
    }, []),
  );

  const featured = capsules.sealed[0] || null;
  const gridItems = capsules.sealed.slice(1);
  const openItems = capsules.open;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(sparkleAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <LovelyBackground intensity={0.5} />
      <Header
        title="타임캡슐"
        showBack
        onBack={() => navigation?.goBack()}
        right={
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation?.navigate('TimeCapsuleCreateScreen')}
            activeOpacity={0.7}
          >
            <Text style={styles.createBtnText} numberOfLines={1}>+ 만들기</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero Card */}
        <LinearGradient
          colors={[colors.lavender, colors.pinkSoft, colors.peach]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Animated.Text style={[styles.heroSparkle, { opacity: sparkleAnim }]}>
            ✨
          </Animated.Text>
          <Text style={styles.heroTag}>HEAR2 TIME CAPSULE</Text>
          <Text style={styles.heroTitle}>미래의 우리에게 💌</Text>
          <Text style={styles.heroDesc}>
            지금의 마음을 담아 미래의 우리에게 보내보세요.{'\n'}
            시간이 지나면 더 빛나는 기억이 됩니다.
          </Text>
          <View style={styles.auroraBlob} />
        </LinearGradient>

        {/* Upcoming Label */}
        <Text style={styles.sectionTitle}>예정된 캡슐</Text>

        {!featured && gridItems.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>💌</Text>
            <Text style={styles.emptyText}>
              아직 예정된 캡슐이 없어요.{'\n'}미래의 우리에게 첫 캡슐을 보내보세요.
            </Text>
          </View>
        )}

        {/* Main (가장 임박한) Capsule Card */}
        {featured && (
          <TouchableOpacity style={styles.mainCapsule} activeOpacity={0.8}>
            <View style={styles.mainCapsuleTop}>
              <Animated.Text style={[styles.capsuleEmoji, { transform: [{ scale: breatheAnim }] }]}>
                {featured.emoji}
              </Animated.Text>
              <View style={styles.mainCapsuleInfo}>
                <Text style={styles.capsuleTitle} numberOfLines={1}>{featured.name}</Text>
                <Text style={styles.capsuleDday}>{featured.ddayLabel}</Text>
              </View>
            </View>
            <View style={styles.capsuleProgressBg}>
              <LinearGradient
                colors={[colors.pink, colors.rose]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.capsuleProgressFill, { width: `${featured.progressPercent}%` }]}
              />
            </View>
            <Text style={styles.capsuleProgressLabel}>{featured.progressPercent}% 채워짐</Text>
          </TouchableOpacity>
        )}

        {/* 2-Column Grid (나머지 예정 캡슐) */}
        {gridItems.length > 0 && (
          <View style={styles.gridRow}>
            {gridItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.gridCard} activeOpacity={0.8}>
                <Text style={styles.gridEmoji}>{item.emoji}</Text>
                <Text style={styles.gridTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.gridDday}>{item.ddayLabel}</Text>
                <View style={styles.lockBadge}>
                  <Text style={styles.lockText}>🔒</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Opened Capsules */}
        {openItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>이미 열린 캡슐</Text>
            {openItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.openedCapsule}
                activeOpacity={0.7}
                onPress={() =>
                  navigation?.navigate('TimeCapsuleOpenedScreen', { capsuleId: item.id })
                }
              >
                <Text style={styles.openedEmoji}>{item.emoji}</Text>
                <View style={styles.openedInfo}>
                  <Text style={styles.openedTitle} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.openedMeta}>
                    <View style={styles.openedBadge}>
                      <Text style={styles.openedBadgeText}>오픈됨</Text>
                    </View>
                    <Text style={styles.openedDate}>{item.dateLabel}</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>{'>'}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  createBtn: {
    backgroundColor: colors.pinkTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  createBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.pink,
  },
  heroCard: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    overflow: 'hidden',
  },
  heroSparkle: {
    position: 'absolute',
    top: 16,
    right: 20,
    fontSize: 28,
  },
  heroTag: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  heroDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  auroraBlob: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: colors.bgApp,
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 24,
  },
  emptyEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    color: colors.inkMute,
    textAlign: 'center',
    lineHeight: 20,
  },
  mainCapsule: {
    backgroundColor: colors.bgApp,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  mainCapsuleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  capsuleEmoji: {
    fontSize: 40,
    marginRight: 14,
  },
  mainCapsuleInfo: {
    flex: 1,
  },
  capsuleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  capsuleDday: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.pink,
  },
  capsuleProgressBg: {
    height: 8,
    backgroundColor: colors.line2,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  capsuleProgressFill: {
    height: 8,
    borderRadius: 4,
  },
  capsuleProgressLabel: {
    fontSize: 12,
    color: colors.inkMute,
    textAlign: 'right',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    flex: 1,
    backgroundColor: colors.bgApp,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  gridEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink2,
    marginBottom: 6,
    textAlign: 'center',
  },
  gridDday: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.pink,
    marginBottom: 6,
  },
  lockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  lockText: {
    fontSize: 14,
  },
  openedCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.greenTint,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  openedEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  openedInfo: {
    flex: 1,
  },
  openedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  openedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openedBadge: {
    backgroundColor: colors.green,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  openedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  openedDate: {
    fontSize: 12,
    color: colors.inkMute,
  },
  chevron: {
    fontSize: 18,
    color: colors.inkMute,
  },
});

export default TimeCapsuleScreen;
