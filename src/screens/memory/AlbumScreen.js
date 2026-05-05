import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';

const filters = ['전체', '데이트', '여행', '음식', '집', '기념일'];

const memories = [
  { emoji: '🌸', tag: '#데이트', place: '서울숲',   date: '3.15', tint: '#FFE4EE', h: 200 },
  { emoji: '🍜', tag: '#음식',   place: '신촌',     date: '3.14', tint: colors.yellowTint, h: 140 },
  { emoji: '🎡', tag: '#데이트', place: '롯데월드', date: '3.1',  tint: '#FFE4EE', h: 220 },
  { emoji: '🌅', tag: '#여행',   place: '해운대',   date: '2.20', tint: '#FFF0E5', h: 150 },
  { emoji: '🎂', tag: '#기념일', place: '집',       date: '2.14', tint: colors.yellowTint, h: 180 },
  { emoji: '☕', tag: '#데이트', place: '카페',     date: '2.10', tint: '#FFE4EE', h: 160 },
];

const moodGroups = [
  { mood: '😊 행복', count: 14, color: colors.green,  tint: colors.greenTint, items: memories.slice(0, 3) },
  { mood: '🥰 사랑', count: 8,  color: colors.heartRed, tint: '#FFE4EE',     items: memories.slice(2, 5) },
  { mood: '🌅 평화', count: 5,  color: colors.peach,  tint: '#FFF0E5',     items: memories.slice(3, 6) },
];

const VIEW_MODES = [
  { key: 'feed',     label: '피드 그리드',     subtitle: '시간순 메이슨리' },
  { key: 'category', label: '카테고리 그리드', subtitle: '감정별 분류' },
];

