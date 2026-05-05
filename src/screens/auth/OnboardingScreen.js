import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import Heart from '../../components/common/Heart';
import LovelyBackground from '../../components/common/LovelyBackground';
import Button from '../../components/common/Button';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const handleSkip = () => {
    navigation.replace('Login');
  };

  const handleNext = () => {
    // TODO: swipe to next page or navigate
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.pinkTint, '#FFE0EC']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <LovelyBackground intensity={0.8} hearts sparkles blobs />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>건너뛰기</Text>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {/* Aurora glow behind hearts */}
        <View style={styles.auroraGlow}>
          <LinearGradient
            colors={['rgba(255,107,157,0.25)', 'rgba(197,184,255,0.2)', 'transparent']}
            style={styles.auroraGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>

        {/* Overlapping hearts */}
        <View style={styles.heartsContainer}>
          <View style={styles.heartLeft}>
            <Heart size={70} color={colors.pinkSoft} pulse />
          </View>
          <View style={styles.heartRight}>
            <Heart size={88} color={colors.rose} pulse />
          </View>

          {/* Sparkles around hearts */}
          <Text style={[styles.sparkle, { top: -10, left: 20 }]}>✦</Text>
          <Text style={[styles.sparkle, { top: 10, right: 10 }]}>✧</Text>
          <Text style={[styles.sparkle, { bottom: -5, left: 40 }]}>✦</Text>
          <Text style={[styles.sparkle, { bottom: 10, right: 30 }]}>✧</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{'매일의 마음,\nAI가 살펴드려요'}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {'대화 속 감정을 자동 분석하고,\n두 사람만의 추억을 매일 쌓아가요.'}
        </Text>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Page indicators */}
        <View style={styles.indicators}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* CTA Button */}
        <Button title="다음" onPress={handleNext} style={styles.ctaBtn} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  auroraGlow: {
    position: 'absolute',
    top: '25%',
    width: 260,
    height: 260,
    borderRadius: 130,
    overflow: 'hidden',
  },
  auroraGradient: {
    flex: 1,
    borderRadius: 130,
  },
  heartsContainer: {
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },
  heartLeft: {
    position: 'absolute',
    left: 30,
    top: 20,
  },
  heartRight: {
    position: 'absolute',
    right: 30,
    top: 8,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 14,
    color: colors.pink,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    color: colors.ink3,
    textAlign: 'center',
    lineHeight: 23,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.line,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
    backgroundColor: colors.pink,
  },
  ctaBtn: {
    width: '100%',
  },
});

export default OnboardingScreen;
