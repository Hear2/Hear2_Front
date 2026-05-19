import endpoints from '../constants/endpoints';
import { getUnwrapped, postUnwrapped } from './client';

// 리포트는 ApiResponse<T> 래핑 — getUnwrapped/postUnwrapped 사용 시 data만 반환됨

function buildQuery(params) {
  const entries = Object.entries(params || {}).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  if (entries.length === 0) return '';
  const q = entries
    .map(
      ([k, v]) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join('&');
  return `?${q}`;
}

// 주간/월간 리포트 조회
// reportType: 'WEEKLY' | 'MONTHLY'
// anchorDate: 'YYYY-MM-DD' (optional)
export function getCoupleReport({ coupleId, reportType, anchorDate, signal } = {}) {
  if (!coupleId) {
    return Promise.reject(new Error('coupleId가 필요합니다.'));
  }
  const url =
    endpoints.reports.forCouple(coupleId) +
    buildQuery({ reportType, anchorDate });
  return getUnwrapped(url, { signal });
}

// 공유 링크 생성
export function createReportShare(
  { coupleId, reportType, anchorDate, signal } = {},
) {
  return postUnwrapped(
    endpoints.reports.createShare,
    { coupleId, reportType, anchorDate },
    { signal },
  );
}

// 공유 리포트 조회 — 인증 없이 (permitAll)
export function getSharedReport({ shareCode, signal } = {}) {
  if (!shareCode) {
    return Promise.reject(new Error('shareCode가 필요합니다.'));
  }
  return getUnwrapped(endpoints.reports.shared(shareCode), {
    skipAuth: true,
    signal,
  });
}
