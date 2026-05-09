import React, { useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

const ITEM_HEIGHT = 36;
const VISIBLE_COUNT = 5;

export default function WheelPicker({ items, value, onChange, width = 80 }) {
  const ref = useRef(null);
  const index = Math.max(
    0,
    items.findIndex((it) => it === value),
  );

  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
    }, 50);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <View
      style={{
        height: ITEM_HEIGHT * VISIBLE_COUNT,
        width,
        overflow: 'hidden',
      }}
    >
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          const clamped = Math.max(0, Math.min(items.length - 1, idx));
          onChange?.(items[clamped]);
        }}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
      >
        {items.map((it, i) => (
          <View key={i} style={styles.item}>
            <Text style={[styles.text, i === index && styles.textActive]}>
              {it}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

WheelPicker.ITEM_HEIGHT = ITEM_HEIGHT;
WheelPicker.VISIBLE_COUNT = VISIBLE_COUNT;

const styles = StyleSheet.create({
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 20, color: '#BBB', fontWeight: '500' },
  textActive: { color: colors.ink, fontWeight: '700' },
});
