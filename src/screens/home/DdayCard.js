import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../constants/colors';
import { fetchCharacter } from '../../api/characterAPI';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/common/Avatar';

const DdayCard = ({
  daysCount = null,
  startDate = '',
  myName = '나',
  partnerName = '연인',
  onCharacterPress,
}) => {
  // 프로필 사진 표시용 (이름 props는 이미 성 제거된 값이라 원본 닉네임은 컨텍스트에서)
  const { user, partner } = useAuth();
  const heartAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0.3)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const [character, setCharacter] = useState(null);

  // 홈이 포커스될 때마다 재조회 → 캐릭터 화면에서 이름을 바꾸고 돌아오면 즉시 반영된다.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      fetchCharacter()
        .then((res) => {
          if (alive) setCharacter(res);
        })
        .catch(() => {});
      return () => {
        alive = false;
      };
    }, [])
  );

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
          {character && (
            <Image
              source={character.image}
              style={styles.characterImage}
              resizeMode="contain"
            />
          )}
        </Animated.View>
        <View style={styles.levelPill}>
          <Text style={styles.levelText} numberOfLines={1}>
            {character ? character.name : ''}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Right: Existing content — 커플 시작일이 있을 때만 D-day/시작일 표시 */}
      <View style={styles.infoCol}>
        <Text style={styles.ddayLabel}>♥ 함께한 지</Text>
        {daysCount != null ? (
          <>
            <Text style={styles.ddayCount}>D+{daysCount}</Text>
            {startDate ? <Text style={styles.startDate}>{startDate} ~</Text> : null}
          </>
        ) : (
          <Text style={styles.startDate}>시작일을 등록해보세요</Text>
        )}

        <View style={styles.avatarRow}>
          <Avatar
            uri={user?.profileImage}
            name={user?.nickname || myName}
            size={36}
            bg="rgba(255,255,255,0.3)"
            textColor="#FFFFFF"
            style={[styles.avatarLeft, { borderWidth: 2, borderColor: '#FFFFFF' }]}
          />
          <Avatar
            uri={partner?.profileImage}
            name={partner?.nickname || partnerName}
            size={36}
            bg="rgba(255,255,255,0.3)"
            textColor="#FFFFFF"
            style={[styles.avatarRight, { borderWidth: 2, borderColor: '#FFFFFF' }]}
          />
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
    width: 136,
    height: 136,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  characterImage: {
    width: 124,
    height: 132,
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
