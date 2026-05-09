import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import CalendarPicker from '../../components/common/CalendarPicker';
import TimePicker from '../../components/common/TimePicker';
import SimpleListPicker from '../../components/common/SimpleListPicker';
import TagPicker from '../../components/common/TagPicker';
import { useEvents } from '../../contexts/EventContext';

const OWNERS = [
  { id: 'me',      label: '예진 (여)', tint: 'rgba(255,138,76,0.55)',  accent: '#E07A2C' },
  { id: 'partner', label: '지호 (남)', tint: 'rgba(108,165,255,0.55)', accent: colors.blue },
  { id: 'couple',  label: '공동',     tint: 'rgba(255,138,178,0.55)', accent: colors.pinkDeep },
];

const REMINDERS = [
  { value: 'none',  label: '알림 없음' },
  { value: 'start', label: '시작 시각' },
  { value: '5m',    label: '5분 전' },
  { value: '10m',   label: '10분 전' },
  { value: '15m',   label: '15분 전' },
  { value: '30m',   label: '30분 전' },
  { value: '1h',    label: '1시간 전' },
  { value: '1d',    label: '1일 전' },
];

const REPEATS = [
  { value: 'none',    label: '안 함' },
  { value: 'daily',   label: '매일' },
  { value: 'weekly',  label: '매주' },
  { value: 'monthly', label: '매월' },
  { value: 'yearly',  label: '매년' },
];

const DOWS = ['일', '월', '화', '수', '목', '금', '토'];
const formatDateK = (d) =>
  `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOWS[d.getDay()]})`;
const formatTimeK = (d) => {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 || 12;
  return `${ampm} ${h12}:${String(m).padStart(2, '0')}`;
};

const mergeDate = (target, source) => {
  const next = new Date(source);
  next.setHours(target.getHours(), target.getMinutes(), 0, 0);
  return next;
};

