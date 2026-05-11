import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../constants/colors';
import WhatIfShell from './WhatIfShell';

const DRAFTS = [
  {
    tone: '직설', score: 32, color: colors.heartRed, bad: true,
    text: '왜 또 늦어? 약속 좀 잘 지켜.',
    why: '비난 표현(왜 또), 명령형',
  },
  {
    tone: '부드럽게', score: 78, color: '#FFB05B',
    text: '많이 늦었네. 무슨 일 있었어? 기다리면서 좀 걱정됐어.',
    why: '걱정 → 확인 → 감정 공유',
  },
  {
    tone: '공감 우선', score: 91, color: '#7ED7A0', best: true,
    text: '오늘 일 많았지? 늦은 건 괜찮은데, 미리 한 마디만 줄 수 있을까?',
    why: '상대 인정 → 양해 → 부드러운 요청',
  },
];

const withAlpha = (hex, alpha) => {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const WhatIfCoachScreen = ({ navigation }) => (
  <WhatIfShell
    navigation={navigation}
    tag="대화 코칭"
    tagIcon="💭"
    tagTint={colors.yellowTint}
    tagColor="#C8A82E"
    title="이렇게 말해보세요"
    bgFrom="#FFFEF7"
    bgTo="#FFFAEB"
  >
    {/* situation */}
    <View style={[styles.card, { borderColor: '#FFF4C2' }]}>
      <Text style={styles.lead}>상황</Text>
      <Text style={styles.situation}>
        약속 시간보다{' '}
        <Text style={styles.situationAccent}>40분 늦은</Text> 지호. 오늘만 세 번째예요.
      </Text>
      <View style={styles.emoBox}>
        <Text style={styles.emoLabel}>지호의 감정 추정</Text>
        <View style={styles.emoRow}>
          <Text style={styles.emoText}>😣 미안함</Text>
          <Text style={styles.emoDot}>·</Text>
          <Text style={styles.emoText}>😶 위축</Text>
          <Text style={styles.emoDot}>·</Text>
          <Text style={styles.emoText}>🙏 사과 의향</Text>
        </View>
      </View>
    </View>

    <Text style={styles.sectionTitle}>3가지 대화 초안</Text>

    <View style={{ gap: 14 }}>
      {DRAFTS.map((d) => (
        <View
          key={d.tone}
          style={[
            styles.draftCard,
            d.best && { borderWidth: 2, borderColor: d.color },
          ]}
        >
          {d.best && (
            <View style={[styles.bestBadge, { backgroundColor: d.color }]}>
              <Text style={styles.bestBadgeText}>RECOMMENDED</Text>
            </View>
          )}
          <View style={styles.draftHead}>
            <View
              style={[
                styles.toneChip,
                { backgroundColor: withAlpha(d.color, 0.13) },
              ]}
            >
              <Text style={[styles.toneText, { color: d.color }]}>{d.tone}</Text>
            </View>
            <Text style={[styles.scoreText, { color: d.color }]}>
              관계 점수 {d.score}
            </Text>
          </View>

          <View
            style={[
              styles.quoteBox,
              d.bad
                ? { backgroundColor: colors.pinkTint }
                : { backgroundColor: withAlpha(d.color, 0.08) },
            ]}
          >
            <Text style={styles.quoteText}>"{d.text}"</Text>
          </View>

          <View style={styles.whyRow}>
            <Text style={[styles.whySparkle, { color: d.color }]}>✨</Text>
            <Text style={styles.whyText}>{d.why}</Text>
          </View>

          {!d.bad && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.copyBtn} activeOpacity={0.85}>
                <Text style={styles.copyText}>복사</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pasteBtn, { backgroundColor: d.color }]}
                activeOpacity={0.85}
              >
                <Text style={styles.pasteText}>채팅에 붙여넣기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  </WhatIfShell>
);

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
  },
  lead: { fontSize: 11, color: '#888', fontWeight: '700' },
  situation: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 21,
  },
  situationAccent: { color: colors.heartRed, fontWeight: '800' },

  emoBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFFAEB',
    borderLeftWidth: 3,
    borderLeftColor: '#C8A82E',
  },
  emoLabel: { fontSize: 11, color: '#888', fontWeight: '700', marginBottom: 4 },
  emoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emoText: { fontSize: 11, color: colors.ink },
  emoDot: { fontSize: 11, color: '#AAA' },

  sectionTitle: {
    marginTop: 14,
    marginBottom: 16,
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },

  draftCard: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
    position: 'relative',
  },
  bestBadge: {
    position: 'absolute',
    top: -8,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bestBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },

  draftHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toneChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  toneText: { fontSize: 10, fontWeight: '800' },
  scoreText: { fontSize: 11, fontWeight: '800' },

  quoteBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
  },
  quoteText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    lineHeight: 20,
  },

  whyRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  whySparkle: { fontSize: 11 },
  whyText: { fontSize: 10, color: '#888' },

  actionRow: { marginTop: 10, flexDirection: 'row', gap: 6 },
  copyBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyText: { color: '#555', fontSize: 11, fontWeight: '700' },
  pasteBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasteText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
});

export default WhatIfCoachScreen;
