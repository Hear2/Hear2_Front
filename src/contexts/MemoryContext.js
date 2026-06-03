import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { fetchAlbum, deleteMemory } from '../api/memoryAPI';

const MemoryContext = createContext(null);

const DOW_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const formatShortDate = (iso) => {
  if (!iso) return '';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}.${d.getDate()}`;
};

const TINT_CYCLE = ['#FFE4EE', '#FFF8E1', '#FFF0E5', '#FFE4EE', '#FFF8E1'];
const HEIGHT_CYCLE = [200, 140, 220, 150, 180, 160];

// 목업/디자인 시드 제거 — 앨범은 BE 실데이터로만 채운다. 로딩 전엔 빈 상태로 시작.
const INITIAL_MEMORIES = [];

// 백엔드 제한: 사진 1장당 AI 태그는 2~5개, 최대 5개까지만 저장된다.
// FE도 사진 단위로 5개까지만 신뢰(방어적 슬라이스)해서 합집합을 만든다.
const MAX_TAGS_PER_PHOTO = 5;

// 태그 문자열 정규화: 앞의 '#'과 공백 제거. 빈 값은 버린다.
const normTag = (t) => (typeof t === 'string' ? t.replace(/^#/, '').trim() : '');

// 태그 분류의 기준은 반드시 photos[].aiTags. 여러 장이면 전 사진의 태그를 합집합으로 모은다.
// photos가 없거나 비어 있을 때만 게시글 레벨 aiTags/userTags를 호환용 fallback으로 쓴다.
function collectPhotoTags(res) {
  const photos = Array.isArray(res.photos) ? res.photos : [];
  const fromPhotos = photos.flatMap((p) =>
    Array.isArray(p?.aiTags) ? p.aiTags.slice(0, MAX_TAGS_PER_PHOTO) : [],
  );
  const source =
    fromPhotos.length > 0
      ? fromPhotos
      : [...(res.aiTags || []), ...(res.userTags || [])];

  const seen = new Set();
  const out = [];
  source.forEach((raw) => {
    const t = normTag(raw);
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  });
  return out;
}

// BE MemoryResponse → 로컬 메모리 카드 모양 어댑터.
// MemoryResponse 1개 = 게시글(카드) 1개. 여러 장은 photos[]로 표현된다.
function memoryResponseToCard(res, idx) {
  // 분류용 정규화 태그 목록(# 없는 슬러그). photos[].aiTags 기준.
  const tags = collectPhotoTags(res);
  // 카드 칩에 보여줄 대표 태그(표시는 # 포함). 분류 기준이 아니라 첫 태그 미리보기용.
  const tag = tags[0] ? `#${tags[0]}` : '#기록';
  // 사진 장수: photos[] 우선, 없으면 대표사진 유무로 0/1 판단.
  const photoCount = Array.isArray(res.photos)
    ? res.photos.length
    : res.photoUrl
      ? 1
      : 0;
  // 위치 표시 우선순위: 사용자 수정/추천 locationName > placeName > addressName > 없음.
  const place =
    res.metadata?.locationName ||
    res.metadata?.placeName ||
    res.metadata?.addressName ||
    '미지정';
  // 사용자가 지정한 제목 = 메모 첫 줄. (PhotoUpload가 note에 "제목\n메모"로 저장)
  const memoText = res.memo || '';
  const title = memoText.split('\n')[0].trim();
  return {
    // 선택/삭제용 안정적 식별자. BE 항목은 backendId 기반으로 고유.
    id: `be-${res.id}`,
    backendId: res.id,
    emoji: '📸',
    // 대표사진: photoUrl 우선, 없으면 photos[0].url.
    photoUri: res.photoUrl || res.photos?.[0]?.url || null,
    photoCount,
    title,
    tag,
    tags,
    place,
    date: formatShortDate(res.memoryDate || res.createdAt),
    tint: TINT_CYCLE[idx % TINT_CYCLE.length],
    h: HEIGHT_CYCLE[idx % HEIGHT_CYCLE.length],
    mood: 'love',
    memo: memoText,
  };
}

export function MemoryProvider({ children }) {
  // 시드에도 선택/삭제용 id와 분류용 tags 배열을 부여(필터가 tags 기준으로 동작).
  const [memories, setMemories] = useState(() =>
    INITIAL_MEMORIES.map((m, i) => ({
      ...m,
      id: m.id ?? `seed-${i}`,
      tags: [normTag(m.tag)],
    })),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // BE에서 한 번이라도 정상 데이터가 도착했으면 시드 대체, 아니면 시드 유지
  const hydratedRef = useRef(false);

  const addMemory = useCallback((m) => {
    setMemories((prev) => {
      const h = m.h ?? HEIGHT_CYCLE[prev.length % HEIGHT_CYCLE.length];
      const id = m.id ?? `local-${Date.now()}-${prev.length}`;
      return [{ ...m, id, h }, ...prev];
    });
  }, []);

  // 다중 선택 삭제. 로컬 상태에서 즉시 제거하고(낙관적), backendId가 있는 항목은
  // BE에도 삭제 요청(best-effort). items는 삭제할 메모리 카드 객체 배열.
  const removeMemories = useCallback(async (items) => {
    if (!items || items.length === 0) return;
    const ids = new Set(items.map((m) => m.id));
    setMemories((prev) => prev.filter((m) => !ids.has(m.id)));

    const backendIds = [];
    items.forEach((m) => {
      if (m.backendId != null) backendIds.push(m.backendId);
      // handleSave가 여러 장을 backendIds 배열로 묶어둔 로컬 카드도 처리.
      if (Array.isArray(m.backendIds)) backendIds.push(...m.backendIds);
    });
    await Promise.allSettled(
      backendIds.map((bid) => deleteMemory(bid).catch(() => {})),
    );
  }, []);

  // 진행 중 새로고침이 있으면 재진입 금지 — 화면 포커스 refresh와 당겨서 새로고침이
  // 겹쳐 호출되며 스피너가 안 끝나거나 중복 fetch가 쌓이는 걸 막는다.
  const inFlightRef = useRef(false);
  const refresh = useCallback(async () => {
    if (inFlightRef.current) return undefined;
    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAlbum();
      const cards = (list || []).map(memoryResponseToCard);
      setMemories(cards);
      hydratedRef.current = true;
      return cards;
    } catch (e) {
      setError(e);
      // BE 호출 실패 시 기존 상태 유지 (마지막 성공값). 시드는 더 이상 없음.
      throw e;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  return (
    <MemoryContext.Provider
      value={{
        memories,
        loading,
        error,
        addMemory,
        removeMemories,
        refresh,
        hydrated: hydratedRef.current,
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemories() {
  const ctx = useContext(MemoryContext);
  if (!ctx) throw new Error('useMemories must be used inside MemoryProvider');
  return ctx;
}
