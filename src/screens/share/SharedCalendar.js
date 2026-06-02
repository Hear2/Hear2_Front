import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Heart from '../../components/common/Heart';
import { useMemories } from '../../contexts/MemoryContext';
import { useEvents } from '../../contexts/EventContext';
import { useCouple } from '../../contexts/CoupleContext';

const OWNER_TINT = {
  me:      'rgba(255,138,76,0.55)',
  partner: 'rgba(108,165,255,0.55)',
  couple:  'rgba(255,138,178,0.55)',
};
const OWNER_LABEL = {
  me: '예진',
  partner: '지호',
  couple: '공동',
};

const PINK = '#FF6B9D';
const BLUE = '#4D96FF';
const INK = '#1E2152';
const INK_MUTE = '#888888';

const HL_ORANGE = 'rgba(255,138,76,0.55)';
const HL_BLUE   = 'rgba(108,165,255,0.55)';
const HL_PINK   = 'rgba(255,138,178,0.55)';

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const GRID_LINE = '#EFEFEF';

const HL_TOP_1 = 32;
const HL_TOP_2 = 48;

// 4월 데모용 하드코딩 일정 (2026년 4월일 때만 표시)
const APRIL_HIGHLIGHTS = {
  3:  [{ c: HL_ORANGE, l: '요가',         span: 1, top: HL_TOP_1 }],
  5:  [{ c: HL_BLUE,   l: '개파',         span: 1, top: HL_TOP_1 }],
  9:  [{ c: HL_ORANGE, l: '브런치',       span: 1, top: HL_TOP_1 }],
  12: [{ c: HL_PINK,   l: '서울숲 데이트', span: 2, top: HL_TOP_1 }],
  14: [{ c: HL_ORANGE, l: '요가',         span: 1, top: HL_TOP_1 }],
  17: [{ c: HL_BLUE,   l: '회식',         span: 1, top: HL_TOP_1 }],
  19: [{ c: HL_PINK,   l: '데이트',       span: 2, top: HL_TOP_1 }],
  20: [{ c: HL_BLUE,   l: '엠티',         span: 2, top: HL_TOP_2 }],
  24: [{ c: HL_ORANGE, l: '엄마 생일',    span: 1, top: HL_TOP_1 }],
  27: [{ c: HL_PINK,   l: '8개월 ♥',      span: 2, top: HL_TOP_1 }],
};
const APRIL_HEART_DAYS = new Set([7, 12, 14, 19]);

const APRIL_EVENTS = [
  { date: '4/12', title: '서울숲 데이트', tag: '공동', tint: '#FFE4EE', color: '#E84A82' },
  { date: '4/14', title: '요가 클래스',   tag: '예진', tint: '#FFE9D9', color: '#E07A2C' },
  { date: '4/20', title: '결혼식 참석',   tag: '지호', tint: '#E8F0FF', color: BLUE },
];

const HeaderIcon = ({ name }) => {
  const props = { stroke: INK, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  if (name === 'search') {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path {...props} d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.3-4.3" />
      </Svg>
    );
  }
  if (name === 'bell') {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path {...props} d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2zM10 21a2 2 0 0 0 4 0" />
      </Svg>
    );
  }
  if (name === 'plus') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path {...props} d="M12 5v14M5 12h14" />
      </Svg>
    );
  }
  return null;
};

const Highlight = ({ color, label, span, top, cellWidth, onPress }) => {
  const width = cellWidth * span - 4;
  const Wrap = onPress ? TouchableOpacity : View;
  return (
    <Wrap
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.highlight, { top, width, backgroundColor: color }]}
    >
      <View style={styles.highlightNotch} />
      <Text style={styles.highlightLabel} numberOfLines={1}>
        {label}
      </Text>
    </Wrap>
  );
};

const parseMonthDay = (str) => {
  const m = String(str ?? '').match(/^\s*(\d+)\.(\d+)/);
  if (!m) return null;
  return { month: parseInt(m[1], 10), day: parseInt(m[2], 10) };
};

