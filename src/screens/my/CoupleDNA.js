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
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';
import Chip from '../../components/common/Chip';

const strengths = [
  { label: '감성소통', value: 89, color: colors.pink },
  { label: '공감지수', value: 92, color: colors.rose },
  { label: '유머코드', value: 76, color: colors.peach },
  { label: '갈등회복', value: 68, color: colors.blue },
  { label: '계획성', value: 45, color: colors.lavender },
];

const profiles = [
  {
    name: '예진',
    type: 'ENFP',
    tags: ['열정', '직관', '공감'],
    color: colors.pink,
    bg: colors.pinkTint,
  },
  {
    name: '지호',
    type: 'INFJ',
    tags: ['배려', '계획', '깊이'],
    color: colors.blue,
    bg: colors.blueTint,
  },
];

const CoupleDNA = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <LovelyBackground intensity={0.8} />
      <Header title="커플 DNA" showBack onBack={() => navigation?.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero Card */}
        <LinearGradient
          colors={[colors.pink, colors.rose, colors.lavender]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroSubtitle}>120일 데이터 분석 완료 ✨</Text>
          <Text style={styles.heroTitle}>{'감정형\n탐험가 커플'}</Text>
          <Text style={styles.heroMbti}>ENFP x INFJ 소통 패턴</Text>
          <View style={styles.heroTags}>
            <View style={styles.heroTag}>
              <Text style={styles.heroTagText}>감성 89%</Text>
            </View>
            <View style={styles.heroTag}>
              <Text style={styles.heroTagText}>공감 92%</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Strengths Card */}
        <Animated.View style={[styles.strengthsCard, { opacity: fadeAnim }]}>
          <Text style={styles.cardTitle}>우리의 강점</Text>
          {strengths.map((item, idx) => (
            <View key={idx} style={styles.strengthRow}>
              <Text style={styles.strengthLabel}>{item.label}</Text>
              <View style={styles.strengthBarBg}>
                <View style={[styles.strengthBarFill, { width: `${item.value}%`, backgroundColor: item.color }]} />
              </View>
              <Text style={[styles.strengthValue, { color: item.color }]}>{item.value}%</Text>
            </View>
          ))}
        </Animated.View>

        {/* 2-col Personality Cards */}
        <View style={styles.profileRow}>
          {profiles.map((p, idx) => (
            <View key={idx} style={[styles.profileCard, { backgroundColor: p.bg }]}>
              <Text style={[styles.profileName, { color: p.color }]}>{p.name}</Text>
              <Text style={styles.profileType}>{p.type}</Text>
              <View style={styles.profileTags}>
                {p.tags.map((tag, i) => (
                  <View key={i} style={[styles.profileTagPill, { borderColor: p.color }]}>
                    <Text style={[styles.profileTagText, { color: p.color }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.pink, colors.rose]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>📤 결과 카드 공유하기</Text>
          </LinearGradient>
        </TouchableOpacity>

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
  heroCard: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 40,
    marginBottom: 8,
  },
  heroMbti: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  heroTags: {
    flexDirection: 'row',
    gap: 10,
  },
  heroTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  heroTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  strengthsCard: {
    backgroundColor: colors.bgApp,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 20,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  strengthLabel: {
    width: 70,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink2,
  },
  strengthBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: colors.line2,
    borderRadius: 5,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: 10,
    borderRadius: 5,
  },
  strengthValue: {
    width: 40,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  profileRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  profileCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  profileType: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 12,
  },
  profileTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  profileTagPill: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  profileTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ctaButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 20,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CoupleDNA;
