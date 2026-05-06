import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse, Circle, Path } from 'react-native-svg';
import colors from '../../constants/colors';

const Mascot = ({ size = 80 }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200">
    <Ellipse cx={100} cy={120} rx={70} ry={60} fill="#FFE08A" />
    <Circle cx={78} cy={105} r={6} fill="#1E2152" />
    <Circle cx={122} cy={105} r={6} fill="#1E2152" />
    <Circle cx={80} cy={103} r={2} fill="#fff" />
    <Circle cx={124} cy={103} r={2} fill="#fff" />
    <Path
      d="M86 130 Q 100 142 114 130"
      stroke="#1E2152"
      strokeWidth={3}
      fill="none"
      strokeLinecap="round"
    />
    <Ellipse cx={62} cy={120} rx={10} ry={6} fill="#FFB3CE" opacity={0.7} />
    <Ellipse cx={138} cy={120} rx={10} ry={6} fill="#FFB3CE" opacity={0.7} />
    <Path d="M96 80 L100 70 L104 80 Z" fill="#FFA94D" />
    <Path
      d="M75 60 L86 75 L100 55 L114 75 L125 60 L120 78 L80 78 Z"
      fill="#FFD93D"
    />
    <Circle cx={100} cy={55} r={3} fill="#FF6B9D" />
  </Svg>
);

const DdayCard = ({
  daysCount = 247,
  startDate = '2025.08.03',
  myName = '예진',
  partnerName = '지호',
  onCharacterPress,
}) => {
  const heartAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0.3)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnim, { toValue: -20, duration: 2000, useNativeDriver: true }),
        Animated.timing(heartAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(sparkleAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1.05, duration: 1400, useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={[colors.pink, colors.heartRed]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.auroraGlow} />

      <Animated.Text style={[styles.sparkle, styles.sparkle1, { opacity: sparkleAnim }]}>✨</Animated.Text>
      <Animated.Text style={[styles.sparkle, styles.sparkle2, { opacity: sparkleAnim }]}>✨</Animated.Text>
      <Animated.Text style={[styles.sparkle, styles.sparkle3, { opacity: sparkleAnim }]}>✨</Animated.Text>

      <Animated.Text
        style={[styles.driftingHeart, { transform: [{ translateY: heartAnim }] }]}
      >
        ♥
      </Animated.Text>

      {/* Left: Character */}
      <TouchableOpacity
        onPress={onCharacterPress}
        activeOpacity={0.85}
        style={styles.characterWrap}
        hitSlop={6}
      >
        <Animated.View style={[styles.characterBubble, { transform: [{ scale: breatheAnim }] }]}>
          <Mascot size={88} />
        </Animated.View>
        <View style={styles.levelPill}>
          <Text style={styles.levelText}>Lv.12</Text>
        </View>
      </TouchableOpacity>

      {/* Right: Existing content */}
      <View style={styles.infoCol}>
        <Text style={styles.ddayLabel}>♥ 함께한 지</Text>
        <Text style={styles.ddayCount}>D+{daysCount}</Text>
        <Text style={styles.startDate}>{startDate} ~</Text>

        <View style={styles.avatarRow}>
          <View style={[styles.avatar, styles.avatarLeft]}>
            <Text style={styles.avatarText}>{myName.charAt(0)}</Text>
          </View>
          <View style={[styles.avatar, styles.avatarRight]}>
            <Text style={styles.avatarText}>{partnerName.charAt(0)}</Text>
          </View>
        </View>
        <Text style={styles.coupleNames}>{myName} ♥ {partnerName}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginHorizontal: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  auroraGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 14,
  },
  sparkle1: { top: 12, right: 20 },
  sparkle2: { top: 50, left: 16 },
  sparkle3: { bottom: 20, right: 40 },
  driftingHeart: {
    position: 'absolute',
    top: 18,
    right: 60,
    fontSize: 18,
    color: 'rgba(255,255,255,0.5)',
  },
  // Left character
  characterWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterBubble: {
    width: 110,
    height: 110,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelPill: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  levelText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.pink,
  },
  // Right info column
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  ddayLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  ddayCount: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 2,
  },
  startDate: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLeft: {
    zIndex: 2,
  },
  avatarRight: {
    marginLeft: -10,
    zIndex: 1,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  coupleNames: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default DdayCard;
