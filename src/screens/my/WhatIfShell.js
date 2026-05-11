import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';

const BackArrow = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={colors.ink}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const WhatIfShell = ({
  navigation,
  tag,
  tagIcon,
  tagTint,
  tagColor,
  title,
  bgFrom = '#FFFAFC',
  bgTo = '#FFF5F8',
  children,
  contentStyle,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[bgFrom, bgTo]}
        style={StyleSheet.absoluteFill}
      />
      <LovelyBackground intensity={0.4} hearts={false} />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            hitSlop={8}
            style={styles.backBtn}
          >
            <BackArrow />
          </TouchableOpacity>
          <View style={[styles.tag, { backgroundColor: tagTint }]}>
            <Text style={[styles.tagText, { color: tagColor }]}>
              {tagIcon} {tag}
            </Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, contentStyle]}
      >
        {children}
        <View style={{ height: 24 + insets.bottom }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFAFC' },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { padding: 2 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: { fontSize: 11, fontWeight: '800' },
  title: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
});

export default WhatIfShell;
