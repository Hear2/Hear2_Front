import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import Chip from '../../components/common/Chip';
import endpoints from '../../constants/endpoints';
import {
  fetchMessages,
  sendMediaMessage,
  sendTextMessage,
  uploadChatMedia,
} from '../../api/chatAPI';
import { useAuth } from '../../contexts/AuthContext';

const POLL_INTERVAL_MS = 3000;

// BE가 반환한 mediaUrl이 상대 경로(/uploads/...)면 BASE_URL을 붙여 절대 URL로 변환.
const absoluteMediaUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${endpoints.BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// 감정 → 색상/라벨 매핑. emotionType이 있으면 채워서, 없으면 null 반환.
const moodFromEmotion = (msg) => {
  if (!msg?.emotionType) return null;
  const pct = Math.round((msg.emotionScore ?? 0) * 100);
  const map = {
    HAPPY: { color: colors.green, label: `긍정 ${pct}%` },
    SAD: { color: colors.blue, label: `슬픔 ${pct}%` },
    ANGRY: { color: colors.pink, label: `분노 ${pct}%` },
    ANXIOUS: { color: colors.yellow, label: `불안 ${pct}%` },
    NEUTRAL: { color: colors.inkMute, label: `중립 ${pct}%` },
  };
  return map[msg.emotionType] ?? null;
};

// BE 정책 그대로 미러:
//  - riskLevel >= WARNING 이거나 negativeScore >= 0.70 이면 AI 판사 호출 가능
//  - BE가 msg.judgeAvailable을 채워주지만, FE에서도 같은 식으로 계산해 일관성 보장
const RISK_SEVERITY = { NONE: 0, CAUTION: 1, WARNING: 2, DANGER: 3 };
const NEGATIVE_THRESHOLD = 0.7;
function isJudgeAvailable(msg) {
  if (!msg) return false;
  if (msg.judgeAvailable === true) return true;
  const sev = RISK_SEVERITY[msg.riskLevel] ?? 0;
  if (sev >= RISK_SEVERITY.WARNING) return true;
  if ((msg.negativeScore ?? 0) >= NEGATIVE_THRESHOLD) return true;
  return false;
}

// DANGER 메시지 도착 시 띄울 인앱 배너 라벨
function riskBannerLabel(msg) {
  if (msg?.riskLevel === 'DANGER') return '🚨 위험 신호가 감지됐어요';
  if (msg?.riskLevel === 'WARNING') return '⚠️ 부정 감정이 강하게 감지됐어요';
  return '💬 AI 판사 호출이 권장되는 메시지가 있어요';
}

const formatHHMM = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const ChatScreen = ({ navigation }) => {
  const { user } = useAuth();
  // /auth/me 응답이 user.id로 올 수도 있어 둘 다 허용. 비교는 숫자로 강제.
  const rawMyId = user?.userId ?? user?.id ?? null;
  const myId = rawMyId != null ? Number(rawMyId) : null;

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // 이미지 풀스크린 미리보기
  // 위험 메시지 인앱 배너
  const [riskBanner, setRiskBanner] = useState(null); // { msg } | null
  // 이미 알림을 띄운 judgeAvailable 메시지 id들 (중복 방지)
  const notifiedIdsRef = useRef(new Set());

  const scrollRef = useRef(null);
  const pollRef = useRef(null);
  const lastIdRef = useRef(0);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 50);
  }, []);

  const loadMessages = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const list = await fetchMessages();
      const arr = Array.isArray(list) ? list : [];
      setMessages(arr);
      const lastId = arr.length ? arr[arr.length - 1].id : 0;
      if (lastId > lastIdRef.current) {
        lastIdRef.current = lastId;
        scrollToEnd();
      }
      setError(null);
    } catch (err) {
      if (!silent) setError(err?.message || '메시지를 불러오지 못했어요.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [scrollToEnd]);

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(() => loadMessages({ silent: true }), POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [loadMessages]);

  // judgeAvailable 메시지의 가장 최근 id — AI 판사 버튼 활성화 여부 결정
  const latestJudgeAvailable = useMemo(
    () => [...messages].reverse().find((m) => isJudgeAvailable(m)) || null,
    [messages],
  );

  // 새 위험 메시지(judgeAvailable=true) 감지 → 인앱 배너 + 로컬 알림
  // 본인 발신/수신 둘 다 포함. (BE의 의도는 수신자 보호이지만, 테스트 편의 + 발신자 자기 인식 둘 다 유용)
  useEffect(() => {
    if (!messages?.length) return;
    if (__DEV__) {
      const last = messages[messages.length - 1];
      console.log('[ChatScreen] latest msg meta:', {
        id: last?.id,
        content: last?.content?.slice(0, 30),
        emotionType: last?.emotionType,
        negativeScore: last?.negativeScore,
        riskLevel: last?.riskLevel,
        judgeAvailable: last?.judgeAvailable,
      });
    }
    const risks = messages.filter(
      (m) => isJudgeAvailable(m) && !notifiedIdsRef.current.has(m.id),
    );
    if (!risks.length) return;
    const latest = risks[risks.length - 1];
    risks.forEach((m) => notifiedIdsRef.current.add(m.id));

    // 인앱 배너
    setRiskBanner({ msg: latest });

    // 로컬 알림 (앱이 백그라운드일 때 사용자에게 도달)
    Notifications.scheduleNotificationAsync({
      content: {
        title: latest.riskLevel === 'DANGER' ? '🚨 대화 위험 감지' : '⚠️ AI 판사 호출 권장',
        body: '상대방의 메시지에 부정/위험 신호가 감지됐어요. AI 판사를 호출해 보세요.',
        data: { type: 'CHAT_RISK_ALERT', messageId: latest.id },
        sound: 'default',
      },
      trigger: null, // 즉시
    }).catch(() => {});
  }, [messages, myId]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const sent = await sendTextMessage({ content: text });
      setDraft('');
      // 응답 메시지를 즉시 추가 (낙관적 UI). 다음 폴링이 동일 id로 덮어쓰기.
      if (sent?.id) {
        setMessages((prev) => [...prev, sent]);
        lastIdRef.current = sent.id;
        scrollToEnd();
      } else {
        await loadMessages({ silent: true });
      }
    } catch (err) {
      setError(err?.message || '메시지 전송에 실패했어요.');
    } finally {
      setSending(false);
    }
  };

  // 이미지 선택 → /chats/media 업로드 → IMAGE 메시지 전송.
  // BE 제한: jpg/jpeg/png/webp, 최대 10MB.
  const handlePickMedia = async () => {
    if (uploading || sending) return;
    setError(null);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setError('사진 접근 권한이 필요해요.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsMultipleSelection: false,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];

      setUploading(true);
      const uploaded = await uploadChatMedia(asset);
      const sent = await sendMediaMessage({
        messageType: uploaded.messageType ?? 'IMAGE',
        mediaUrl: uploaded.mediaUrl,
        originalFileName: uploaded.originalFileName,
        mediaContentType: uploaded.mediaContentType,
        mediaSize: uploaded.mediaSize,
        content: '',
      });
      if (sent?.id) {
        setMessages((prev) => [...prev, sent]);
        lastIdRef.current = sent.id;
        scrollToEnd();
      } else {
        await loadMessages({ silent: true });
      }
    } catch (err) {
      setError(err?.message || '사진 업로드에 실패했어요.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Chat Header */}
      <View style={styles.header}>
        <View style={styles.headerProfile}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>예</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>지호</Text>
            <Text style={styles.headerStatus}>온라인</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (!latestJudgeAvailable) {
              setError('AI 판사는 위험 감정이 감지된 메시지가 있을 때만 호출할 수 있어요.');
              return;
            }
            navigation?.navigate('AIJudgeModal', {
              triggerMessageId: latestJudgeAvailable.id,
              myId,
            });
          }}
          activeOpacity={latestJudgeAvailable ? 0.7 : 1}
          hitSlop={8}
        >
          <Chip
            label="AI판사"
            variant={latestJudgeAvailable ? 'pink' : 'gray'}
          />
        </TouchableOpacity>
      </View>

      {riskBanner && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            navigation?.navigate('AIJudgeModal', {
              triggerMessageId: riskBanner.msg.id,
              myId,
            });
            setRiskBanner(null);
          }}
          style={styles.riskBanner}
        >
          <Text style={styles.riskBannerText}>
            {riskBannerLabel(riskBanner.msg)} · AI판사 호출 →
          </Text>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              setRiskBanner(null);
            }}
            hitSlop={8}
          >
            <Text style={styles.riskBannerClose}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.chatBody}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={scrollToEnd}
        >
          {loading && messages.length === 0 ? (
            <View style={styles.centerEmpty}>
              <ActivityIndicator color={colors.pink} />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.centerEmpty}>
              <Text style={styles.emptyText}>첫 메시지를 보내보세요 💌</Text>
            </View>
          ) : (
            <>
              {/* Date Divider */}
              <View style={styles.dateDivider}>
                <View style={styles.dateLine} />
                <Text style={styles.dateText}>오늘</Text>
                <View style={styles.dateLine} />
              </View>

              {/* Messages */}
              {messages.map((msg) => {
                const isMe = myId != null && Number(msg.senderId) === myId;
                const mood = moodFromEmotion(msg);
                const isImage = msg.messageType === 'IMAGE';
                const isVideo = msg.messageType === 'VIDEO';
                const mediaSrc = absoluteMediaUrl(msg.mediaUrl);
                return (
                  <View
                    key={msg.id}
                    style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}
                  >
                    {!isMe && (
                      <View style={styles.msgAvatar}>
                        <Text style={styles.msgAvatarText}>지</Text>
                      </View>
                    )}
                    <View style={styles.msgGroup}>
                      {isImage && mediaSrc ? (
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => setPreviewUrl(mediaSrc)}
                        >
                          <Image
                            source={{ uri: mediaSrc }}
                            style={styles.imageBubble}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ) : isVideo && mediaSrc ? (
                        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                            🎬 {msg.originalFileName || '동영상'}
                          </Text>
                        </View>
                      ) : isMe ? (
                        <LinearGradient
                          colors={[colors.pink, colors.pinkSoft]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.bubble, styles.bubbleMe]}
                        >
                          <Text style={[styles.bubbleText, styles.bubbleTextMe]}>
                            {msg.content}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <View style={[styles.bubble, styles.bubbleThem]}>
                          <Text style={styles.bubbleText}>{msg.content}</Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.metaRow,
                          isMe && { alignSelf: 'flex-end' },
                        ]}
                      >
                        {!!mood && (
                          <View
                            style={[
                              styles.moodChip,
                              { backgroundColor: mood.color + '20' },
                            ]}
                          >
                            <View
                              style={[styles.moodDot, { backgroundColor: mood.color }]}
                            />
                            <Text
                              style={[styles.moodChipText, { color: mood.color }]}
                            >
                              {msg.emotionEmoji ? msg.emotionEmoji + ' ' : ''}
                              {mood.label}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.timeText}>{formatHHMM(msg.createdAt)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}

              <View style={{ height: 16 }} />
            </>
          )}

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={[styles.plusBtn, (uploading || sending) && styles.sendBtnDisabled]}
            onPress={handlePickMedia}
            disabled={uploading || sending}
            hitSlop={6}
          >
            {uploading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.plusBtnText}>+</Text>
            )}
          </TouchableOpacity>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              value={draft}
              onChangeText={setDraft}
              placeholder="메시지 입력..."
              placeholderTextColor={colors.inkMute}
              multiline
              editable={!sending}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!draft.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.sendBtnText}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* 이미지 풀스크린 미리보기 */}
      <Modal
        visible={!!previewUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUrl(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.previewBackdrop}
          onPress={() => setPreviewUrl(null)}
        >
          {!!previewUrl && (
            <Image
              source={{ uri: previewUrl }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  riskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFE4E4',
    borderBottomWidth: 1,
    borderBottomColor: '#FFB8B8',
  },
  riskBannerText: {
    flex: 1,
    color: colors.heartRed,
    fontSize: 12,
    fontWeight: '700',
  },
  riskBannerClose: {
    color: colors.heartRed,
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 6,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
    backgroundColor: colors.bgApp,
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.bgApp,
  },
  headerInfo: {
    marginLeft: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  headerStatus: {
    fontSize: 12,
    color: colors.green,
    fontWeight: '500',
  },
  // Chat Body
  chatBody: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dateText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: colors.inkMute,
    fontWeight: '500',
  },
  // Messages
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowThem: {
    justifyContent: 'flex-start',
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  msgAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  msgGroup: {
    maxWidth: '72%',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleThem: {
    backgroundColor: colors.bgSoft,
    borderTopLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: colors.pink,
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
  },
  bubbleTextMe: {
    color: '#FFFFFF',
  },
  imageBubble: {
    width: 220,
    height: 220,
    borderRadius: 18,
    backgroundColor: colors.bgSoft,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    color: colors.inkMute,
  },
  centerEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 14,
    color: colors.ink3,
  },
  errorBox: {
    marginTop: 12,
    backgroundColor: '#FFF0F2',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 12,
    color: colors.heartRed,
    fontWeight: '600',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  moodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  moodChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.pinkTint,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.pinkSoft,
  },
  warningText: {
    fontSize: 13,
    color: colors.pinkDeep,
    fontWeight: '600',
    flex: 1,
  },
  warningBtn: {
    backgroundColor: colors.pink,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  warningBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line2,
    backgroundColor: colors.bgApp,
  },
  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  plusBtnText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '300',
    marginTop: -1,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 0,
  },
  inputIcon: {
    marginLeft: 6,
  },
  inputIconText: {
    fontSize: 18,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -1,
  },
});

export default ChatScreen;
