import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import colors from '../../constants/colors';
import SettingsShell from './SettingsShell';
import Heart from '../../components/common/Heart';
import { useCouple } from '../../contexts/CoupleContext';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/common/Avatar';
import { daysTogether, formatStartDate } from '../../utils/dday';
import { givenName } from '../../utils/name';

// 한국어 주격 조사 이/가 (받침 있으면 '이').
const subjParticle = (name) => {
  if (!name) return '가';
  const code = name.charCodeAt(name.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return '가';
  return (code - 0xac00) % 28 !== 0 ? '이' : '가';
};
const NICK_MAX = 20;

const withAlpha = (hex, alpha) => {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const dotDate = (iso) => iso.replace(/-/g, '.');
const ddayLabel = (iso) => {
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((target - now) / (1000 * 60 * 60 * 24));
  if (diff > 0) return `D-${diff}`;
  if (diff < 0) return `D+${Math.abs(diff)}`;
  return 'D-DAY';
};

// 날짜 오름차순(시간 순) 정렬: 과거 → 미래.
const sortByDate = (list) =>
  [...list].sort((a, b) => new Date(a.date) - new Date(b.date));

const CoupleManageScreen = ({ navigation }) => {
  const { anniversaries, nicknames, setNickname } = useCouple();
  const { user, coupleStartDate, partner } = useAuth();
  const sorted = useMemo(() => sortByDate(anniversaries), [anniversaries]);

  // 실데이터: 나 = 로그인 닉네임, 파트너 = 커플 상태의 partner.nickname.
  const myName = givenName(user?.nickname) || '나';
  const partnerName = givenName(partner?.nickname) || '연인';
  const dday = daysTogether(coupleStartDate);

  // 애칭 카드: [나→연인](편집 가능) / [연인→나](잠금). 편집은 내가 상대를 부르는 것만.
  const nickCards = useMemo(() => {
    const PINK = { color: colors.pinkDeep, bg: '#FFF5F8' };
    const BLUE = { color: colors.blue, bg: '#F5F8FF' };
    return [
      { giver: myName, target: partnerName, editable: true, ...PINK },
      { giver: partnerName, target: myName, editable: false, ...BLUE },
    ].map((c) => ({
      ...c,
      label: `${c.giver}${subjParticle(c.giver)} 부르는 ${c.target}`,
      value: nicknames?.[c.giver] ?? '',
    }));
  }, [nicknames, myName, partnerName]);

  // 애칭 편집 모달
  const [editGiver, setEditGiver] = useState(null);
  const [draftNick, setDraftNick] = useState('');
  const openNickEdit = (card) => {
    if (!card.editable) return;
    setEditGiver(card.giver);
    setDraftNick(card.value);
  };
  const closeNickEdit = () => setEditGiver(null);
  const saveNickEdit = () => {
    if (editGiver) setNickname(editGiver, draftNick.trim());
    setEditGiver(null);
  };

  // 자동 파생(100일 등)이 아닌 기념일만 탭해서 수정.
  const onEditAnniversary = (a) => {
    if (a.auto) return;
    navigation?.navigate('AnniversaryAddScreen', { editing: a });
  };

  return (
  <SettingsShell navigation={navigation} title="커플 관리">
    {/* hero */}
    <LinearGradient
      colors={[colors.pink, colors.heartRed]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.heroAurora} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 200 200">
          <Defs>
            <RadialGradient id="cmGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="100" cy="100" r="100" fill="url(#cmGlow)" />
        </Svg>
      </View>

      <View style={styles.coupleRow}>
        <Avatar
          uri={user?.profileImage}
          name={user?.nickname || myName}
          size={48}
          bg="#FFE4EE"
          textColor={colors.pinkDeep}
          style={{ borderWidth: 3, borderColor: '#FFFFFF' }}
        />
        <View style={styles.heartWrap}>
          <Heart size={20} color="#FFFFFF" pulse />
        </View>
        <Avatar
          uri={partner?.profileImage}
          name={partner?.nickname || partnerName}
          size={48}
          bg={colors.blueTint}
          textColor={colors.blue}
          style={{ borderWidth: 3, borderColor: '#FFFFFF', marginLeft: -8 }}
        />
        <View style={styles.coupleInfo}>
          <Text style={styles.coupleName}>{myName} ♥ {partnerName}</Text>
          <Text style={styles.coupleSub}>
            {dday != null
              ? `${formatStartDate(coupleStartDate)} 시작 · ${dday}일째`
              : '함께하는 중'}
          </Text>
        </View>
      </View>
    </LinearGradient>

    {/* nicknames (애칭) */}
    <Text style={styles.sectionLabel}>우리만의 애칭</Text>
    <View style={styles.nickCard}>
      {nickCards.map((n) => (
        <Pressable
          key={n.giver}
          onPress={() => openNickEdit(n)}
          disabled={!n.editable}
          style={({ pressed }) => [
            styles.nickCell,
            { backgroundColor: n.bg },
            n.editable && styles.nickCellEditable,
            pressed && n.editable && { opacity: 0.85 },
          ]}
        >
          <View style={styles.nickHeaderRow}>
            <Text style={styles.nickLabel}>{n.label}</Text>
            <Text style={styles.nickAffordance}>{n.editable ? '✏️' : '🔒'}</Text>
          </View>
          <Text style={[styles.nickValue, { color: n.color }]}>
            "{n.value || '애칭 없음'}"
          </Text>
        </Pressable>
      ))}
    </View>
    <Text style={styles.nickHint}>
      애칭은 상대를 부르는 것만 내가 정할 수 있어요. 내 애칭은 상대가 정해줘요 🔒
    </Text>

    {/* anniversaries */}
    <View style={styles.annHeader}>
      <Text style={styles.sectionLabel}>기념일 · D-DAY</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation?.navigate('AnniversaryAddScreen')}
        style={styles.addBtn}
      >
        <Text style={styles.addAction}>+ 추가</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.card}>
      {sorted.map((a, i, arr) => (
        <TouchableOpacity
          key={a.id}
          activeOpacity={a.auto ? 1 : 0.6}
          onPress={() => onEditAnniversary(a)}
          disabled={a.auto}
          style={[styles.annRow, i < arr.length - 1 && styles.divider]}
        >
          <View
            style={[
              styles.annIcon,
              { backgroundColor: withAlpha(a.color, 0.13) },
            ]}
          >
            <Text style={{ fontSize: 16 }}>{a.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.annLabel}>
              {a.name}
              {a.auto ? <Text style={styles.autoTag}>  · 자동</Text> : null}
            </Text>
            <Text style={styles.annDate}>{dotDate(a.date)}</Text>
          </View>
          <Text style={[styles.annDDay, { color: a.color }]}>
            {ddayLabel(a.date)}
          </Text>
          {!a.auto && <Text style={styles.annChevron}>›</Text>}
        </TouchableOpacity>
      ))}
    </View>

    {/* unlink notice */}
    <View style={styles.notice}>
      <Text style={styles.noticeText}>
        💔 연인 연결 해제는{' '}
        <Text style={styles.noticeAccent}>설정 &gt; 계정</Text> 에서
      </Text>
    </View>

    {/* 애칭 편집 모달 */}
    <Modal
      visible={!!editGiver}
      transparent
      animationType="fade"
      onRequestClose={closeNickEdit}
    >
      <Pressable style={styles.modalBackdrop} onPress={closeNickEdit}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalCenter}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              {editGiver ? `${partnerName} 애칭` : '애칭'}
            </Text>
            <Text style={styles.modalSub}>상대를 부르는 애칭을 정해주세요</Text>
            <TextInput
              value={draftNick}
              onChangeText={(t) => setDraftNick(t.slice(0, NICK_MAX))}
              placeholder="예: 자기야"
              placeholderTextColor="#BBB"
              style={styles.modalInput}
              maxLength={NICK_MAX}
              autoFocus
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={closeNickEdit}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSave]}
                onPress={saveNickEdit}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSaveText}>저장</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  </SettingsShell>
  );
};

