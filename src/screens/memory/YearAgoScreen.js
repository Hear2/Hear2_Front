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
import Header from '../../components/common/Header';

const TAGS = ['#서울숲', '#봄나들이', '#데이트'];

const STATS = [
  { value: '12개', label: '채팅 메시지' },
  { value: '😊 88%', label: '긍정 감정' },
  { value: '8장', label: '사진 기록' },
];

export default function YearAgoScreen({ navigation }) {
  return (
    <LinearGradient colors={['#FFF5F8', '#FFFFFF']} style={styles.container}>
      <Header
        title="1년 전 오늘"
        showBack
        onBack={() => navigation?.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Date */}
        <Text style={styles.date}>2025년 4월 7일 · 월요일</Text>

        {/* Big Photo Placeholder */}
        <View style={styles.photoWrapper}>
          <LinearGradient
            colors={[colors.pinkSoft, colors.pinkTint]}
            style={styles.photoPlaceholder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.photoEmoji}>🌸</Text>
          </LinearGradient>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>📅 1년 전</Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagRow}>
          {TAGS.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Stats Row */}
        <View style={styles.statsCard}>
          {STATS.map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* AI Recall Card */}
        <View style={styles.recallCard}>
          <Text style={styles.recallIcon}>🤖</Text>
          <View style={styles.recallBody}>
            <Text style={styles.recallTitle}>AI 회상</Text>
            <Text style={styles.recallText}>
              1년 전 이날, 두 분은 서울숲에서 가장 행복한 봄날을 보냈어요 🌸
            </Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.pink, colors.pinkDeep]}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaText}>📤 추억 공유하기</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  date: { fontSize: 13, color: colors.ink3, marginBottom: 16 },

  photoWrapper: { marginBottom: 16, position: 'relative' },
  photoPlaceholder: { height: 270, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  photoEmoji: { fontSize: 56 },
  badge: { position: 'absolute', top: 14, left: 14, backgroundColor: colors.bgApp, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.ink2 },

  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tag: { backgroundColor: colors.pinkTint, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { fontSize: 13, color: colors.pink, fontWeight: '600' },

  statsCard: { backgroundColor: colors.pinkTint, borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  statLabel: { fontSize: 11, color: colors.ink3 },

  recallCard: { backgroundColor: colors.pinkTint, borderRadius: 16, padding: 18, flexDirection: 'row', borderLeftWidth: 4, borderLeftColor: colors.pink, marginBottom: 24 },
  recallIcon: { fontSize: 24, marginRight: 12 },
  recallBody: { flex: 1 },
  recallTitle: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 6 },
  recallText: { fontSize: 14, color: colors.ink2, lineHeight: 22 },

  ctaButton: { borderRadius: 14, overflow: 'hidden' },
  ctaGradient: { paddingVertical: 16, alignItems: 'center' },
  ctaText: { fontSize: 16, fontWeight: '700', color: colors.bgApp },
});
