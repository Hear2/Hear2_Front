import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import colors from '../../constants/colors';
import Header from '../../components/common/Header';

const PALETTE = {
  love:    { tint: colors.pinkTint,   color: colors.pink,     category: 'love'   },
  memory:  { tint: colors.pinkTint,   color: colors.pink,     category: 'system' },
  level:   { tint: '#FFE4EE',         color: colors.pink,     category: 'system' },
  qa:      { tint: colors.yellowTint, color: '#C8A82E',       category: 'ai'     },
  judge:   { tint: colors.yellowTint, color: '#C8A82E',       category: 'ai'     },
  capsule: { tint: colors.greenTint,  color: colors.green,    category: 'system' },
  report:  { tint: colors.blueTint,   color: colors.blue,     category: 'ai'     },
};

const NOTIFICATIONS = [
  { kind: 'love',    icon: '💗', from: '지호',  text: '"사랑해" 메시지를 보냈어요',           time: '방금',     unread: true  },
  { kind: 'qa',      icon: '💬', from: 'Hear2', text: '오늘의 데일리 Q&A가 도착했어요',         time: '5분 전',   unread: true  },
  { kind: 'memory',  icon: '🌸', from: 'Hear2', text: '1년 전 오늘의 추억이 있어요',           time: '오전 9:00', unread: true  },
  { kind: 'judge',   icon: '⚖️', from: 'Hear2', text: '갈등 분석 결과가 준비됐어요',           time: '어제',     unread: false },
  { kind: 'capsule', icon: '💌', from: 'Hear2', text: '1주년 캡슐이 내일 열려요',              time: '어제',     unread: false },
  { kind: 'level',   icon: '🐣', from: '해피',  text: 'Lv.12 → Lv.13 진화 임박!',              time: '2일 전',   unread: false },
  { kind: 'report',  icon: '📊', from: 'Hear2', text: '이번 주 AI 관계 리포트가 준비됐어요',     time: '3일 전',   unread: false },
];

const NotificationsScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('unread');
  const [readMap, setReadMap] = useState({});

  const items = useMemo(() => {
    return NOTIFICATIONS.map((n, idx) => ({
      ...n,
      origIndex: idx,
      unread: n.unread && !readMap[idx],
    }));
  }, [readMap]);

  const unreadCount = items.filter((n) => n.unread).length;

  const filters = [
    { id: 'unread', label: `새 알림 ${unreadCount}` },
    { id: 'love',   label: '💗 애정' },
    { id: 'ai',     label: 'AI' },
    { id: 'system', label: '시스템' },
  ];

  const filtered = items.filter((n) => {
    if (activeFilter === 'unread') return n.unread;
    return PALETTE[n.kind].category === activeFilter;
  });

  const markAllRead = () => {
    const map = {};
    NOTIFICATIONS.forEach((_, idx) => {
      map[idx] = true;
    });
    setReadMap(map);
  };

  return (
    <View style={styles.container}>
      <Header
        title="알림"
        showBack
        onBack={() => navigation?.goBack()}
        right={
          <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
            <Text style={styles.readAllText}>전체 읽음</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.filterRow}>
        {filters.map((f) => {
          const active = activeFilter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {filtered.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={styles.emptyText}>해당하는 알림이 없어요</Text>
          </View>
        )}
        {filtered.map((n, idx) => {
          const palette = PALETTE[n.kind];
          return (
            <TouchableOpacity
              key={`${n.kind}-${idx}`}
              style={[
                styles.notifItem,
                n.unread
                  ? { backgroundColor: palette.tint }
                  : styles.notifItemRead,
              ]}
              activeOpacity={0.75}
              onPress={() => setReadMap((m) => ({ ...m, [n.origIndex]: true }))}
            >
              {n.unread && (
                <View
                  style={[
                    styles.glow,
                    { backgroundColor: hexWithAlpha(palette.color, 0.2) },
                  ]}
                />
              )}
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>{n.icon}</Text>
              </View>
              <View style={styles.body}>
                <View style={styles.metaRow}>
                  <Text style={[styles.from, { color: palette.color }]}>{n.from}</Text>
                  <Text style={styles.metaSep}>·</Text>
                  <Text style={styles.time}>{n.time}</Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>{n.text}</Text>
              </View>
              {n.unread && (
                <View style={[styles.unreadDot, { backgroundColor: palette.color }]} />
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// Append alpha (0-1) onto a #RRGGBB hex string.
const hexWithAlpha = (hex, alpha) => {
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  readAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.pink,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.bgSoft,
  },
  filterChipActive: {
    backgroundColor: colors.pinkTint,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink3,
  },
  filterTextActive: {
    color: colors.pink,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  notifItemRead: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
  },
  glow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  iconText: {
    fontSize: 18,
  },
  body: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  from: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaSep: {
    fontSize: 10,
    color: colors.inkMute,
  },
  time: {
    fontSize: 10,
    color: colors.inkMute,
  },
  message: {
    marginTop: 2,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 19,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyWrap: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.inkMute,
  },
});

export default NotificationsScreen;
