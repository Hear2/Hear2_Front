import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';
import Heart from '../../components/common/Heart';
import WheelPicker from '../../components/common/WheelPicker';
import { useCouple } from '../../contexts/CoupleContext';

const PRESETS = [
  { icon: '💕', label: '사귄 날', color: '#FC2648' },
  { icon: '🎂', label: '생일', color: '#FFB05B' },
  { icon: '✨', label: '기타', color: '#6BCB77' },
];

const ICONS = ['💕', '🎂', '💯', '🎄', '🎉', '✨', '🌸', '🍰', '🎁', '🥂', '📸', '🌙'];

const COLOR_SWATCHES = ['#FC2648', '#FFB05B', '#A78BFA', '#4D96FF', '#6BCB77', '#1E2152'];

const REMIND_OPTIONS = [
  { id: '7d', label: '7일 전' },
  { id: '3d', label: '3일 전' },
  { id: '1d', label: '1일 전' },
  { id: '0d', label: '당일' },
];

const NAME_MAX = 20;

const range = (start, end) => {
  const out = [];
  for (let i = start; i <= end; i += 1) out.push(i);
  return out;
};

const YEARS = range(2020, 2035).map(String);
const MONTHS = range(1, 12).map((m) => `${m}월`);
const DAYS_31 = range(1, 31).map(String);

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

const WEEKDAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

const formatDate = (y, m, d) =>
  `${y}년 ${String(m).padStart(2, '0')}월 ${String(d).padStart(2, '0')}일`;

const computeDDay = (y, m, d) => {
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diff > 0) return `D-${diff}`;
  if (diff < 0) return `D+${Math.abs(diff)}`;
  return 'D-DAY';
};

