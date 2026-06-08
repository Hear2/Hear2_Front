import endpoints from '../constants/endpoints';
import { get, post, patch } from './client';

// 백엔드 CoupleStatusResponse 모양:
// { connected, coupleId, coupleCode, startDate, createdAt, memberCount, partner }
//
// connected=true  → 두 사람 모두 참여 완료
// connected=false && coupleCode 있음 → 본인이 OWNER, 파트너 대기 중
// connected=false && coupleCode 없음 → 커플 없음 (createCode 필요)

export function fetchCoupleStatus() {
  return get(endpoints.couples.status);
}

// 본인을 OWNER로 한 새 커플 생성. 이미 커플에 속해있으면 409 CONFLICT.
export function createCoupleCode() {
  return post(endpoints.couples.code, {});
}

// 상대가 알려준 코드로 합류. 이미 커플에 속해있으면 409,
// 코드 없으면 404, 정원 초과면 409 반환.
export function connectCouple({ coupleCode } = {}) {
  return post(endpoints.couples.connect, { coupleCode });
}

// 사귄 날(커플 시작일) 저장/수정. 백엔드: PATCH /api/v1/couples/start-date { startDate: 'YYYY-MM-DD' }
// 응답은 갱신된 CoupleStatusResponse.
export function setCoupleStartDate({ startDate } = {}) {
  return patch(endpoints.couples.startDate, { startDate });
}
