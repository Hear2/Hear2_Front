import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import Header from '../../components/common/Header';
import endpoints from '../../constants/endpoints';
import { useAuth } from '../../contexts/AuthContext';
import { getCoupleReport } from '../../api/reportAPI';

// MOCK 응답 — endpoints.MOCK === true일 때 사용. 백엔드 schema 모양 그대로.
const MOCK_REPORT = {
  reportType: 'WEEKLY',
  periodStart: '2026-05-04',
  periodEnd: '2026-05-10',
  title: '5월 첫째 주 리포트',
  summary:
    '점심 시간 이후 부정 감정이 살짝 늘었지만, 저녁에는 긍정으로 전환됐어요. 오늘 잠들기 전 따뜻한 메시지를 남겨보세요 💌',
  emotionFlow: [
    { time: '8시', emoji: '😐', score: 30 },
    { time: '10시', emoji: '🙂', score: 50 },
    { time: '12시', emoji: '😊', score: 70 },
    { time: '14시', emoji: '😤', score: 20 },
    { time: '16시', emoji: '😊', score: 70 },
    { time: '18시', emoji: '🥰', score: 85 },
  ],
  totalConversationCount: 128,
  positiveRatio: 74,
  uploadedPhotoCount: 9,
  oneAnswerResponseCount: 6,
  oneAnswerTotalCount: 7,
  mostUsedWords: ['사랑해', '고마워', '보고싶어', '주말', '데이트', '맛있다', '미안해', '수고했어'],
  memoryHighlight: null,
  monthlyComparison: null,
  relationshipHealth: '이번 달 관계 건강도는 82점이에요. 갈등 후 평균 화해까지 걸린 시간이 지난달보다 40% 빨라졌어요 💞',
  monthlyRecommendations: null,
};

function ProgressBar({ label, pct, color }) {
  const safe = Math.max(0, Math.min(100, pct ?? 0));
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${safe}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barPct}>{safe}%</Text>
    </View>
  );
}

function formatPeriod(start, end) {
  if (!start && !end) return '';
  if (start && end) return `${start} ~ ${end}`;
  return start || end || '';
}

export default function ReportView({ navigation, route }) {
  const { user, refreshCoupleStatus } = useAuth();
  const coupleId = route?.params?.coupleId ?? user?.coupleId ?? null;
  const initialType = route?.params?.reportType ?? 'WEEKLY';

  const [reportType, setReportType] = useState(initialType);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const breathAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1.12, duration: 1200, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, [breathAnim]);

  const fetchReport = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      try {
        if (endpoints.MOCK) {
          await new Promise((r) => setTimeout(r, 400));
          setReport({ ...MOCK_REPORT, reportType });
          return;
        }
        // user.coupleId가 비어 있으면(부팅 시 status 동기화 실패 등) /couples/status로 재조회.
        let cid = coupleId;
        if (!cid) {
          const status = await refreshCoupleStatus();
          cid = status?.coupleId ?? null;
        }
        if (!cid) {
          throw new Error('coupleId를 찾을 수 없어요. 로그인 후 다시 시도해주세요.');
        }
        const data = await getCoupleReport({
          coupleId: cid,
          reportType,
          signal,
        });
        setReport(data);
      } catch (err) {
        if (err?.code === 'ABORTED') return;
        setError(err?.message || '리포트를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    },
    [coupleId, reportType, refreshCoupleStatus],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchReport(controller.signal);
    return () => controller.abort();
  }, [fetchReport]);

  const isMonthly = reportType === 'MONTHLY';

  return (
    <View style={styles.container}>
      <Header
        title="감정 리포트"
        showBack
        onBack={() => navigation?.goBack()}
        right={
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleChip, !isMonthly && styles.toggleChipActive]}
              onPress={() => setReportType('WEEKLY')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, !isMonthly && styles.toggleTextActive]}>
                주간
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleChip, isMonthly && styles.toggleChipActive]}
              onPress={() => setReportType('MONTHLY')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, isMonthly && styles.toggleTextActive]}>
                월간
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.pink} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>리포트를 불러오지 못했어요</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchReport()}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ReportBody report={report} breathAnim={breathAnim} isMonthly={isMonthly} />
      )}
    </View>
  );
}

