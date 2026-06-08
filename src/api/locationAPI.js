import endpoints from '../constants/endpoints';
import { getUnwrapped, postUnwrapped, requestUnwrapped } from './client';

// 커플 간 위치 공유 API. 모두 ApiResponse<T> 래핑 → unwrapped 사용.

// 내 위치 업로드. JWT 기준이라 userId/coupleId 불필요.
export function uploadMyLocation({ lat, lng, accuracy, capturedAt } = {}) {
  return postUnwrapped(endpoints.location.update, {
    lat,
    lng,
    accuracy,
    capturedAt,
  });
}

// 커플 양쪽 위치 조회 → { me: LocationResponse|null, partner: LocationResponse|null }
// LocationResponse: { coupleId, userId, lat, lng, accuracy, locationName, placeName, ... }
// 내가 공유 OFF면 403, 상대가 OFF면 partner=null.
export function fetchCoupleLocation(opts) {
  return getUnwrapped(endpoints.location.couple, opts);
}

// 위치 공유 ON/OFF. OFF로 바꾸면 BE가 마지막 위치를 즉시 삭제.
export function setLocationSharing(enabled) {
  return requestUnwrapped(endpoints.location.sharing, {
    method: 'PUT',
    body: { enabled },
  });
}