export default function SharedCalendar({ navigation, route }) {
  const { memories } = useMemories();
  const { events } = useEvents();
  const { anniversaries } = useCouple();
  const today = useMemo(() => new Date(), []);

  // 커플 관리의 기념일(자동 계산 포함)을 캘린더 이벤트 모양으로 변환해 합친다.
  // EventContext에 복제하지 않고 파생 병합하므로 항상 기념일과 동기화된다.
  const anniversaryEvents = useMemo(
    () =>
      (anniversaries || [])
        .filter((a) => a.date)
        .map((a) => ({
          id: `ann-${a.id}`,
          startDate: a.date,
          endDate: a.date,
          title: a.name,
          owner: 'couple',
          isAnniversary: true,
        })),
    [anniversaries],
  );
  const calendarEvents = useMemo(
    () => [...events, ...anniversaryEvents],
    [events, anniversaryEvents],
  );
  const [view, setView] = useState({
    y: today.getFullYear(),
    m: today.getMonth(),
  });

  const jumpTo = route?.params?.jumpTo;
  useEffect(() => {
    if (!jumpTo) return;
    setView({ y: jumpTo.y, m: jumpTo.m });
    navigation?.setParams?.({ jumpTo: undefined });
  }, [jumpTo, navigation]);

  const [gridWidth, setGridWidth] = useState(0);
  const cellWidth = gridWidth > 0 ? Math.floor(gridWidth / 7) : 0;
  const cellHeight = cellWidth > 0 ? cellWidth * 1.75 : 0;

  const startDow = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;
  const isCurrentMonth =
    view.y === today.getFullYear() && view.m === today.getMonth();
  const todayDay = isCurrentMonth ? today.getDate() : -1;
  const isAprilDemo = view.y === 2026 && view.m === 3;

  const memoriesByDay = useMemo(() => {
    const map = {};
    memories.forEach((mem) => {
      const p = parseMonthDay(mem.date);
      if (!p) return;
      const memYear = mem.createdAt
        ? new Date(mem.createdAt).getFullYear()
        : today.getFullYear();
      if (memYear !== view.y || p.month - 1 !== view.m) return;
      if (!map[p.day]) map[p.day] = [];
      map[p.day].push(mem);
    });
    return map;
  }, [memories, view, today]);

  // 다일 일정을 주 단위로 잘라서 segment 단위로 표시. 같은 주에 걸친 부분은 span으로 한 번에.
  const eventSegments = useMemo(() => {
    const result = [];
    const monthStart = new Date(view.y, view.m, 1);
    const monthEnd = new Date(view.y, view.m + 1, 0);
    monthStart.setHours(0, 0, 0, 0);
    monthEnd.setHours(0, 0, 0, 0);

    calendarEvents.forEach((ev) => {
      if (!ev.startDate) return;
      const startRaw = new Date(ev.startDate);
      const endRaw = ev.endDate ? new Date(ev.endDate) : startRaw;
      const start = new Date(
        startRaw.getFullYear(),
        startRaw.getMonth(),
        startRaw.getDate(),
      );
      const end = new Date(
        endRaw.getFullYear(),
        endRaw.getMonth(),
        endRaw.getDate(),
      );

      const evStart = start < monthStart ? new Date(monthStart) : start;
      const evEnd = end > monthEnd ? new Date(monthEnd) : end;
      if (evStart > evEnd) return;

      const cursor = new Date(evStart);
      while (cursor <= evEnd) {
        const dow = cursor.getDay();
        const daysToWeekEnd = 6 - dow; // until Saturday
        const segEndCandidate = new Date(cursor);
        segEndCandidate.setDate(segEndCandidate.getDate() + daysToWeekEnd);
        const segEnd = segEndCandidate > evEnd ? new Date(evEnd) : segEndCandidate;
        const span =
          Math.round((segEnd - cursor) / 86400000) + 1;
        result.push({
          day: cursor.getDate(),
          span,
          event: ev,
        });
        cursor.setDate(cursor.getDate() + span);
      }
    });
    return result;
  }, [calendarEvents, view]);

  // 하이라이트 바는 공유 일정 전용. 추억은 하트 아이콘만 표시.
  const highlightsByDay = useMemo(() => {
    const map = {};
    if (isAprilDemo) {
      Object.keys(APRIL_HIGHLIGHTS).forEach((k) => {
        map[k] = [...APRIL_HIGHLIGHTS[k]];
      });
    }
    eventSegments.forEach((seg) => {
      if (!map[seg.day]) map[seg.day] = [];
      const tint = OWNER_TINT[seg.event.owner] || HL_PINK;
      const top = map[seg.day].length % 2 === 0 ? HL_TOP_1 : HL_TOP_2;
      map[seg.day].push({
        c: tint,
        l: seg.event.title || '일정',
        span: seg.span,
        top,
        event: seg.event,
      });
    });
    return map;
  }, [isAprilDemo, eventSegments]);

  const heartDays = useMemo(() => {
    const set = new Set();
    if (isAprilDemo) APRIL_HEART_DAYS.forEach((d) => set.add(d));
    Object.keys(memoriesByDay).forEach((d) => set.add(parseInt(d, 10)));
    return set;
  }, [memoriesByDay, isAprilDemo]);

  const goPrev = () =>
    setView(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }));
  const goNext = () =>
    setView(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }));
  const goToday = () =>
    setView({ y: today.getFullYear(), m: today.getMonth() });

  const renderCells = () => {
    if (cellWidth === 0) return null;
    const cells = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startDow + 1;
      const isValid = dayNum >= 1 && dayNum <= daysInMonth;
      const colIndex = i % 7;
      const rowIndex = Math.floor(i / 7);
      const isSunday = colIndex === 0;
      const isSaturday = colIndex === 6;
      const dayHighlights = isValid ? highlightsByDay[dayNum] || [] : [];
      const dayMemories = isValid ? memoriesByDay[dayNum] || [] : [];
      const showHeart = isValid && heartDays.has(dayNum);
      const isToday = dayNum === todayDay;

      const cellStyle = {
        width: cellWidth,
        height: cellHeight,
        paddingTop: 6,
        paddingHorizontal: 4,
        position: 'relative',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: colIndex === 0 ? 1 : 0,
        borderTopWidth: rowIndex === 0 ? 1 : 0,
        borderColor: GRID_LINE,
      };

      const onCellPress =
        dayMemories.length > 0
          ? () =>
              navigation?.navigate?.('PhotoDetail', {
                memory: dayMemories[0],
              })
          : undefined;

      const Container = onCellPress ? TouchableOpacity : View;
      const containerProps = onCellPress
        ? { activeOpacity: 0.7, onPress: onCellPress }
        : {};

      cells.push(
        <Container key={i} {...containerProps} style={cellStyle}>
          {isValid && (
            <View style={styles.dayWrap}>
              {isToday ? (
                <View style={styles.todayCircle}>
                  <Text style={styles.todayText}>{dayNum}</Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.dayText,
                    isSunday && { color: PINK },
                    isSaturday && { color: BLUE },
                  ]}
                >
                  {dayNum}
                </Text>
              )}
              {showHeart && <Heart size={10} color="#FC2648" />}
            </View>
          )}
          {dayHighlights.map((h, j) => (
            <Highlight
              key={j}
              color={h.c}
              label={h.l}
              span={h.span}
              top={h.top}
              cellWidth={cellWidth}
              onPress={() =>
                navigation?.navigate?.(
                  'EventDetail',
                  h.event ? { eventId: h.event.id } : undefined,
                )
              }
            />
          ))}
        </Container>
      );
    }
    return cells;
  };

  const monthMemoryList = useMemo(() => {
    const list = [];
    Object.keys(memoriesByDay)
      .map((k) => parseInt(k, 10))
      .sort((a, b) => a - b)
      .forEach((day) => {
        memoriesByDay[day].forEach((m) => list.push({ ...m, _day: day }));
      });
    return list;
  }, [memoriesByDay]);

  const monthEventList = useMemo(() => {
    const seen = new Set();
    const list = [];
    eventSegments
      .slice()
      .sort((a, b) => a.day - b.day)
      .forEach((seg) => {
        if (seen.has(seg.event.id)) return;
        seen.add(seg.event.id);
        list.push({ ...seg.event, _firstDay: seg.day });
      });
    return list;
  }, [eventSegments]);

  return (
    <View style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={goPrev}
              style={styles.navBtn}
              hitSlop={8}
            >
              <Text style={styles.navArrow}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goToday}
              activeOpacity={0.7}
              style={styles.monthLabelWrap}
            >
              <Text style={styles.yearText}>{view.y}</Text>
              <Text style={styles.bigMonth}>
                {view.m + 1}
                <Text style={styles.bigMonthSuffix}>월</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goNext}
              style={styles.navBtn}
              hitSlop={8}
            >
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity hitSlop={8} style={styles.headerIconBtn} onPress={() => navigation?.navigate('SearchScreen')}>
              <HeaderIcon name="search" />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={8} style={styles.headerIconBtn} onPress={() => navigation?.navigate('NotificationsScreen')}>
              <HeaderIcon name="bell" />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={8} onPress={() => navigation?.navigate?.('EventAdd')}>
              <HeaderIcon name="plus" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          {/* Weekday labels */}
          {cellWidth > 0 && (
            <View style={styles.weekHeader}>
              {DAYS_OF_WEEK.map((d, i) => (
                <View key={i} style={{ width: cellWidth, alignItems: 'center' }}>
                  <Text
                    style={[
                      styles.weekText,
                      i === 0 && { color: PINK },
                      i === 6 && { color: BLUE },
                    ]}
                  >
                    {d}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Calendar grid */}
          <View
            style={styles.grid}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (w && Math.abs(w - gridWidth) > 0.5) setGridWidth(w);
            }}
          >
            {renderCells()}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: HL_ORANGE }]} />
              <Text style={styles.legendText}>예진</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: HL_BLUE }]} />
              <Text style={styles.legendText}>지호</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: HL_PINK }]} />
              <Text style={styles.legendText}>공동</Text>
            </View>
            <View style={styles.legendItem}>
              <Heart size={11} color="#FC2648" />
              <Text style={styles.legendText}>사진/메모</Text>
            </View>
          </View>

          {/* This-month event list (user-created) */}
          {monthEventList.length > 0 && (
            <>
              <Text style={styles.eventsTitle}>이 달의 일정</Text>
              {monthEventList.map((ev) => {
                const tint = OWNER_TINT[ev.owner] || HL_PINK;
                const ownerLabel = OWNER_LABEL[ev.owner] || '공동';
                const start = new Date(ev.startDate);
                return (
                  <TouchableOpacity
                    key={ev.id}
                    style={styles.eventCard}
                    activeOpacity={0.7}
                    onPress={() =>
                      ev.isAnniversary
                        ? navigation?.navigate?.('CoupleManageScreen')
                        : navigation?.navigate?.('EventDetail', { eventId: ev.id })
                    }
                  >
                    <View
                      style={[styles.eventDateBox, { backgroundColor: tint }]}
                    >
                      <Text style={[styles.eventDateMonth, { color: INK }]}>
                        {start.getMonth() + 1}월
                      </Text>
                      <Text style={[styles.eventDateDay, { color: INK }]}>
                        {ev._firstDay}
                      </Text>
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle} numberOfLines={1}>
                        {ev.title}
                      </Text>
                      <View style={[styles.tagChip, { backgroundColor: tint }]}>
                        <Text style={[styles.tagText, { color: INK }]}>
                          #{ownerLabel}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.eventArrow}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {/* This-month memory list */}
          {monthMemoryList.length > 0 && (
            <>
              <Text style={styles.eventsTitle}>이 달의 추억</Text>
              {monthMemoryList.map((m, idx) => (
                <TouchableOpacity
                  key={`${m.createdAt ?? idx}-${m._day}`}
                  style={styles.eventCard}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation?.navigate?.('PhotoDetail', { memory: m })
                  }
                >
                  <View
                    style={[
                      styles.eventDateBox,
                      { backgroundColor: m.tint || '#FFE4EE' },
                    ]}
                  >
                    <Text
                      style={[styles.eventDateMonth, { color: '#E84A82' }]}
                    >
                      {view.m + 1}월
                    </Text>
                    <Text style={[styles.eventDateDay, { color: '#E84A82' }]}>
                      {m._day}
                    </Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {m.emoji} {m.title || m.place || '추억'}
                    </Text>
                    <View style={[styles.tagChip, { backgroundColor: '#FFE4EE' }]}>
                      <Text style={[styles.tagText, { color: '#E84A82' }]}>
                        {m.tag || '#추억'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.eventArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* April demo upcoming events */}
          {isAprilDemo && (
            <>
              <Text style={styles.eventsTitle}>다가오는 일정</Text>
              {APRIL_EVENTS.map((event, idx) => {
                const [m, d] = event.date.split('/');
                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.eventCard}
                    activeOpacity={0.7}
                    onPress={() => navigation?.navigate?.('EventDetail')}
                  >
                    <View
                      style={[styles.eventDateBox, { backgroundColor: event.tint }]}
                    >
                      <Text
                        style={[styles.eventDateMonth, { color: event.color }]}
                      >
                        {parseInt(m, 10)}월
                      </Text>
                      <Text
                        style={[styles.eventDateDay, { color: event.color }]}
                      >
                        {parseInt(d, 10)}
                      </Text>
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <View
                        style={[styles.tagChip, { backgroundColor: event.tint }]}
                      >
                        <Text style={[styles.tagText, { color: event.color }]}>
                          #{event.tag}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.eventArrow}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  navBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  navArrow: {
    fontSize: 30,
    color: INK,
    fontWeight: '300',
    lineHeight: 32,
  },
  monthLabelWrap: { alignItems: 'flex-start' },
  yearText: {
    fontSize: 12,
    color: INK_MUTE,
    fontWeight: '600',
    marginBottom: -2,
  },
  bigMonth: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
    lineHeight: 40,
  },
  bigMonthSuffix: { fontSize: 28, fontWeight: '800', color: INK },
  headerIcons: { flexDirection: 'row', alignItems: 'center', paddingBottom: 6 },
  headerIconBtn: { marginRight: 24 },
  body: { paddingHorizontal: 16 },
  weekHeader: { flexDirection: 'row', paddingTop: 6, paddingBottom: 8 },
  weekText: {
    fontSize: 11,
    fontWeight: '600',
    color: INK_MUTE,
    textAlign: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 22,
    gap: 4,
  },
  dayText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: INK,
  },
  todayCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PINK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  heartMarker: { position: 'absolute', top: 4, right: 5, zIndex: 2 },
  highlight: {
    position: 'absolute',
    left: 2,
    height: 14,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    overflow: 'hidden',
    zIndex: 1,
  },
  highlightNotch: {
    width: 2,
    height: 9,
    backgroundColor: 'rgba(30,33,82,0.55)',
    marginRight: 3,
  },
  highlightLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: INK,
    flexShrink: 1,
  },
  legend: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendSwatch: { width: 18, height: 10, borderRadius: 2, marginRight: 6 },
  legendText: { fontSize: 11, color: '#555555' },
  eventsTitle: {
    marginTop: 18,
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    marginBottom: 10,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  eventDateBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventDateMonth: { fontSize: 9, fontWeight: '600' },
  eventDateDay: { fontSize: 16, fontWeight: '700' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '600', color: INK },
  tagChip: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  tagText: { fontSize: 11, fontWeight: '600' },
  eventArrow: {
    fontSize: 18,
    color: '#AAA',
    fontWeight: '300',
    marginLeft: 8,
  },
});
