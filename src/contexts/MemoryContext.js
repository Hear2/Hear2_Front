import React, { createContext, useCallback, useContext, useState } from 'react';

const MemoryContext = createContext(null);

const INITIAL_MEMORIES = [
  { emoji: '🌸', tag: '#데이트', place: '서울숲',   date: '3.15', tint: '#FFE4EE', h: 200, mood: 'love' },
  { emoji: '🍜', tag: '#음식',   place: '신촌',     date: '3.14', tint: '#FFF8E1', h: 140, mood: 'happy' },
  { emoji: '🎡', tag: '#데이트', place: '롯데월드', date: '3.1',  tint: '#FFE4EE', h: 220, mood: 'happy' },
  { emoji: '🌅', tag: '#여행',   place: '해운대',   date: '2.20', tint: '#FFF0E5', h: 150, mood: 'peace' },
  { emoji: '🎂', tag: '#기념일', place: '집',       date: '2.14', tint: '#FFF8E1', h: 180, mood: 'love' },
  { emoji: '☕', tag: '#데이트', place: '카페',     date: '2.10', tint: '#FFE4EE', h: 160, mood: 'happy' },
];

const HEIGHT_CYCLE = [200, 140, 220, 150, 180, 160];

export function MemoryProvider({ children }) {
  const [memories, setMemories] = useState(INITIAL_MEMORIES);

  const addMemory = useCallback((m) => {
    setMemories((prev) => {
      const h = m.h ?? HEIGHT_CYCLE[prev.length % HEIGHT_CYCLE.length];
      return [{ ...m, h }, ...prev];
    });
  }, []);

  return (
    <MemoryContext.Provider value={{ memories, addMemory }}>
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemories() {
  const ctx = useContext(MemoryContext);
  if (!ctx) throw new Error('useMemories must be used inside MemoryProvider');
  return ctx;
}
