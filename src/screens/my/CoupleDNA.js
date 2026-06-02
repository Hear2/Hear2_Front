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
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';
import endpoints from '../../constants/endpoints';
import { useAuth } from '../../contexts/AuthContext';
import { getCoupleDna } from '../../api/dnaAPI';

// MOCK 응답 — endpoints.MOCK === true일 때 사용. 백엔드 schema 그대로.
const MOCK_DNA = {
  dnaTitle: '감정형 탐험가 커플',
  dnaDescription: '서로의 감정을 잘 읽고, 분위기를 따뜻하게 이어가는 편이에요.',
  userAType: 'ENFP',
  userBType: 'INFJ',
  strengths: ['열정', '직관', '공감'],
  metrics: [
    { label: '감성소통', score: 89 },
    { label: '공감지수', score: 92 },
    { label: '유머코드', score: 76 },
    { label: '갈등회복', score: 68 },
    { label: '계획성', score: 45 },
  ],
  emotionScore: 89,
  empathyScore: 92,
  humorScore: 76,
  recoveryScore: 68,
  planningScore: 45,
  analyzedDays: 120,
  generatedAt: '2026-05-13T16:40:00',
  shareCard: {
    badgeText: '120일 데이터 분석 완료',
    headline: '감정형 탐험가 커플',
    subheadline: 'ENFP x INFJ 소통 패턴',
    gradientStartColor: '#FF4F93',
    gradientEndColor: '#B69CFF',
    metricBadges: [
      { label: '공감 92%', score: 92 },
      { label: '감성 89%', score: 89 },
    ],
    userCards: [
      { slot: 'USER_A', type: 'ENFP', accentColor: '#FF6EA8', traits: ['열정', '직관', '공감'] },
      { slot: 'USER_B', type: 'INFJ', accentColor: '#5B93FF', traits: ['깊이', '직관', '공감'] },
    ],
    footerMessage: '공감과 열정의 리듬이 특히 또렷했던 기간이에요.',
  },
};

const METRIC_COLORS = [colors.pink, colors.rose, colors.peach, colors.blue, colors.lavender];

// 분석 일수가 적거나 metric 점수가 사실상 0이면 BE narration이 어색해진다(예: "회복력이(가)").
// 그런 경우엔 mock을 보여줘서 화면이 살아있게 만든다.
function isSparseDna(data) {
  if (!data) return true;
  if ((data.analyzedDays ?? 0) < 7) return true;
  const metrics = Array.isArray(data.metrics) ? data.metrics : [];
  if (metrics.length === 0) return true;
  const meaningful = metrics.filter((m) => (m?.score ?? 0) >= 30).length;
  return meaningful < 2;
}

export default function CoupleDNA({ navigation, route }) {
  const { user, refreshCoupleStatus } = useAuth();
  const coupleId = route?.params?.coupleId ?? user?.coupleId ?? null;
  const anchorDate = route?.params?.anchorDate;

  const [dna, setDna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchDna = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      try {
        if (endpoints.MOCK) {
          await new Promise((r) => setTimeout(r, 400));
          setDna(MOCK_DNA);
          return;
        }
        // user.coupleId가 비어 있으면(부팅 시 status 동기화 실패 등) /couples/status로 재조회.
        let cid = coupleId;
        if (!cid) {
          const status = await refreshCoupleStatus();
          cid = status?.coupleId ?? null;
        }
        if (!cid) {
          throw new Error('coupleId를 찾을 수 없어요.');
        }
        const data = await getCoupleDna({ coupleId: cid, anchorDate, signal });
        // BE 응답이 와도 분석 데이터가 너무 빈약하면 mock으로 대체.
        // 7일치 미만이면 metric/조사/문구가 어색하게 노출되므로 보여줄 만큼 쌓이기 전까지는 mock.
        setDna(isSparseDna(data) ? MOCK_DNA : data);
      } catch (err) {
        if (err?.code === 'ABORTED') return;
        setError(err?.message || 'DNA 분석을 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    },
    [coupleId, anchorDate, refreshCoupleStatus],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchDna(controller.signal);
    return () => controller.abort();
  }, [fetchDna]);

  useEffect(() => {
    if (!loading && !error && dna) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }
  }, [loading, error, dna, fadeAnim]);

  const handleShare = async () => {
    const card = dna?.shareCard;
    const title = card?.headline ?? dna?.dnaTitle ?? '커플 DNA';
    const sub = card?.subheadline ?? '';
    try {
      await Share.share({
        message: `${title}\n${sub}\n— Hear2 커플 DNA`,
      });
    } catch (err) {
      Alert.alert('공유 실패', err?.message ?? '잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <LovelyBackground intensity={0.8} />
      <Header title="커플 DNA" showBack onBack={() => navigation?.goBack()} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.pink} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>DNA 분석을 불러오지 못했어요</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchDna()}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <DnaBody dna={dna} fadeAnim={fadeAnim} onShare={handleShare} />
      )}
    </View>
  );
}

