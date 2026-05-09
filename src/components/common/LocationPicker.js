import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import colors from '../../constants/colors';

const HOME = { icon: '🏠', name: '집' };

export default function LocationPicker({
  visible,
  value,
  options = [],
  onClose,
  onSelect,
}) {
  const [query, setQuery] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setCustomMode(false);
      setCustomValue('');
    }
  }, [visible]);

  const items = useMemo(() => {
    const seen = new Set([HOME.name]);
    const fromPhotos = options
      .filter((o) => o && o.name)
      .filter((o) => {
        if (seen.has(o.name)) return false;
        seen.add(o.name);
        return true;
      });
    return [HOME, ...fromPhotos];
  }, [options]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return items;
    return items.filter((p) => p.name.includes(q));
  }, [query, items]);

  const pick = (name) => {
    const trimmed = (name ?? '').trim();
    if (!trimmed) return;
    onSelect?.(trimmed);
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
            <Text style={styles.title}>위치 선택</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="장소 검색"
              placeholderTextColor={colors.inkMute}
              returnKeyType="search"
            />
          </View>

          <ScrollView
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filtered.length === 0 && (
              <Text style={styles.empty}>
                일치하는 장소가 없어요. 아래에서 직접 추가해보세요.
              </Text>
            )}

            {filtered.map((p) => {
              const sel = p.name === value;
              return (
                <TouchableOpacity
                  key={p.name}
                  style={[styles.row, sel && styles.rowSelected]}
                  onPress={() => pick(p.name)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.rowIcon}>{p.icon}</Text>
                  <Text style={[styles.rowName, sel && styles.rowNameSelected]}>
                    {p.name}
                  </Text>
                  {sel && <Text style={styles.rowCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}

            <View style={styles.divider} />

            {customMode ? (
              <View style={styles.customRow}>
                <Text style={styles.rowIcon}>📍</Text>
                <TextInput
                  autoFocus
                  style={styles.customInput}
                  value={customValue}
                  onChangeText={setCustomValue}
                  placeholder="새 위치를 입력하세요"
                  placeholderTextColor={colors.inkMute}
                  returnKeyType="done"
                  onSubmitEditing={() => pick(customValue)}
                />
                <TouchableOpacity
                  onPress={() => pick(customValue)}
                  activeOpacity={0.8}
                  style={[
                    styles.customConfirm,
                    !customValue.trim() && styles.customConfirmDisabled,
                  ]}
                  disabled={!customValue.trim()}
                >
                  <Text style={styles.customConfirmText}>확인</Text>
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

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 8,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 13, color: colors.ink, padding: 0 },

  list: { flexGrow: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  rowSelected: { backgroundColor: colors.pinkTint },
  rowIcon: { fontSize: 16, width: 22, textAlign: 'center' },
  rowName: { flex: 1, fontSize: 13, color: colors.ink, fontWeight: '600' },
  rowNameSelected: { color: colors.pinkDeep, fontWeight: '700' },
  rowCheck: { fontSize: 14, color: colors.heartRed, fontWeight: '800' },
  empty: {
    textAlign: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    fontSize: 12,
    color: colors.inkMute,
  },

  divider: {
    height: 1,
    backgroundColor: colors.line2,
    marginVertical: 6,
  },

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
});
