import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';
import { fetchCharacter, updateCharacterName } from '../../api/characterAPI';

const NAME_MAX = 10; // BE @Size(min=1,max=10)

const CharacterScreen = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;

  const openEdit = () => {
    setNameInput(data?.name ?? '');
    setError(null);
    setEditing(true);
  };

  const closeEdit = () => {
    if (!saving) setEditing(false);
  };

  const onSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError('이름을 입력해 주세요');
      return;
    }
    if (trimmed === data?.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    updateCharacterName(trimmed)
      .then((res) => {
        // 이름만 갱신 — PATCH 응답엔 breakdown/history가 없으므로 덮어쓰지 않는다.
        setData((prev) => (prev ? { ...prev, name: res.name } : prev));
        setEditing(false);
      })
      .catch((e) => {
        setError(e?.message || '이름을 바꾸지 못했어요');
      })
      .finally(() => setSaving(false));
  };

  useEffect(() => {
    let alive = true;
    fetchCharacter()
      .then((res) => {
        if (alive) setData(res);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.05,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [breatheAnim]);

  useEffect(() => {
    if (!data) return;
    xpAnim.setValue(0);
    Animated.timing(xpAnim, {
      toValue: 1,
      duration: 1100,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [data, xpAnim]);

  const isMax = data?.nextStageExp == null;
  const pct = data?.progressPercent ?? 0;
  const xpWidth = xpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${pct}%`],
  });

  return (
    <View style={styles.container}>
      <LovelyBackground intensity={0.9} />
      <Header title="우리의 캐릭터" showBack onBack={() => navigation?.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {data && (
          <>
            {/* Mascot */}
            <View style={styles.mascotWrap}>
              <Animated.View style={[styles.mascotBubble, { transform: [{ scale: breatheAnim }] }]}>
                <LinearGradient
                  colors={['#FFE4EE', '#FFB590']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.mascotGradient}
                >
                  <Image source={data.image} style={styles.mascotImage} resizeMode="contain" />
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Character name (탭하면 변경) */}
            <TouchableOpacity
              style={styles.nameRow}
              onPress={openEdit}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="캐릭터 이름 변경"
            >
              <Text style={styles.charName} numberOfLines={1}>
                {data.name}
              </Text>
              <View style={styles.editBadge}>
                <Text style={styles.editIcon}>✏️</Text>
              </View>
            </TouchableOpacity>

            {/* Stage pill */}
            <View style={styles.levelPillWrap}>
              <View style={styles.levelPill}>
                <Text style={styles.levelText}>{data.stage}단계</Text>
                <View style={styles.levelDivider} />
                <Text style={styles.levelName}>{data.stageTitle}</Text>
              </View>
              <Text style={styles.moodLine}>
                {isMax
                  ? '마지막 진화 단계예요 💖'
                  : `다음 진화: ${data.nextStageTitle}`}
              </Text>
            </View>

            {/* XP card */}
            <View style={styles.xpCard}>
              <View style={styles.xpHeader}>
                <Text style={styles.xpHeaderLabel}>
                  {isMax ? '최고 단계 달성 💖' : '다음 단계까지'}
                </Text>
                <Text style={styles.xpHeaderValue}>
                  {isMax
                    ? `${data.exp} EXP`
                    : `${data.exp} / ${data.nextStageExp} EXP`}
                </Text>
              </View>
              <View style={styles.xpBarBg}>
                <Animated.View style={[styles.xpBarFillWrap, { width: xpWidth }]}>
                  <LinearGradient
                    colors={[colors.pink, colors.peach]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.xpBarFill}
                  />
                </Animated.View>
              </View>
              <Text style={styles.xpCaption}>
                {isMax
                  ? '둘이 함께 끝까지 키워냈어요!'
                  : `다음 단계까지 ${data.remainingExp} EXP 남았어요 (${pct}%)`}
              </Text>

              {/* 오늘 모은 EXP (소스별) */}
              <View style={styles.xpStatsRow}>
                {data.breakdown.map((b) => (
                  <View key={b.source} style={styles.xpStatItem}>
                    <Text style={styles.xpStatEmoji}>{b.emoji}</Text>
                    <Text style={styles.xpStatValue}>+{b.today}</Text>
                    <Text style={styles.xpStatLabel}>{b.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.dailyCapLine}>
                오늘 +{data.todayExp} EXP · 일일 최대 {data.dailyCap}
              </Text>
            </View>

            {/* Growth log */}
            <Text style={styles.sectionTitle}>오늘의 성장 기록</Text>
            {data.history.map((g, i) => (
              <View key={i} style={styles.logRow}>
                <View style={styles.logIconBox}>
                  <Text style={styles.logIcon}>{g.icon}</Text>
                </View>
                <Text style={styles.logText}>{g.text}</Text>
                <Text style={styles.logXp}>{g.xp}</Text>
              </View>
            ))}

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>

      {/* 이름 변경 모달 */}
      <Modal
        visible={editing}
        transparent
        animationType="fade"
        onRequestClose={closeEdit}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeEdit} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>캐릭터 이름 바꾸기</Text>
            <Text style={styles.modalSub}>
              둘이 함께 키우는 캐릭터예요. 바꾸면 상대에게도 똑같이 보여요 💞
            </Text>
            <TextInput
              style={styles.input}
              value={nameInput}
              onChangeText={(t) => {
                setNameInput(t);
                if (error) setError(null);
              }}
              maxLength={NAME_MAX}
              placeholder={`이름 (최대 ${NAME_MAX}자)`}
              placeholderTextColor="#C9A9B5"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={onSaveName}
              editable={!saving}
            />
            <Text style={styles.counter}>
              {nameInput.length}/{NAME_MAX}
            </Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={closeEdit}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={onSaveName}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F8',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
  },
  mascotWrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  mascotBubble: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotGradient: {
    width: 200,
    height: 200,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.heartRed,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 8,
  },
  mascotImage: {
    width: 170,
    height: 185,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 24,
  },
  charName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
    maxWidth: '80%',
  },
  editBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  editIcon: {
    fontSize: 13,
  },
  levelPillWrap: {
    alignItems: 'center',
    marginTop: 6,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.pink,
  },
  levelDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.line,
  },
  levelName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  moodLine: {
    marginTop: 8,
    fontSize: 12,
    color: '#7A4A5E',
  },
  xpCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE4EE',
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpHeaderLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink3,
  },
  xpHeaderValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.pink,
  },
  xpBarBg: {
    marginTop: 8,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.pinkTint,
    overflow: 'hidden',
  },
  xpBarFillWrap: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  xpBarFill: {
    flex: 1,
  },
  xpCaption: {
    marginTop: 8,
    fontSize: 11,
    color: colors.ink3,
  },
  xpStatsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  xpStatItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.pinkTint,
    alignItems: 'center',
  },
  xpStatEmoji: {
    fontSize: 16,
  },
  xpStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.heartRed,
    marginTop: 2,
  },
  xpStatLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  dailyCapLine: {
    marginTop: 10,
    fontSize: 11,
    color: colors.ink3,
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink3,
  },
  logRow: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFE4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logIcon: {
    fontSize: 16,
  },
  logText: {
    flex: 1,
    fontSize: 12,
    color: colors.ink,
  },
  logXp: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.pink,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(40,20,30,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
  },
  modalSub: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: colors.ink3,
    textAlign: 'center',
  },
  input: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFE4EE',
    backgroundColor: '#FFF8FB',
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  counter: {
    marginTop: 6,
    fontSize: 11,
    color: colors.ink3,
    textAlign: 'right',
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.heartRed,
    textAlign: 'center',
  },
  modalBtnRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.pinkTint,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink3,
  },
  saveBtn: {
    backgroundColor: colors.pink,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CharacterScreen;
