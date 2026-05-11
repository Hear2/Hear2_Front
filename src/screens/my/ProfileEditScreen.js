import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import SettingsShell from './SettingsShell';

const FIELDS = [
  { label: '이름', value: '예진' },
  { label: '생년월일', value: '2000.07.14' },
  { label: '성별', value: '여성' },
  { label: '한 줄 소개', value: '벚꽃 좋아하는 사람 🌸' },
  { label: '이메일', value: 'yejin@hear2.app', locked: true },
  { label: '전화번호', value: '010-****-1234', locked: true },
];

const ProfileEditScreen = ({ navigation }) => (
  <SettingsShell
    navigation={navigation}
    title="프로필 편집"
    rightLabel="저장"
    onRightPress={() => navigation?.goBack()}
  >
    {/* avatar card */}
    <View style={styles.avatarCard}>
      <View style={styles.avatarWrap}>
        <LinearGradient
          colors={['#FFE4EE', '#FFB590']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>예</Text>
        </LinearGradient>
        <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.85}>
          <Text style={styles.cameraIcon}>📷</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.tapHint}>탭하여 변경</Text>
    </View>

    {/* fields */}
    <View style={styles.card}>
      {FIELDS.map((f, i, a) => {
        const Wrap = f.locked ? View : TouchableOpacity;
        return (
          <Wrap
            key={f.label}
            style={[styles.row, i < a.length - 1 && styles.divider]}
            activeOpacity={0.7}
          >
            <Text style={styles.fieldLabel}>{f.label}</Text>
            <Text style={styles.fieldValue} numberOfLines={1}>
              {f.value}
            </Text>
            {f.locked ? (
              <Text style={styles.lockIcon}>🔒</Text>
            ) : (
              <Text style={styles.chevron}>›</Text>
            )}
          </Wrap>
        );
      })}
    </View>

    {/* privacy hint */}
    <View style={styles.hint}>
      <Text style={styles.hintIcon}>💡</Text>
      <Text style={styles.hintText}>
        지호에게는 이름·생일·소개만 보여요. 나머지는 비공개.
      </Text>
    </View>
  </SettingsShell>
);

const styles = StyleSheet.create({
  avatarCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
    alignItems: 'center',
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.pinkDeep,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.heartRed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraIcon: { fontSize: 14 },
  tapHint: { marginTop: 8, fontSize: 11, color: '#888' },

  card: {
    marginTop: 12,
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
    paddingVertical: 14,
    gap: 8,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: '#F4EEF1' },
  fieldLabel: {
    width: 80,
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  fieldValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  lockIcon: { fontSize: 12, color: '#999' },
  chevron: { fontSize: 18, color: '#CCC', fontWeight: '600' },

  hint: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFF5F8',
    borderWidth: 1,
    borderColor: '#FFD0E0',
    flexDirection: 'row',
    gap: 8,
  },
  hintIcon: { fontSize: 12 },
  hintText: {
    flex: 1,
    fontSize: 11,
    color: colors.ink,
    lineHeight: 17,
  },
});

export default ProfileEditScreen;
