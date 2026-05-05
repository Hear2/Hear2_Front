import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, RadialGradient as SvgRadialGradient, Stop, Circle } from 'react-native-svg';
import Heart from './Heart';
import Colors from '../../constants/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Corner-only radial glows. Centers parked just outside each corner with a
// radius small enough that the falloff goes to zero well before the screen
// center, so no halo appears behind central content.
const GLOW_CONFIGS = [
  { cx: -30, cy: -30, r: 200, color: '#FF6B9D', opacity: 0.5 },
  { cx: SCREEN_W + 30, cy: -30, r: 200, color: '#C5B8FF', opacity: 0.45 },
  { cx: -30, cy: SCREEN_H + 30, r: 180, color: '#FFB590', opacity: 0.35 },
  { cx: SCREEN_W + 30, cy: SCREEN_H + 30, r: 180, color: '#FDF0F5', opacity: 0.5 },
];

// Bokeh dots — kept away from the central column where the main heart sits.
const BOKEH_CONFIGS = [
  { top: '12%', left: '8%', size: 8, opacity: 0.35 },
  { top: '22%', right: '12%', size: 6, opacity: 0.3 },
  { top: '68%', left: '8%', size: 7, opacity: 0.32 },
  { top: '72%', right: '12%', size: 10, opacity: 0.28 },
  { top: '88%', left: '20%', size: 6, opacity: 0.3 },
];

const HEART_CONFIGS = [
  { top: '8%', left: '80%', size: 14 },
  { top: '30%', left: '10%', size: 10 },
  { top: '60%', left: '85%', size: 12 },
  { top: '78%', left: '40%', size: 9 },
];

const SPARKLE_CONFIGS = [
  { top: '18%', left: '60%', size: 16 },
  { top: '45%', left: '5%', size: 14 },
  { top: '65%', left: '75%', size: 12 },
  { top: '35%', left: '88%', size: 10 },
];

const Sparkle = ({ size = 16, color = Colors.pinkSoft, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M12 1 L13.4 9.6 L22 11 L13.4 12.4 L12 22 L10.6 12.4 L2 11 L10.6 9.6 Z"
      fill={color}
    />
  </Svg>
);

const RadialGlow = ({ cx, cy, r, color, opacity }) => {
  const id = `g-${cx}-${cy}-${r}`;
  return (
    <Svg
      width={r * 2}
      height={r * 2}
      style={{ position: 'absolute', left: cx - r, top: cy - r }}
      pointerEvents="none"
    >
      <Defs>
        <SvgRadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <Stop offset="60%" stopColor={color} stopOpacity={opacity * 0.4} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </SvgRadialGradient>
      </Defs>
      <Circle cx={r} cy={r} r={r} fill={`url(#${id})`} />
    </Svg>
  );
};

const LovelyBackground = ({
  intensity = 1,
  hearts = true,
  sparkles = true,
  blobs = true,
  blurAmount = 40,
}) => {
  const shimmer = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ]),
    );
    const driftAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ]),
    );
    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0, duration: 5000, useNativeDriver: true }),
      ]),
    );
    shimmerAnim.start();
    driftAnim.start();
    glowAnim.start();
    return () => {
      shimmerAnim.stop();
      driftAnim.stop();
      glowAnim.stop();
    };
  }, [shimmer, drift, glowPulse]);

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4 * intensity, 0.9 * intensity],
  });

  const driftY = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14 * intensity],
  });

  const glowScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85 * intensity, 1 * intensity],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Radial glow blobs (true falloff via SVG) */}
      {blobs && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { opacity: glowOpacity, transform: [{ scale: glowScale }] },
          ]}
        >
          {GLOW_CONFIGS.map((g, i) => (
            <RadialGlow key={`glow-${i}`} {...g} />
          ))}
        </Animated.View>
      )}

      {/* Subtle white wash to keep contrast for content above */}
      <LinearGradient
        colors={['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.0)']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      {/* Bokeh dots */}
      {BOKEH_CONFIGS.map((dot, i) => (
        <Animated.View
          key={`bokeh-${i}`}
          style={[
            styles.bokeh,
            {
              top: dot.top,
              left: dot.left,
              right: dot.right,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              opacity: shimmerOpacity,
              backgroundColor: Colors.pinkSoft,
              shadowColor: Colors.pink,
              shadowOpacity: 0.6,
              shadowRadius: dot.size,
              shadowOffset: { width: 0, height: 0 },
              elevation: 4,
            },
          ]}
        />
      ))}

      {/* Floating hearts */}
      {hearts &&
        HEART_CONFIGS.map((h, i) => (
          <Animated.View
            key={`heart-${i}`}
            style={[
              styles.floatingElement,
              {
                top: h.top,
                left: h.left,
                transform: [{ translateY: driftY }],
                opacity: 0.45 * intensity,
              },
            ]}
          >
            <Heart size={h.size} color={Colors.pinkSoft} />
          </Animated.View>
        ))}

      {/* Sparkles */}
      {sparkles &&
        SPARKLE_CONFIGS.map((s, i) => (
          <Animated.View
            key={`sparkle-${i}`}
            style={[
              styles.floatingElement,
              {
                top: s.top,
                left: s.left,
                transform: [{ translateY: driftY }],
                opacity: shimmerOpacity,
              },
            ]}
          >
            <Sparkle size={s.size} color={Colors.pinkSoft} />
          </Animated.View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bokeh: {
    position: 'absolute',
  },
  floatingElement: {
    position: 'absolute',
  },
});

export default LovelyBackground;
