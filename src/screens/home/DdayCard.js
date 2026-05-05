import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';

const DdayCard = ({ daysCount = 247, startDate = '2025.08.03', myName = '예진', partnerName = '지호' }) => {
  const heartAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Drifting heart animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnim, { toValue: -20, duration: 2000, useNativeDriver: true }),
        Animated.timing(heartAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Sparkle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(sparkleAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
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
      {/* White aurora glow overlay */}
      <View style={styles.auroraGlow} />

      {/* Sparkles */}
      <Animated.Text style={[styles.sparkle, styles.sparkle1, { opacity: sparkleAnim }]}>
        ✨
      </Animated.Text>
      <Animated.Text style={[styles.sparkle, styles.sparkle2, { opacity: sparkleAnim }]}>
        ✨
      </Animated.Text>
      <Animated.Text style={[styles.sparkle, styles.sparkle3, { opacity: sparkleAnim }]}>
        ✨
      </Animated.Text>

      {/* Drifting heart */}
      <Animated.Text
        style={[styles.driftingHeart, { transform: [{ translateY: heartAnim }] }]}
      >
        ♥
      </Animated.Text>

      {/* D-Day text */}
      <Text style={styles.ddayLabel}>♥ 함께한 지</Text>
      <Text style={styles.ddayCount}>D+{daysCount}</Text>
      <Text style={styles.startDate}>{startDate} ~</Text>

      {/* Avatar circles */}
      <View style={styles.avatarRow}>
        <View style={[styles.avatar, styles.avatarLeft]}>
          <Text style={styles.avatarText}>{myName.charAt(0)}</Text>
        </View>
        <View style={[styles.avatar, styles.avatarRight]}>
          <Text style={styles.avatarText}>{partnerName.charAt(0)}</Text>
        </View>
      </View>
      <Text style={styles.coupleNames}>{myName} ♥ {partnerName}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
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
    left: 30,
    fontSize: 18,
    color: 'rgba(255,255,255,0.5)',
  },
  ddayLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  ddayCount: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 2,
  },
  startDate: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginLeft: -12,
    zIndex: 1,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  coupleNames: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default DdayCard;
