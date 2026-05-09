import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';

const TAGS = [
  { label: '데이트', color: colors.pink },
  { label: '봄', color: '#FFB05B' },
  { label: '벚꽃', color: colors.pinkDeep },
  { label: '서울숲', color: '#7ED7A0' },
];

const AI_INSIGHTS = [
  { icon: '🌸', label: '주요 색상', value: '벚꽃 핑크' },
  { icon: '😊', label: '얼굴 인식', value: '2명 (예진·지호)' },
  { icon: '🗓', label: '비슷한 추억', value: '작년 4월 8일' },
  { icon: '🎵', label: '추천 BGM', value: '봄 사랑 벚꽃' },
];

const COMMENTS = [
  { who: '예', name: '예진', tone: '#FFE4EE', color: colors.pinkDeep, text: '오빠랑 보니까 더 예뻤어 🥰', when: '2시간 전' },
  { who: '지', name: '지호', tone: colors.blueTint, color: colors.blue, text: '나도. 사진 잘 찍었네 ㅎㅎ 내년에도 가자!', when: '1시간 전' },
  { who: '예', name: '예진', tone: '#FFE4EE', color: colors.pinkDeep, text: '약속! 💕', when: '방금' },
];

const DOTS_TOTAL = 5;
const DOTS_ACTIVE = 2;

