import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import { useMemories } from '../../contexts/MemoryContext';
import CalendarPicker from '../../components/common/CalendarPicker';
import LocationPicker from '../../components/common/LocationPicker';

const DOW_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const formatDate = (d) =>
  `${d.getMonth() + 1}.${d.getDate()} (${DOW_LABELS[d.getDay()]})`;

const GRID_PAD = 16;
const GRID_GAP = 4;
const GRID_COLS = 3;

const MOOD_TO_GROUP = {
  love: 'love',
  happy: 'happy',
  peace: 'peace',
  calm: 'peace',
  flutter: 'love',
};

const SOURCES = [
  { key: 'gallery', label: '갤러리', icon: '🖼️' },
  { key: 'camera', label: '카메라', icon: '📷' },
  { key: 'drive', label: '드라이브', icon: '☁️' },
];

const TAG_OPTIONS = [
  { id: 'date', label: '데이트', defaultOn: true },
  { id: 'spring', label: '봄', defaultOn: true },
  { id: 'walk', label: '산책', defaultOn: true },
  { id: 'food', label: '음식' },
  { id: 'travel', label: '여행' },
];

const MOODS = [
  { id: 'love', emoji: '🥰', label: '사랑' },
  { id: 'happy', emoji: '😊', label: '행복' },
  { id: 'peace', emoji: '🌅', label: '평화' },
  { id: 'calm', emoji: '😌', label: '편안' },
  { id: 'flutter', emoji: '✨', label: '설렘' },
];

// 각 사진에 mock 메타데이터(location)를 부여 — 실제 환경에서는 EXIF/GPS에서 추출
const INITIAL_LIBRARY = [
  { id: 'p1', emoji: '🌸', tint: '#FFE4EE',         location: { icon: '🌸', name: '서울숲' } },
  { id: 'p2', emoji: '☕', tint: '#FFE4EE',         location: { icon: '☕', name: '망원동 카페' } },
  { id: 'p3', emoji: '🍜', tint: colors.yellowTint, location: { icon: '🍜', name: '신촌' } },
  { id: 'p4', emoji: '🎂', tint: colors.yellowTint, location: { icon: '🏠', name: '집' } },
  { id: 'p5', emoji: '🌅', tint: '#FFF0E5',         location: { icon: '🌊', name: '해운대' } },
  { id: 'p6', emoji: '🎡', tint: '#FFE4EE',         location: { icon: '🎡', name: '롯데월드' } },
  { id: 'p7', emoji: '🍰', tint: colors.yellowTint, location: { icon: '🍰', name: '연남동' } },
  { id: 'p8', emoji: '🌺', tint: '#FFE4EE',         location: { icon: '🌴', name: '제주도' } },
  { id: 'p9', emoji: '🍻', tint: '#FFF0E5',         location: { icon: '🍻', name: '강남역' } },
];