export default function EventAddScreen({ navigation, route }) {
  const { events, addEvent, updateEvent } = useEvents();
  const editingId = route?.params?.eventId;
  const editingEvent = editingId
    ? events.find((e) => e.id === editingId)
    : null;
  const isEditing = !!editingEvent;

  const [title, setTitle] = useState(
    () => editingEvent?.title ?? '서울숲 데이트',
  );
  const [owner, setOwner] = useState(() => editingEvent?.owner ?? 'couple');
  const [allDay, setAllDay] = useState(() => editingEvent?.allDay ?? false);
  const [startDate, setStartDate] = useState(() =>
    editingEvent?.startDate
      ? new Date(editingEvent.startDate)
      : new Date(2026, 3, 12, 14, 0),
  );
  const [endDate, setEndDate] = useState(() =>
    editingEvent?.endDate
      ? new Date(editingEvent.endDate)
      : new Date(2026, 3, 12, 19, 0),
  );
  const [reminder, setReminder] = useState(
    () => editingEvent?.reminder ?? '30m',
  );
  const [repeat, setRepeat] = useState(() => editingEvent?.repeat ?? 'none');
  const [tags, setTags] = useState(() => editingEvent?.tags ?? ['데이트', '봄']);
  const [memo, setMemo] = useState(
    () =>
      editingEvent?.memo ??
      '벚꽃 보러 가기. 카페 들렀다가 한강 산책 코스로! 🌸',
  );

  // picker open states
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openStartTime, setOpenStartTime] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [openEndTime, setOpenEndTime] = useState(false);
  const [openReminder, setOpenReminder] = useState(false);
  const [openRepeat, setOpenRepeat] = useState(false);
  const [openTag, setOpenTag] = useState(false);

  const ownerObj = OWNERS.find((o) => o.id === owner) ?? OWNERS[2];
  const reminderLabel =
    REMINDERS.find((r) => r.value === reminder)?.label ?? '알림 없음';
  const repeatLabel =
    REPEATS.find((r) => r.value === repeat)?.label ?? '안 함';
  const tagLabel =
    tags.length > 0 ? tags.map((t) => `#${t}`).join(' ') : '없음';

  const goBack = () => navigation?.goBack?.();

  const handleSave = () => {
    const trimmedTitle = title.trim() || '새 일정';
    const payload = {
      title: trimmedTitle,
      owner,
      startDate,
      endDate,
      allDay,
      location:
        editingEvent?.location ?? {
          name: '서울숲',
          address: '서울시 성동구 서울숲길 273',
        },
      reminder,
      repeat,
      tags,
      memo: memo.trim(),
    };
    if (isEditing) {
      updateEvent(editingId, payload);
    } else {
      addEvent({ ...payload, createdAt: Date.now() });
    }
    goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.appbar}>
        <View style={styles.appbarLeft}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={8}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.appbarTitle}>
            {isEditing ? '일정 편집' : '새 일정'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleSave} hitSlop={8}>
          <Text style={styles.appbarSave}>저장</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 제목 */}
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>제목</Text>
            <View style={styles.titleRow}>
              <View style={[styles.titleNotch, { backgroundColor: ownerObj.tint }]} />
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="일정 제목"
                placeholderTextColor={colors.inkMute}
              />
            </View>
          </View>

          {/* 일정 색 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>일정 색</Text>
            <View style={styles.ownerRow}>
              {OWNERS.map((o) => {
                const on = o.id === owner;
                return (
                  <TouchableOpacity
                    key={o.id}
                    activeOpacity={0.7}
                    onPress={() => setOwner(o.id)}
                    style={[
                      styles.ownerBtn,
                      on && {
                        backgroundColor: '#FFF5F8',
                        borderWidth: 2,
                        borderColor: o.accent,
                      },
                    ]}
                  >
                    <View style={[styles.ownerSwatch, { backgroundColor: o.tint }]} />
                    <Text
                      style={[
                        styles.ownerLabel,
                        on && { color: o.accent, fontWeight: '700' },
                      ]}
                    >
                      {o.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 시작 / 종료 / 하루 종일 */}
          <View style={styles.card}>
            <View style={styles.timeRow}>
              <Text style={styles.timeIcon}>📅</Text>
              <Text style={styles.timeLabel}>시작</Text>
              <View style={styles.timeChipsWrap}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setOpenStartDate(true)}
                  style={styles.timeChip}
                >
                  <Text style={styles.timeChipText}>{formatDateK(startDate)}</Text>
                </TouchableOpacity>
                {!allDay && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setOpenStartTime(true)}
                    style={styles.timeChip}
                  >
                    <Text style={styles.timeChipText}>{formatTimeK(startDate)}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.timeRow}>
              <Text style={styles.timeIcon}>📅</Text>
              <Text style={styles.timeLabel}>종료</Text>
              <View style={styles.timeChipsWrap}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setOpenEndDate(true)}
                  style={styles.timeChip}
                >
                  <Text style={styles.timeChipText}>{formatDateK(endDate)}</Text>
                </TouchableOpacity>
                {!allDay && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setOpenEndTime(true)}
                    style={styles.timeChip}
                  >
                    <Text style={styles.timeChipText}>{formatTimeK(endDate)}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.allDayRow}>
              <Text style={styles.allDayLabel}>하루 종일</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setAllDay((v) => !v)}
                style={[styles.toggle, allDay ? styles.toggleOn : styles.toggleOff]}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    allDay ? styles.toggleKnobOn : styles.toggleKnobOff,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 위치 */}
          <TouchableOpacity activeOpacity={0.7} style={styles.card}>
            <View style={styles.locationRow}>
              <Text style={styles.timeIcon}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationName}>서울숲</Text>
                <Text style={styles.locationAddr}>서울시 성동구 서울숲길 273</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          {/* 알림 / 반복 / 태그 */}
          <View style={[styles.card, styles.metaCard]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setOpenReminder(true)}
              style={[styles.metaRow, styles.metaRowDivider]}
            >
              <Text style={styles.metaIcon}>🔔</Text>
              <Text style={styles.metaLabel}>알림</Text>
              <Text style={styles.metaValue}>{reminderLabel}</Text>
              <Text style={styles.metaChevron}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setOpenRepeat(true)}
              style={[styles.metaRow, styles.metaRowDivider]}
            >
              <Text style={styles.metaIcon}>🔁</Text>
              <Text style={styles.metaLabel}>반복</Text>
              <Text style={styles.metaValue}>{repeatLabel}</Text>
              <Text style={styles.metaChevron}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setOpenTag(true)}
              style={styles.metaRow}
            >
              <Text style={styles.metaIcon}>🏷️</Text>
              <Text style={styles.metaLabel}>태그</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {tagLabel}
              </Text>
              <Text style={styles.metaChevron}>›</Text>
            </TouchableOpacity>
          </View>

          {/* 메모 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>메모</Text>
            <TextInput
              value={memo}
              onChangeText={setMemo}
              multiline
              style={styles.memoInput}
              placeholder="메모를 입력하세요"
              placeholderTextColor={colors.inkMute}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Save bar */}
        <View style={styles.saveBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={goBack}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            style={styles.saveBtnWrap}
          >
            <LinearGradient
              colors={[colors.pink, colors.heartRed]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveBtn}
            >
              <Text style={styles.saveHeart}>♥</Text>
              <Text style={styles.saveText}>일정 저장하기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modals */}
      <CalendarPicker
        visible={openStartDate}
        value={startDate}
        onClose={() => setOpenStartDate(false)}
        onSelect={(d) => setStartDate(mergeDate(startDate, d))}
      />
      <CalendarPicker
        visible={openEndDate}
        value={endDate}
        onClose={() => setOpenEndDate(false)}
        onSelect={(d) => setEndDate(mergeDate(endDate, d))}
      />
      <TimePicker
        visible={openStartTime}
        value={startDate}
        onClose={() => setOpenStartTime(false)}
        onSelect={setStartDate}
      />
      <TimePicker
        visible={openEndTime}
        value={endDate}
        onClose={() => setOpenEndTime(false)}
        onSelect={setEndDate}
      />
      <SimpleListPicker
        visible={openReminder}
        title="알림"
        value={reminder}
        options={REMINDERS}
        onClose={() => setOpenReminder(false)}
        onSelect={setReminder}
      />
      <SimpleListPicker
        visible={openRepeat}
        title="반복"
        value={repeat}
        options={REPEATS}
        onClose={() => setOpenRepeat(false)}
        onSelect={setRepeat}
      />
      <TagPicker
        visible={openTag}
        value={tags}
        onClose={() => setOpenTag(false)}
        onSelect={setTags}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },

  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  appbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 26, color: colors.ink, fontWeight: '300', lineHeight: 28 },
  appbarTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  appbarSave: { fontSize: 13, color: colors.pink, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },

  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line2,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 10 },

  fieldLabel: { fontSize: 11, color: '#888', fontWeight: '600', marginBottom: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleNotch: { width: 4, height: 22, borderRadius: 2 },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    padding: 0,
  },

  ownerRow: { flexDirection: 'row', gap: 8 },
  ownerBtn: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: colors.line2,
    alignItems: 'center',
    gap: 6,
  },
  ownerSwatch: { width: 28, height: 12, borderRadius: 2 },
  ownerLabel: { fontSize: 11, fontWeight: '500', color: colors.ink3 },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  timeIcon: { fontSize: 14 },
  timeLabel: { fontSize: 12, color: '#888', width: 36 },
  timeChipsWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  timeChipText: { fontSize: 13, fontWeight: '700', color: colors.ink },

  divider: { height: 1, backgroundColor: colors.line2 },
  allDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  allDayLabel: { fontSize: 13, color: colors.ink },

  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationName: { fontSize: 13, fontWeight: '600', color: colors.ink },
  locationAddr: { fontSize: 11, color: '#888', marginTop: 2 },
  chevron: { fontSize: 18, color: colors.inkMute, fontWeight: '300' },

  metaCard: { padding: 4 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  metaRowDivider: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  metaIcon: { fontSize: 14 },
  metaLabel: { width: 60, fontSize: 13, fontWeight: '600', color: colors.ink },
  metaValue: { flex: 1, fontSize: 12, color: '#888', textAlign: 'right' },
  metaChevron: { fontSize: 14, color: '#CCC', fontWeight: '300' },

  memoInput: {
    fontSize: 12,
    color: colors.ink,
    lineHeight: 18,
    minHeight: 60,
    padding: 0,
  },

  toggle: {
    width: 36,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: colors.heartRed },
  toggleOff: { backgroundColor: '#E0E0E0' },
  toggleKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff' },
  toggleKnobOn: { alignSelf: 'flex-end' },
  toggleKnobOff: { alignSelf: 'flex-start' },

  saveBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.line2,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.ink3 },
  saveBtnWrap: { flex: 2 },
  saveBtn: {
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.heartRed,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
  },
  saveHeart: { color: '#fff', fontSize: 14 },
  saveText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
