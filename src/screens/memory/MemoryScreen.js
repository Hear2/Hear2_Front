import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';
import Heart from '../../components/common/Heart';

const MemoryScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <LovelyBackground intensity={0.5} hearts sparkles />
      <Header title="추억" showBack onBack={() => navigation?.goBack()} />

      <View style={styles.content}>
        <Heart size={64} color={colors.pinkSoft} pulse />
        <Text style={styles.title}>추억 기능 준비 중</Text>
        <Text style={styles.subtitle}>
          소중한 순간들을 모아볼 수 있는{'\n'}추억 기능이 곧 찾아옵니다
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 24,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: colors.inkMute,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default MemoryScreen;