export default function PhotoUpload({ navigation }) {
  const { addMemory } = useMemories();
  const { width: winWidth } = useWindowDimensions();
  const cellSize = Math.floor(
    (winWidth - GRID_PAD * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS,
  );

  const [source, setSource] = useState('gallery');
  const [selected, setSelected] = useState(['p1', 'p2', 'p3']);
  const [title, setTitle] = useState('서울숲에서 봄나들이');
  const [pickedDate, setPickedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [place, setPlace] = useState('서울숲');
  const [placeOpen, setPlaceOpen] = useState(false);
  const [memo, setMemo] = useState('벚꽃이 정말 예뻤던 날. 손잡고 한참을 걸었어.');
  const [activeTags, setActiveTags] = useState(
    TAG_OPTIONS.filter((t) => t.defaultOn).map((t) => t.id),
  );
  const [mood, setMood] = useState('love');
  const [shareWithPartner, setShareWithPartner] = useState(true);

  const library = INITIAL_LIBRARY;
  const selectedItems = useMemo(
    () =>
      selected
        .map((id) => library.find((p) => p.id === id))
        .filter(Boolean),
    [selected, library],
  );
  const placeOptions = useMemo(
    () => selectedItems.map((p) => p.location).filter(Boolean),
    [selectedItems],
  );

  const handleSave = () => {
    if (selectedItems.length === 0) {
      navigation?.goBack?.();
      return;
    }
    const firstTagId = activeTags[0];
    const tagOption = TAG_OPTIONS.find((t) => t.id === firstTagId);
    const first = selectedItems[0];
    addMemory({
      emoji: first.emoji,
      tag: tagOption ? `#${tagOption.label}` : '#기록',
      place: place.trim() || '미지정',
      date: formatDate(pickedDate),
      tint: first.tint,
      mood: MOOD_TO_GROUP[mood] ?? 'love',
      title: title.trim(),
      memo: memo.trim(),
      shared: shareWithPartner,
      createdAt: Date.now(),
    });
    navigation?.goBack?.();
  };

  const togglePhoto = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const toggleTag = (id) => {
    setActiveTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const goBack = () => navigation?.goBack?.();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* App bar */}
      <View style={styles.appbar}>
        <View style={styles.appbarLeft}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={8}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.appbarTitle}>새 추억 추가</Text>
        </View>
        <Text style={styles.appbarCount}>{selected.length}장 선택</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Selected preview row */}
          <Text style={styles.sectionLabel}>선택한 사진</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedRow}
          >
            {selectedItems.map((p, i) => (
              <View key={p.id} style={[styles.selectedThumb, { backgroundColor: p.tint }]}>
                <Text style={styles.selectedEmoji}>{p.emoji}</Text>
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>{i + 1}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addMoreBtn} activeOpacity={0.8}>
              <Text style={styles.addMoreIcon}>＋</Text>
              <Text style={styles.addMoreText}>더 추가</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Source tabs */}
          <View style={styles.sourceRow}>
            {SOURCES.map((s) => {
              const on = s.key === source;
              return on ? (
                <TouchableOpacity
                  key={s.key}
                  activeOpacity={0.85}
                  onPress={() => setSource(s.key)}
                  style={styles.sourceTabActiveWrap}
                >
                  <LinearGradient
                    colors={[colors.pink, colors.heartRed]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sourceTabActive}
                  >
                    <Text style={styles.sourceIconActive}>{s.icon}</Text>
                    <Text style={styles.sourceLabelActive}>{s.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  key={s.key}
                  activeOpacity={0.7}
                  onPress={() => setSource(s.key)}
                  style={styles.sourceTab}
                >
                  <Text style={styles.sourceIcon}>{s.icon}</Text>
                  <Text style={styles.sourceLabel}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Gallery grid */}
          <View style={styles.gridWrap}>
            {library.map((p, i) => {
              const idx = selected.indexOf(p.id);
              const isOn = idx >= 0;
              const isLastCol = (i + 1) % GRID_COLS === 0;
              return (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.85}
                  onPress={() => togglePhoto(p.id)}
                  style={[
                    styles.gridCell,
                    {
                      backgroundColor: p.tint,
                      width: cellSize,
                      height: cellSize,
                      marginRight: isLastCol ? 0 : GRID_GAP,
                      marginBottom: GRID_GAP,
                    },
                  ]}
                >
                  <Text style={styles.gridEmoji}>{p.emoji}</Text>
                  {isOn ? (
                    <>
                      <View style={styles.gridSelectedBorder} />
                      <View style={styles.gridSelectedBadge}>
                        <Text style={styles.gridSelectedBadgeText}>{idx + 1}</Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.gridUnselectedDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Memory info card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>추억 정보</Text>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldIcon}>✏️</Text>
              <TextInput
                style={styles.fieldInput}
                value={title}
                onChangeText={setTitle}
                placeholder="추억 제목"
                placeholderTextColor={colors.inkMute}
              />
            </View>

            <View style={styles.fieldGridRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setCalendarOpen(true)}
                style={[styles.fieldRow, styles.fieldHalf]}
              >
                <Text style={styles.fieldIconSm}>📅</Text>
                <Text style={styles.fieldStaticValue}>{formatDate(pickedDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setPlaceOpen(true)}
                style={[styles.fieldRow, styles.fieldHalf]}
              >
                <Text style={styles.fieldIconSm}>📍</Text>
                <Text
                  style={styles.fieldStaticValue}
                  numberOfLines={1}
                >
                  {place || '위치 선택'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tagWrap}>
              {TAG_OPTIONS.map((t) => {
                const on = activeTags.includes(t.id);
                return (
                  <TouchableOpacity
                    key={t.id}
                    activeOpacity={0.7}
                    onPress={() => toggleTag(t.id)}
                    style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                  >
                    <Text style={[styles.chipText, on ? styles.chipTextOn : styles.chipTextOff]}>
                      #{t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity activeOpacity={0.7} style={[styles.chip, styles.chipOff]}>
                <Text style={[styles.chipText, styles.chipTextOff]}>+ 태그</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.memoBox}>
              <Text style={styles.memoIcon}>💭</Text>
              <TextInput
                style={styles.memoInput}
                value={memo}
                onChangeText={setMemo}
                multiline
                placeholder="이 순간을 기록해보세요..."
                placeholderTextColor={colors.inkMute}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Mood pick */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>오늘의 감정</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m) => {
                const on = m.id === mood;
                return (
                  <TouchableOpacity
                    key={m.id}
                    activeOpacity={0.8}
                    onPress={() => setMood(m.id)}
                    style={styles.moodItem}
                  >
                    {on ? (
                      <LinearGradient
                        colors={['#FFE4EE', colors.pinkSoft]}
                        style={[styles.moodCircle, styles.moodCircleOn]}
                      >
                        <Text style={styles.moodEmoji}>{m.emoji}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.moodCircle}>
                        <Text style={styles.moodEmoji}>{m.emoji}</Text>
                      </View>
                    )}
                    <Text style={[styles.moodLabel, on && styles.moodLabelOn]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Share with partner */}
          <View style={styles.shareCard}>
            <Text style={styles.shareHeart}>♥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.shareTitle}>
                <Text style={{ fontWeight: '800' }}>지호</Text>에게 공유하기
              </Text>
              <Text style={styles.shareSub}>저장하면 우리 둘 모두의 앨범에 추가돼요</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShareWithPartner((v) => !v)}
              style={[
                styles.toggle,
                shareWithPartner ? styles.toggleOn : styles.toggleOff,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  shareWithPartner ? styles.toggleKnobOn : styles.toggleKnobOff,
                ]}
              />
            </TouchableOpacity>
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
              <Text style={styles.saveText}>추억 저장하기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CalendarPicker
        visible={calendarOpen}
        value={pickedDate}
        onClose={() => setCalendarOpen(false)}
        onSelect={setPickedDate}
      />
      <LocationPicker
        visible={placeOpen}
        value={place}
        options={placeOptions}
        onClose={() => setPlaceOpen(false)}
        onSelect={setPlace}
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  appbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 26, color: colors.ink, fontWeight: '300', lineHeight: 28 },
  appbarTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  appbarCount: { fontSize: 13, color: colors.pink, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },

  sectionLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedRow: { gap: 8, paddingBottom: 4 },
  selectedThumb: {
    position: 'relative',
    width: 84,
    height: 84,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedEmoji: { fontSize: 36, opacity: 0.75 },
  selectedBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.heartRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  selectedBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  addMoreBtn: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.pinkSoft,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addMoreIcon: { fontSize: 22, color: colors.pink, fontWeight: '600', lineHeight: 24 },
  addMoreText: { fontSize: 10, color: colors.pink, fontWeight: '600' },

  sourceRow: { flexDirection: 'row', gap: 6, marginTop: 16 },
  sourceTab: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sourceIcon: { fontSize: 14 },
  sourceLabel: { fontSize: 12, fontWeight: '700', color: colors.ink3 },
  sourceTabActiveWrap: { flex: 1 },
  sourceTabActive: {
    height: 40,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.heartRed,
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  sourceIconActive: { fontSize: 14 },
  sourceLabelActive: { fontSize: 12, fontWeight: '700', color: '#fff' },

  gridWrap: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gridEmoji: { fontSize: 36, opacity: 0.7 },
  gridSelectedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: colors.heartRed,
    backgroundColor: 'rgba(252,38,72,0.08)',
  },
  gridSelectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.heartRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridSelectedBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  gridUnselectedDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  card: {
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 10 },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    marginBottom: 8,
  },
  fieldIcon: { fontSize: 16 },
  fieldIconSm: { fontSize: 12 },
  fieldInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    padding: 0,
  },
  fieldStaticValue: { fontSize: 12, color: colors.ink, fontWeight: '600' },
  fieldInputSm: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
    padding: 0,
  },
  fieldGridRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  fieldHalf: { flex: 1, marginBottom: 0 },

  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 11 },
  chipOn: { backgroundColor: '#FFE4EE' },
  chipOff: { backgroundColor: '#F0F0F0' },
  chipText: { fontSize: 11 },
  chipTextOn: { color: colors.pinkDeep, fontWeight: '700' },
  chipTextOff: { color: '#888', fontWeight: '500' },

  memoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    minHeight: 56,
  },
  memoIcon: { fontSize: 14, marginTop: 1 },
  memoInput: {
    flex: 1,
    fontSize: 12,
    color: colors.ink,
    lineHeight: 18,
    padding: 0,
    minHeight: 32,
  },

  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodItem: { alignItems: 'center', gap: 4 },
  moodCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: colors.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCircleOn: { borderWidth: 2, borderColor: colors.heartRed },
  moodEmoji: { fontSize: 22 },
  moodLabel: { fontSize: 10, color: '#888', fontWeight: '500' },
  moodLabelOn: { color: colors.pinkDeep, fontWeight: '700' },

  shareCard: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFF5F8',
    borderWidth: 1,
    borderColor: '#FFD0E0',
  },
  shareHeart: { fontSize: 18, color: colors.heartRed },
  shareTitle: { fontSize: 12, color: colors.ink },
  shareSub: { fontSize: 10, color: '#888', marginTop: 2 },
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