const styles = StyleSheet.create({
  hero: {
    padding: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.heartRed,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
  heroAurora: {
    position: 'absolute',
    right: -60,
    top: -80,
    width: 200,
    height: 200,
  },
  coupleRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800' },
  heartWrap: { marginHorizontal: -8, zIndex: 2 },
  coupleInfo: { flex: 1, marginLeft: 12 },
  coupleName: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  coupleSub: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
    marginTop: 2,
  },

  sectionLabel: {
    marginTop: 18,
    paddingHorizontal: 4,
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  annHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addBtn: {
    marginTop: 18,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginRight: -8,
  },
  addAction: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.heartRed,
  },

  nickCard: {
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
    flexDirection: 'row',
    gap: 10,
  },
  nickCell: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
  },
  nickCellEditable: {
    borderWidth: 1.5,
    borderColor: colors.heartRed,
  },
  nickHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nickAffordance: { fontSize: 10 },
  nickLabel: { fontSize: 9, color: '#888', fontWeight: '700', flex: 1 },
  nickValue: { marginTop: 4, fontSize: 14, fontWeight: '800' },
  nickHint: {
    marginTop: 8,
    paddingHorizontal: 4,
    fontSize: 10,
    color: '#999',
    lineHeight: 15,
  },
  annChevron: { fontSize: 18, color: '#CCC', marginLeft: 2 },

  // 애칭 편집 모달
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalCenter: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  modalSub: { marginTop: 4, fontSize: 12, color: '#888' },
  modalInput: {
    marginTop: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.pinkSoft ?? '#FFD0E0',
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    backgroundColor: '#FFF8FB',
  },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancel: { backgroundColor: '#F5F5F5' },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: '#555' },
  modalSave: { backgroundColor: colors.heartRed },
  modalSaveText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },

  card: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
    overflow: 'hidden',
  },
  annRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: '#F4EEF1' },
  annIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  annLabel: { fontSize: 13, fontWeight: '700', color: colors.ink },
  autoTag: { fontSize: 10, fontWeight: '600', color: '#AAA' },
  annDate: { fontSize: 10, color: '#888', marginTop: 2 },
  annDDay: { fontSize: 12, fontWeight: '800' },

  notice: {
    marginTop: 18,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FFD0E0',
    alignItems: 'center',
  },
  noticeText: { fontSize: 11, color: '#888' },
  noticeAccent: { color: colors.heartRed, fontWeight: '800' },
});

export default CoupleManageScreen;
