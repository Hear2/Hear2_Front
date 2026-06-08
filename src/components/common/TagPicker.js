import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import colors from '../../constants/colors';

const PRESETS = [
  '데이트',
  '봄',
  '벚꽃',
  '음식',
  '여행',
  '기념일',
  '집',
  '공부',
  '운동',
  '가족',
  '친구',
];

export default function TagPicker({
  visible,
  value = [],
  onClose,
  onSelect,
}) {
  const [selected, setSelected] = useState(value);
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    if (!visible) return;
    setSelected(value);
    setCustomMode(false);
    setCustomValue('');
  }, [visible, value]);

  const allTags = useMemo(
    () => Array.from(new Set([...PRESETS, ...selected])),
    [selected],
  );

  const toggle = (t) =>
    setSelected((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  const addCustom = () => {
    const v = customValue.trim();
    if (!v) return;
    setSelected((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setCustomValue('');
    setCustomMode(false);
  };

  const confirm = () => {
    onSelect?.(selected);
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
            <Text style={styles.title}>태그 선택</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.chipsWrap}>
              {allTags.map((t) => {
                const on = selected.includes(t);
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => toggle(t)}
                    activeOpacity={0.7}
                    style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        on ? styles.chipTextOn : styles.chipTextOff,
                      ]}
                    >
                      #{t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divider} />

            {customMode ? (
              <View style={styles.customRow}>
                <Text style={styles.customIcon}>＃</Text>
                <TextInput
                  autoFocus
                  style={styles.customInput}
                  value={customValue}
                  onChangeText={setCustomValue}
                  placeholder="새 태그를 입력하세요"
                  placeholderTextColor={colors.inkMute}
                  returnKeyType="done"
                  onSubmitEditing={addCustom}
                />
                <TouchableOpacity
                  onPress={addCustom}
                  activeOpacity={0.8}
                  style={[
                    styles.customConfirm,
                    !customValue.trim() && styles.customConfirmDisabled,
                  ]}
                  disabled={!customValue.trim()}
                >
                  <Text style={styles.customConfirmText}>추가</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addRow}
                onPress={() => setCustomMode(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.addIcon}>＋</Text>
                <Text style={styles.addText}>직접 추가하기</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirm}
              style={styles.confirmBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmText}>확인 ({selected.length})</Text>
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
    maxWidth: 340,
    maxHeight: '75%',
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
  list: { flexGrow: 0 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 11 },
  chipOn: { backgroundColor: '#FFE4EE' },
  chipOff: { backgroundColor: '#F5F5F5' },
  chipText: { fontSize: 12, fontWeight: '600' },
  chipTextOn: { color: colors.pinkDeep, fontWeight: '700' },
  chipTextOff: { color: '#888' },
  divider: { height: 1, backgroundColor: colors.line2, marginVertical: 12 },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.pinkSoft,
    borderStyle: 'dashed',
    backgroundColor: '#FFF5F8',
  },
  addIcon: {
    fontSize: 18,
    color: colors.pinkDeep,
    width: 22,
    textAlign: 'center',
    fontWeight: '700',
  },
  addText: { fontSize: 13, color: colors.pinkDeep, fontWeight: '700' },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.pinkSoft,
    backgroundColor: '#FFF5F8',
  },
  customIcon: {
    fontSize: 14,
    color: colors.pinkDeep,
    fontWeight: '800',
    width: 20,
    textAlign: 'center',
  },
  customInput: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
    padding: 0,
  },
  customConfirm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.heartRed,
  },
  customConfirmDisabled: { backgroundColor: colors.pinkSoft },
  customConfirmText: { color: '#fff', fontSize: 12, fontWeight: '700' },

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
