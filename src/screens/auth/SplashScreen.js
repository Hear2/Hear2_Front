import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import Heart from '../../components/common/Heart';
import LovelyBackground from '../../components/common/LovelyBackground';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const { hydrating, isAuthenticated, coupleConnected } = useAuth();
  // useState로 두면 setState가 deps를 바꿔서 cleanup이 setTimeout을 취소함. useRef로 안전하게.
  const autoRoutedRef = useRef(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const dotOpacity1 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity3 = useRef(new Animated.Value(0.3)).current;

  // Orbiting hearts animation
  const orbit = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in main content
    Animated.sequence([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Orbit animation
    Animated.loop(
      Animated.timing(orbit, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
    ).start();

    // Shimmer dots
    const shimmerDot = (dotRef, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotRef, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotRef, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );

    shimmerDot(dotOpacity1, 0).start();
    shimmerDot(dotOpacity2, 300).start();
    shimmerDot(dotOpacity3, 600).start();
  }, []);

  // hydration이 끝나면 인증 상태에 따라 자동 분기:
  // - 로그인 & 커플 연결 → MainTabs
  // - 로그인 only → Auth(PartnerConnect)
  // - 미인증 → 탭 대기 (아래 handleTap에서 Onboarding으로)
  useEffect(() => {
    if (hydrating || autoRoutedRef.current) return;
    if (!isAuthenticated) return;
    autoRoutedRef.current = true;

    if (coupleConnected) {
      setTimeout(() => navigation.replace('MainTabs'), 600);
    } else {
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Auth',
              state: {
                index: 0,
                routes: [{ name: 'PartnerConnect' }],
              },
            },
          ],
        });
      }, 600);
    }
  }, [hydrating, isAuthenticated, coupleConnected, navigation]);

  const handleTap = () => {
    // 인증된 사용자는 자동 분기에 맡기고 탭 무시
    if (hydrating || isAuthenticated) return;
    navigation.replace('Auth', { screen: 'Onboarding' });
  };

  const orbitRadius = 90;

  const orbitPositions = [0, 1, 2, 3].map((i) => {
    const angle = orbit.interpolate({
      inputRange: [0, 1],
      outputRange: [
        `${(Math.PI / 2) * i}rad`,
        `${(Math.PI / 2) * i + Math.PI * 2}rad`,
      ],
    });
    return angle;
  });

  // Small orbiting hearts rendered with transforms
  const renderOrbitingHeart = (index) => {
    const baseAngle = (Math.PI * 2 * index) / 4;
    const rotate = orbit.interpolate({
      inputRange: [0, 1],
      outputRange: [baseAngle, baseAngle + Math.PI * 2],
    });

    const translateX = Animated.multiply(
      Animated.cos ? orbit : orbit,
      orbitRadius,
    );

    // Use simple offset positioning since Animated.cos is not available
    const offsetX = Math.cos(baseAngle) * orbitRadius;
    const offsetY = Math.sin(baseAngle) * orbitRadius;

    return (
      <Animated.View
        key={index}
        style={[
          styles.orbitHeart,
          {
            transform: [
              { translateX: offsetX },
              { translateY: offsetY },
              {
                rotate: orbit.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
              { translateX: -offsetX + orbitRadius },
              { translateY: -offsetY },
            ],
          },
        ]}
      >
        <Heart size={18} color={colors.pinkSoft} />
      </Animated.View>
    );
  };

  const showTapHint = !hydrating && !isAuthenticated;

  return (
    <Pressable style={styles.container} onPress={handleTap}>
      <LinearGradient
        colors={['#FFF5F8', '#FFE0EC', '#FFC8DD', '#FFD9E8', '#FFF0F5']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />

      <LovelyBackground intensity={1.2} hearts sparkles blobs />

      <Animated.View style={[styles.content, { opacity: fadeIn }]}>
        {/* Sparkles above heart */}
        <Text style={styles.sparkleTop}>✦</Text>

        {/* Heart with orbiting small hearts */}
        <View style={styles.heartContainer}>
          {[0, 1, 2, 3].map((i) => renderOrbitingHeart(i))}
          <Heart size={140} color={colors.rose} pulse />
        </View>

        {/* Sparkles around */}
        <View style={styles.sparkleRow}>
          <Text style={styles.sparkle}>✧</Text>
          <Text style={[styles.sparkle, { marginHorizontal: 40 }]}>✦</Text>
          <Text style={styles.sparkle}>✧</Text>
        </View>

        {/* App name */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Hear</Text>
          <Text style={styles.title2}>2</Text>
        </View>

        {/* Tagline */}
        <Animated.View style={[styles.taglineRow, { opacity: taglineFade }]}>
          <Text style={styles.taglineSparkle}>✦ </Text>
          <Text style={styles.tagline}>두 사람의 마음을 듣다</Text>
          <Text style={styles.taglineSparkle}> ✦</Text>
        </Animated.View>
      </Animated.View>

      {/* Shimmer dots at bottom */}
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { opacity: dotOpacity1 }]} />
        <Animated.View style={[styles.dot, { opacity: dotOpacity2 }]} />
        <Animated.View style={[styles.dot, { opacity: dotOpacity3 }]} />
      </View>

      {showTapHint && (
        <View style={styles.tapHint} pointerEvents="none">
          <Text style={styles.tapHintText}>화면을 터치하여 시작하기</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleTop: {
    fontSize: 14,
    color: colors.pink,
    marginBottom: 8,
  },
  heartContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitHeart: {
    position: 'absolute',
  },
  sparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  sparkle: {
    fontSize: 12,
    color: colors.pinkSoft,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -1,
  },
  title2: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.rose,
    letterSpacing: -1,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.ink3,
    fontWeight: '500',
  },
  taglineSparkle: {
    fontSize: 10,
    color: colors.pinkSoft,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.pink,
  },
  tapHint: {
    position: 'absolute',
    bottom: 110,
  },
  tapHintText: {
    fontSize: 13,
    color: colors.ink3,
    fontWeight: '500',
    opacity: 0.6,
  },
});

export default SplashScreen;
