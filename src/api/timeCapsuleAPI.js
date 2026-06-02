import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import endpoints from '../constants/endpoints';
import { getUnwrapped, postUnwrapped } from './client';
import { createPresignedUrl, uploadToPresignedUrl } from './memoryAPI';

// 타임캡슐(커플 타임캡슐) API.
//
// BE 계약 (모두 ApiResponse<T> 래핑 → getUnwrapped/postUnwrapped):
//   POST /api/v1/capsule                          생성 → TimeCapsuleDetailResponse
//   GET  /api/v1/capsule?status=all|sealed|open    목록 → { sealed:[Summary], open:[Summary] }
//   GET  /api/v1/capsule/{id}                      상세 → Detail (sealed면 letter/photos/thenVsNow/shareCard null)
//   GET  /api/v1/capsule/{id}/share-card           공유 카드(open만)
//
// Summary: { id, name, status(SEALED|OPEN), coverStyle, openAt, sealedAt, openedAt, dDay }

// 커버 스타일 → 이모지. BE enum(LETTER/GIFT/FLOWER/SPACE/CHERRY) 기준.
export const COVER_EMOJI = {
  LETTER: '💌',
  GIFT: '🎁',
  FLOWER: '🌹',
  SPACE: '🪐',
  CHERRY: '🌸',
};

// 생성 화면의 소문자 cover id → BE enum.
const COVER_TO_ENUM = {
  letter: 'LETTER',
  gift: 'GIFT',
  flower: 'FLOWER',
  space: 'SPACE',
  cherry: 'CHERRY',
};

function fmtYmd(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

const clampPct = (n) => Math.max(0, Math.min(100, Math.round(n)));

// 봉인~개봉 사이 진행도(%). 채워진 정도를 시간 경과로 근사.
function progressPercent(sealedAt, openAt) {
  const s = new Date(sealedAt).getTime();
  const o = new Date(openAt).getTime();
  if (!s || !o || o <= s) return 0;
  return clampPct(((Date.now() - s) / (o - s)) * 100);
}

// BE Summary → 화면용 카드 데이터.
function shapeSummary(s) {
  const isOpen = s.status === 'OPEN';
  const dday = Math.max(0, Number(s.dDay) || 0);
  return {
    id: s.id,
    name: s.name,
    status: s.status,
    coverStyle: s.coverStyle,
    emoji: COVER_EMOJI[s.coverStyle] || '💌',
    dday,
    ddayLabel: isOpen ? '오픈됨' : `D-${dday}`,
    openAt: s.openAt,
    sealedAt: s.sealedAt,
    openedAt: s.openedAt,
    dateLabel: fmtYmd(s.openedAt || s.openAt),
    progressPercent: isOpen ? 100 : progressPercent(s.sealedAt, s.openAt),
  };
}

// ── 목업 (MOCK 모드) ────────────────────────────────────────
function buildMockList() {
  return {
    sealed: [
      { id: -1, name: '2026 크리스마스 캡슐', status: 'SEALED', coverStyle: 'GIFT', sealedAt: '2026-04-01T00:00:00', openAt: '2026-12-25T00:00:00', openedAt: null, dDay: 263 },
      { id: -2, name: '내년 생일까지', status: 'SEALED', coverStyle: 'CHERRY', sealedAt: '2026-05-01T00:00:00', openAt: '2026-10-07T00:00:00', openedAt: null, dDay: 127 },
      { id: -3, name: '여름휴가 기록', status: 'SEALED', coverStyle: 'SPACE', sealedAt: '2026-05-01T00:00:00', openAt: '2026-09-01T00:00:00', openedAt: null, dDay: 92 },
    ].map(shapeSummary),
    open: [
      { id: -4, name: '1주년 기념 캡슐', status: 'OPEN', coverStyle: 'LETTER', sealedAt: '2025-04-07T00:00:00', openAt: '2026-04-07T00:00:00', openedAt: '2026-04-07T00:00:00', dDay: 0 },
    ].map(shapeSummary),
  };
}

const toIso = (v) => (v instanceof Date ? v.toISOString() : String(v ?? ''));

// 갤러리에서 고른 사진들을 presigned URL로 업로드하고 objectKey 배열을 반환.
// photos: [{ uri, mimeType?, fileName? }]  (expo-image-picker asset)
// HEIC 등은 JPEG로 변환 후 업로드(메모리 파이프라인과 동일).
export async function uploadCapsulePhotos(photos) {
  if (!photos || photos.length === 0) return [];
  if (endpoints.MOCK) return [];
  const keys = [];
  for (let i = 0; i < photos.length; i += 1) {
    const p = photos[i];
    let uri = p.uri;
    let mime = p.mimeType || 'image/jpeg';
    let name = p.fileName || `capsule-${i}.jpg`;
    try {
      const jpeg = await manipulateAsync(p.uri, [], { compress: 0.9, format: SaveFormat.JPEG });
      uri = jpeg.uri;
      mime = 'image/jpeg';
      name = `${(p.fileName || `capsule-${i}`).replace(/\.[^.]+$/, '')}.jpg`;
    } catch {
      // 변환 실패 시 원본 그대로 업로드
    }
    const presigned = await createPresignedUrl({
      mediaType: 'photo',
      contentType: mime,
      originalFileName: name,
      purpose: 'capsule',
    });
    await uploadToPresignedUrl({
      uploadUrl: presigned.uploadUrl,
      method: presigned.method,
      headers: presigned.headers,
      fileUri: uri,
      contentType: mime,
    });
    keys.push(presigned.objectKey);
  }
  return keys;
}

// 커플 타임캡슐 목록 조회. → { sealed:[], open:[] } (화면용으로 shape)
export function fetchCapsules(status = 'all') {
  if (endpoints.MOCK) return Promise.resolve(buildMockList());
  return getUnwrapped(`${endpoints.timeCapsule.list}?status=${encodeURIComponent(status)}`)
    .then((res) => ({
      sealed: (res?.sealed ?? []).map(shapeSummary),
      open: (res?.open ?? []).map(shapeSummary),
    }))
    .catch(() => ({ sealed: [], open: [] }));
}

// 타임캡슐 상세 조회. sealed면 letter/photos/thenVsNow/shareCard는 null/[].
export function fetchCapsuleDetail(id) {
  if (endpoints.MOCK) return Promise.resolve(null);
  return getUnwrapped(endpoints.timeCapsule.detail(id));
}

// 인스타 공유 카드(open 캡슐만).
export function fetchShareCard(id) {
  if (endpoints.MOCK) return Promise.resolve(null);
  return getUnwrapped(endpoints.timeCapsule.shareCard(id));
}

// 타임캡슐 생성(봉인).
// input: { name, cover('letter'..), openAt(Date|iso), letter, photoObjectKeys?, options:{blind,notify,confetti} }
export function createCapsule(input) {
  const body = {
    name: input.name,
    coverStyle: COVER_TO_ENUM[input.cover] || 'LETTER',
    openAt: toIso(input.openAt),
    letter: input.letter,
    photoObjectKeys: input.photoObjectKeys ?? [], // TODO: presigned 업로드 연동 후 실제 objectKey 전달
    options: {
      blindOthersAnswer: !!input.options?.blind,
      notifyBeforeOpen: !!input.options?.notify,
      confettiOnOpen: !!input.options?.confetti,
    },
  };
  if (endpoints.MOCK) {
    return Promise.resolve({ id: -Date.now(), status: 'SEALED', ...body });
  }
  return postUnwrapped(endpoints.timeCapsule.create, body);
}