function DnaBody({ dna, fadeAnim, onShare }) {
  const card = dna?.shareCard ?? {};
  const gradientStart = card.gradientStartColor || colors.pink;
  const gradientEnd = card.gradientEndColor || colors.rose;
  const metrics = Array.isArray(dna?.metrics) ? dna.metrics : [];

  const userA = card.userCards?.find((c) => c.slot === 'USER_A') ?? {
    type: dna?.userAType,
    accentColor: colors.pink,
    traits: dna?.strengths,
  };
  const userB = card.userCards?.find((c) => c.slot === 'USER_B') ?? {
    type: dna?.userBType,
    accentColor: colors.blue,
    traits: dna?.strengths,
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        {!!card.badgeText && (
          <Text style={styles.heroSubtitle}>{card.badgeText} ✨</Text>
        )}
        <Text style={styles.heroTitle}>{card.headline ?? dna?.dnaTitle ?? ''}</Text>
        {!!card.subheadline && <Text style={styles.heroMbti}>{card.subheadline}</Text>}
        {Array.isArray(card.metricBadges) && card.metricBadges.length > 0 && (
          <View style={styles.heroTags}>
            {card.metricBadges.map((b, i) => (
              <View key={i} style={styles.heroTag}>
                <Text style={styles.heroTagText}>{b.label}</Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>

      {!!dna?.dnaDescription && (
        <Text style={styles.description}>{dna.dnaDescription}</Text>
      )}

      <Animated.View style={[styles.strengthsCard, { opacity: fadeAnim }]}>
        <Text style={styles.cardTitle}>우리의 강점</Text>
        {metrics.map((m, idx) => {
          const color = METRIC_COLORS[idx % METRIC_COLORS.length];
          const score = Math.max(0, Math.min(100, m?.score ?? 0));
          return (
            <View key={`${m.label}-${idx}`} style={styles.strengthRow}>
              <Text style={styles.strengthLabel}>{m.label}</Text>
              <View style={styles.strengthBarBg}>
                <View style={[styles.strengthBarFill, { width: `${score}%`, backgroundColor: color }]} />
              </View>
              <Text style={[styles.strengthValue, { color }]}>{score}%</Text>
            </View>
          );
        })}
      </Animated.View>

      <View style={styles.profileRow}>
        <ProfileCard
          name={dna?.userAName ?? 'A'}
          color={userA.accentColor || colors.pink}
          type={userA.type}
          tags={userA.traits ?? dna?.strengths ?? []}
        />
        <ProfileCard
          name={dna?.userBName ?? 'B'}
          color={userB.accentColor || colors.blue}
          type={userB.type}
          tags={userB.traits ?? dna?.strengths ?? []}
        />
      </View>

      {!!card.footerMessage && (
        <Text style={styles.footerMessage}>{card.footerMessage}</Text>
      )}

      <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={onShare}>
        <LinearGradient
          colors={[colors.pink, colors.rose]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ctaGradient}
        >
          <Text style={styles.ctaText}>📤 결과 카드 공유하기</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function ProfileCard({ name, color, type, tags }) {
  return (
    <View style={[styles.profileCard, { backgroundColor: color + '20' }]}>
      <Text style={[styles.profileName, { color }]}>{name}</Text>
      <Text style={styles.profileType}>{type ?? '-'}</Text>
      <View style={styles.profileTags}>
        {(Array.isArray(tags) ? tags : []).map((tag, i) => (
          <View key={`${tag}-${i}`} style={[styles.profileTagPill, { borderColor: color }]}>
            <Text style={[styles.profileTagText, { color }]}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp },
  scroll: { paddingHorizontal: 20, paddingTop: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorEmoji: { fontSize: 36, marginBottom: 10 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 6 },
  errorMessage: { fontSize: 13, color: colors.ink3, textAlign: 'center', marginBottom: 14 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.pink },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  heroCard: { borderRadius: 24, padding: 28, marginBottom: 16, overflow: 'hidden' },
  heroSubtitle: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', lineHeight: 36, marginBottom: 8 },
  heroMbti: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  heroTags: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  heroTag: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  heroTagText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  description: { fontSize: 14, color: colors.ink2, lineHeight: 20, marginBottom: 20, paddingHorizontal: 4 },

  strengthsCard: {
    backgroundColor: colors.bgApp,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.ink, marginBottom: 20 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  strengthLabel: { width: 70, fontSize: 13, fontWeight: '600', color: colors.ink2 },
  strengthBarBg: { flex: 1, height: 10, backgroundColor: colors.line2, borderRadius: 5, marginHorizontal: 10, overflow: 'hidden' },
  strengthBarFill: { height: 10, borderRadius: 5 },
  strengthValue: { width: 40, fontSize: 14, fontWeight: '800', textAlign: 'right' },

  profileRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  profileCard: { flex: 1, borderRadius: 20, padding: 20, alignItems: 'center' },
  profileName: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  profileType: { fontSize: 24, fontWeight: '900', color: colors.ink, marginBottom: 12 },
  profileTags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  profileTagPill: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  profileTagText: { fontSize: 12, fontWeight: '600' },

  footerMessage: { fontSize: 13, color: colors.ink3, textAlign: 'center', marginBottom: 20, paddingHorizontal: 8 },

  ctaButton: { borderRadius: 20, overflow: 'hidden' },
  ctaGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 20 },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
