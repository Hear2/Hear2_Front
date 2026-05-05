import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import Button from '../../components/common/Button';

export default function AIJudgeModal({ navigation, onClose }) {
  const breathAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1.15, duration: 1400, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ]),
    ).start();
  }, [breathAnim]);

  const handleClose = () => {
    if (onClose) onClose();
    else navigation?.goBack();
  };

  return (
    <LinearGradient colors={['#FFF5F8', '#FFFFFF']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeTxt}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚖️ AI 판사</Text>
        <View style={styles.closeBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Animated.Text style={[styles.heroEmoji, { transform: [{ scale: breathAnim }] }]}>⚖️</Animated.Text>
          <Text style={styles.heroTitle}>중립적인 시선이 필요할 때</Text>
          <Text style={styles.heroSub}>AI가 두 사람의 대화를 분석했어요</Text>
        </View>

        {/* Side-by-side cards */}
        <View style={styles.cardsRow}>
          {/* 예진 */}
          <View style={[styles.personCard, { borderColor: colors.pinkSoft }]}>
            <View style={[styles.personAvatar, { backgroundColor: colors.pinkTint }]}>
              <Text style={styles.avatarTxt}>예진</Text>
            </View>
            <Text style={styles.personQuote}>"거기 웨이팅 길잖아"</Text>
            <View style={[styles.moodBadge, { backgroundColor: colors.yellowTint }]}>
              <Text style={[styles.moodText, { color: colors.yellow }]}>😐 중립 45%</Text>
            </View>
          </View>

          {/* 지호 */}
          <View style={[styles.personCard, { borderColor: colors.blueTint }]}>
            <View style={[styles.personAvatar, { backgroundColor: colors.blueTint }]}>
              <Text style={styles.avatarTxt}>지호</Text>
            </View>
            <Text style={styles.personQuote}>"왜 맨날 부정적이야?"</Text>
            <View style={[styles.moodBadge, { backgroundColor: colors.pinkTint }]}>
              <Text style={[styles.moodText, { color: colors.pink }]}>😤 부정 72%</Text>
            </View>
          </View>
        </View>

        {/* AI Verdict */}
        <LinearGradient colors={[colors.ink, '#2A2D6A']} style={styles.verdictCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.verdictIcon}>🤖</Text>
          <Text style={styles.verdictTitle}>AI 판결</Text>
          <Text style={styles.verdictBody}>
            두 분 모두 피곤한 상태에서 의도와 다르게 표현됐어요.
          </Text>
          <View style={styles.suggestionBox}>
            <View style={styles.suggestionHighlight} />
            <Text style={styles.suggestionText}>
              서로의 하루를 먼저 물어봐 주세요. 작은 관심이 오해를 줄여줄 수 있어요.
            </Text>
          </View>
        </LinearGradient>

        {/* Actions */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
          <LinearGradient colors={[colors.pink, colors.pinkDeep]} style={styles.ctaGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.ctaText}>화해 메시지 자동 작성 💌</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineButton} activeOpacity={0.7}>
          <Text style={styles.outlineText}>대화 일시 정지하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeTxt: { fontSize: 20, color: colors.ink3 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },

  scroll: { padding: 20, paddingBottom: 40 },

  hero: { alignItems: 'center', marginBottom: 24 },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  heroSub: { fontSize: 13, color: colors.ink3 },

  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  personCard: { flex: 1, borderWidth: 1.5, borderRadius: 16, padding: 14, alignItems: 'center', backgroundColor: colors.bgApp },
  personAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarTxt: { fontSize: 13, fontWeight: '700', color: colors.ink },
  personQuote: { fontSize: 13, color: colors.ink2, textAlign: 'center', marginBottom: 10, lineHeight: 18 },
  moodBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  moodText: { fontSize: 11, fontWeight: '600' },

  verdictCard: { borderRadius: 20, padding: 22, marginBottom: 24 },
  verdictIcon: { fontSize: 24, marginBottom: 6 },
  verdictTitle: { fontSize: 16, fontWeight: '700', color: colors.bgApp, marginBottom: 8 },
  verdictBody: { fontSize: 14, color: '#FFFFFFCC', lineHeight: 22, marginBottom: 14 },
  suggestionBox: { flexDirection: 'row', backgroundColor: '#FFFFFF15', borderRadius: 12, padding: 14 },
  suggestionHighlight: { width: 3, backgroundColor: colors.pink, borderRadius: 2, marginRight: 10 },
  suggestionText: { flex: 1, fontSize: 13, color: '#FFFFFFDD', lineHeight: 20 },

  ctaButton: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  ctaGradient: { paddingVertical: 16, alignItems: 'center' },
  ctaText: { fontSize: 16, fontWeight: '700', color: colors.bgApp },
  outlineButton: { borderRadius: 14, borderWidth: 1.5, borderColor: colors.line, paddingVertical: 14, alignItems: 'center' },
  outlineText: { fontSize: 15, fontWeight: '600', color: colors.ink3 },
});
