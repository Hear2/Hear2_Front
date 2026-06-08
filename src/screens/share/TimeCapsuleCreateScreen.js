import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';
import CalendarPicker from '../../components/common/CalendarPicker';
import { createCapsule, uploadCapsulePhotos } from '../../api/timeCapsuleAPI';

const MAX_PHOTOS = 9;

const COVER_STYLES = [
  { id: 'letter', icon: '💌', label: '편지', colors: [colors.lavender, colors.peach] },
  { id: 'gift', icon: '🎁', label: '선물', colors: [colors.pink, colors.heartRed] },
  { id: 'flower', icon: '🌹', label: '꽃다발', colors: ['#FFB05B', colors.pink] },
  { id: 'space', icon: '🪐', label: '우주', colors: [colors.blue, '#A78BFA'] },
  { id: 'cherry', icon: '🌸', label: '벚꽃', colors: ['#FFE4EE', '#FFD0E0'] },
];

const YEAR_MIN = 1;
const YEAR_MAX = 10;
const HUNDRED_MIN = 1;
const HUNDRED_MAX = 30;

const DOW_LABEL = ['일', '월', '화', '수', '목', '금', '토'];

const addDays = (base, days) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

const addMonths = (base, months) => {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d;
};

const presetToDate = (id, opts = {}, from = new Date()) => {
  const { years = 1, hundreds = 1 } = opts;
  switch (id) {
    case 'years':
      return addDays(from, 365 * years);
    case '6m':
      return addMonths(from, 6);
    case 'hundreds':
      return addDays(from, 100 * hundreds);
    case 'xmas': {
      const y = from.getFullYear();
      const candidate = new Date(y, 11, 25);
      return candidate <= from ? new Date(y + 1, 11, 25) : candidate;
    }
    default:
      return null;
  }
};

const stripTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const daysUntil = (target) => {
  const today = stripTime(new Date());
  const t = stripTime(target);
  return Math.round((t - today) / 86400000);
};

const formatDate = (d) =>
  `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW_LABEL[d.getDay()]})`;

const StepperChip = ({
  active,
  label,
  onMinus,
  onPlus,
  onCenter,
  minusDisabled,
  plusDisabled,
}) => {
  const textColor = active ? '#FFFFFF' : '#666';
  return (
    <View
      style={[
        styles.stepper,
        active && { backgroundColor: colors.heartRed },
      ]}
    >
      <TouchableOpacity
        onPress={onMinus}
        disabled={minusDisabled}
        activeOpacity={0.7}
        hitSlop={4}
        style={styles.stepperBtn}
      >
        <Text
          style={[
            styles.stepperSign,
            { color: textColor, opacity: minusDisabled ? 0.35 : 1 },
          ]}
        >
          −
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onCenter}
        activeOpacity={0.8}
        style={styles.stepperCenter}
      >
        <Text style={[styles.stepperLabel, { color: textColor }]}>
          {label}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onPlus}
        disabled={plusDisabled}
        activeOpacity={0.7}
        hitSlop={4}
        style={styles.stepperBtn}
      >
        <Text
          style={[
            styles.stepperSign,
            { color: textColor, opacity: plusDisabled ? 0.35 : 1 },
          ]}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const Toggle = ({ on, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[styles.toggle, { backgroundColor: on ? colors.heartRed : '#E0E0E0' }]}
  >
    <View
      style={[
        styles.toggleKnob,
        on ? { right: 2 } : { left: 2 },
      ]}
    />
  </TouchableOpacity>
);

