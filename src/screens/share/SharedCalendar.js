import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Heart from '../../components/common/Heart';

const PINK = '#FF6B9D';
const BLUE = '#4D96FF';
const INK = '#1E2152';
const INK_MUTE = '#888888';

const HL_ORANGE = 'rgba(255,138,76,0.55)';
const HL_BLUE   = 'rgba(108,165,255,0.55)';
const HL_PINK   = 'rgba(255,138,178,0.55)';

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_START_INDEX = 3;
const DAYS_IN_MONTH = 30;
const TODAY = 19;
const GRID_LINE = '#EFEFEF';

const HL_TOP_1 = 32;
const HL_TOP_2 = 48;

const HIGHLIGHTS = {
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

const HEART_DAYS = new Set([7, 12, 14, 19]);

const EVENTS = [
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

const Highlight = ({ color, label, span, top, cellWidth }) => {
  const width = cellWidth * span - 4;
  return (
    <View style={[styles.highlight, { top, width, backgroundColor: color }]}>
      <View style={styles.highlightNotch} />
      <Text style={styles.highlightLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

export default function SharedCalendar({ navigation }) {
  const [gridWidth, setGridWidth] = useState(0);
  const cellWidth = gridWidth > 0 ? Math.floor(gridWidth / 7) : 0;
  const cellHeight = cellWidth > 0 ? cellWidth * 1.75 : 0;

  const renderCells = () => {
    if (cellWidth === 0) return null;
    const cells = [];
    for (let i = 0; i < 35; i++) {
      const dayNum = i - MONTH_START_INDEX + 1;
      const isValid = dayNum >= 1 && dayNum <= DAYS_IN_MONTH;
      const colIndex = i % 7;
      const rowIndex = Math.floor(i / 7);
      const isSunday = colIndex === 0;
      const isSaturday = colIndex === 6;
      const dayHighlights = isValid ? HIGHLIGHTS[dayNum] || [] : [];
      const showHeart = isValid && HEART_DAYS.has(dayNum);

      const isToday = dayNum === TODAY;

      cells.push(
        <View
          key={i}
          style={{
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
          }}
        >
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
            </View>
          )}
          {showHeart && (
            <View style={styles.heartMarker}>
              <Heart size={9} color="#FC2648" />
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
            />
          ))}
        </View>
      );
    }
    return cells;
  };

  return (
    <View style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.bigMonth}>
            4<Text style={styles.bigMonthSuffix}>월</Text>
          </Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity hitSlop={8} style={styles.headerIconBtn} onPress={() => navigation?.navigate('SearchScreen')}><HeaderIcon name="search" /></TouchableOpacity>
            <TouchableOpacity hitSlop={8} style={styles.headerIconBtn} onPress={() => navigation?.navigate('NotificationsScreen')}><HeaderIcon name="bell" /></TouchableOpacity>
            <TouchableOpacity hitSlop={8}><HeaderIcon name="plus" /></TouchableOpacity>
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

          {/* Upcoming events */}
          <Text style={styles.eventsTitle}>다가오는 일정</Text>
          {EVENTS.map((event, idx) => {
            const [m, d] = event.date.split('/');
            return (
              <TouchableOpacity key={idx} style={styles.eventCard} activeOpacity={0.7}>
                <View style={[styles.eventDateBox, { backgroundColor: event.tint }]}>
                  <Text style={[styles.eventDateMonth, { color: event.color }]}>
                    {parseInt(m, 10)}월
                  </Text>
                  <Text style={[styles.eventDateDay, { color: event.color }]}>
                    {parseInt(d, 10)}
                  </Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={[styles.tagChip, { backgroundColor: event.tint }]}>
                    <Text style={[styles.tagText, { color: event.color }]}>
                      #{event.tag}
                    </Text>
                  </View>
                </View>
                <Text style={styles.eventArrow}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  bigMonth: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
    lineHeight: 40,
  },
  bigMonthSuffix: {
    fontSize: 28,
    fontWeight: '800',
    color: INK,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    marginRight: 28,
  },
  body: {
    paddingHorizontal: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    paddingTop: 6,
    paddingBottom: 8,
  },
  weekText: {
    fontSize: 11,
    fontWeight: '600',
    color: INK_MUTE,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 22,
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
  todayText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  heartMarker: {
    position: 'absolute',
    top: 4,
    right: 5,
    zIndex: 2,
  },
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
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendSwatch: {
    width: 18,
    height: 10,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#555555',
  },
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
  eventDateMonth: {
    fontSize: 9,
    fontWeight: '600',
  },
  eventDateDay: {
    fontSize: 16,
    fontWeight: '700',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: INK,
  },
  tagChip: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventArrow: {
    fontSize: 18,
    color: '#AAA',
    fontWeight: '300',
    marginLeft: 8,
  },
});
