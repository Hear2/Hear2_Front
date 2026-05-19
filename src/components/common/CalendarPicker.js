import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import colors from '../../constants/colors';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const CURRENT_YEAR = new Date().getFullYear();

export default function CalendarPicker({
  visible,
  value,
  onClose,
  onSelect,
  minYear = 1950,
  maxYear = CURRENT_YEAR + 5,
}) {
  const initial = value ?? new Date();
  const [view, setView] = useState({
    y: initial.getFullYear(),
    m: initial.getMonth(),
  });
  const [mode, setMode] = useState('days'); // 'days' | 'years'
  const yearScrollRef = useRef(null);

  // 모달 열릴 때마다 현재 value 기준으로 view를 동기화
  useEffect(() => {
    if (visible) {
      const v = value ?? new Date();
      setView({ y: v.getFullYear(), m: v.getMonth() });
      setMode('days');
    }
  }, [visible, value]);

  const today = new Date();
  const startDow = new Date(view.y, view.m, 1).getDay();
  const total = daysInMonth(view.y, view.m);

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const goPrev = () =>
    setView(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }));
  const goNext = () =>
    setView(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }));

  const select = (d) => {
    if (d == null) return;
    onSelect?.(new Date(view.y, view.m, d));
    onClose?.();
  };

  const safeMin = Math.min(minYear, maxYear);
  const safeMax = Math.max(minYear, maxYear);
  const years = [];
  // 최신 연도가 위로 오도록 내림차순
  for (let y = safeMax; y >= safeMin; y--) years.push(y);

  const pickYear = (y) => {
    setView((v) => ({ ...v, y }));
    setMode('days');
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={goPrev}
              style={[styles.navBtn, mode === 'years' && styles.navBtnHidden]}
              hitSlop={8}
              disabled={mode === 'years'}
            >
              <Text style={styles.navIcon}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.titleBtn}
              activeOpacity={0.7}
              onPress={() => setMode(mode === 'years' ? 'days' : 'years')}
              hitSlop={8}
            >
              <Text style={styles.title}>
                {view.y}년 {view.m + 1}월
              </Text>
              <Text style={[styles.titleChevron, mode === 'years' && styles.titleChevronUp]}>
                ▾
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goNext}
              style={[styles.navBtn, mode === 'years' && styles.navBtnHidden]}
              hitSlop={8}
              disabled={mode === 'years'}
            >
              <Text style={styles.navIcon}>›</Text>
            </TouchableOpacity>
          </View>

          {mode === 'years' ? (
            <ScrollView
              ref={yearScrollRef}
              style={styles.yearScroll}
              contentContainerStyle={styles.yearGrid}
              showsVerticalScrollIndicator={false}
              onLayout={() => {
                // 선택된 연도가 보이도록 대략 스크롤
                const idx = years.indexOf(view.y);
                if (idx < 0) return;
                const rowH = 44;
                const rowIdx = Math.floor(idx / 3);
                const offset = Math.max(0, rowH * rowIdx - 60);
                yearScrollRef.current?.scrollTo({ y: offset, animated: false });
              }}
            >
              {years.map((y) => {
                const selected = y === view.y;
                return (
                  <TouchableOpacity
                    key={y}
                    style={[styles.yearCell, selected && styles.yearCellSelected]}
                    activeOpacity={0.7}
                    onPress={() => pickYear(y)}
                  >
                    <Text
                      style={[
                        styles.yearText,
                        selected && styles.yearTextSelected,
                      ]}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <>
          <View style={styles.dowRow}>
            {DAY_LABELS.map((d, i) => (
              <Text
                key={d}
                style={[
                  styles.dow,
                  i === 0 && styles.dowSun,
                  i === 6 && styles.dowSat,
                ]}
              >
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((d, i) => {
              if (d == null) {
                return <View key={`e-${i}`} style={styles.cell} />;
              }
              const cellDate = new Date(view.y, view.m, d);
              const sel = isSameDay(cellDate, value);
              const isToday = isSameDay(cellDate, today);
              const dow = cellDate.getDay();
              return (
                <TouchableOpacity
                  key={d}
                  style={styles.cell}
                  onPress={() => select(d)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.cellInner,
                      sel && styles.cellSelected,
                      !sel && isToday && styles.cellToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellText,
                        dow === 0 && !sel && styles.cellTextSun,
                        dow === 6 && !sel && styles.cellTextSat,
                        sel && styles.cellTextSelected,
                      ]}
                    >
                      {d}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pinkTint,
  },
  navBtnHidden: { opacity: 0 },
  navIcon: {
    fontSize: 22,
    color: colors.pinkDeep,
    fontWeight: '600',
    lineHeight: 22,
  },
  titleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  title: { fontSize: 15, fontWeight: '800', color: colors.ink },
  titleChevron: { fontSize: 12, color: colors.ink3, marginTop: 1 },
  titleChevronUp: { transform: [{ rotate: '180deg' }] },
  yearScroll: { maxHeight: 280 },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 4,
    paddingBottom: 8,
  },
  yearCell: {
    width: `${100 / 3}%`,
    paddingVertical: 10,
    alignItems: 'center',
  },
  yearCellSelected: {},
  yearText: {
    fontSize: 14,
    color: colors.ink2,
    fontWeight: '600',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  yearTextSelected: {
    color: '#fff',
    backgroundColor: colors.heartRed,
    fontWeight: '800',
  },
  dowRow: { flexDirection: 'row', marginBottom: 6 },
  dow: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: colors.ink3,
    fontWeight: '700',
    paddingVertical: 6,
  },
  dowSun: { color: colors.heartRed },
  dowSat: { color: colors.blue },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    paddingVertical: 4,
    alignItems: 'center',
  },
  cellInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: { backgroundColor: colors.heartRed },
  cellToday: { borderWidth: 1, borderColor: colors.pink },
  cellText: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  cellTextSun: { color: colors.heartRed },
  cellTextSat: { color: colors.blue },
  cellTextSelected: { color: '#fff', fontWeight: '700' },
});
