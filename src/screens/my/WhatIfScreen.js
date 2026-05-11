import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';
import Chip from '../../components/common/Chip';

const categories = [
  { emoji: '⚠️', label: '갈등 예측', bg: '#FFF0F0', color: '#FF6B6B', route: 'WhatIfConflictScreen' },
  { emoji: '🎁', label: '선물 추천', bg: colors.pinkTint, color: colors.pink, route: 'WhatIfGiftScreen' },
  { emoji: '✈️', label: '여행 시뮬', bg: colors.blueTint, color: colors.blue, route: 'WhatIfTripScreen' },
  { emoji: '💭', label: '대화 코칭', bg: colors.yellowTint, color: '#E8A800', route: 'WhatIfCoachScreen' },
];

const WhatIfScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <LovelyBackground intensity={0.5} hearts={false} />
      <Header title="만약에..." showBack onBack={() => navigation?.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Title */}
        <Text style={styles.mainTitle}>궁금한 시나리오를{'\n'}예측해드려요</Text>
        <Text style={styles.mainSubtitle}>120일치 대화 패턴 기반</Text>

        {/* 2x2 Category Grid */}
        <View style={styles.categoryGrid}>
          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.categoryCard, { backgroundColor: cat.bg }]}
              activeOpacity={0.7}
              onPress={() => cat.route && navigation?.navigate(cat.route)}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Simulation Card */}
        <Text style={styles.sectionTitle}>최근 시뮬레이션</Text>
        <View style={styles.simCard}>
          <View style={styles.simTagRow}>
            <View style={styles.simTag}>
              <Text style={styles.simTagText}>갈등 예측</Text>
            </View>
          </View>
          <Text style={styles.simQuestion}>
            주말 일정 미리 안 정한 채로 만나면?
          </Text>

          {/* Result Box */}
          <View style={styles.resultBox}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>갈등 가능성</Text>
              <Text style={styles.resultValue}>72%</Text>
            </View>
            <View style={styles.resultBarBg}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E53']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.resultBarFill, { width: '72%' }]}
              />
            </View>
            <Text style={styles.resultExplanation}>
              평소 지호님은 계획적인 데이트를 선호하는 패턴이 있어요.
              미리 장소나 일정을 정해두면 더 편안하게 만날 수 있을 거예요.
            </Text>
          </View>

          {/* Two Buttons */}
          <View style={styles.simButtons}>
            <TouchableOpacity style={styles.simBtnOutline} activeOpacity={0.7}>
              <Text style={styles.simBtnOutlineText}>다시 시뮬</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.simBtnFill}
              activeOpacity={0.8}
              onPress={() => navigation?.navigate('WhatIfSolutionScreen')}
            >
              <LinearGradient
                colors={[colors.pink, colors.rose]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.simBtnGradient}
              >
                <Text style={styles.simBtnFillText}>해결 방법 보기</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Prompt Input Bar */}
      <View style={styles.promptBar}>
        <Text style={styles.promptSparkle}>✨</Text>
        <TextInput
          style={styles.promptInput}
          placeholder="만약에... 우리가 같이 살게 되면?"
          placeholderTextColor={colors.inkMute}
          editable={false}
        />
        <TouchableOpacity style={styles.sendBtn} activeOpacity={0.7}>
          <LinearGradient
            colors={[colors.pink, colors.rose]}
            style={styles.sendGradient}
          >
            <Text style={styles.sendIcon}>{'>'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
    lineHeight: 36,
    marginBottom: 6,
  },
  mainSubtitle: {
    fontSize: 14,
    color: colors.inkMute,
    marginBottom: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  categoryCard: {
    width: '47%',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 14,
  },
  simCard: {
    backgroundColor: colors.bgApp,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  simTagRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  simTag: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  simTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  simQuestion: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 16,
    lineHeight: 26,
  },
  resultBox: {
    backgroundColor: colors.bgSoft,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink2,
  },
  resultValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF6B6B',
  },
  resultBarBg: {
    height: 8,
    backgroundColor: colors.line2,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  resultBarFill: {
    height: 8,
    borderRadius: 4,
  },
  resultExplanation: {
    fontSize: 13,
    color: colors.ink3,
    lineHeight: 20,
  },
  simButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  simBtnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.pink,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  simBtnOutlineText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.pink,
  },
  simBtnFill: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  simBtnGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 14,
  },
  simBtnFillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promptBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.line2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  promptSparkle: {
    fontSize: 20,
    marginRight: 10,
  },
  promptInput: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.bgInput,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendBtn: {
    marginLeft: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  sendGradient: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default WhatIfScreen;
