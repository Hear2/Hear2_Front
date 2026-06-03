import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';
import Heart from '../../components/common/Heart';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/common/Avatar';
import { useCoupleStats } from '../../hooks/useCoupleStats';
import { useMemories } from '../../contexts/MemoryContext';
import { daysTogether } from '../../utils/dday';

const sections = [
  {
    title: 'AI 분석',
    items: [
      { icon: '📊', label: '주간/월간 리포트', subtitle: 'AI가 분석한 관계 인사이트', bg: colors.blueTint, route: 'ReportView' },
      { icon: '🧬', label: '커플 DNA', subtitle: '우리만의 성향 분석', bg: colors.pinkTint, route: 'CoupleDNA' },
      { icon: '🤔', label: '만약에 AI', subtitle: 'AI가 예측하는 시나리오', bg: colors.yellowTint, route: 'WhatIfScreen' },
    ],
  },
  {
    title: '커플 활동',
    items: [
      { icon: '❓', label: '데일리 Q&A', subtitle: '매일 하나의 질문', bg: colors.greenTint, route: 'DailyQAScreen' },
      { icon: '🐣', label: '캐릭터 키우기', subtitle: '함께 성장하는 캐릭터', bg: colors.yellowTint, route: 'CharacterScreen' },
      { icon: '💌', label: '타임캡슐', subtitle: '미래의 우리에게 편지', bg: colors.pinkTint, route: 'TimeCapsuleScreen' },
    ],
  },
  {
    title: '유틸리티',
    items: [
      { icon: '📍', label: '위치 공유', subtitle: '실시간 위치 확인', bg: colors.blueTint, route: 'LocationShare' },
      { icon: '🔔', label: '알림', subtitle: '알림 설정 관리', bg: colors.yellowTint, route: 'NotificationsScreen' },
      { icon: '⚙️', label: '설정', subtitle: '앱 설정 및 계정 관리', bg: colors.bgSoft, route: 'SettingsScreen' },
    ],
  },
];

const MoreScreen = ({ navigation }) => {
  const { user, coupleStartDate } = useAuth();
  const { memories } = useMemories();
  const dday = daysTogether(coupleStartDate);
  const nickname = user?.nickname || '나';
  // 통계: 대화·캡슐은 BE 집계, 추억은 앨범 개수. 화면 포커스마다 갱신.
  const { chatCount, capsuleCount } = useCoupleStats({ withCapsules: true });
  const stats = [
    { value: String(chatCount), label: '대화' },
    { value: String(memories.length), label: '추억' },
    { value: String(capsuleCount), label: '캡슐' },
  ];
  return (
    <View style={styles.container}>
      <LovelyBackground intensity={0.3} />

      {/* App Header (identical to HomeScreen) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Heart size={24} color={colors.pink} pulse />
          <Text style={styles.logoText}>Hear2</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Hero Card — 누르면 프로필 편집으로 이동 */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ProfileEditScreen')}
        >
        <LinearGradient
          colors={[colors.pink, colors.peach]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileTop}>
            <View style={styles.avatarWrap}>
              <Avatar
                uri={user?.profileImage}
                name={nickname}
                size={52}
                bg="rgba(255,255,255,0.35)"
                textColor="#FFFFFF"
                style={{ borderWidth: 2, borderColor: '#FFFFFF' }}
              />
              <View style={styles.cameraBadge}>
                <Text style={styles.cameraBadgeText}>📷</Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{nickname}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
            </View>
            {dday != null && (
              <View style={styles.ddayPill}>
                <Heart size={12} color="#FFFFFF" />
                <Text style={styles.ddayPillText}>D+{dday}</Text>
              </View>
            )}
          </View>
          <View style={styles.statsRow}>
            {stats.map((stat, idx) => (
              <View key={idx} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
        </TouchableOpacity>

        {/* Premium Banner */}
        <LinearGradient
          colors={['#FFD700', '#FFAA00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.premiumBanner}
        >
          <View style={styles.premiumLeft}>
            <Text style={styles.premiumEmoji}>👑</Text>
            <View>
              <Text style={styles.premiumTitle}>Hear2 Premium</Text>
              <Text style={styles.premiumDesc}>AI 판사 무제한 · 캡슐 무제한</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>업그레이드</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Section Groups */}
        {sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionGroup}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={iIdx}
                  style={[
                    styles.menuRow,
                    iIdx < section.items.length - 1 && styles.menuRowBorder,
                  ]}
                  onPress={() => item.route && navigation.navigate(item.route)}
                  disabled={!item.route}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.menuTextWrap}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
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
    backgroundColor: colors.bgApp,
  },
  scrollContent: {
    paddingBottom: 24,
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
  // Profile Card
  profileCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadgeText: {
    fontSize: 11,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  ddayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  ddayPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 14,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  // Premium Banner
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
  },
  premiumLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  premiumTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5A3D00',
  },
  premiumDesc: {
    fontSize: 12,
    color: '#7A5A1A',
    marginTop: 1,
  },
  upgradeBtn: {
    backgroundColor: '#5A3D00',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 8,
  },
  upgradeBtnText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '700',
  },
  // Section Groups
  sectionGroup: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: colors.bgApp,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line2,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.inkMute,
    marginTop: 1,
  },
  menuArrow: {
    fontSize: 22,
    color: colors.inkMute,
    fontWeight: '300',
  },
});

export default MoreScreen;
