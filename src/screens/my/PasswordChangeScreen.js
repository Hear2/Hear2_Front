import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import colors from '../../constants/colors';
import SettingsShell from './SettingsShell';

const PasswordRow = ({ label, value, onChangeText, placeholder, last }) => {
  const [visible, setVisible] = useState(false);
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        placeholder={placeholder}
        placeholderTextColor="#CCC"
        autoCapitalize="none"
        style={styles.input}
      />
      <TouchableOpacity
        hitSlop={8}
        onPress={() => setVisible((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={styles.eye}>{visible ? '🙈' : '👁'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const PasswordChangeScreen = ({ navigation }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const rules = useMemo(
    () => [
      { ok: next.length >= 8, label: '8자 이상' },
      {
        ok: /[A-Za-z]/.test(next) && /[0-9]/.test(next),
        label: '영문 + 숫자 포함',
      },
      {
        ok: /[^A-Za-z0-9]/.test(next),
        label: '특수문자 1개 이상',
      },
      {
        ok: next.length > 0 && next === confirm,
        label: '새 비밀번호와 일치',
      },
    ],
    [next, confirm],
  );

  const canSave =
    current.length > 0 && rules.every((r) => r.ok) && next !== current;

  return (
    <SettingsShell
      navigation={navigation}
      title="비밀번호 변경"
      rightLabel="변경"
      onRightPress={() => canSave && navigation?.goBack()}
    >
      <View style={styles.card}>
        <PasswordRow
          label="현재"
          value={current}
          onChangeText={setCurrent}
          placeholder="현재 비밀번호"
        />
        <PasswordRow
          label="새"
          value={next}
          onChangeText={setNext}
          placeholder="새 비밀번호"
        />
        <PasswordRow
          label="확인"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="새 비밀번호 확인"
          last
        />
      </View>

      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>🔐 비밀번호 조건</Text>
        {rules.map((r) => (
          <View key={r.label} style={styles.ruleRow}>
            <Text
              style={[
                styles.ruleCheck,
                { color: r.ok ? '#1F8A5B' : '#CCC' },
              ]}
            >
              {r.ok ? '✓' : '○'}
            </Text>
            <Text
              style={[
                styles.ruleText,
                r.ok && { color: colors.ink, fontWeight: '700' },
              ]}
            >
              {r.label}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity hitSlop={8} activeOpacity={0.7}>
        <Text style={styles.forgot}>비밀번호를 잊으셨나요?</Text>
      </TouchableOpacity>
    </SettingsShell>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: '#F4EEF1' },
  fieldLabel: {
    width: 50,
    fontSize: 12,
    color: '#888',
    fontWeight: '700',
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    padding: 0,
  },
  eye: { fontSize: 16 },

  rulesCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFF5F8',
    borderWidth: 1,
    borderColor: '#FFD0E0',
  },
  rulesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 8,
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  ruleCheck: { width: 14, fontSize: 12, fontWeight: '800' },
  ruleText: { fontSize: 11, color: '#888' },

  forgot: {
    marginTop: 18,
    fontSize: 12,
    fontWeight: '700',
    color: colors.heartRed,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default PasswordChangeScreen;
