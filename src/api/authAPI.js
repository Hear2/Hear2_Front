import endpoints from '../constants/endpoints';
import { post, get } from './client';

// 백엔드 AuthResponse 모양:
//   { userId, email, nickname, profileImage, provider, createdAt,
//     token: { accessToken, refreshToken, tokenType: 'Bearer', expiresIn } }
// → 프론트 signIn 호출부가 기대하는 평면 구조로 변환:
//   { accessToken, refreshToken, tokenType, expiresIn, user: { ... } }
function normalizeAuthResponse(res) {
  if (!res) return res;
  const token = res.token ?? {};
  return {
    accessToken: token.accessToken ?? res.accessToken ?? null,
    refreshToken: token.refreshToken ?? res.refreshToken ?? null,
    tokenType: token.tokenType ?? res.tokenType ?? 'Bearer',
    expiresIn: token.expiresIn ?? res.expiresIn ?? null,
    user: {
      userId: res.userId ?? null,
      email: res.email ?? null,
      nickname: res.nickname ?? null,
      profileImage: res.profileImage ?? null,
      provider: res.provider ?? null,
      createdAt: res.createdAt ?? null,
    },
  };
}

export async function login({ email, password } = {}) {
  const res = await post(
    endpoints.auth.login,
    { email, password },
    { skipAuth: true },
  );
  return normalizeAuthResponse(res);
}

export async function signup({ email, password, nickname, ...rest } = {}) {
  const res = await post(
    endpoints.auth.signup,
    { email, password, nickname, ...rest },
    { skipAuth: true },
  );
  return normalizeAuthResponse(res);
}

// 소셜 로그인: 클라가 제공자로부터 받은 토큰(or auth code)을 백엔드에 전달
// 백엔드 GoogleOAuthLoginRequest는 idToken만 사용. accessToken 필드는 무시됨.
export async function loginWithGoogle({ idToken, accessToken } = {}) {
  const res = await post(
    endpoints.auth.oauthGoogle,
    { idToken, accessToken },
    { skipAuth: true },
  );
  return normalizeAuthResponse(res);
}

export async function loginWithKakao({ accessToken } = {}) {
  const res = await post(
    endpoints.auth.oauthKakao,
    { accessToken },
    { skipAuth: true },
  );
  return normalizeAuthResponse(res);
}

// refresh 토큰으로 access 토큰 재발급. 401 인터셉터에서 호출됨.
// skipAuth=true이지만 refresh 토큰은 바디(또는 헤더)로 명시 전달.
export function reissue({ refreshToken } = {}) {
  return post(
    endpoints.auth.reissue,
    { refreshToken },
    { skipAuth: true, _retryOn401: false },
  );
}

export function logout() {
  return post(endpoints.auth.logout, {});
}

export function fetchMe() {
  return get(endpoints.auth.me);
}

// 이메일 인증 토큰 재발송. /signup 시점에 1차 발송되므로, 이건 "다시 받기"용.
// 백엔드 EmailVerificationResendRequest: { email }
export function resendEmailVerification({ email } = {}) {
  return post(
    endpoints.auth.emailResend,
    { email },
    { skipAuth: true },
  );
}

// 메일로 받은 토큰을 검증. 백엔드 EmailVerificationRequest: { token }
// 성공 응답: { success: true }
export function verifyEmail({ token } = {}) {
  return post(
    endpoints.auth.emailVerify,
    { token },
    { skipAuth: true },
  );
}

// 비밀번호 찾기: 코드 발송 → 검증 → 새 비번 등록 3단계
export function requestPasswordReset({ email } = {}) {
  return post(
    endpoints.auth.passwordResetRequest,
    { email },
    { skipAuth: true },
  );
}

export function verifyPasswordReset({ email, code } = {}) {
  return post(
    endpoints.auth.passwordResetVerify,
    { email, code },
    { skipAuth: true },
  );
}

export function confirmPasswordReset({ email, code, newPassword } = {}) {
  return post(
    endpoints.auth.passwordResetConfirm,
    { email, code, newPassword },
    { skipAuth: true },
  );
}
