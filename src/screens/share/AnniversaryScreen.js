import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PINK = '#FF6B9D';
const PINK_TINT = '#FDF0F5';
const INK = '#1E2152';
const INK_MUTE = '#AAAAAA';

const INITIAL_ANNIVERSARIES = [
  { id: '1', title: '처음 만난 날', date: '2025-09-03', emoji: '💕' },
  { id: '2', title: '100일', date: '2025-12-12', emoji: '💯' },
  { id: '3', title: '200일', date: '2026-03-22', emoji: '🎉' },
  { id: '4', title: '1주년', date: '2026-09-03', emoji: '🎂' },
];

export default function AnniversaryScreen({ navigation }) {
  const [anniversaries, setAnniversaries] = useState(INITIAL_ANNIVERSARIES);

  const handleDelete = (id) => {
    Alert.alert('삭제', '이 기념일을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () =>
          setAnniversaries((prev) => prev.filter((a) => a.id !== id)),
      },
    ]);
  };

  const getDaysUntil = (dateStr) => {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)}일 전`;
    if (diff === 0) return '오늘';
    return `D-${diff}`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>기념일 관리</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {anniversaries.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.emojiBox}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDate}>{item.date}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.dday}>{getDaysUntil(item.date)}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ 기념일 추가</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 28,
    color: INK,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
  },
  headerRight: {
    width: 36,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINK_TINT,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  emoji: {
    fontSize: 22,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 13,
    color: INK_MUTE,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  dday: {
    fontSize: 14,
    fontWeight: '700',
    color: PINK,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 4,
    marginLeft: 4,
  },
  editIcon: {
    fontSize: 16,
  },
  deleteIcon: {
    fontSize: 16,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  addButton: {
    backgroundColor: PINK,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
