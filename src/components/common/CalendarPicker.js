import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
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

export default function CalendarPicker({ visible, value, onClose, onSelect }) {
  const initial = value ?? new Date();
  const [view, setView] = useState({
    y: initial.getFullYear(),
    m: initial.getMonth(),
  });

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
            <TouchableOpacity onPress={goPrev} style={styles.navBtn} hitSlop={8}>
              <Text style={styles.navIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {view.y}년 {view.m + 1}월
            </Text>
            <TouchableOpacity onPress={goNext} style={styles.navBtn} hitSlop={8}>
              <Text style={styles.navIcon}>›</Text>
            </TouchableOpacity>
          </View>

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
  navIcon: {
    fontSize: 22,
    color: colors.pinkDeep,
    fontWeight: '600',
    lineHeight: 22,
  },
  title: { fontSize: 15, fontWeight: '800', color: colors.ink },
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
