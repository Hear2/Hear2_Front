import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import SettingsShell from './SettingsShell';

const FAQS = [
  '연인을 어떻게 연결하나요?',
  'AI 판사는 어떻게 작동하나요?',
  '데이터는 어디에 저장되나요?',
  '연결을 해제하면 추억은 어떻게 되나요?',
  '구독 결제·환불 안내',
];

const HelpScreen = ({ navigation }) => (
  <SettingsShell navigation={navigation} title="도움말·문의">
    {/* search */}
    <View style={styles.search}>
      <Text style={styles.searchIcon}>🔍</Text>
      <Text style={styles.searchPlaceholder}>무엇이 궁금하신가요?</Text>
    </View>

    <Text style={styles.sectionLabel}>자주 묻는 질문</Text>
    <View style={styles.card}>
      {FAQS.map((q, i, a) => (
        <TouchableOpacity
          key={q}
          activeOpacity={0.7}
          style={[styles.faqRow, i < a.length - 1 && styles.divider]}
        >
          <View style={styles.qBadge}>
            <Text style={styles.qBadgeText}>Q</Text>
          </View>
          <Text style={styles.faqText}>{q}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </View>

    <Text style={styles.sectionLabel}>1:1 문의</Text>
    <LinearGradient
      colors={['#FFF5F8', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.contactCard}
    >
      <View style={styles.contactIcon}>
        <Text style={{ fontSize: 18, color: '#FFFFFF' }}>💬</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.contactTitle}>채팅으로 문의하기</Text>
        <Text style={styles.contactSub}>평일 10:00–19:00 · 평균 12분 응답</Text>
      </View>
      <Text style={styles.contactChevron}>›</Text>
    </LinearGradient>
  </SettingsShell>
);

const styles = StyleSheet.create({
  search: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchIcon: { fontSize: 13 },
  searchPlaceholder: { flex: 1, fontSize: 12, color: '#AAA' },

  sectionLabel: {
    marginTop: 18,
    paddingHorizontal: 4,
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 0.5,
  },
  card: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
    overflow: 'hidden',
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: '#F4EEF1' },
  qBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.pinkTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qBadgeText: { color: colors.heartRed, fontSize: 11, fontWeight: '800' },
  faqText: { flex: 1, fontSize: 13, color: colors.ink },
  chevron: { fontSize: 18, color: '#CCC', fontWeight: '600' },

  contactCard: {
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFD0E0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.heartRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTitle: { fontSize: 13, fontWeight: '800', color: colors.ink },
  contactSub: { fontSize: 10, color: '#888', marginTop: 2 },
  contactChevron: {
    fontSize: 18,
    color: colors.heartRed,
    fontWeight: '700',
  },
});

export default HelpScreen;
