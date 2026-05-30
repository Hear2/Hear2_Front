import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Share,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import {
  fetchMemory,
  deleteMemory as apiDeleteMemory,
} from '../../api/memoryAPI';
import { useMemories } from '../../contexts/MemoryContext';
import { useAuth } from '../../contexts/AuthContext';
import { buildPhotoSource } from '../../utils/imageSource';

const TAG_COLOR_CYCLE = [
  colors.pink,
  '#FFB05B',
  colors.pinkDeep,
  '#7ED7A0',
  colors.blue,
];

// 댓글 기능은 BE 미구현 — 디자인 유지용 더미 (보이지 않게 빈 배열로 전환)
const COMMENTS = [];

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dow = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${yr}.${mo}.${day} (${dow}) ${hh}:${mm}`;
}

function relativeFromNow(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금';
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}일 전`;
  return formatDate(iso);
}

export default function PhotoDetailScreen({ navigation, route }) {
  const [draft, setDraft] = useState('');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const passedMemory = route?.params?.memory || null;
  // PhotoUpload는 N장 업로드 시 backendIds(복수) 배열로 저장, AlbumScreen이 BE refresh로 가져온 건 backendId(단수).
  // BE detail까지 호출됐다면 detail.id가 가장 신뢰성 높음.
  const backendId =
    passedMemory?.backendId ||
    passedMemory?.backendIds?.[0] ||
    passedMemory?.id;

  const { refresh: refreshAlbum } = useMemories();
  const { accessToken } = useAuth();

  // BE detail (있으면 사용, 없으면 passedMemory 그대로 표시)
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!backendId) return;
    setLoading(true);
    try {
      const res = await fetchMemory(backendId);
      setDetail(res);
    } catch (_) {
      // 실패하면 로컬 데이터로 표시
    } finally {
      setLoading(false);
    }
  }, [backendId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // 표시용 통합 모델: BE detail 우선, 없으면 navigation params
  const view = useMemo(() => {
    if (detail) {
      const aiTagSlugs = (detail.aiTags || []).map((t) => t.replace(/^#/, ''));
      const userTagSlugs = (detail.userTags || []).map((t) => t.replace(/^#/, ''));
      const tags = [...new Set([...userTagSlugs, ...aiTagSlugs])];
      return {
        title: (detail.memo || '').split('\n')[0] || '제목 없는 추억',
        memo: (detail.memo || '').split('\n').slice(1).join('\n') || detail.memo || '',
        photoUrl: detail.photoUrl,
        takenAt: detail.metadata?.takenAt || detail.createdAt,
        memoryDate: detail.memoryDate,
        // 위치 표시 우선순위: locationName > placeName > addressName.
        place:
          detail.metadata?.locationName ||
          detail.metadata?.placeName ||
          detail.metadata?.addressName ||
          '',
        tags,
        aiTags: aiTagSlugs,
      };
    }
    // 로컬 시드/임시 모델
    return {
      title: passedMemory?.title || (passedMemory?.tag || '추억'),
      memo: passedMemory?.memo || '',
      photoUrl: passedMemory?.photoUri || null,
      takenAt: null,
      memoryDate: null,
      place: passedMemory?.place || '',
      tags: passedMemory?.tag
        ? [passedMemory.tag.replace(/^#/, '')]
        : [],
      aiTags: [],
    };
  }, [detail, passedMemory]);

  const goBack = () => navigation?.goBack?.();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${view.title} — 우리 둘의 추억`,
      });
    } catch {}
  };

  const handleDelete = () => {
    // 여러 장 업로드 케이스 대비: backendIds 배열이 있으면 그것 우선, 아니면 backendId 하나
    const idsToDelete =
      (Array.isArray(passedMemory?.backendIds) && passedMemory.backendIds.length > 0)
        ? passedMemory.backendIds
        : (backendId ? [backendId] : []);

    if (__DEV__) {
      console.log('[PhotoDetail] handleDelete:', { backendId, idsToDelete, passedMemory });
    }

    if (idsToDelete.length === 0) {
      Alert.alert(
        '삭제할 수 없어요',
        '이 추억의 서버 ID를 찾을 수 없습니다. 앨범에서 새로고침 후 다시 시도해 주세요.',
      );
      return;
    }
    Alert.alert('추억을 삭제할까요?', '되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await Promise.all(idsToDelete.map((id) => apiDeleteMemory(id)));
            refreshAlbum?.().catch(() => {});
            goBack();
          } catch (e) {
            Alert.alert('삭제 실패', e?.message || '잠시 후 다시 시도해주세요');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
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
            <Text style={styles.appbarCount}>추억</Text>
            <Text style={styles.appbarDate}>
              {view.memoryDate
                ? view.memoryDate.replace(/-/g, '.')
                : (view.takenAt ? formatDate(view.takenAt).split(' ')[0] : '')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity style={styles.appbarBtn} onPress={handleShare}>
              <Text style={styles.appbarBtnTextSm}>↗</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.appbarBtn}
              onPress={() => setMoreMenuOpen((v) => !v)}
            >
              <Text style={styles.appbarBtnTextSm}>⋯</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      {/* 메뉴 + backdrop은 root 레벨에서 SafeAreaView보다 위에 렌더해서 zIndex 충돌 방지 */}
      {moreMenuOpen && (
        <>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.moreMenuBackdrop}
            onPress={() => setMoreMenuOpen(false)}
          />
          <View
            style={[
              styles.moreMenu,
              { top: 56 + Math.max(insets.top, 0) },
            ]}
          >
            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                setMoreMenuOpen(false);
                // Alert 보장을 위해 다음 tick에서 호출
                setTimeout(() => handleDelete(), 0);
              }}
            >
              <Text style={styles.moreMenuItemText}>🗑  삭제</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 + Math.max(insets.bottom, 0) }}
      >
        {/* Hero photo */}
        {view.photoUrl ? (
          <View style={styles.hero}>
            <Image
              source={buildPhotoSource(view.photoUrl, accessToken)}
              style={styles.heroImage}
            />
            {loading && (
              <View style={styles.heroLoader}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </View>
        ) : (
          <LinearGradient
            colors={['#FFE4EE', colors.peach, colors.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroEmoji}>
              {passedMemory?.emoji || '📷'}
            </Text>
            <Text style={[styles.sparkle, styles.sparkleA]}>✨</Text>
            <Text style={[styles.sparkle, styles.sparkleB]}>✨</Text>
          </LinearGradient>
        )}

        {/* Sheet */}
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          <Text style={styles.title}>{view.title}</Text>
          <View style={styles.metaRow}>
            {view.takenAt ? (
              <Text style={styles.metaItem}>📅 {formatDate(view.takenAt)}</Text>
            ) : null}
            {view.place ? (
              <>
                {view.takenAt ? <View style={styles.metaDot} /> : null}
                <Text style={styles.metaItem}>📍 {view.place}</Text>
              </>
            ) : null}
          </View>

          {/* Uploader */}
          <View style={styles.uploader}>
            <View style={styles.uploaderAvatar}>
              <Text style={styles.uploaderAvatarText}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.uploaderName}>
                {detail?.uploaderId ? `사용자 ${detail.uploaderId}` : '내가 올림'}
              </Text>
              <Text style={styles.uploaderSub}>
                {view.takenAt
                  ? `${relativeFromNow(view.takenAt)} · 두 분의 추억함에 저장됨`
                  : '두 분의 추억함에 저장됨'}
              </Text>
            </View>
            <View style={styles.sharedPill}>
              <Text style={styles.sharedPillText}>공유 중</Text>
            </View>
          </View>

          {/* Tags */}
          {view.tags.length > 0 && (
            <View style={styles.tagRow}>
              {view.tags.map((t, i) => {
                const c = TAG_COLOR_CYCLE[i % TAG_COLOR_CYCLE.length];
                return (
                  <View
                    key={t}
                    style={[styles.tagChip, { backgroundColor: `${c}26` }]}
                  >
                    <Text style={[styles.tagChipText, { color: c }]}>#{t}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Memo */}
          {view.memo ? (
            <View style={styles.memoCard}>
              <Text style={styles.memoQuote}>“</Text>
              <Text style={styles.memoText}>{view.memo}</Text>
            </View>
          ) : null}

          {/* AI 발견 (AI 태그가 있을 때만) */}
          {view.aiTags.length > 0 && (
            <View style={styles.insightsCard}>
              <Text style={styles.insightsHeader}>✨ AI가 발견한 것</Text>
              <View style={styles.insightsGrid}>
                {view.aiTags.slice(0, 4).map((tag) => (
                  <View key={tag} style={styles.insightItem}>
                    <Text style={styles.insightLabel}>🏷️ 태그</Text>
                    <Text style={styles.insightValue}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Comments (BE 미구현 — 댓글 0개일 때 카드 숨김) */}
          {COMMENTS.length > 0 && (
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
          )}

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
      <View
        style={[
          styles.actionBar,
          { paddingBottom: 12 + Math.max(insets.bottom, 0) },
        ]}
      >
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
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => Alert.alert('알림', '다운로드는 다음 스프린트에 추가됩니다.')}
        >
          <Text style={styles.iconBtnText}>📥</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => Alert.alert('알림', '편집은 다음 스프린트에 추가됩니다.')}
        >
          <Text style={styles.iconBtnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, styles.iconBtnDanger]}
          onPress={handleDelete}
          disabled={deleting}
        >
          <Text style={styles.iconBtnText}>{deleting ? '…' : '🗑'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F0F1A' },
  safe: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  moreMenu: {
    position: 'absolute',
    // top은 인라인으로 (status bar inset 반영)
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: 130,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 12, // Android: 메뉴를 backdrop 위로
    zIndex: 100,
  },
  moreMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  moreMenuItemText: {
    fontSize: 14,
    color: colors.heartRed,
    fontWeight: '600',
  },
  moreMenuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 11, // Android: backdrop은 menu 바로 아래
    zIndex: 99,
  },
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
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
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
    // paddingBottom은 인라인으로 insets.bottom 더해서 주입
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