function ReportBody({ report, breathAnim, isMonthly }) {
  const emotionFlow = Array.isArray(report?.emotionFlow) ? report.emotionFlow : [];
  const flowPath = useMemo(() => buildFlowPaths(emotionFlow), [emotionFlow]);
  const positive = report?.positiveRatio ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.date}>{formatPeriod(report?.periodStart, report?.periodEnd)}</Text>
      {!!report?.title && <Text style={styles.title}>{report.title}</Text>}

      {/* Summary */}
      <View style={styles.card}>
        <View style={styles.summaryTop}>
          <Animated.View style={[styles.emojiCircle, { transform: [{ scale: breathAnim }] }]}>
            <Text style={styles.bigEmoji}>{positive >= 50 ? '😊' : '😐'}</Text>
          </Animated.View>
          <Text style={styles.summaryTitle}>
            {positive >= 50 ? '긍정 우세 ✨' : '차분한 흐름'}
          </Text>
        </View>
        <ProgressBar label="긍정" pct={positive} color={colors.green} />
        <View style={styles.statRow}>
          <Stat label="대화" value={report?.totalConversationCount ?? 0} />
          <Stat label="사진" value={report?.uploadedPhotoCount ?? 0} />
          <Stat
            label="1일 1답"
            value={
              report?.oneAnswerResponseCount == null
                ? '준비중'
                : `${report.oneAnswerResponseCount}/${
                    report?.oneAnswerTotalCount ?? '-'
                  }`
            }
          />
        </View>
      </View>

      {/* Emotion flow timeline — only if backend provided non-empty data */}
      {flowPath && (
        <>
          <Text style={styles.sectionTitle}>시간대별 감정 흐름</Text>
          <View style={styles.card}>
            <Svg width="320" height="130" viewBox="0 0 320 130">
              <Path d={flowPath.fill} fill={colors.pinkTint} opacity={0.6} />
              <Path d={flowPath.line} stroke={colors.pink} strokeWidth={2.5} fill="none" />
              {flowPath.points.map((p, i) => (
                <React.Fragment key={i}>
                  <Circle cx={p.x} cy={p.y} r={16} fill={colors.bgApp} stroke={colors.line} strokeWidth={1} />
                  <SvgText x={p.x} y={p.y + 5} fontSize={14} textAnchor="middle">{p.emoji}</SvgText>
                  <SvgText x={p.x} y={115} fontSize={10} fill={colors.ink3} textAnchor="middle">{p.time}</SvgText>
                </React.Fragment>
              ))}
            </Svg>
          </View>
        </>
      )}

      {/* Most used words */}
      {Array.isArray(report?.mostUsedWords) && report.mostUsedWords.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>많이 쓴 단어</Text>
          <View style={styles.wordsCard}>
            {report.mostUsedWords.map((w, i) => (
              <View key={`${w}-${i}`} style={styles.wordChip}>
                <Text style={styles.wordText}>{typeof w === 'string' ? w : w.word}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Monthly-only sections */}
      {isMonthly && report?.relationshipHealth && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>관계 건강도</Text>
          <Text style={styles.bodyText}>
            {typeof report.relationshipHealth === 'string'
              ? report.relationshipHealth
              : JSON.stringify(report.relationshipHealth)}
          </Text>
        </View>
      )}

      {/* AI Insight */}
      {!!report?.summary && (
        <LinearGradient
          colors={['#FFE4EE', colors.pinkSoft, colors.pink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.insightCard}
        >
          <View style={styles.insightAurora} pointerEvents="none">
            <Svg width="100%" height="100%" viewBox="0 0 200 200">
              <Defs>
                <RadialGradient id="insightGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                  <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.15" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="100" cy="100" r="100" fill="url(#insightGlow)" />
            </Svg>
          </View>
          <View style={styles.insightIconWrap}>
            <Text style={styles.insightIcon}>🤖</Text>
          </View>
          <Text style={styles.insightLabel}>HEAR2 AI 인사이트</Text>
          <Text style={styles.insightText}>{report.summary}</Text>
        </LinearGradient>
      )}
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function buildFlowPaths(flow) {
  if (!flow || flow.length === 0) return null;
  const W = 320;
  const padding = 20;
  const innerW = W - padding * 2;
  const step = flow.length > 1 ? innerW / (flow.length - 1) : 0;
  const points = flow.map((item, i) => {
    const score = Math.max(0, Math.min(100, item?.score ?? 50));
    const y = 95 - (score / 100) * 70; // 0~100 score → y 25~95
    return {
      x: padding + step * i,
      y,
      emoji: item?.emoji ?? '🙂',
      time: item?.time ?? '',
    };
  });
  const line = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');
  const fill = `${line} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;
  return { line, fill, points };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp },
  scroll: { padding: 20, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorEmoji: { fontSize: 36, marginBottom: 10 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 6 },
  errorMessage: { fontSize: 13, color: colors.ink3, textAlign: 'center', marginBottom: 14 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.pink },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  toggleRow: { flexDirection: 'row', gap: 6 },
  toggleChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.bgSoft },
  toggleChipActive: { backgroundColor: colors.pink },
  toggleText: { fontSize: 12, color: colors.ink3, fontWeight: '600' },
  toggleTextActive: { color: '#FFFFFF' },

  date: { fontSize: 13, color: colors.ink3, marginBottom: 6 },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink, marginBottom: 16 },

  card: { backgroundColor: colors.bgApp, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.line2 },

  summaryTop: { alignItems: 'center', marginBottom: 16 },
  emojiCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.pinkTint, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  bigEmoji: { fontSize: 32 },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: colors.ink },

  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barLabel: { width: 36, fontSize: 12, color: colors.ink3 },
  barTrack: { flex: 1, height: 8, backgroundColor: colors.line2, borderRadius: 4, marginHorizontal: 8 },
  barFill: { height: 8, borderRadius: 4 },
  barPct: { width: 36, fontSize: 12, color: colors.ink3, textAlign: 'right' },

  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line2 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.ink },
  statLabel: { fontSize: 11, color: colors.ink3, marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 12, marginTop: 8 },
  bodyText: { fontSize: 13, color: colors.ink2, lineHeight: 20 },

  wordsCard: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: colors.bgSoft, borderRadius: 12, padding: 12, marginBottom: 16 },
  wordChip: { backgroundColor: colors.pinkTint, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  wordText: { fontSize: 12, color: colors.pink, fontWeight: '600' },

  insightCard: {
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    overflow: 'hidden',
    shadowColor: colors.pink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  insightAurora: { position: 'absolute', right: -80, top: -80, width: 220, height: 220 },
  insightIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  insightIcon: { fontSize: 22 },
  insightLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.9)', letterSpacing: 0.6, marginBottom: 4 },
  insightText: { fontSize: 14, color: '#FFFFFF', lineHeight: 22, fontWeight: '500' },
});
