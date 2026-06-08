import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import colors from '../../constants/colors';

export default function SimpleListPicker({
  visible,
  title,
  value,
  options = [],
  onClose,
  onSelect,
}) {
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
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {options.map((opt) => {
              const sel = opt.value === value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.row, sel && styles.rowSelected]}
                  onPress={() => {
                    onSelect?.(opt.value);
                    onClose?.();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.label, sel && styles.labelSelected]}>
                    {opt.label}
                  </Text>
                  {sel && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
    maxHeight: '70%',
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
  },
  rowSelected: { backgroundColor: colors.pinkTint },
  label: { flex: 1, fontSize: 13, color: colors.ink, fontWeight: '600' },
  labelSelected: { color: colors.pinkDeep, fontWeight: '700' },
  check: { fontSize: 14, color: colors.heartRed, fontWeight: '800' },
});
