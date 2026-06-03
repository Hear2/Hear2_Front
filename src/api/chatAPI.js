import { Platform } from 'react-native';
import endpoints from '../constants/endpoints';
import { ApiError, get, post } from './client';

// 백엔드 ChatMessageResponse 모양:
// { id, coupleId, senderId, receiverId, content, messageType,
//   mediaUrl, originalFileName, mediaContentType, mediaSize,
//   readAt, unreadCount, createdAt,
//   emotionType, emotionScore, negativeScore, emotionEmoji,
//   riskLevel, riskDetected, riskReason, detectedRiskKeywords,
//   judgeAvailable, judgeTriggerMessageId }
//
// 커플 정보는 토큰의 사용자 ID로 서버가 자동 식별.

export function fetchMessages() {
  return get(endpoints.chat.messages);
}

// TEXT 메시지 전송. content만 보내면 messageType은 BE에서 TEXT로 처리.
export function sendTextMessage({ content } = {}) {
  return post(endpoints.chat.messages, {
    content,
    messageType: 'TEXT',
  });
}

// 감정분석 피드백. 메시지에 붙은 감정 분석이 맞는지 사용자가 알려준다.
// isCorrect=true(맞아요) / false(아니에요). 한 번만 제출, 재제출은 update 개념.
// 반환(예시): { emotionFeedback: boolean }
export function sendEmotionFeedback({ messageId, isCorrect } = {}) {
  if (endpoints.MOCK) {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ emotionFeedback: isCorrect }), 300),
    );
  }
  return post(endpoints.chat.emotionFeedback(messageId), { isCorrect });
}

// 이미지/동영상 메시지 (Stage 2). 사전에 /media 업로드 후 받은 정보를 전달.
export function sendMediaMessage({
  messageType,
  mediaUrl,
  originalFileName,
  mediaContentType,
  mediaSize,
  content = '',
} = {}) {
  return post(endpoints.chat.messages, {
    content,
    messageType,
    mediaUrl,
    originalFileName,
    mediaContentType,
    mediaSize,
  });
}

// 미디어 파일 업로드 (multipart/form-data, field name "file").
// asset: expo-image-picker가 돌려주는 { uri, fileName?, mimeType?, type? } shape.
// 반환: ChatMediaResponse { messageType, mediaUrl, originalFileName, mediaContentType, mediaSize }
// 주의: client.js는 JSON 전용이라 fetch 직접 사용. 토큰는 AuthProvider가 주입.
let _tokenGetter = () => null;
export function setUploadTokenProvider(fn) {
  _tokenGetter = typeof fn === 'function' ? fn : () => null;
}

function guessMime(uri, explicit) {
  if (explicit) return explicit;
  const lower = (uri || '').toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  return 'image/jpeg';
}

function guessName(uri, explicit) {
  if (explicit) return explicit;
  const base = (uri || 'media').split('/').pop() || 'media';
  return base.includes('.') ? base : `${base}.jpg`;
}

export async function uploadChatMedia(asset) {
  if (!asset?.uri) {
    throw new ApiError('업로드할 파일이 없어요.', { code: 'NO_FILE' });
  }
  const uri =
    Platform.OS === 'android' && !asset.uri.startsWith('file://')
      ? `file://${asset.uri}`
      : asset.uri;
  const mime = guessMime(uri, asset.mimeType);
  const name = guessName(uri, asset.fileName);

  const form = new FormData();
  // RN FormData 파일 객체 형식
  form.append('file', { uri, name, type: mime });

  const token = _tokenGetter?.();
  const res = await fetch(endpoints.chat.media, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Content-Type은 fetch가 boundary 포함해 자동 설정. 명시하면 boundary 누락됨.
    },
    body: form,
  });
  const text = await res.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (!res.ok) {
    const msg =
      (payload && (payload.message || payload.error)) || `업로드 실패 (HTTP ${res.status})`;
    throw new ApiError(msg, { status: res.status, payload });
  }
  return payload;
}
