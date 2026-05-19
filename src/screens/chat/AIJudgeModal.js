import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import { requestJudge } from '../../api/judgeAPI';
import { sendTextMessage } from '../../api/chatAPI';

export default function AIJudgeModal({ navigation, route, onClose }) {
  const breathAnim = useRef(new Animated.Value(1)).current;
  const params = route?.params ?? {};
  const triggerMessageId = params.triggerMessageId ?? null;

  const [loading, setLoading] = useState(true);
  const [verdict, setVerdict] = useState(null);
  const [error, setError] = useState(null);
  const [sendingRecon, setSendingRecon] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1.15, duration: 1400, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ]),
    ).start();
  }, [breathAnim]);

  const fetchVerdict = useCallback(async () => {
    if (!triggerMessageId) {
      setError('판결을 호출할 메시지가 없어요.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await requestJudge({ triggerMessageId });
      setVerdict(data);
    } catch (err) {
      // BE: 400이면 트리거 조건 미달 (부정 점수/리스크 부족), 502면 GPT 실패.
      const msg =
        err?.status === 400
          ? '아직 갈등이 감지된 메시지가 없어요.\n조금 더 격한 대화가 있을 때 다시 시도해주세요.'
          : err?.message || '판결을 불러오지 못했어요.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [triggerMessageId]);

  useEffect(() => {
    fetchVerdict();
  }, [fetchVerdict]);

  const handleClose = () => {
    if (onClose) onClose();
    else navigation?.goBack();
  };

  // 화해 메시지를 채팅에 그대로 전송.
  const handleSendReconciliation = async () => {
    const msg = verdict?.reconciliationMessage?.trim();
    if (!msg || sendingRecon) return;
    setSendingRecon(true);
    try {
      await sendTextMessage({ content: msg });
      Alert.alert('보냈어요 💌', '화해 메시지가 채팅에 전송됐어요.', [
        { text: '확인', onPress: handleClose },
      ]);
    } catch (err) {
      Alert.alert('전송 실패', err?.message || '잠시 후 다시 시도해주세요.');
    } finally {
      setSendingRecon(false);
    }
  };

  return (
    <LinearGradient colors={['#FFF5F8', '#FFFFFF']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeTxt}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚖️ AI 판사</Text>
        <View style={styles.closeBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Animated.Text style={[styles.heroEmoji, { transform: [{ scale: breathAnim }] }]}>
            ⚖️
          </Animated.Text>
          <Text style={styles.heroTitle}>중립적인 시선이 필요할 때</Text>
          <Text style={styles.heroSub}>
            {loading
              ? '두 사람의 대화를 분석하고 있어요…'
              : 'AI가 두 사람의 대화를 분석했어요'}
          </Text>
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.pink} />
          </View>
        )}

        {!loading && error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTitle}>분석할 수 없어요</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              activeOpacity={0.8}
              onPress={fetchVerdict}
            >
              <Text style={styles.retryText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && verdict && (
          <>
            {/* 양측 입장 카드 */}
            <View style={styles.cardsRow}>
              <PersonCard label="내 입장" tone="me" body={verdict.summaryA} />
              <PersonCard label="상대 입장" tone="partner" body={verdict.summaryB} />
            </View>

            {/* 판결문 */}
            <LinearGradient
              colors={[colors.ink, '#2A2D6A']}
              style={styles.verdictCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.verdictTitle}>AI 판결</Text>
              <Text style={styles.verdictBody}>{verdict.judgement}</Text>
              {!!verdict.solution && (
                <View style={styles.suggestionBox}>
                  <View style={styles.suggestionHighlight} />
                  <Text style={styles.suggestionText}>{verdict.solution}</Text>
                </View>
              )}
              {verdict.sameConflictCount > 1 && (
                <Text style={styles.recurringHint}>
                  💡 같은 유형의 갈등이 {verdict.sameConflictCount}번째 감지됐어요.
                </Text>
              )}
            </LinearGradient>

            {/* 화해 메시지 자동 전송 */}
            {!!verdict.reconciliationMessage && (
              <View style={styles.reconCard}>
                <Text style={styles.reconLabel}>💌 추천 화해 메시지</Text>
                <Text style={styles.reconBody}>"{verdict.reconciliationMessage}"</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.85}
              onPress={handleSendReconciliation}
              disabled={sendingRecon || !verdict.reconciliationMessage}
            >
              <LinearGradient
                colors={[colors.pink, colors.pinkDeep]}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {sendingRecon ? (
                  <ActivityIndicator color={colors.bgApp} />
                ) : (
                  <Text style={styles.ctaText}>이대로 보내기 💌</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.outlineButton}
              activeOpacity={0.7}
              onPress={handleClose}
            >
              <Text style={styles.outlineText}>대화 일시 정지하기</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function PersonCard({ label, tone, body }) {
  const borderColor = tone === 'me' ? colors.pinkSoft : colors.blueTint;
  const bgColor = tone === 'me' ? colors.pinkTint : colors.blueTint;
  return (
    <View style={[styles.personCard, { borderColor }]}>
      <View style={[styles.personBadge, { backgroundColor: bgColor }]}>
        <Text style={styles.personBadgeText}>{label}</Text>
      </View>
      <Text style={styles.personBody} numberOfLines={6}>
        {body || '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeTxt: { fontSize: 20, color: colors.ink3 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },

  scroll: { padding: 20, paddingBottom: 40 },

  hero: { alignItems: 'center', marginBottom: 24 },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  heroSub: { fontSize: 13, color: colors.ink3, textAlign: 'center' },

  loadingBox: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center' },
  errorBox: {
    backgroundColor: '#FFF0F2',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
  },
  errorEmoji: { fontSize: 32, marginBottom: 8 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  errorMessage: { fontSize: 13, color: colors.ink3, textAlign: 'center', marginBottom: 14, lineHeight: 18 },
  retryBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.pink },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  personCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.bgApp,
    minHeight: 130,
  },
  personBadge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  personBadgeText: { fontSize: 11, fontWeight: '700', color: colors.ink },
  personBody: { fontSize: 13, color: colors.ink2, lineHeight: 19 },

  verdictCard: { borderRadius: 20, padding: 22, marginBottom: 20 },
  verdictTitle: { fontSize: 16, fontWeight: '700', color: colors.bgApp, marginBottom: 8 },
  verdictBody: { fontSize: 14, color: '#FFFFFFCC', lineHeight: 22, marginBottom: 14 },
  suggestionBox: { flexDirection: 'row', backgroundColor: '#FFFFFF15', borderRadius: 12, padding: 14 },
  suggestionHighlight: { width: 3, backgroundColor: colors.pink, borderRadius: 2, marginRight: 10 },
  suggestionText: { flex: 1, fontSize: 13, color: '#FFFFFFDD', lineHeight: 20 },
  recurringHint: { marginTop: 12, fontSize: 12, color: '#FFFFFFAA', fontStyle: 'italic' },

  reconCard: {
    backgroundColor: '#FFF8FA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.pinkTint,
  },
  reconLabel: { fontSize: 12, fontWeight: '700', color: colors.pink, marginBottom: 8 },
  reconBody: { fontSize: 14, color: colors.ink, lineHeight: 21, fontStyle: 'italic' },

  ctaButton: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  ctaGradient: { paddingVertical: 16, alignItems: 'center' },
  ctaText: { fontSize: 16, fontWeight: '700', color: colors.bgApp },
  outlineButton: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineText: { fontSize: 15, fontWeight: '600', color: colors.ink3 },
});