export default function PhotoDetailScreen({ navigation }) {
  const [draft, setDraft] = useState('');

  const goBack = () => navigation?.goBack?.();

  const handleShare = async () => {
    try {
      await Share.share({
        message: '서울숲 벚꽃 🌸 — 우리 둘의 추억',
      });
    } catch {}
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Floating app bar */}
        <View style={styles.appbar}>
          <TouchableOpacity style={styles.appbarBtn} onPress={goBack} hitSlop={8}>
            <Text style={styles.appbarBtnText}>‹</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.appbarCount}>3 / 24</Text>
            <Text style={styles.appbarDate}>2026.04.12</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity style={styles.appbarBtn}>
              <Text style={styles.appbarBtnTextSm}>↗</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.appbarBtn}>
              <Text style={styles.appbarBtnTextSm}>⋯</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 }}
      >
        {/* Hero photo */}
        <LinearGradient
          colors={['#FFE4EE', colors.peach, colors.pink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroEmoji}>🌸</Text>
          <Text style={[styles.sparkle, styles.sparkleA]}>✨</Text>
          <Text style={[styles.sparkle, styles.sparkleB]}>✨</Text>
          <View style={styles.heroDots}>
            {Array.from({ length: DOTS_TOTAL }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.heroDot,
                  i === DOTS_ACTIVE && styles.heroDotActive,
                ]}
              />
            ))}
          </View>
        </LinearGradient>

        {/* Sheet */}
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          <Text style={styles.title}>서울숲 벚꽃 🌸</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>📅 2026.04.12 (토) 오후 3:24</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaItem}>📍 서울숲</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaItem}>📷 iPhone 15 Pro</Text>
          </View>

          {/* Uploader */}
          <View style={styles.uploader}>
            <View style={styles.uploaderAvatar}>
              <Text style={styles.uploaderAvatarText}>예</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.uploaderName}>예진이 올림</Text>
              <Text style={styles.uploaderSub}>2시간 전 · 두 분의 추억함에 저장됨</Text>
            </View>
            <View style={styles.sharedPill}>
              <Text style={styles.sharedPillText}>공유 중</Text>
            </View>
          </View>

          {/* Tags + emotion */}
          <View style={styles.tagRow}>
            {TAGS.map((t) => (
              <View
                key={t.label}
                style={[styles.tagChip, { backgroundColor: `${t.color}26` }]}
              >
                <Text style={[styles.tagChipText, { color: t.color }]}>#{t.label}</Text>
              </View>
            ))}
            <View style={styles.emotionChip}>
              <Text style={styles.emotionChipText}>🥰 사랑</Text>
            </View>
          </View>

          {/* Memo */}
          <View style={styles.memoCard}>
            <Text style={styles.memoQuote}>“</Text>
            <Text style={styles.memoText}>
              벚꽃이 이렇게 예쁠 줄이야. 지호랑 같이 보니까 더 예뻐 보였어. 내년에도 꼭 같이 오자 🌸
            </Text>
          </View>

          {/* AI insights */}
          <View style={styles.insightsCard}>
            <Text style={styles.insightsHeader}>✨ AI가 발견한 것</Text>
            <View style={styles.insightsGrid}>
              {AI_INSIGHTS.map((r) => (
                <View key={r.label} style={styles.insightItem}>
                  <Text style={styles.insightLabel}>
                    {r.icon} {r.label}
                  </Text>
                  <Text style={styles.insightValue}>{r.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Comments */}
          <View style={styles.commentsCard}>
            <View style={styles.commentsHeaderRow}>
              <Text style={styles.commentsTitle}>💬 우리의 한마디</Text>
              <Text style={styles.commentsCount}>{COMMENTS.length}개</Text>
            </View>
            <View style={{ gap: 10 }}>
              {COMMENTS.map((c, i) => (
                <View key={i} style={styles.commentRow}>
                  <View
                    style={[
                      styles.commentAvatar,
                      { backgroundColor: c.tone },
                    ]}
                  >
                    <Text style={[styles.commentAvatarText, { color: c.color }]}>
                      {c.who}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.commentMeta}>
                      <Text style={styles.commentName}>{c.name}</Text>
                      <Text style={styles.commentWhen}>{c.when}</Text>
                    </View>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="한마디 남기기..."
                placeholderTextColor="#888"
                value={draft}
                onChangeText={setDraft}
              />
              <TouchableOpacity style={styles.commentSend} activeOpacity={0.85}>
                <Text style={styles.commentSendText}>↑</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Connected event */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              navigation?.navigate?.('MainTabs', {
                screen: '캘린더',
                params: { jumpTo: { y: 2026, m: 3 } },
              });
              navigation?.goBack?.();
            }}
            style={styles.eventCard}
          >
            <Text style={styles.eventLabel}>🔗 연결된 일정</Text>
            <View style={styles.eventRow}>
              <View style={styles.eventIconWrap}>
                <Text style={styles.eventIcon}>📅</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>서울숲 데이트 🌸</Text>
                <Text style={styles.eventTime}>4월 12일 (토) 오후 2:00 — 7:00</Text>
              </View>
              <Text style={styles.eventChevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleShare}
          style={styles.likeBtnWrap}
        >
          <LinearGradient
            colors={[colors.pink, colors.heartRed]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.likeBtn}
          >
            <Text style={styles.likeHeart}>↗</Text>
            <Text style={styles.likeText}>공유하기</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>📥</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]}>
          <Text style={styles.iconBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F0F1A' },
  safe: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  scroll: { flex: 1, backgroundColor: '#fff' },

  appbar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appbarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appbarBtnText: { color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 22 },
  appbarBtnTextSm: { color: '#fff', fontSize: 14, fontWeight: '700' },
  appbarCount: { color: '#fff', fontSize: 12, fontWeight: '700', opacity: 0.9 },
  appbarDate: { color: '#fff', fontSize: 9, fontWeight: '500', opacity: 0.7, marginTop: 1 },

  // Hero
  hero: {
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  heroEmoji: { fontSize: 120, opacity: 0.85 },
  sparkle: { position: 'absolute', color: '#fff' },
  sparkleA: { top: '20%', left: '15%', fontSize: 14 },
  sparkleB: { top: '60%', right: '20%', fontSize: 12 },
  heroHeart: {
    position: 'absolute',
    top: '50%',
    color: '#fff',
    fontSize: 64,
    opacity: 0.95,
  },
  heroDots: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    gap: 6,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  heroDotActive: {
    width: 18,
    backgroundColor: '#fff',
  },

  // Sheet
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: colors.ink,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  metaItem: { fontSize: 11, color: '#888' },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#DDD',
  },

  uploader: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF5F8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  uploaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploaderAvatarText: { fontSize: 12, fontWeight: '700', color: colors.pinkDeep },
  uploaderName: { fontSize: 12, fontWeight: '700', color: colors.ink },
  uploaderSub: { fontSize: 10, color: '#888', marginTop: 1 },
  sharedPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  sharedPillText: { color: colors.heartRed, fontSize: 10, fontWeight: '800' },

  tagRow: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  tagChipText: { fontSize: 11, fontWeight: '700' },
  emotionChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.pinkTint,
  },
  emotionChipText: { fontSize: 11, fontWeight: '700', color: colors.heartRed },

  memoCard: {
    marginTop: 12,
    padding: 14,
    paddingLeft: 28,
    borderRadius: 14,
    backgroundColor: '#FFF8FB',
    borderWidth: 1,
    borderColor: '#FFD0E0',
    position: 'relative',
  },
  memoQuote: {
    position: 'absolute',
    top: -2,
    left: 10,
    fontSize: 36,
    color: colors.pink,
    opacity: 0.4,
    fontWeight: '800',
    lineHeight: 36,
  },
  memoText: { fontSize: 13, color: colors.ink, lineHeight: 21 },

  insightsCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line2,
  },
  insightsHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.pink,
    marginBottom: 8,
  },
  insightsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  insightItem: {
    width: '48%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
  },
  insightLabel: {
    fontSize: 9,
    color: '#888',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  insightValue: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },

  commentsCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line2,
  },
  commentsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentsTitle: { fontSize: 13, fontWeight: '800', color: colors.ink },
  commentsCount: { fontSize: 11, color: '#888' },
  commentRow: { flexDirection: 'row', gap: 10 },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: { fontSize: 11, fontWeight: '700' },
  commentMeta: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  commentName: { fontSize: 11, fontWeight: '800', color: colors.ink },
  commentWhen: { fontSize: 9, color: colors.inkMute },
  commentText: { marginTop: 2, fontSize: 12, color: colors.ink, lineHeight: 18 },
  commentInputRow: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
    padding: 0,
  },
  commentSend: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.heartRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSendText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  eventCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFF8FB',
    borderWidth: 1,
    borderColor: '#FFD0E0',
  },
  eventLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.pink,
    marginBottom: 8,
  },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  eventIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,138,178,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventIcon: { fontSize: 18 },
  eventTitle: { fontSize: 13, fontWeight: '800', color: colors.ink },
  eventTime: { fontSize: 11, color: '#888', marginTop: 2 },
  eventChevron: { fontSize: 20, color: colors.inkMute, fontWeight: '300' },

  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.line2,
  },
  likeBtnWrap: { flex: 1 },
  likeBtn: {
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.heartRed,
    shadowOpacity: 0.32,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  likeHeart: { color: '#fff', fontSize: 14 },
  likeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDanger: { borderColor: '#FFD0E0' },
  iconBtnText: { fontSize: 16 },
});
