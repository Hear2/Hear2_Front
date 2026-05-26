import endpoints from '../constants/endpoints';
import {
  ApiError,
  getUnwrapped,
  postUnwrapped,
  patch,
  del,
  request,
} from './client';

// 백엔드 응답 모양 (ApiResponse<T> 래핑 해제 후):
//
// MediaPresignedUrlResponse:
//   { uploadUrl, method, headers, objectKey, expiresAt }
//
// MemoryQuickResponse:
//   { id, imageUrl, aiPlace, aiTime, aiTags: ['#봄', ...], userTags, note }
//
// MemoryImageTagResponse:
//   { tags: ['데이트', '봄', ...], scene, confidence }
//
// MemoryResponse (앨범/상세):
//   { id, coupleId, uploaderId, memo, memoryDate, photoUrl, photoAvailable,
//     aiAnalysisStatus, metadata, tags, aiTags, userTags, createdAt, updatedAt }

// ───── 미디어 업로드 ─────

export function createPresignedUrl({
  mediaType = 'photo',
  contentType,
  originalFileName,
  purpose = 'memory',
} = {}) {
  return postUnwrapped(endpoints.media.presignedUrl, {
    mediaType,
    contentType,
    originalFileName,
    purpose,
  });
}

// presigned URL에 직접 PUT 업로드. uploadUrl/headers는 createPresignedUrl 응답값을 그대로 전달.
// RN에서는 fetch(fileUri)로 Blob을 얻어 PUT body로 넘긴다.
export async function uploadToPresignedUrl({
  uploadUrl,
  method = 'PUT',
  headers = {},
  fileUri,
  contentType,
} = {}) {
  if (!uploadUrl || !fileUri) {
    throw new ApiError('uploadUrl/fileUri가 필요해요', { code: 'BAD_ARGS' });
  }

  const fileRes = await fetch(fileUri);
  const blob = await fileRes.blob();

  const finalHeaders = { ...headers };
  // R2/S3 presigned는 PUT 시 Content-Type을 발급 시점과 일치시켜야 한다.
  if (contentType && !finalHeaders['Content-Type'] && !finalHeaders['content-type']) {
    finalHeaders['Content-Type'] = contentType;
  }

  const res = await fetch(uploadUrl, {
    method,
    headers: finalHeaders,
    body: blob,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(`업로드 실패 (${res.status})`, {
      status: res.status,
      payload: body,
    });
  }

  return true;
}

// ───── AI 이미지 태깅 ─────

export function analyzeImageTags({ imageUrl } = {}) {
  return postUnwrapped(endpoints.memory.imageTags, { imageUrl });
}

// ───── 3초 기록(=추억 사진 1장) 생성 ─────

// capturedAt은 OffsetDateTime (UTC ISO8601 권장: "2026-05-12T14:00:00Z")
// userTags는 ["우리둘이", "특별한날"] 처럼 # 제외 문자열 배열
export function createQuickMemory({
  objectKey,
  imageUrl, // 호환용
  lat,
  lng,
  capturedAt,
  userTags,
} = {}) {
  return postUnwrapped(endpoints.memory.quickCreate, {
    objectKey,
    imageUrl,
    lat,
    lng,
    capturedAt,
    userTags,
  });
}

export function updateQuickMemory(id, { note, userTags } = {}) {
  return patch(endpoints.memory.quickUpdate(id), { note, userTags }).then(
    (env) => env?.data ?? env,
  );
}

// ───── 앨범 / 달력 / 상세 ─────

export function fetchAlbum() {
  return getUnwrapped(endpoints.memory.album);
}

export function fetchMemoriesByDate(dateIsoYmd) {
  // dateIsoYmd: "2026-05-25"
  return getUnwrapped(endpoints.memory.byDate(dateIsoYmd));
}

export function fetchCalendar(year, month) {
  return getUnwrapped(endpoints.memory.calendar(year, month));
}

export function fetchYearAgo() {
  return getUnwrapped(endpoints.memory.yearAgo);
}

export function fetchMemory(memoryId) {
  return getUnwrapped(endpoints.memory.item(memoryId));
}

export function deleteMemory(memoryId) {
  return del(endpoints.memory.item(memoryId));
}

// ───── 편의 함수: 1장 업로드 + 생성 ─────

// fileUri → presigned 발급 → PUT 업로드 → /memory/quick 생성 까지 한 번에.
// 반환: MemoryQuickResponse
export async function uploadAndCreateQuickMemory({
  fileUri,
  contentType = 'image/jpeg',
  originalFileName = 'memory.jpg',
  lat,
  lng,
  capturedAt,
  userTags,
} = {}) {
  const presigned = await createPresignedUrl({
    mediaType: 'photo',
    contentType,
    originalFileName,
    purpose: 'memory',
  });

  await uploadToPresignedUrl({
    uploadUrl: presigned.uploadUrl,
    method: presigned.method,
    headers: presigned.headers,
    fileUri,
    contentType,
  });

  return createQuickMemory({
    objectKey: presigned.objectKey,
    lat,
    lng,
    capturedAt,
    userTags,
  });
}
