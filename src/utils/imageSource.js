import endpoints from '../constants/endpoints';

const { BASE_URL } = endpoints;

// BE가 내려주는 사진 URL은 상대경로(`/api/v1/memories/items/{id}/photo`)인 경우가 많고,
// 해당 엔드포인트는 인증이 필요하다. 절대경로로 바꿔준다. 로컬/외부/데이터 URI는 그대로.
export function toAbsolutePhotoUri(url) {
  if (!url) return null;
  if (/^(https?:|file:|content:|data:)/i.test(url)) return url;
  if (!BASE_URL) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

// <Image source>로 쓸 객체를 만든다. BE 보호 엔드포인트 사진이면 Authorization 헤더를 싣고,
// 로컬 파일(file://, content://)·외부 URL이면 헤더 없이 그대로 사용한다.
export function buildPhotoSource(uri, token) {
  const abs = toAbsolutePhotoUri(uri);
  if (!abs) return undefined;
  if (token && BASE_URL && abs.startsWith(BASE_URL)) {
    return { uri: abs, headers: { Authorization: `Bearer ${token}` } };
  }
  return { uri: abs };
}
