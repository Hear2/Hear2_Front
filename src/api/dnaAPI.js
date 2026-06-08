import endpoints from '../constants/endpoints';
import { getUnwrapped } from './client';

function buildQuery(params) {
  const entries = Object.entries(params || {}).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  if (entries.length === 0) return '';
  return (
    '?' +
    entries
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      )
      .join('&')
  );
}

// Couple DNA 조회. anchorDate 옵션.
export function getCoupleDna({ coupleId, anchorDate, signal } = {}) {
  if (!coupleId) {
    return Promise.reject(new Error('coupleId가 필요합니다.'));
  }
  const url = endpoints.couples.dna(coupleId) + buildQuery({ anchorDate });
  return getUnwrapped(url, { signal });
}
