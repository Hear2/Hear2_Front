import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

const recentHistory = [
  { day: 126, question: '가장 행복했던 데이트는?', myEmoji: '😊', partnerEmoji: '🥰', date: '5.2' },
  { day: 125, question: '서로에게 고마운 점은?', myEmoji: '💕', partnerEmoji: '😍', date: '5.1' },
];

const DailyQAScreen = ({ navigation }) => {
  const [answer, setAnswer] = useState('웃으면서 나한테 달려올 때! 그 순간이 제일 좋아 ♥');
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.8, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <LovelyBackground intensity={0.6} hearts={false} />
      <Header title="데일리 Q&A" showBack onBack={() => navigation?.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Streak Banner */}
        <LinearGradient
          colors={['#FFD700', '#FFA500', '#FF8C00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.streakBanner}
        >
          <Text style={styles.streakText}>🔥 7일 연속 답변 중!</Text>
          <View style={styles.pointBadge}>
            <Text style={styles.pointText}>+50 P</Text>
          </View>
        </LinearGradient>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <Animated.View style={[styles.auroraGlow, { opacity: glowAnim }]} pointerEvents="none">
            <Svg width="100%" height="100%" viewBox="0 0 200 200">
              <Defs>
                <RadialGradient id="qaGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <Stop offset="0%" stopColor={colors.pinkSoft} stopOpacity="0.95" />
                  <Stop offset="55%" stopColor={colors.pinkSoft} stopOpacity="0.5" />
                  <Stop offset="100%" stopColor={colors.pinkSoft} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="100" cy="100" r="100" fill="url(#qaGlow)" />
            </Svg>
          </Animated.View>
          <View style={styles.questionHeader}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '85%' }]} />
            </View>
            <Text style={styles.dayLabel}>Day 127</Text>
          </View>
          <Text style={styles.questionText}>
            상대방이 나를 가장{'\n'}기쁘게 하는 순간은{'\n'}언제인가요?
          </Text>
        </View>

        {/* My Answer Card */}
        <View style={styles.answerCard}>
          <View style={styles.answerHeader}>
            <Text style={styles.answerLabel}>💗 내 답변</Text>
            <Text style={styles.charCount}>{answer.length}/500자</Text>
          </View>
          <TextInput
            style={styles.answerInput}
            value={answer}
            onChangeText={setAnswer}
            multiline
            maxLength={500}
            placeholder="답변을 입력해주세요..."
            placeholderTextColor={colors.inkMute}
          />
        </View>

        {/* Partner Answer (Locked) */}
        <View style={styles.lockedCard}>
          <View style={styles.answerHeader}>
            <Text style={styles.answerLabel}>🔒 파트너 답변</Text>
          </View>
          <View style={styles.shimmerLines}>
            {[1, 0.8, 0.6].map((w, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.shimmerBar,
                  { width: `${w * 100}%`, opacity: shimmerOpacity },
                ]}
              />
            ))}
          </View>
          <Text style={styles.lockedHint}>
            둘 다 답변하면 서로의 답이 공개돼요
          </Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.pink, colors.rose]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>답변 저장하고 살짝 보내기 💌</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent QA History */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>최근 Q&A</Text>
          <TouchableOpacity
            onPress={() => navigation?.navigate('QuestionHistoryScreen')}
            hitSlop={8}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAll}>더보기 ›</Text>
          </TouchableOpacity>
        </View>
        {recentHistory.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.historyItem} activeOpacity={0.7}>
            <View style={styles.historyLeft}>
              <Text style={styles.historyDay}>Day {item.day}</Text>
              <Text style={styles.historyQuestion} numberOfLines={1}>{item.question}</Text>
            </View>
            <View style={styles.historyRight}>
              <Text style={styles.historyEmoji}>{item.myEmoji} {item.partnerEmoji}</Text>
              <Text style={styles.historyDate}>{item.date}</Text>
            </View>
          </TouchableOpacity>
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
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 20,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pointBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pointText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  questionCard: {
    backgroundColor: colors.pinkTint,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  auroraGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.pink,
    borderRadius: 3,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.pink,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 34,
  },
  answerCard: {
    backgroundColor: colors.bgApp,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  answerLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  charCount: {
    fontSize: 13,
    color: colors.inkMute,
  },
  answerInput: {
    fontSize: 15,
    color: colors.ink2,
    lineHeight: 24,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  lockedCard: {
    backgroundColor: colors.bgSoft,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.line2,
  },
  shimmerLines: {
    gap: 10,
    marginBottom: 14,
  },
  shimmerBar: {
    height: 14,
    backgroundColor: colors.line,
    borderRadius: 7,
  },
  lockedHint: {
    fontSize: 13,
    color: colors.inkMute,
    textAlign: 'center',
  },
  ctaButton: {
    marginBottom: 28,
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
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.pink,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgApp,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line2,
  },
  historyLeft: {
    flex: 1,
    marginRight: 12,
  },
  historyDay: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.pink,
    marginBottom: 4,
  },
  historyQuestion: {
    fontSize: 14,
    color: colors.ink2,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: colors.inkMute,
  },
});

export default DailyQAScreen;
