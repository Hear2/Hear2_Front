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
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';
import Heart from '../../components/common/Heart';

const FLOATING_HEARTS = [
  { left: '12%', top: 24, size: 14, delay: 0 },
  { left: '82%', top: 56, size: 18, delay: 400 },
  { left: '8%', top: 220, size: 12, delay: 800 },
  { left: '88%', top: 280, size: 16, delay: 200 },
  { left: '20%', top: 360, size: 10, delay: 600 },
];

const FloatingHeart = ({ left, top, size, delay }) => {
  const breathe = useRef(new Animated.Value(0.85)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(breathe, { toValue: 1.15, duration: 1600, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0.85, duration: 1600, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [breathe, delay]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.floatingHeart,
        { left, top, opacity: 0.7, transform: [{ scale: breathe }] },
      ]}
    >
      <Heart size={size} color={colors.pink} />
    </Animated.View>
  );
};

const Sparkle = ({ style, delay = 0 }) => {
  const twinkle = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(twinkle, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [delay, twinkle]);
  return <Animated.Text style={[style, { opacity: twinkle }]}>✨</Animated.Text>;
};

const DailyQASubmittedScreen = ({ navigation, route }) => {
  const answer =
    route?.params?.answer ?? '웃으면서 나한테 달려올 때! 그 순간이 제일 좋아 ♥';
  const sentAt = route?.params?.sentAt ?? '오후 9:24';
  const day = route?.params?.day ?? 127;

  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.9, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFAFC', '#FFE4EE']}
        style={StyleSheet.absoluteFill}
      />
      <LovelyBackground intensity={0.85} hearts sparkles />

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {FLOATING_HEARTS.map((p, i) => (
          <FloatingHeart key={i} {...p} />
        ))}
      </View>

      <Header
        title=""
        showBack
        onBack={() => navigation?.goBack()}
        style={{ backgroundColor: 'transparent' }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero card */}
        <LinearGradient
          colors={[colors.pink, colors.heartRed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Animated.View
            pointerEvents="none"
            style={[styles.heroAurora, { opacity: glowAnim }]}
          >
            <Svg width="100%" height="100%" viewBox="0 0 200 200">
              <Defs>
                <RadialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
                  <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.18" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="100" cy="100" r="100" fill="url(#heroGlow)" />
            </Svg>
          </Animated.View>

          <View style={styles.envelopeWrap}>
            <Sparkle style={[styles.sparkle, { top: 0, left: 4, fontSize: 14 }]} />
            <Sparkle
              style={[styles.sparkle, { top: 6, right: 0, fontSize: 18 }]}
              delay={400}
            />
            <Sparkle
              style={[styles.sparkle, { bottom: 4, left: 10, fontSize: 12 }]}
              delay={800}
            />
            <Sparkle
              style={[styles.sparkle, { bottom: 6, right: 8, fontSize: 16 }]}
              delay={200}
            />
            <View style={styles.envelope}>
              <Heart size={36} color={colors.heartRed} pulse />
            </View>
            <Text style={styles.envelopeTag}>💌</Text>
          </View>

          <Text style={styles.heroTitle}>답변이 도착했어요!</Text>
          <Text style={styles.heroSubtitle}>지호에게 살짝 알림이 갔어요 💕</Text>
        </LinearGradient>

        {/* Streak earned */}
        <LinearGradient
          colors={['#FFF8E1', '#FFE9A8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.streakBanner}
        >
          <View style={styles.streakLeft}>
            <Text style={styles.streakFire}>🔥</Text>
            <View>
              <Text style={styles.streakTitle}>8일 연속 답변!</Text>
              <Text style={styles.streakSub}>내일도 답변하면 +50P 추가</Text>
            </View>
          </View>
          <View style={styles.pointBadge}>
            <Text style={styles.pointText}>+50 P</Text>
          </View>
        </LinearGradient>

        {/* My answer recap */}
        <View style={styles.answerCard}>
          <View style={styles.answerHeader}>
            <Text style={styles.answerLabel}>💗 내 답변 · Day {day}</Text>
            <Text style={styles.answerTime}>{sentAt} 전송</Text>
          </View>
          <View style={styles.answerBubble}>
            <Text style={styles.answerText}>{answer}</Text>
          </View>
        </View>

        {/* Partner waiting */}
        <View style={styles.partnerCard}>
          <View style={styles.partnerRow}>
            <View style={styles.partnerAvatarWrap}>
              <Animated.View
                style={[styles.partnerAvatarRing, { opacity: shimmerOpacity }]}
              />
              <View style={styles.partnerAvatar}>
                <Text style={styles.partnerAvatarText}>지</Text>
              </View>
            </View>
            <View style={styles.partnerTextWrap}>
              <Text style={styles.partnerTitle}>지호의 답변을 기다리는 중</Text>
              <Text style={styles.partnerSub}>둘 다 답변하면 서로의 답이 공개돼요</Text>
            </View>
            <Text style={styles.hourglass}>⏳</Text>
          </View>

          <View style={styles.progressRow}>
            <View style={[styles.dot, { backgroundColor: colors.heartRed }]} />
            <LinearGradient
              colors={[colors.heartRed, colors.line]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressBar}
            />
            <Animated.View
              style={[
                styles.dot,
                { backgroundColor: colors.line, opacity: shimmerOpacity },
              ]}
            />
            <View style={[styles.progressBar, { backgroundColor: '#EEE' }]} />
            <View style={[styles.dot, { backgroundColor: '#EEE' }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: colors.heartRed }]}>
              내 답변
            </Text>
            <Text style={styles.progressLabel}>지호 답변</Text>
            <Text style={styles.progressLabel}>둘 다 공개</Text>
          </View>
        </View>

        {/* Nudge action */}
        <TouchableOpacity style={styles.nudgeBtn} activeOpacity={0.85}>
          <Text style={styles.nudgeText}>💌 지호에게 살짝 재촉하기</Text>
        </TouchableOpacity>

        {/* Primary CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation?.navigate('QuestionHistoryScreen')
          }
        >
          <LinearGradient
            colors={[colors.pink, colors.heartRed]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Q&A 히스토리 보기</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAFC',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  floatingHeart: {
    position: 'absolute',
  },
  heroCard: {
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: colors.heartRed,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 10,
  },
  heroAurora: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
  },
  envelopeWrap: {
    width: 110,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  sparkle: {
    position: 'absolute',
    color: '#FFFFFF',
  },
  envelope: {
    width: 88,
    height: 68,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  envelopeTag: {
    position: 'absolute',
    top: -6,
    fontSize: 24,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#F4B300',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakFire: {
    fontSize: 26,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#A07A00',
  },
  streakSub: {
    fontSize: 11,
    color: '#A07A00',
    opacity: 0.75,
    marginTop: 2,
  },
  pointBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pointText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C8932E',
  },
  answerCard: {
    backgroundColor: colors.bgApp,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line2,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.pink,
  },
  answerTime: {
    fontSize: 11,
    color: colors.inkMute,
  },
  answerBubble: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.pinkTint,
  },
  answerText: {
    fontSize: 13,
    color: colors.ink,
    lineHeight: 20,
  },
  partnerCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    backgroundColor: '#FBFAFE',
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  partnerAvatarWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerAvatarRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.pinkSoft,
  },
  partnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerAvatarText: {
    color: colors.blue,
    fontWeight: '800',
    fontSize: 14,
  },
  partnerTextWrap: {
    flex: 1,
  },
  partnerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  partnerSub: {
    fontSize: 11,
    color: colors.inkMute,
    marginTop: 2,
  },
  hourglass: {
    fontSize: 18,
  },
  progressRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressBar: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressLabels: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 10,
    color: colors.inkMute,
    fontWeight: '600',
  },
  nudgeBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFD0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  nudgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.heartRed,
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: colors.heartRed,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default DailyQASubmittedScreen;
