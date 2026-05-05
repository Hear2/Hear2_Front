import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Ellipse, Line } from 'react-native-svg';
import colors from '../../constants/colors';
import Header from '../../components/common/Header';
import Heart from '../../components/common/Heart';
import Button from '../../components/common/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LocationShare = ({ navigation }) => {
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const heartPulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1.15, duration: 1500, useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(heartPulse, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="위치 공유" showBack onBack={() => navigation?.goBack()} />

      {/* Fake Map Area */}
      <View style={styles.mapArea}>
        <LinearGradient
          colors={[colors.blueTint, '#E0F0FF', colors.bgSoft]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* SVG Roads and Parks */}
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
          {/* Roads */}
          <Path d="M 0 120 Q 100 80 200 140 T 400 100" stroke="#D0D8E0" strokeWidth={8} fill="none" />
          <Path d="M 50 250 Q 150 200 250 280 T 420 220" stroke="#D0D8E0" strokeWidth={6} fill="none" />
          <Path d="M 180 0 Q 200 150 160 300 T 200 500" stroke="#D0D8E0" strokeWidth={7} fill="none" />
          <Path d="M 300 50 Q 280 180 320 300" stroke="#D0D8E0" strokeWidth={5} fill="none" />
          {/* Parks */}
          <Ellipse cx="90" cy="180" rx="45" ry="35" fill="rgba(107,203,119,0.2)" />
          <Ellipse cx="300" cy="160" rx="55" ry="40" fill="rgba(107,203,119,0.15)" />
          {/* Dashed connecting line */}
          <Line x1="120" y1="200" x2="280" y2="170" stroke={colors.pink} strokeWidth={2} strokeDasharray="8,6" opacity={0.6} />
        </Svg>

        {/* My Pin */}
        <Animated.View style={[styles.pinContainer, styles.myPin, { transform: [{ scale: breatheAnim }] }]}>
          <View style={[styles.pinDot, { backgroundColor: colors.pink }]}>
            <Text style={styles.pinEmoji}>나</Text>
          </View>
          <Text style={styles.pinLabel}>예진</Text>
        </Animated.View>

        {/* Partner Pin */}
        <View style={[styles.pinContainer, styles.partnerPin]}>
          <View style={[styles.pinDot, { backgroundColor: colors.blue }]}>
            <Text style={styles.pinEmoji}>지</Text>
          </View>
          <Text style={styles.pinLabel}>지호</Text>
        </View>

        {/* Pulsing Heart at Midpoint */}
        <Animated.View style={[styles.midpointHeart, { opacity: heartPulse }]}>
          <Heart size={20} color={colors.heartRed} pulse />
        </Animated.View>

        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomBtn}><Text style={styles.zoomText}>+</Text></TouchableOpacity>
          <TouchableOpacity style={styles.zoomBtn}><Text style={styles.zoomText}>-</Text></TouchableOpacity>
          <TouchableOpacity style={styles.zoomBtn}><Text style={styles.zoomText}>{'\u25CE'}</Text></TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        <Text style={styles.distanceText}>
          1.2km <Text style={styles.distanceHeart}>{'\u2665'}</Text> 가까워지는 중
        </Text>

        <TouchableOpacity style={styles.midpointBtn} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.pink, colors.pinkDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.midpointGradient}
          >
            <Text style={styles.midpointBtnText}>중간 지점 찾기</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.locationInfoCard}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationDetail}>
              <Text style={styles.locationName}>예진 - 서울 마포구 연남동</Text>
              <Text style={styles.locationTime}>3분 전 업데이트</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationDetail}>
              <Text style={styles.locationName}>지호 - 서울 마포구 홍대입구</Text>
              <Text style={styles.locationTime}>1분 전 업데이트</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  pinContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  myPin: {
    left: 90,
    top: 175,
  },
  partnerPin: {
    left: 255,
    top: 145,
  },
  pinDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pinEmoji: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pinLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  midpointHeart: {
    position: 'absolute',
    left: 182,
    top: 178,
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 8,
  },
  zoomBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  zoomText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink2,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.line,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  distanceText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 16,
  },
  distanceHeart: {
    color: colors.heartRed,
  },
  midpointBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  midpointGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
  },
  midpointBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  locationInfoCard: {
    backgroundColor: colors.bgSoft,
    borderRadius: 16,
    padding: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  locationDetail: {
    flex: 1,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink2,
  },
  locationTime: {
    fontSize: 12,
    color: colors.inkMute,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line2,
    marginVertical: 12,
  },
});

export default LocationShare;
