import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Colors from '../../constants/colors';

const Heart = ({ size = 24, color = Colors.heartRed, pulse = false, style }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulse) {
      scale.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.18,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.96,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.10,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [pulse, scale]);

  const heartSvg = (
    <Svg width={size} height={size} viewBox="-2 -2 36 34">
      <Path
        d="M16 28C5 20 1 14 1 8.5A7.5 7.5 0 0 1 16 4 7.5 7.5 0 0 1 31 8.5C31 14 27 20 16 28z"
        fill={color}
      />
    </Svg>
  );

  if (!pulse) {
    return <Animated.View style={[styles.container, style]}>{heartSvg}</Animated.View>;
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }, style]}>
      {heartSvg}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Heart;
