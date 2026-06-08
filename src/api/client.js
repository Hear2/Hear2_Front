let tokenProvider = () => null;
let refreshHandler = null; // async () => newAccessToken | null
let onAuthFailure = null; // () => void  (refresh도 실패했을 때)

export function setAuthTokenProvider(fn) {
  tokenProvider = typeof fn === 'function' ? fn : () => null;
}

export function setRefreshHandler(fn) {
  refreshHandler = typeof fn === 'function' ? fn : null;
}

export function setAuthFailureHandler(fn) {
  onAuthFailure = typeof fn === 'function' ? fn : null;
}

export class ApiError extends Error {
  constructor(message, { status, code, payload } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status ?? null;
    this.code = code ?? null;
    this.payload = payload ?? null;
  }
}

// Render free tier는 15분 idle 후 sleep, 첫 호출(cold start)이 30~50초 걸린다.
// 15초로는 첫 호출이 무조건 잘리므로 30초로 늘림. 정상 호출은 1초 안에 끝나니 부작용 없음.
const DEFAULT_TIMEOUT_MS = 30000;

// 백엔드 에러 응답: { status, error, message, timestamp }
function extractErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload === 'string') return payload || fallback;
  return payload.message || payload.error || fallback;
}

async function rawFetch(
  url,
  {
    method = 'GET',
    body,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal: externalSignal,
    skipAuth = false,
    token,
  } = {},
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onExternalAbort);
  }

  const effectiveToken = skipAuth
    ? null
    : token !== undefined
      ? token
      : tokenProvider?.();
  const finalHeaders = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {}),
    ...headers,
  };

  try {
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
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
    return { ok: res.ok, status: res.status, payload };
  } finally {
    clearTimeout(timeoutId);
    if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
  }
}

export async function request(url, options = {}) {
  const { _retryOn401 = true } = options;

  let res;
  try {
    res = await rawFetch(url, options);
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new ApiError('요청 시간이 초과됐어요', { code: 'TIMEOUT' });
    }
    throw new ApiError(err?.message || '네트워크 오류', { code: 'NETWORK' });
  }

  // 401 처리: refresh 한 번 시도 후 재시도
  if (res.status === 401 && _retryOn401 && !options.skipAuth && refreshHandler) {
    try {
      const newToken = await refreshHandler();
      if (newToken) {
        return request(url, { ...options, token: newToken, _retryOn401: false });
      }
    } catch {
      // refresh 자체 실패 → 아래에서 401 throw로 흘려보냄
    }
    if (typeof onAuthFailure === 'function') {
      try {
        onAuthFailure();
      } catch {}
    }
  }

  if (!res.ok) {
    const message = extractErrorMessage(res.payload, `HTTP ${res.status}`);
    throw new ApiError(message, {
      status: res.status,
      code: res.payload?.code ?? res.payload?.error ?? null,
      payload: res.payload,
    });
  }

  return res.payload;
}

// ApiResponse<T> 래핑 해제. success/data/message 구조 가정.
// 성공인데 success=false인 경우도 ApiError로 변환.
export function unwrap(envelope) {
  if (envelope == null) return null;
  if (typeof envelope !== 'object') return envelope;
  if (!('success' in envelope) && !('data' in envelope)) return envelope;
  if (envelope.success === false) {
    throw new ApiError(envelope.message || '요청에 실패했어요', {
      payload: envelope,
    });
  }
  return envelope.data ?? null;
}

export async function requestUnwrapped(url, options) {
  const envelope = await request(url, options);
  return unwrap(envelope);
}

export const get = (url, opts) => request(url, { ...opts, method: 'GET' });
export const post = (url, body, opts) =>
  request(url, { ...opts, method: 'POST', body });
export const put = (url, body, opts) =>
  request(url, { ...opts, method: 'PUT', body });
export const patch = (url, body, opts) =>
  request(url, { ...opts, method: 'PATCH', body });
export const del = (url, opts) => request(url, { ...opts, method: 'DELETE' });

export const getUnwrapped = (url, opts) =>
  requestUnwrapped(url, { ...opts, method: 'GET' });
export const postUnwrapped = (url, body, opts) =>
  requestUnwrapped(url, { ...opts, method: 'POST', body });
