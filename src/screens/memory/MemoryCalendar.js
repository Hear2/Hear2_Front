import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PINK = '#FF6B9D';
const PINK_TINT = '#FDF0F5';
const INK = '#1E2152';
const INK_MUTE = '#AAAAAA';

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// Sample memory data: days in April 2026 that have memories
const MEMORY_DAYS = {
  3: [
    { id: '1', title: '카페에서 커피 한 잔', time: '14:30', hasPhoto: true },
  ],
  7: [
    { id: '2', title: '한강 산책', time: '18:00', hasPhoto: true },
    { id: '3', title: '같이 만든 저녁', time: '20:30', hasPhoto: false },
  ],
  14: [
    { id: '4', title: '발렌타인 데이트', time: '12:00', hasPhoto: true },
  ],
  20: [
    { id: '5', title: '결혼식 참석', time: '11:00', hasPhoto: true },
  ],
  25: [
    { id: '6', title: '영화 관람', time: '19:00', hasPhoto: false },
  ],
};

// April 2026 starts Wednesday (index 3), 30 days
const MONTH_START_INDEX = 3;
const DAYS_IN_MONTH = 30;

export default function MemoryCalendar({ navigation }) {
  const [selectedDay, setSelectedDay] = useState(7);

  const renderCalendarCells = () => {
    const cells = [];
    const totalCells = 35;

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - MONTH_START_INDEX + 1;
      const isValid = dayNum >= 1 && dayNum <= DAYS_IN_MONTH;
      const isSelected = dayNum === selectedDay;
      const hasMemory = MEMORY_DAYS[dayNum];

      cells.push(
        <TouchableOpacity
          key={i}
          style={styles.calendarCell}
          onPress={() => isValid && setSelectedDay(dayNum)}
          activeOpacity={isValid ? 0.6 : 1}
        >
          {isValid && (
            <View style={styles.cellContent}>
              <View
                style={[styles.dayCircle, isSelected && styles.selectedCircle]}
              >
                <Text
                  style={[styles.dayText, isSelected && styles.selectedDayText]}
                >
                  {dayNum}
                </Text>
              </View>
              {hasMemory && (
                <View
                  style={[
                    styles.memoryDot,
                    isSelected && styles.memoryDotSelected,
                  ]}
                />
              )}
            </View>
          )}
        </TouchableOpacity>
      );
    }
    return cells;
  };

  const selectedMemories = MEMORY_DAYS[selectedDay] || [];

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
        <Text style={styles.headerTitle}>추억 캘린더</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Month title */}
        <Text style={styles.monthTitle}>2026년 4월</Text>

        {/* Week header */}
        <View style={styles.weekHeader}>
          {DAYS_OF_WEEK.map((d, i) => (
            <View key={i} style={styles.weekCell}>
              <Text style={styles.weekText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>{renderCalendarCells()}</View>

        {/* Selected day memories */}
        <View style={styles.memoriesSection}>
          <Text style={styles.memoriesTitle}>
            4월 {selectedDay}일의 추억
          </Text>
          {selectedMemories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📷</Text>
              <Text style={styles.emptyText}>이 날의 추억이 없어요</Text>
              <TouchableOpacity style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>추억 추가하기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            selectedMemories.map((memory) => (
              <TouchableOpacity key={memory.id} style={styles.memoryCard}>
                {memory.hasPhoto && (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoIcon}>🖼️</Text>
                  </View>
                )}
                <View style={styles.memoryInfo}>
                  <Text style={styles.memoryTitle}>{memory.title}</Text>
                  <Text style={styles.memoryTime}>{memory.time}</Text>
                </View>
                <Text style={styles.memoryArrow}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: INK,
    marginTop: 20,
    marginBottom: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekText: {
    fontSize: 13,
    fontWeight: '600',
    color: INK_MUTE,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellContent: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    backgroundColor: PINK,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: INK,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  memoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PINK,
    marginTop: 3,
  },
  memoryDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  memoriesSection: {
    marginTop: 28,
    paddingBottom: 40,
  },
  memoriesTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: INK,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: INK_MUTE,
    marginBottom: 16,
  },
  emptyBtn: {
    backgroundColor: PINK_TINT,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: PINK,
  },
  memoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINK_TINT,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  photoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  photoIcon: {
    fontSize: 24,
  },
  memoryInfo: {
    flex: 1,
  },
  memoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: INK,
    marginBottom: 4,
  },
  memoryTime: {
    fontSize: 13,
    color: INK_MUTE,
  },
  memoryArrow: {
    fontSize: 22,
    color: INK_MUTE,
    marginLeft: 8,
  },
});
