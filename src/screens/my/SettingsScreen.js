import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';

const SettingsScreen = ({ navigation }) => {
  const [toggles, setToggles] = useState({
    chatNotif: true,
    qaNotif: true,
    memoryNotif: true,
    locationNotif: false,
    faceId: true,
    locationShare: true,
  });

  const toggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderRow = ({ emoji, label, value, onPress, toggleKey, danger }) => (
    <TouchableOpacity
      style={styles.settingRow}
      activeOpacity={onPress ? 0.6 : 1}
      onPress={onPress}
    >
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
      <View style={styles.rowRight}>
        {toggleKey != null ? (
          <Switch
            value={toggles[toggleKey]}
            onValueChange={() => toggle(toggleKey)}
            trackColor={{ false: colors.line, true: colors.pinkSoft }}
            thumbColor={toggles[toggleKey] ? colors.pink : '#F4F4F4'}
          />
        ) : value ? (
          <Text style={styles.rowValue}>{value}</Text>
        ) : (
          <Text style={styles.chevron}>{'>'}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title, rows) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {rows.map((row, idx) => (
          <View key={idx}>
            {idx > 0 && <View style={styles.divider} />}
            {renderRow(row)}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LovelyBackground intensity={0.4} hearts={false} sparkles={false} />
      <Header
        title="설정"
        showBack
        onBack={() => navigation?.goBack()}
        right={
          <TouchableOpacity>
            <Text style={styles.moreIcon}>{'...'}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {renderSection('연인', [
          { emoji: '💞', label: '연결된 연인 관리', value: '지호' },
          { emoji: '🎂', label: '기념일 설정', value: '3개' },
          { emoji: '✨', label: '우리만의 호칭', value: '자기야' },
        ])}

        {renderSection('알림', [
          { emoji: '💬', label: '채팅 알림', toggleKey: 'chatNotif' },
          { emoji: '❓', label: 'Q&A 알림', toggleKey: 'qaNotif' },
          { emoji: '🌸', label: '1년 전 오늘', toggleKey: 'memoryNotif' },
          { emoji: '📍', label: '위치 알림', toggleKey: 'locationNotif' },
          { emoji: '🌙', label: '방해금지 시간', value: '23:00~07:00' },
        ])}

        {renderSection('개인정보 · 보안', [
          { emoji: '🔒', label: 'Face ID', toggleKey: 'faceId' },
          { emoji: '📍', label: '위치 공유', toggleKey: 'locationShare' },
          { emoji: '🔐', label: '비밀번호 변경' },
          { emoji: '📋', label: '데이터 다운로드' },
        ])}

        {renderSection('일반', [
          { emoji: '🎨', label: '테마', value: '라이트' },
          { emoji: '🌐', label: '언어', value: '한국어' },
          { emoji: '❓', label: '도움말' },
          { emoji: '📜', label: '이용약관' },
          { emoji: 'ℹ️', label: '버전', value: '1.0.0' },
        ])}

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#FF6B6B' }]}>위험 영역</Text>
          <View style={styles.sectionCard}>
            {renderRow({ emoji: '🚪', label: '로그아웃', danger: true, onPress: () => {} })}
            <View style={styles.divider} />
            {renderRow({ emoji: '💔', label: '연인 연결 해제', danger: true, onPress: () => {} })}
            <View style={styles.divider} />
            {renderRow({ emoji: '🗑️', label: '계정 삭제', danger: true, onPress: () => {} })}
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  moreIcon: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink2,
    letterSpacing: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkMute,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: colors.bgApp,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowEmoji: {
    fontSize: 20,
    marginRight: 14,
    width: 28,
    textAlign: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink,
  },
  dangerText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 14,
    color: colors.inkMute,
    marginRight: 6,
  },
  chevron: {
    fontSize: 16,
    color: colors.inkMute,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line2,
    marginLeft: 58,
  },
});

export default SettingsScreen;
