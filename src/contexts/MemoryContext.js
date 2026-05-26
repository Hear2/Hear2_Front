import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { fetchAlbum } from '../api/memoryAPI';

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

// 로그인 전, BE 응답이 도착하기 전까지 보여줄 디자인 시드. BE 새로고침 성공 시 교체된다.
const INITIAL_MEMORIES = [
  { emoji: '🌸', tag: '#데이트', place: '서울숲',   date: '3.15', tint: '#FFE4EE', h: 200, mood: 'love' },
  { emoji: '🍜', tag: '#음식',   place: '신촌',     date: '3.14', tint: '#FFF8E1', h: 140, mood: 'happy' },
  { emoji: '🎡', tag: '#데이트', place: '롯데월드', date: '3.1',  tint: '#FFE4EE', h: 220, mood: 'happy' },
  { emoji: '🌅', tag: '#여행',   place: '해운대',   date: '2.20', tint: '#FFF0E5', h: 150, mood: 'peace' },
  { emoji: '🎂', tag: '#기념일', place: '집',       date: '2.14', tint: '#FFF8E1', h: 180, mood: 'love' },
  { emoji: '☕', tag: '#데이트', place: '카페',     date: '2.10', tint: '#FFE4EE', h: 160, mood: 'happy' },
];

// BE MemoryResponse → 로컬 메모리 카드 모양 어댑터
function memoryResponseToCard(res, idx) {
  const tag = (res.aiTags?.[0] || res.userTags?.[0] || '#기록');
  const place = res.metadata?.locationName || '미지정';
  return {
    backendId: res.id,
    emoji: '📸',
    photoUri: res.photoUrl || null,
    tag,
    place,
    date: formatShortDate(res.memoryDate || res.createdAt),
    tint: TINT_CYCLE[idx % TINT_CYCLE.length],
    h: HEIGHT_CYCLE[idx % HEIGHT_CYCLE.length],
    mood: 'love',
    memo: res.memo || '',
  };
}

export function MemoryProvider({ children }) {
  const [memories, setMemories] = useState(INITIAL_MEMORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // BE에서 한 번이라도 정상 데이터가 도착했으면 시드 대체, 아니면 시드 유지
  const hydratedRef = useRef(false);

  const addMemory = useCallback((m) => {
    setMemories((prev) => {
      const h = m.h ?? HEIGHT_CYCLE[prev.length % HEIGHT_CYCLE.length];
      return [{ ...m, h }, ...prev];
    });
  }, []);

  const refresh = useCallback(async () => {
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
      // BE 호출 실패 시 기존 상태 유지 (시드 또는 마지막 성공값)
      throw e;
    } finally {
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