export default function AnniversaryAddScreen({ navigation, route }) {
  // 커플 연결 직후 진입하는 "사귄 날 입력" 온보딩 모드. 기본 프리셋이 사귄 날(0)이라 그대로 띄운다.
  const onboarding = !!route?.params?.onboarding;
  // 기존 기념일(사귄날 포함) 수정 모드. editing 객체를 받아 필드를 채워준다.
  const editing = route?.params?.editing || null;
  const { addAnniversary, removeAnniversary } = useCouple();
  const today = new Date();
  const initPreset = editing
    ? Math.max(0, PRESETS.findIndex((p) => p.label === editing.type))
    : 0;
  const initDate = editing?.date ? editing.date.split('-').map(Number) : null;
  const [presetIdx, setPresetIdx] = useState(initPreset);
  const [name, setName] = useState(editing?.name ?? '사귄 날');
  const [iconIdx, setIconIdx] = useState(() => {
    const i = editing?.icon ? ICONS.indexOf(editing.icon) : 0;
    return i >= 0 ? i : 0;
  });
  const [colorIdx, setColorIdx] = useState(() => {
    const i = editing?.color ? COLOR_SWATCHES.indexOf(editing.color) : 0;
    return i >= 0 ? i : 0;
  });
  const [repeatYearly, setRepeatYearly] = useState(true);
  const [shareWithPartner, setShareWithPartner] = useState(true);
  const [reminders, setReminders] = useState({ '7d': true, '3d': false, '1d': true, '0d': true });

  const [year, setYear] = useState(initDate ? initDate[0] : today.getFullYear());
  const [month, setMonth] = useState(initDate ? initDate[1] : today.getMonth() + 1);
  const [day, setDay] = useState(initDate ? initDate[2] : today.getDate());

  const validDay = useMemo(
    () => Math.min(day, daysInMonth(year, month)),
    [year, month, day],
  );

  const accent = COLOR_SWATCHES[colorIdx];
  const dateLabel = formatDate(year, month, validDay);
  const weekday = WEEKDAYS_KR[new Date(year, month - 1, validDay).getDay()];
  const dday = computeDDay(year, month, validDay);

  const onPickPreset = (i) => {
    setPresetIdx(i);
    const p = PRESETS[i];
    setName(p.label);
    const ic = ICONS.indexOf(p.icon);
    if (ic >= 0) setIconIdx(ic);
    const c = COLOR_SWATCHES.indexOf(p.color);
    if (c >= 0) setColorIdx(c);
  };

  const onPickIcon = (i) => setIconIdx(i);
  const onPickColor = (i) => setColorIdx(i);
  const toggleRemind = (id) =>
    setReminders((r) => ({ ...r, [id]: !r[id] }));

  const onSave = () => {
    const pad = (n) => String(n).padStart(2, '0');
    const isoDate = `${year}-${pad(month)}-${pad(validDay)}`;
    // 수정 모드면 기존 항목(+사귄날이면 자동 파생 기념일)을 먼저 제거하고 새로 추가한다.
    if (editing?.id) removeAnniversary(editing.id);
    addAnniversary({
      type: PRESETS[presetIdx].label,
      name: name.trim() || PRESETS[presetIdx].label,
      date: isoDate,
      icon: ICONS[iconIdx],
      color: COLOR_SWATCHES[colorIdx],
      repeatYearly,
      shareWithPartner,
      reminders,
    });
    navigation?.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient
        colors={['#FFFAFC', '#FFF5F8']}
        style={StyleSheet.absoluteFill}
      />
      <LovelyBackground intensity={0.3} hearts={false} sparkles={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity hitSlop={12} onPress={() => navigation?.goBack()}>
          <Text style={styles.headerClose}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {onboarding
            ? '사귄 날을 알려주세요'
            : editing
              ? '기념일 수정'
              : '기념일 추가'}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Live preview */}
        <LinearGradient
          colors={[accent, '#FF6B9D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.preview}
        >
          <View style={styles.previewAurora} pointerEvents="none">
            <Svg width="100%" height="100%" viewBox="0 0 200 200">
              <Defs>
                <RadialGradient id="annPrevGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                  <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.18" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="100" cy="100" r="100" fill="url(#annPrevGlow)" />
            </Svg>
          </View>
          <View style={styles.previewRow}>
            <View style={styles.previewIcon}>
              <Text style={{ fontSize: 26 }}>{ICONS[iconIdx]}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.previewKicker}>미리보기</Text>
              <Text style={styles.previewName}>{name || '기념일 이름'}</Text>
              <Text style={styles.previewDate}>
                {dateLabel} · {weekday}요일
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.previewKicker}>남은 날</Text>
              <Text style={styles.previewDDay}>{dday}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Presets */}
        <Text style={styles.sectionLabel}>종류</Text>
        <View style={styles.presetGrid}>
          {PRESETS.map((p, i) => {
            const on = i === presetIdx;
            return (
              <Pressable
                key={p.label}
                onPress={() => onPickPreset(i)}
                style={[
                  styles.presetCell,
                  on && {
                    backgroundColor: '#FFF5F8',
                    borderColor: colors.heartRed,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text style={styles.presetIcon}>{p.icon}</Text>
                <Text
                  style={[
                    styles.presetLabel,
                    on && { color: colors.heartRed, fontWeight: '800' },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Name */}
        <Text style={styles.sectionLabel}>이름</Text>
        <View style={[styles.card, styles.nameCard]}>
          <View style={[styles.nameCursor, { backgroundColor: accent }]} />
          <TextInput
            value={name}
            onChangeText={(t) => setName(t.slice(0, NAME_MAX))}
            placeholder="기념일 이름"
            placeholderTextColor="#CCC"
            style={styles.nameInput}
            maxLength={NAME_MAX}
          />
          <Text style={styles.nameCounter}>
            {name.length} / {NAME_MAX}
          </Text>
        </View>

        {/* Date — wheel picker */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>날짜</Text>
          <Text style={[styles.sectionAccent, { color: accent }]}>{dateLabel}</Text>
        </View>
        <View style={[styles.card, styles.wheelCard]}>
          <View style={styles.wheelSelectionBand} pointerEvents="none" />
          <View style={styles.wheelRow}>
            <View style={styles.wheelCol}>
              <WheelPicker
                items={YEARS}
                value={String(year)}
                onChange={(v) => setYear(Number(v))}
                width={80}
              />
            </View>
            <View style={styles.wheelCol}>
              <WheelPicker
                items={MONTHS}
                value={`${month}월`}
                onChange={(v) => setMonth(Number(String(v).replace('월', '')))}
                width={80}
              />
            </View>
            <View style={styles.wheelCol}>
              <WheelPicker
                items={DAYS_31.slice(0, daysInMonth(year, month))}
                value={String(validDay)}
                onChange={(v) => setDay(Number(v))}
                width={80}
              />
            </View>
          </View>
        </View>

        {/* Icon picker */}
        <Text style={styles.sectionLabel}>아이콘</Text>
        <View style={[styles.card, styles.iconCard]}>
          {ICONS.map((ic, i) => {
            const on = i === iconIdx;
            return (
              <Pressable
                key={ic + i}
                onPress={() => onPickIcon(i)}
                style={[
                  styles.iconCell,
                  on && {
                    backgroundColor: '#FFE4EE',
                    borderColor: colors.heartRed,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{ic}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Color picker */}
        <Text style={styles.sectionLabel}>색상</Text>
        <View style={[styles.card, styles.colorCard]}>
          {COLOR_SWATCHES.map((c, i) => {
            const on = i === colorIdx;
            return (
              <Pressable
                key={c}
                onPress={() => onPickColor(i)}
                style={({ pressed }) => [
                  styles.colorWrap,
                  on && {
                    borderColor: c,
                    borderWidth: 2,
                    padding: 2,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={[styles.colorDot, { backgroundColor: c }]}>
                  {on && <Text style={styles.colorCheck}>✓</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Repeat · Reminder */}
        <View style={[styles.card, styles.repeatCard]}>
          <View style={styles.repeatRow}>
            <Text style={styles.repeatEmoji}>🔁</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.repeatTitle}>매년 반복</Text>
              <Text style={styles.repeatSub}>매년 같은 날 D-DAY 알림</Text>
            </View>
            <Switch
              value={repeatYearly}
              onValueChange={setRepeatYearly}
              trackColor={{ false: '#E5E5E5', true: colors.heartRed }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E5E5"
            />
          </View>
          <View style={styles.repeatDivider} />
          <View style={[styles.repeatRow, { alignItems: 'flex-start' }]}>
            <Text style={styles.repeatEmoji}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.repeatTitle}>다가오면 알림</Text>
              <View style={styles.remindRow}>
                {REMIND_OPTIONS.map((opt) => {
                  const on = reminders[opt.id];
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => toggleRemind(opt.id)}
                      style={[
                        styles.remindChip,
                        on && { backgroundColor: colors.heartRed },
                      ]}
                    >
                      <Text
                        style={[
                          styles.remindChipText,
                          on && { color: '#FFFFFF' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Share with partner */}
        <View style={styles.shareCard}>
          <Heart size={16} color={colors.heartRed} pulse />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.shareText}>
              <Text style={{ fontWeight: '800' }}>연인</Text>과 함께 기념해요
            </Text>
            <Text style={styles.shareSub}>
              두 사람 모두에게 D-DAY가 표시돼요
            </Text>
          </View>
          <Switch
            value={shareWithPartner}
            onValueChange={setShareWithPartner}
            trackColor={{ false: '#E5E5E5', true: colors.heartRed }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E5E5E5"
          />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.ctaBar}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.cancelBtn}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={{ flex: 2 }}
          onPress={onSave}
        >
          <LinearGradient
            colors={['#FF6B9D', colors.heartRed]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveBtn}
          >
            <Heart size={14} color="#FFFFFF" />
            <Text style={styles.saveText}>
              {onboarding ? '시작하기' : editing ? '수정 완료' : '기념일 저장'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFAFC' },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerClose: { fontSize: 20, fontWeight: '700', color: colors.ink, width: 22 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.ink },

  scroll: { paddingHorizontal: 16, paddingBottom: 16 },

  // Preview
  preview: {
    padding: 16,
    borderRadius: 18,
    overflow: 'hidden',
  },
  previewAurora: {
    position: 'absolute',
    right: -60,
    top: -80,
    width: 200,
    height: 200,
  },
  previewRow: { flexDirection: 'row', alignItems: 'center' },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewKicker: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  previewName: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  previewDate: {
    marginTop: 2,
    fontSize: 11,
    color: 'rgba(255,255,255,0.92)',
  },
  previewDDay: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  // Section labels
  sectionLabel: {
    marginTop: 18,
    paddingHorizontal: 4,
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 0.5,
  },
  sectionRow: {
    marginTop: 18,
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionAccent: { fontSize: 11, fontWeight: '800' },

  // Shared card surface
  card: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
  },

  // Presets
  presetGrid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetCell: {
    width: '31.5%',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
    alignItems: 'center',
    gap: 4,
  },
  presetIcon: { fontSize: 20, lineHeight: 22 },
  presetLabel: { fontSize: 11, fontWeight: '600', color: '#555' },

  // Name input
  nameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.heartRed,
  },
  nameCursor: { width: 3, height: 16, borderRadius: 2 },
  nameInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
    paddingVertical: 8,
  },
  nameCounter: { fontSize: 11, color: '#BBB' },

  // Wheel picker
  wheelCard: {
    paddingVertical: 8,
    overflow: 'hidden',
  },
  wheelRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  wheelCol: { flex: 1, alignItems: 'center' },
  wheelSelectionBand: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: '50%',
    marginTop: -18,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(252,38,72,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(252,38,72,0.18)',
  },

  // Icon grid
  iconCard: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  iconCell: {
    width: '15.4%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  // Color swatches
  colorCard: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDot: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCheck: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  // Repeat card
  repeatCard: {
    marginTop: 18,
    overflow: 'hidden',
  },
  repeatRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  repeatEmoji: { fontSize: 16 },
  repeatTitle: { fontSize: 13, fontWeight: '700', color: colors.ink },
  repeatSub: { fontSize: 10, color: '#888', marginTop: 2 },
  repeatDivider: { height: 1, backgroundColor: '#F4EEF1' },
  remindRow: { marginTop: 6, flexDirection: 'row', gap: 6 },
  remindChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F5F5F5',
  },
  remindChipText: { fontSize: 11, fontWeight: '700', color: '#999' },

  // Share card
  shareCard: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFF5F8',
    borderWidth: 1,
    borderColor: '#FFD0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareText: { fontSize: 12, color: colors.ink },
  shareSub: { fontSize: 10, color: '#888', marginTop: 2 },

  // CTA
  ctaBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F4EEF1',
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: '#555' },
  saveBtn: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.heartRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  saveText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});
