import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import WheelPicker from './WheelPicker';
import colors from '../../constants/colors';

const AMPM = ['오전', '오후'];
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, '0'),
);

const ITEM_HEIGHT = WheelPicker.ITEM_HEIGHT;

const breakdown = (date) => {
  const d = date ?? new Date();
  const ampm = d.getHours() < 12 ? '오전' : '오후';
  const hour = String(d.getHours() % 12 || 12);
  const m5 = (Math.round(d.getMinutes() / 5) * 5) % 60;
  const minute = String(m5).padStart(2, '0');
  return { ampm, hour, minute };
};

export default function TimePicker({ visible, value, onClose, onSelect }) {
  const init = breakdown(value);
  const [ampm, setAmpm] = useState(init.ampm);
  const [hour, setHour] = useState(init.hour);
  const [minute, setMinute] = useState(init.minute);

  useEffect(() => {
    if (!visible) return;
    const b = breakdown(value);
    setAmpm(b.ampm);
    setHour(b.hour);
    setMinute(b.minute);
  }, [visible, value]);

  const confirm = () => {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    const h24 = ampm === '오후' ? (h % 12) + 12 : h % 12;
    const next = new Date(value ?? new Date());
    next.setHours(h24, m, 0, 0);
    onSelect?.(next);
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
            <Text style={styles.title}>시간 선택</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.wheelArea}>
            <View pointerEvents="none" style={styles.indicator} />
            <View style={styles.wheelRow}>
              <WheelPicker items={AMPM} value={ampm} onChange={setAmpm} width={70} />
              <WheelPicker items={HOURS} value={hour} onChange={setHour} width={56} />
              <WheelPicker items={MINUTES} value={minute} onChange={setMinute} width={64} />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn} activeOpacity={0.7}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirm} style={styles.confirmBtn} activeOpacity={0.85}>
              <Text style={styles.confirmText}>확인</Text>
            </TouchableOpacity>
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
  title: { fontSize: 15, fontWeight: '800', color: colors.ink },
  close: { fontSize: 16, color: colors.inkMute, fontWeight: '600' },
  wheelArea: { position: 'relative', alignItems: 'center' },
  indicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  wheelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  cancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 13, color: colors.ink3, fontWeight: '700' },
  confirmBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.heartRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { fontSize: 13, color: '#fff', fontWeight: '700' },
});
