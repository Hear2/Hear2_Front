import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { fetchCalendar, fetchMemoriesByDate } from '../../api/memoryAPI';

const PINK = '#FF6B9D';
const PINK_TINT = '#FDF0F5';
const INK = '#1E2152';
const INK_MUTE = '#AAAAAA';

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// "2026-05-25" 형태로 직렬화 (Date → ISO YMD)
function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysInMonth(year, month /* 1-12 */) {
  return new Date(year, month, 0).getDate();
}

function startWeekday(year, month) {
  // 0(일) ~ 6(토)
  return new Date(year, month - 1, 1).getDay();
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function MemoryCalendar({ navigation }) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  // BE에서 받은 달력 데이터: { "2026-05-15": { memoryCount, thumbnails, dominantEmoji }, ... }
  const [calendarDays, setCalendarDays] = useState({});
  const [calendarLoading, setCalendarLoading] = useState(false);

  // 선택한 날짜의 메모리 목록 (MemoryResponse[])
  const [dayMemories, setDayMemories] = useState([]);
  const [dayLoading, setDayLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const monthStart = startWeekday(year, month);
  const daysCount = daysInMonth(year, month);

  const loadCalendar = useCallback(async () => {
    setCalendarLoading(true);
    try {
      const res = await fetchCalendar(year, month);
      const map = {};
      (res?.days || []).forEach((d) => {
        // d.date는 "yyyy-MM-dd"
        map[d.date] = d;
      });
      setCalendarDays(map);
    } catch (_) {
      setCalendarDays({});
    } finally {
      setCalendarLoading(false);
    }
  }, [year, month]);

  const loadDay = useCallback(async (date) => {
    setDayLoading(true);
    try {
      const list = await fetchMemoriesByDate(date);
      setDayMemories(list || []);
    } catch (_) {
      setDayMemories([]);
    } finally {
      setDayLoading(false);
    }
  }, []);

  // 월 바뀌면 캘린더 재조회
  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  // 선택일 바뀌면 그 날 메모리 재조회
  useEffect(() => {
    const dateStr = ymd(new Date(year, month - 1, selectedDay));
    loadDay(dateStr);
  }, [year, month, selectedDay, loadDay]);

  // 화면 포커스 시 (업로드 후 돌아온 경우 등) 최신화
  useFocusEffect(
    useCallback(() => {
      loadCalendar();
      const dateStr = ymd(new Date(year, month - 1, selectedDay));
      loadDay(dateStr);
    }, [loadCalendar, loadDay, year, month, selectedDay]),
  );

  const onPullRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadCalendar(),
        loadDay(ymd(new Date(year, month - 1, selectedDay))),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [loadCalendar, loadDay, year, month, selectedDay]);

  const gotoPrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
    setSelectedDay(1);
  };

  const gotoNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDay(1);
  };

  const renderCalendarCells = () => {
    const cells = [];
    const totalCells = Math.ceil((monthStart + daysCount) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - monthStart + 1;
      const isValid = dayNum >= 1 && dayNum <= daysCount;
      const isSelected = isValid && dayNum === selectedDay;
      const dateStr = isValid ? ymd(new Date(year, month - 1, dayNum)) : null;
      const hasMemory = isValid && calendarDays[dateStr];

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

  const onTapMemory = (memory) => {
    navigation?.navigate?.('PhotoDetail', { memory });
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
        <Text style={styles.headerTitle}>추억 캘린더</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onPullRefresh}
            tintColor={PINK}
            colors={[PINK]}
          />
        }
      >
        {/* Month nav + title */}
        <View style={styles.monthNavRow}>
          <TouchableOpacity onPress={gotoPrevMonth} hitSlop={8}>
            <Text style={styles.monthNavChev}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {year}년 {month}월
            {calendarLoading && (
              <Text style={styles.monthLoading}>  …</Text>
            )}
          </Text>
          <TouchableOpacity onPress={gotoNextMonth} hitSlop={8}>
            <Text style={styles.monthNavChev}>›</Text>
          </TouchableOpacity>
        </View>

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
            {month}월 {selectedDay}일의 추억
          </Text>
          {dayLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={PINK} />
            </View>
          ) : dayMemories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📷</Text>
              <Text style={styles.emptyText}>이 날의 추억이 없어요</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation?.navigate?.('PhotoUpload')}
              >
                <Text style={styles.emptyBtnText}>추억 추가하기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            dayMemories.map((memory) => (
              <TouchableOpacity
                key={memory.id}
                style={styles.memoryCard}
                onPress={() => onTapMemory(memory)}
              >
                {memory.photoUrl ? (
                  <Image
                    source={{ uri: memory.photoUrl }}
                    style={styles.photoThumb}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoIcon}>🖼️</Text>
                  </View>
                )}
                <View style={styles.memoryInfo}>
                  <Text style={styles.memoryTitle} numberOfLines={1}>
                    {memory.memo || '제목 없음'}
                  </Text>
                  <Text style={styles.memoryTime}>
                    {formatTime(memory.metadata?.takenAt || memory.createdAt)}
                  </Text>
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
  },
  monthLoading: {
    fontSize: 14,
    color: INK_MUTE,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  monthNavChev: {
    fontSize: 26,
    color: INK,
    fontWeight: '300',
    paddingHorizontal: 12,
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
  photoThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
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
