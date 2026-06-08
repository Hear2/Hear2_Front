import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';

const VISIBLE_MS = 2200;

// 화면 어디서든 가볍게 쓰는 토스트.
// 글로벌 프로바이더 없이, 화면별로 useToast()를 호출해
// { showToast, toast }를 받고 toast를 루트 말단에 렌더한다.
export function useToast() {
  const counterRef = useRef(0);
  const [message, setMessage] = useState(null); // { text, key } | null
  const showToast = useCallback((text) => {
    if (!text) return;
    counterRef.current += 1;
    setMessage({ text: String(text), key: counterRef.current });
  }, []);
  const toast = <Toast message={message} onHide={() => setMessage(null)} />;
  return { showToast, toast };
}

export default function Toast({ message, onHide }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const hideRef = useRef(onHide);
  hideRef.current = onHide;

  // message.key가 바뀔 때마다(같은 문구 재요청 포함) 다시 등장 → 유지 → 사라짐.
  const key = message?.key;
  useEffect(() => {
    if (key == null) return undefined;
    let cancelled = false;
    opacity.setValue(0);
    translateY.setValue(20);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        if (!cancelled) hideRef.current?.();
      });
    }, VISIBLE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [key, opacity, translateY]);

  if (!message) return null;
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.text}>{message.text}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 96,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  toast: {
    maxWidth: '100%',
    backgroundColor: 'rgba(30,33,82,0.95)',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 19,
  },
});
