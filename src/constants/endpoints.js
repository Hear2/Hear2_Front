import Constants from 'expo-constants';

const extra =
  Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};

const BASE_URL = extra.apiBaseUrl ?? 'https://api.hear2.app';
const AI_URL = extra.aiBaseUrl ?? BASE_URL;
const WS_URL = extra.wsBaseUrl ?? 'wss://api.hear2.app';
const MOCK_API = extra.mockApi !== false;

export const apiConfig = {
  BASE_URL,
  AI_URL,
  WS_URL,
  MOCK: MOCK_API,
};

export default {
  BASE_URL,
  AI_URL,
  WS_URL,
  MOCK: MOCK_API,

  // 인증: 생 DTO 반환 (ApiResponse 래핑 없음)
  auth: {
    signup: `${BASE_URL}/api/v1/auth/signup`,
    login: `${BASE_URL}/api/v1/auth/login`,
    oauthGoogle: `${BASE_URL}/api/v1/auth/oauth/google`,
    oauthKakao: `${BASE_URL}/api/v1/auth/oauth/kakao`,
    reissue: `${BASE_URL}/api/v1/auth/reissue`,
    logout: `${BASE_URL}/api/v1/auth/logout`,
    me: `${BASE_URL}/api/v1/auth/me`,
    emailVerify: `${BASE_URL}/api/v1/auth/email/verify`,
    emailResend: `${BASE_URL}/api/v1/auth/email/resend`,
    passwordResetRequest: `${BASE_URL}/api/v1/auth/password-reset/request`,
    passwordResetVerify: `${BASE_URL}/api/v1/auth/password-reset/verify`,
    passwordResetConfirm: `${BASE_URL}/api/v1/auth/password-reset/confirm`,
  },

  // 리포트: ApiResponse<T> 래핑
  reports: {
    forCouple: (coupleId) =>
      `${BASE_URL}/api/v1/reports/couples/${coupleId}`,
    createShare: `${BASE_URL}/api/v1/reports/shares`,
    // 공유 리포트 — 인증 없음, permitAll
    shared: (shareCode) => `${BASE_URL}/reports/shared/${shareCode}`,
  },

  // Couple: 생 DTO 반환 (ApiResponse 래핑 없음)
  couples: {
    code: `${BASE_URL}/api/v1/couples/code`,
    connect: `${BASE_URL}/api/v1/couples/connect`,
    status: `${BASE_URL}/api/v1/couples/status`,
    dna: (coupleId) => `${BASE_URL}/api/v1/couples/${coupleId}/dna`,
  },

  // Chat: 생 DTO 반환. 커플 식별은 토큰(서버 측 Authentication)으로 자동.
  chat: {
    messages: `${BASE_URL}/api/v1/chats/messages`,
    media: `${BASE_URL}/api/v1/chats/media`,
    // WebSocket(STOMP): 엔드포인트 /ws, pub /pub/chats/messages, sub /sub/chats/couples/{id}
    ws: `${WS_URL}/ws`,
  },
  memory: {
    list: `${BASE_URL}/memory`,
    create: `${BASE_URL}/memory`,
  },
  calendar: {
    events: `${BASE_URL}/calendar/events`,
  },
  couple: {
    connect: `${BASE_URL}/couple/connect`,
    location: `${BASE_URL}/couple/location`,
  },
  ai: {
    emotion: `${AI_URL}/emotion`,
    judge: `${AI_URL}/judge`,
    reconciliation: `${AI_URL}/judge/reconciliation`,
    report: `${AI_URL}/report`,
    question: `${AI_URL}/question`,
    whatif: `${AI_URL}/predict/whatif`,
  },

  // AI 판사 (실 BE). 생 DTO 반환.
  judge: {
    invoke: `${BASE_URL}/api/v1/judge`,
    histories: `${BASE_URL}/api/v1/judge/histories`,
    patterns: `${BASE_URL}/api/v1/judge/patterns`,
  },
};