const AlbumScreen = () => {
  const [activeFilter, setActiveFilter] = useState('전체');
  const [viewMode, setViewMode] = useState('feed');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentMode = VIEW_MODES.find((m) => m.key === viewMode) ?? VIEW_MODES[0];

  const filteredMemories = useMemo(() => {
    if (activeFilter === '전체') return memories;
    return memories.filter((m) => m.tag === `#${activeFilter}`);
  }, [activeFilter]);

  const filteredMoodGroups = useMemo(() => {
    if (activeFilter === '전체') return moodGroups;
    return moodGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((m) => m.tag === `#${activeFilter}`),
      }))
      .filter((g) => g.items.length > 0);
  }, [activeFilter]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>추억 앨범</Text>
        <TouchableOpacity>
          <Text style={styles.addBtn}>+ 추가</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          nestedScrollEnabled
          overScrollMode="always"
          directionalLockEnabled
        >
          {filters.map((label) => {
            const active = activeFilter === label;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(label)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="태그, 위치로 검색"
          placeholderTextColor={colors.inkMute}
        />
      </View>

      {/* View-mode dropdown */}
      <View style={styles.dropdownArea}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownOpen((o) => !o)}
          activeOpacity={0.8}
        >
          <View style={styles.dropdownLabelWrap}>
            <Text style={styles.dropdownLabel}>{currentMode.label}</Text>
            <Text style={styles.dropdownSubtitle}>{currentMode.subtitle}</Text>
          </View>
          <Text style={[styles.dropdownChevron, dropdownOpen && styles.dropdownChevronOpen]}>
            ▾
          </Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownMenu}>
            {VIEW_MODES.map((m) => {
              const selected = m.key === viewMode;
              return (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.dropdownItem, selected && styles.dropdownItemSelected]}
                  onPress={() => {
                    setViewMode(m.key);
                    setDropdownOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.dropdownItemTextWrap}>
                    <Text style={[styles.dropdownItemLabel, selected && styles.dropdownItemLabelSelected]}>
                      {m.label}
                    </Text>
                    <Text style={styles.dropdownItemSubtitle}>{m.subtitle}</Text>
                  </View>
                  {selected && <Text style={styles.dropdownCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      >
        {viewMode === 'feed' ? (
          <FeedGrid items={filteredMemories} />
        ) : (
          <CategoryGrid groups={filteredMoodGroups} />
        )}
        {((viewMode === 'feed' && filteredMemories.length === 0) ||
          (viewMode === 'category' && filteredMoodGroups.length === 0)) && (
          <Text style={styles.emptyText}>해당 태그의 추억이 없어요</Text>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <LinearGradient colors={[colors.pink, colors.heartRed]} style={styles.fabGradient}>
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// Feed (Masonry-style 2-column with varied heights)
const FeedGrid = ({ items }) => {
  const [left, right] = useMemo(() => {
    const l = [];
    const r = [];
    let lH = 0;
    let rH = 0;
    items.forEach((m) => {
      if (lH <= rH) {
        l.push(m);
        lH += m.h;
      } else {
        r.push(m);
        rH += m.h;
      }
    });
    return [l, r];
  }, [items]);

  const Card = ({ m }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.feedCard, { height: m.h, backgroundColor: m.tint }]}
    >
      <View style={styles.feedTagPill}>
        <Text style={styles.feedTagText}>{m.tag}</Text>
      </View>
      <View style={styles.feedEmojiWrap}>
        <Text style={styles.feedEmoji}>{m.emoji}</Text>
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.45)']}
        style={styles.feedFade}
      >
        <Text style={styles.feedMeta}>{m.place} · {m.date}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.feedRow}>
      <View style={styles.feedCol}>
        {left.map((m, i) => <Card key={`l-${i}`} m={m} />)}
      </View>
      <View style={styles.feedCol}>
        {right.map((m, i) => <Card key={`r-${i}`} m={m} />)}
      </View>
    </View>
  );
};

// Category (mood-grouped horizontal scrollers)
const CategoryGrid = ({ groups }) => (
  <View>
    {groups.map((g, i) => (
      <View key={i} style={styles.moodGroup}>
        <View style={styles.moodHeader}>
          <View style={styles.moodTitleRow}>
            <Text style={styles.moodTitle}>{g.mood}</Text>
            <Text style={styles.moodCount}>{g.count}장</Text>
          </View>
          <TouchableOpacity>
            <Text style={[styles.moodSeeAll, { color: g.color }]}>전체 ›</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodRow}
        >
          {g.items.map((m, j) => (
            <TouchableOpacity
              key={j}
              activeOpacity={0.85}
              style={[styles.moodCard, { backgroundColor: g.tint }]}
            >
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
              <View style={[styles.moodCardTag, { borderColor: g.color }]}>
                <Text style={[styles.moodCardTagText, { color: g.color }]}>{m.tag}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.bgApp,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
  },
  addBtn: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.pink,
  },
  filterWrap: {
    height: 56,
    width: '100%',
  },
  filterRow: {
    height: 56,
    paddingLeft: 16,
    paddingRight: 40,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgSoft,
    marginRight: 8,
    height: 36,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.pink,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink3,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: colors.bgInput,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 0,
  },
  dropdownArea: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 12,
    zIndex: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.pinkTint,
    borderWidth: 1,
    borderColor: colors.pinkSoft,
  },
  dropdownLabelWrap: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.pinkDeep,
  },
  dropdownSubtitle: {
    marginTop: 1,
    fontSize: 11,
    color: colors.ink3,
  },
  dropdownChevron: {
    fontSize: 18,
    color: colors.pinkDeep,
    marginLeft: 8,
    transform: [{ rotate: '0deg' }],
  },
  dropdownChevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownMenu: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownItemSelected: {
    backgroundColor: colors.pinkTint,
  },
  dropdownItemTextWrap: {
    flex: 1,
  },
  dropdownItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  dropdownItemLabelSelected: {
    color: colors.pinkDeep,
    fontWeight: '700',
  },
  dropdownItemSubtitle: {
    marginTop: 1,
    fontSize: 11,
    color: colors.ink3,
  },
  dropdownCheck: {
    fontSize: 16,
    color: colors.pink,
    fontWeight: '700',
    marginLeft: 8,
  },
  gridContainer: {
    paddingHorizontal: 16,
  },
  // Feed (masonry) grid
  feedRow: {
    flexDirection: 'row',
    gap: 10,
  },
  feedCol: {
    flex: 1,
    gap: 10,
  },
  feedCard: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  feedTagPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    zIndex: 2,
  },
  feedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.pink,
  },
  feedEmojiWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedEmoji: {
    fontSize: 48,
    opacity: 0.75,
  },
  feedFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 18,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  feedMeta: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  // Category grid
  moodGroup: {
    marginBottom: 16,
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  moodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  moodCount: {
    fontSize: 11,
    color: colors.inkMute,
  },
  moodSeeAll: {
    fontSize: 12,
    fontWeight: '600',
  },
  moodRow: {
    paddingVertical: 4,
    gap: 8,
  },
  moodCard: {
    width: 120,
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  moodEmoji: {
    fontSize: 36,
    opacity: 0.8,
  },
  moodCardTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  moodCardTagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: colors.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -1,
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 13,
    color: colors.inkMute,
  },
});

export default AlbumScreen;
