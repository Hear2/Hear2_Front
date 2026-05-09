import React from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import { useEvents } from '../../contexts/EventContext';

const OWNERS_INFO = {
  me:      { tint: 'rgba(255,138,76,0.55)',  chipLabel: '예진 일정' },
  partner: { tint: 'rgba(108,165,255,0.55)', chipLabel: '지호 일정' },
  couple:  { tint: 'rgba(255,138,178,0.55)', chipLabel: '공동 일정' },
};

const REMINDER_LABEL = {
  none: '알림 없음',
  start: '시작 시각',
  '5m': '5분 전',
  '10m': '10분 전',
  '15m': '15분 전',
  '30m': '30분 전',
  '1h': '1시간 전',
  '1d': '1일 전',
};
const REPEAT_LABEL = {
  none: '안 함',
  daily: '매일',
  weekly: '매주',
  monthly: '매월',
  yearly: '매년',
};

const DOWS = ['일', '월', '화', '수', '목', '금', '토'];
const formatTimeK = (d) => {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 || 12;
  return `${ampm} ${h12}:${String(m).padStart(2, '0')}`;
};
const formatFullDate = (d) =>
  `${d.getMonth() + 1}월 ${d.getDate()}일 ${DOWS[d.getDay()]}요일`;
const formatDateShort = (d) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
const formatDateTimeK = (d) => `${formatDateShort(d)} ${formatTimeK(d)}`;
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const computeDDay = (target) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  const diff = Math.round((t - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'D-Day';
  if (diff > 0) return `D-${diff}`;
  return `D+${-diff}`;
};

const computeDuration = (start, end) => {
  const minutes = Math.max(0, Math.round((end - start) / 60000));
  const days = Math.floor(minutes / (60 * 24));
  const rest = minutes - days * 60 * 24;
  const hours = Math.floor(rest / 60);
  const mins = rest % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}일`);
  if (hours > 0) parts.push(`${hours}시간`);
  if (mins > 0) parts.push(`${mins}분`);
  return parts.length ? parts.join(' ') : '잠깐';
};

// Demo event used when no eventId passed (e.g. tapping April demo highlight)
const DEMO_EVENT = {
  title: '서울숲 데이트 🌸',
  owner: 'couple',
  startDate: new Date(2026, 3, 12, 14, 0),
  endDate: new Date(2026, 3, 12, 19, 0),
  allDay: false,
  location: { name: '서울숲', address: '서울시 성동구 서울숲길 273' },
  reminder: '30m',
  repeat: 'none',
  tags: ['데이트', '봄', '벚꽃'],
  memo:
    '벚꽃 보러 가기. 카페 들렀다가 한강 산책 코스로! 🌸\n4시쯤 피크닉 자리 잡고 사진 많이 찍자!',
};

export default function EventDetailScreen({ navigation, route }) {
  const { events, removeEvent } = useEvents();
  const eventId = route?.params?.eventId;
  const found = eventId ? events.find((e) => e.id === eventId) : null;
  const event = found || DEMO_EVENT;
  const isUserEvent = !!found;

  const ownerObj = OWNERS_INFO[event.owner] || OWNERS_INFO.couple;
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const allDay = !!event.allDay;
  const dDay = computeDDay(start);
  const dateLabel =
    start.toDateString() === end.toDateString()
      ? formatFullDate(start)
      : `${formatFullDate(start)} ~ ${formatFullDate(end)}`;
  const sameDay = isSameDay(start, end);
  const timeRange = allDay
    ? sameDay
      ? '하루 종일'
      : `${formatDateShort(start)} — ${formatDateShort(end)} 하루 종일`
    : sameDay
    ? `${formatTimeK(start)} — ${formatTimeK(end)}`
    : `${formatDateTimeK(start)} — ${formatDateTimeK(end)}`;
  const duration = allDay ? '' : computeDuration(start, end);
  const location = event.location || { name: '', address: '' };
  const tags = event.tags || [];
  const memo = event.memo || '';
  const reminderLabel = REMINDER_LABEL[event.reminder] ?? '알림 없음';
  const repeatLabel = REPEAT_LABEL[event.repeat] ?? '안 함';

  const goBack = () => navigation?.goBack?.();
  const goChat = () =>
    navigation?.navigate?.('MainTabs', { screen: '채팅' });

  const handleEdit = () => {
    if (!isUserEvent) {
      Alert.alert('편집', '데모 일정은 편집할 수 없어요.');
      return;
    }
    navigation?.navigate?.('EventAdd', { eventId });
  };

  const handleDelete = () => {
    if (!isUserEvent) {
      Alert.alert('삭제', '데모 일정은 삭제할 수 없어요.');
      return;
    }
    Alert.alert(
      '일정 삭제',
      `'${event.title}'을(를) 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            removeEvent(eventId);
            navigation?.goBack?.();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.appbar}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={8}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.appbarRight}>
          <TouchableOpacity hitSlop={8} onPress={handleEdit}>
            <Text style={styles.editText}>편집</Text>
          </TouchableOpacity>
          <TouchableOpacity hitSlop={8}>
            <Text style={styles.moreIcon}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={['#FFF5F8', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.hero}
        >
          <View style={[styles.ownerChip, { backgroundColor: ownerObj.tint }]}>
            <View style={styles.ownerNotch} />
            <Text style={styles.ownerChipText}>{ownerObj.chipLabel}</Text>
          </View>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.dDay}>
            {dDay} · {dateLabel}
          </Text>

          <View style={styles.avatarRow}>
            <View style={[styles.avatar, styles.avatarMe]}>
              <Text style={styles.avatarMeText}>예</Text>
            </View>
            <View style={[styles.avatar, styles.avatarPartner]}>
              <Text style={styles.avatarPartnerText}>지</Text>
            </View>
            <Text style={styles.avatarLabel}>예진 ♥ 지호</Text>
          </View>
        </LinearGradient>

        {/* Time / Location */}
        <View style={styles.cardWrap}>
          <View style={styles.card}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeIcon}>📅</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.timeMain}>{timeRange}</Text>
                {!!duration && <Text style={styles.timeSub}>{duration}</Text>}
              </View>
            </View>
            {!!location.name && (
              <>
                <View style={styles.dividerSoft} />
                <View style={styles.locationBlock}>
                  <Text style={styles.timeIcon}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locationName}>{location.name}</Text>
                    {!!location.address && (
                      <Text style={styles.locationAddr}>{location.address}</Text>
                    )}
                  </View>
                  <Text style={styles.mapLink}>지도</Text>
                </View>

                <LinearGradient
                  colors={['#E8F5E9', '#C5E8D5', '#FFE4EE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.miniMap}
                >
                  <View style={styles.mapPin}>
                    <Text style={styles.mapPinHeart}>♥</Text>
                  </View>
                </LinearGradient>
              </>
            )}
          </View>
        </View>

        {/* Memo + Tags */}
        {(!!memo || tags.length > 0) && (
          <View style={styles.cardWrap}>
            <View style={styles.card}>
              <View style={styles.memoHeader}>
                <Text style={styles.memoIcon}>💭</Text>
                <Text style={styles.memoTitle}>메모</Text>
              </View>
              {!!memo && <Text style={styles.memoText}>{memo}</Text>}
              {tags.length > 0 && (
                <View style={styles.tagRow}>
                  {tags.map((t) => (
                    <View key={t} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>#{t}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Reminder / Repeat */}
        <View style={styles.cardWrap}>
          <View style={[styles.card, styles.metaCard]}>
            <View style={[styles.metaRow, styles.metaRowDivider]}>
              <Text style={styles.metaIcon}>🔔</Text>
              <Text style={styles.metaLabel}>알림</Text>
              <Text style={styles.metaValue}>{reminderLabel}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>🔁</Text>
              <Text style={styles.metaLabel}>반복</Text>
              <Text style={styles.metaValue}>{repeatLabel}</Text>
            </View>
          </View>
        </View>

        {/* Couple chat preview */}
        <View style={styles.cardWrap}>
          <View style={styles.chatCard}>
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <Text style={styles.chatHeart}>♥</Text>
                <Text style={styles.chatHeaderTitle}>이 일정에 대해</Text>
              </View>
              <TouchableOpacity onPress={goChat} hitSlop={8}>
                <Text style={styles.chatGoLink}>채팅으로 가기</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bubblePartnerWrap}>
              <Text style={styles.bubblePartnerText}>이날 같이 가자 💕</Text>
            </View>
            <LinearGradient
              colors={[colors.pink, colors.heartRed]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bubbleMineWrap}
            >
              <Text style={styles.bubbleMineText}>좋아! 잊지말고 챙기자 🍱</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85}>
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionText}>사진 추가</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionDangerBtn}
            activeOpacity={0.85}
            onPress={handleDelete}
          >
            <Text style={styles.actionIcon}>🗑</Text>
            <Text style={styles.actionDangerText}>일정 삭제</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  backBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 26, color: colors.ink, fontWeight: '300', lineHeight: 28 },
  appbarRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  editText: { fontSize: 13, color: colors.pink, fontWeight: '700' },
  moreIcon: { fontSize: 20, color: colors.ink, fontWeight: '700' },

  scroll: { flex: 1 },

  // Hero
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  ownerChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownerNotch: {
    width: 4,
    height: 10,
    backgroundColor: 'rgba(30,33,82,0.55)',
  },
  ownerChipText: { fontSize: 11, fontWeight: '700', color: colors.ink },
  title: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: colors.ink,
  },
  dDay: { marginTop: 4, fontSize: 13, color: colors.ink3 },
  avatarRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMe: { backgroundColor: '#FFE4EE' },
  avatarMeText: { fontSize: 12, fontWeight: '700', color: colors.pinkDeep },
  avatarPartner: { backgroundColor: colors.blueTint, marginLeft: -10 },
  avatarPartnerText: { fontSize: 12, fontWeight: '700', color: colors.blue },
  avatarLabel: {
    marginLeft: 12,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },

  cardWrap: { paddingHorizontal: 16, marginTop: 12 },
  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line2,
  },

  timeBlock: { flexDirection: 'row', gap: 12, paddingBottom: 10 },
  timeIcon: { fontSize: 14 },
  timeMain: { fontSize: 13, fontWeight: '600', color: colors.ink },
  timeSub: { fontSize: 11, color: '#888', marginTop: 2 },
  dividerSoft: { height: 1, backgroundColor: '#F5F5F5' },

  locationBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 10,
  },
  locationName: { fontSize: 13, fontWeight: '600', color: colors.ink },
  locationAddr: { fontSize: 11, color: '#888', marginTop: 2 },
  mapLink: { fontSize: 11, color: colors.pink, fontWeight: '700' },

  miniMap: {
    marginTop: 12,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.heartRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.heartRed,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  mapPinHeart: { color: '#fff', fontSize: 14 },

  memoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  memoIcon: { fontSize: 14 },
  memoTitle: { fontSize: 13, fontWeight: '700', color: colors.ink },
  memoText: { fontSize: 12, color: colors.ink, lineHeight: 19 },
  tagRow: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 11,
    backgroundColor: '#FFE4EE',
  },
  tagChipText: { fontSize: 11, fontWeight: '700', color: colors.pinkDeep },

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
  metaLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.ink },
  metaValue: { fontSize: 12, color: '#888' },

  chatCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFF8FB',
    borderWidth: 1,
    borderColor: '#FFD0E0',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chatHeart: { fontSize: 14, color: colors.heartRed },
  chatHeaderTitle: { fontSize: 13, fontWeight: '700', color: colors.ink },
  chatGoLink: { fontSize: 11, color: colors.pink, fontWeight: '600' },

  bubblePartnerWrap: {
    alignSelf: 'flex-start',
    maxWidth: '78%',
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderTopLeftRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line2,
    marginBottom: 6,
  },
  bubblePartnerText: { fontSize: 12, color: colors.ink },
  bubbleMineWrap: {
    alignSelf: 'flex-end',
    maxWidth: '78%',
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderTopRightRadius: 4,
  },
  bubbleMineText: { fontSize: 12, color: '#fff' },

  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionDangerBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FFD0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionIcon: { fontSize: 14 },
  actionText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  actionDangerText: { fontSize: 13, fontWeight: '700', color: colors.heartRed },
});