const TimeCapsuleCreateScreen = ({ navigation }) => {
  const [name, setName] = useState('1주년 기념 캡슐');
  const [cover, setCover] = useState('letter');
  const [preset, setPreset] = useState('years');
  const [yearCount, setYearCount] = useState(1);
  const [hundredCount, setHundredCount] = useState(1);
  const [openDate, setOpenDate] = useState(() =>
    presetToDate('years', { years: 1 }),
  );
  const [pickerVisible, setPickerVisible] = useState(false);
  const [options, setOptions] = useState({
    blind: true,
    notify: true,
    confetti: false,
  });
  const [letter, setLetter] = useState(
    '지금 이 순간이 너무 행복해서 1년 뒤에도 기억하고 싶어 봉인해. 작은 카페에서 우연히 만난 너에게…',
  );

  const breathe = useRef(new Animated.Value(1)).current;
  const sparkle = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(sparkle, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const selectedCover = COVER_STYLES.find((c) => c.id === cover) ?? COVER_STYLES[0];
  const dDay = daysUntil(openDate);
  const dDayLabel = dDay >= 0 ? `D-${dDay}` : `D+${Math.abs(dDay)}`;

  const handlePresetSelect = (id) => {
    setPreset(id);
    if (id === 'custom') {
      setPickerVisible(true);
      return;
    }
    const next = presetToDate(id, {
      years: yearCount,
      hundreds: hundredCount,
    });
    if (next) setOpenDate(next);
  };

  const handleStep = (kind, delta) => {
    if (kind === 'years') {
      const next = Math.max(YEAR_MIN, Math.min(YEAR_MAX, yearCount + delta));
      setYearCount(next);
      setPreset('years');
      setOpenDate(presetToDate('years', { years: next }));
    } else {
      const next = Math.max(
        HUNDRED_MIN,
        Math.min(HUNDRED_MAX, hundredCount + delta),
      );
      setHundredCount(next);
      setPreset('hundreds');
      setOpenDate(presetToDate('hundreds', { hundreds: next }));
    }
  };

  const handlePickDate = (d) => {
    setOpenDate(d);
    setPreset('custom');
  };

  const [photos, setPhotos] = useState([]); // { id, uri, mimeType, fileName }
  const [saving, setSaving] = useState(false);

  const pickPhotos = async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      Alert.alert(`사진은 최대 ${MAX_PHOTOS}장까지 담을 수 있어요`);
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('사진 접근 권한이 필요해요', '설정에서 사진 접근을 허용해 주세요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 1,
    });
    if (result.canceled) return;
    const picked = (result.assets || []).map((a, i) => ({
      id: `${a.assetId || a.uri}-${i}`,
      uri: a.uri,
      mimeType: a.mimeType,
      fileName: a.fileName,
    }));
    setPhotos((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSeal = async () => {
    if (saving) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('캡슐 이름을 입력해 주세요');
      return;
    }
    if (!letter.trim()) {
      Alert.alert('편지를 입력해 주세요');
      return;
    }
    if (dDay < 1) {
      Alert.alert('개봉일은 내일 이후로 설정해 주세요');
      return;
    }
    setSaving(true);
    try {
      // 사진을 presigned URL로 업로드 → objectKey 수집 → 캡슐 생성에 전달.
      const photoObjectKeys = await uploadCapsulePhotos(photos);
      await createCapsule({
        name: trimmedName,
        cover,
        openAt: openDate,
        letter: letter.trim(),
        photoObjectKeys,
        options,
      });
      navigation?.goBack();
    } catch (e) {
      Alert.alert('봉인 실패', e?.message || '잠시 후 다시 시도해 주세요');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFAFC', '#FFF0F6']}
        style={StyleSheet.absoluteFill}
      />
      <LovelyBackground intensity={0.5} hearts={false} />

      <Header
        title="새 캡슐 만들기"
        showBack
        onBack={() => navigation?.goBack()}
        right={
          <TouchableOpacity activeOpacity={0.7} hitSlop={8} onPress={handleSeal} disabled={saving}>
            <Text style={styles.sealAction}>봉인</Text>
          </TouchableOpacity>
        }
        style={{ backgroundColor: 'transparent' }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Preview Hero */}
        <LinearGradient
          colors={selectedCover.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Animated.Text style={[styles.heroSparkle, { opacity: sparkle }]}>✨</Animated.Text>
          <Animated.View style={[styles.heroIconWrap, { transform: [{ scale: breathe }] }]}>
            <Text style={styles.heroIcon}>{selectedCover.icon}</Text>
          </Animated.View>
          <View style={styles.heroBody}>
            <Text style={styles.heroTag}>PREVIEW</Text>
            <Text style={styles.heroTitle}>{name || '새 캡슐'}</Text>
            <Text style={styles.heroSub}>
              {`${openDate.getFullYear()}.${String(openDate.getMonth() + 1).padStart(2, '0')}.${String(openDate.getDate()).padStart(2, '0')} 오픈 예정 · ${dDayLabel}`}
            </Text>
          </View>
        </LinearGradient>

        {/* Capsule name */}
        <View style={styles.card}>
          <Text style={styles.cardSubLabel}>캡슐 이름</Text>
          <View style={styles.inputRow}>
            <View style={styles.cursor} />
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="캡슐 이름을 입력하세요"
              placeholderTextColor={colors.inkMute}
            />
          </View>
        </View>

        {/* Cover style */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>커버 스타일</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
          >
            {COVER_STYLES.map((c) => {
              const on = c.id === cover;
              return (
                <TouchableOpacity
                  key={c.id}
                  activeOpacity={0.85}
                  onPress={() => setCover(c.id)}
                  style={styles.coverWrap}
                >
                  <LinearGradient
                    colors={c.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.coverTile,
                      on && styles.coverTileSelected,
                    ]}
                  >
                    <Text style={styles.coverEmoji}>{c.icon}</Text>
                    <Text style={styles.coverLabel}>{c.label}</Text>
                  </LinearGradient>
                  {on && (
                    <View style={styles.coverCheck}>
                      <Text style={styles.coverCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Open date */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardLabel}>오픈 날짜</Text>
            <Text style={styles.cardRightAccent}>{dDayLabel}</Text>
          </View>
          <TouchableOpacity
            style={styles.dateBox}
            activeOpacity={0.85}
            onPress={() => setPickerVisible(true)}
          >
            <Text style={styles.dateIcon}>📅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateTitle}>{formatDate(openDate)}</Text>
              <Text style={styles.dateSub}>오전 0:00 · 자동으로 열려요</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.chipsRow}>
            <StepperChip
              active={preset === 'hundreds'}
              label={`+${hundredCount * 100}일`}
              onMinus={() => handleStep('hundreds', -1)}
              onPlus={() => handleStep('hundreds', +1)}
              onCenter={() => handlePresetSelect('hundreds')}
              minusDisabled={hundredCount <= HUNDRED_MIN}
              plusDisabled={hundredCount >= HUNDRED_MAX}
            />

            <StepperChip
              active={preset === 'years'}
              label={`+${yearCount}년`}
              onMinus={() => handleStep('years', -1)}
              onPlus={() => handleStep('years', +1)}
              onCenter={() => handlePresetSelect('years')}
              minusDisabled={yearCount <= YEAR_MIN}
              plusDisabled={yearCount >= YEAR_MAX}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handlePresetSelect('xmas')}
              style={[
                styles.chip,
                preset === 'xmas' && { backgroundColor: colors.heartRed },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  preset === 'xmas' && { color: '#FFFFFF' },
                ]}
              >
                크리스마스
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handlePresetSelect('custom')}
              style={[
                styles.chip,
                preset === 'custom' && { backgroundColor: colors.heartRed },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  preset === 'custom' && { color: '#FFFFFF' },
                ]}
              >
                직접 선택
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contents */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>담을 추억</Text>

          {/* letter */}
          <View style={styles.letterCard}>
            <View style={styles.letterHeader}>
              <Text style={styles.letterTitle}>💌 미래의 우리에게 쓰는 편지</Text>
              <Text style={styles.letterCount}>{letter.length} / 1000자</Text>
            </View>
            <TextInput
              style={styles.letterInput}
              value={letter}
              onChangeText={setLetter}
              multiline
              maxLength={1000}
              placeholder="미래의 우리에게 한 마디 남겨주세요..."
              placeholderTextColor={colors.inkMute}
            />
          </View>

          {/* photos */}
          <View style={{ marginTop: 12 }}>
            <View style={styles.subRow}>
              <Text style={styles.subLabel}>📷 사진</Text>
              <Text style={styles.subCount}>{photos.length} / {MAX_PHOTOS}</Text>
            </View>
            <View style={styles.photoRow}>
              {photos.map((p) => (
                <View key={p.id} style={styles.photoTile}>
                  <Image source={{ uri: p.uri }} style={styles.photoImg} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.photoRemove}
                    onPress={() => removePhoto(p.id)}
                    hitSlop={6}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.photoRemoveText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < MAX_PHOTOS && (
                <TouchableOpacity style={styles.photoAdd} activeOpacity={0.7} onPress={pickPhotos}>
                  <Text style={styles.photoAddIcon}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Options */}
        <View style={[styles.card, { paddingVertical: 4 }]}>
          {[
            { key: 'blind', icon: '🔒', label: '서로의 답변 가리기', sub: '오픈 전까지 미공개' },
            { key: 'notify', icon: '🔔', label: '오픈 1주일 전 알림', sub: '두 사람 모두에게' },
            { key: 'confetti', icon: '🎉', label: '오픈 시 콘페티 효과', sub: '특별한 순간을 더 화려하게' },
          ].map((r, i, a) => (
            <View
              key={r.key}
              style={[
                styles.optRow,
                i < a.length - 1 && styles.optRowDivider,
              ]}
            >
              <Text style={styles.optIcon}>{r.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optLabel}>{r.label}</Text>
                <Text style={styles.optSub}>{r.sub}</Text>
              </View>
              <Toggle
                on={options[r.key]}
                onPress={() =>
                  setOptions((prev) => ({ ...prev, [r.key]: !prev[r.key] }))
                }
              />
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom action */}
      <LinearGradient
        colors={['rgba(255,250,252,0)', '#FFF0F6']}
        locations={[0, 0.4]}
        style={styles.bottomBar}
        pointerEvents="box-none"
      >
        <TouchableOpacity style={styles.draftBtn} activeOpacity={0.85}>
          <Text style={styles.draftText}>임시 저장</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sealBtn}
          activeOpacity={0.85}
          onPress={handleSeal}
          disabled={saving}
        >
          <LinearGradient
            colors={[colors.lavender, colors.heartRed]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sealBtnInner}
          >
            <Text style={styles.sealBtnText}>
              {saving ? '봉인 중…' : `🔒 ${Math.max(dDay, 0)}일간 봉인하기`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <CalendarPicker
        visible={pickerVisible}
        value={openDate}
        onClose={() => setPickerVisible(false)}
        onSelect={handlePickDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFAFC' },
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  sealAction: { fontSize: 13, fontWeight: '800', color: colors.pink },

  hero: {
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#9678C8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 6,
  },
  heroSparkle: {
    position: 'absolute',
    top: 14,
    right: 16,
    fontSize: 18,
    color: '#FFD700',
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: { fontSize: 28 },
  heroBody: { flex: 1 },
  heroTag: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 2 },
  heroSub: { color: 'rgba(255,255,255,0.92)', fontSize: 11, marginTop: 2 },

  card: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
    marginBottom: 10,
  },
  cardLabel: { fontSize: 13, fontWeight: '800', color: colors.ink, marginBottom: 10 },
  cardSubLabel: { fontSize: 11, fontWeight: '700', color: '#888', marginBottom: 6 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardRightAccent: { fontSize: 11, fontWeight: '800', color: colors.pink },

  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cursor: {
    width: 4,
    height: 20,
    backgroundColor: 'rgba(255,138,178,0.55)',
    borderRadius: 2,
  },
  nameInput: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.ink, padding: 0 },

  coverWrap: { width: 64, height: 76, position: 'relative' },
  coverTile: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  coverTileSelected: {
    borderWidth: 3,
    borderColor: colors.heartRed,
  },
  coverEmoji: { fontSize: 22, color: '#FFFFFF' },
  coverLabel: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  coverCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.heartRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverCheckText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },

  dateBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF5F8',
    borderWidth: 1,
    borderColor: '#FFD0E0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateIcon: { fontSize: 18 },
  dateTitle: { fontSize: 14, fontWeight: '800', color: colors.ink },
  dateSub: { fontSize: 10, color: '#888', marginTop: 2 },
  chipsRow: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#F5F5F5',
  },
  chipText: { fontSize: 11, fontWeight: '700', color: '#666' },

  stepper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 999,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSign: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 16,
  },
  stepperCenter: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    justifyContent: 'center',
  },
  stepperLabel: { fontSize: 11, fontWeight: '700' },

  letterCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.pinkTint,
    borderLeftWidth: 3,
    borderLeftColor: colors.pink,
  },
  letterHeader: { flexDirection: 'row', alignItems: 'center' },
  letterTitle: { flex: 1, fontSize: 11, fontWeight: '800', color: colors.heartRed },
  letterCount: { fontSize: 10, color: '#888', fontWeight: '600' },
  letterInput: {
    marginTop: 6,
    fontSize: 12,
    color: colors.ink,
    lineHeight: 20,
    minHeight: 60,
    textAlignVertical: 'top',
    padding: 0,
  },

  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  subLabel: { fontSize: 12, fontWeight: '700', color: colors.ink },
  subCount: { fontSize: 10, color: '#888' },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoTile: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImg: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: { color: '#FFFFFF', fontSize: 11 },
  photoAdd: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddIcon: { fontSize: 20, color: '#BBB' },

  optRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  optRowDivider: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  optIcon: { fontSize: 14 },
  optLabel: { fontSize: 12, fontWeight: '700', color: colors.ink },
  optSub: { fontSize: 10, color: '#888', marginTop: 2 },

  toggle: {
    width: 36,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
  },
  toggleKnob: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: 'row',
    gap: 8,
  },
  draftBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  sealBtn: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: colors.heartRed,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 6,
  },
  sealBtnInner: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default TimeCapsuleCreateScreen;
