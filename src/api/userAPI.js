import endpoints from '../constants/endpoints';
import { patch } from './client';

// 내 프로필 수정. PATCH /api/v1/users/me — 변경할 필드만 전달(undefined는 JSON 직렬화 시 제외됨).
// profileImage: 갤러리에서 고른 사진을 presigned로 업로드한 뒤 받은 objectKey.
// 반환: MeResponse { userId, email, nickname, profileImage, ... } (ApiResponse 래핑 없음).
export function updateMyProfile({
  nickname,
  birthday,
  gender,
  intro,
  phone,
  profileImage,
} = {}) {
  return patch(endpoints.users.me, {
    nickname,
    birthday,
    gender,
    intro,
    phone,
    profileImage,
  });
}
