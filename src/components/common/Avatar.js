import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import colors from '../../constants/colors';
import { givenName } from '../../utils/name';

// 프로필 아바타.
// - uri(프로필 사진)가 있으면 사진을 둥글게 표시
// - 없으면 이름에서 성을 뗀 뒤 앞글자(예: "황욱자" → "욱자" → "욱")를 표시
export default function Avatar({
  uri,
  name,
  size = 36,
  fontSize,
  bg = colors.blue,
  textColor = '#FFFFFF',
  style,
}) {
  const dim = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.base, dim, style]} />;
  }

  const given = givenName(name) || '';
  const initial = given ? Array.from(given)[0] : '👤';
  return (
    <View style={[styles.base, dim, { backgroundColor: bg }, style]}>
      <Text
        style={{
          color: textColor,
          fontWeight: '700',
          fontSize: fontSize || Math.round(size * 0.42),
        }}
      >
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
