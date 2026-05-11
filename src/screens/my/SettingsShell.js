import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';

const SettingsShell = ({
  navigation,
  title,
  rightLabel,
  onRightPress,
  children,
  contentStyle,
}) => (
  <View style={styles.container}>
    <LinearGradient
      colors={['#FFFAFC', '#FFF5F8']}
      style={StyleSheet.absoluteFill}
    />
    <LovelyBackground intensity={0.3} hearts={false} sparkles={false} />

    <Header
      title={title}
      showBack
      onBack={() => navigation?.goBack()}
      right={
        rightLabel ? (
          <TouchableOpacity onPress={onRightPress} hitSlop={8}>
            <Text style={styles.rightLabel}>{rightLabel}</Text>
          </TouchableOpacity>
        ) : null
      }
      style={{ backgroundColor: 'transparent' }}
    />

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scroll, contentStyle]}
    >
      {children}
      <View style={{ height: 24 }} />
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFAFC' },
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  rightLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.heartRed,
  },
});

export default SettingsShell;
