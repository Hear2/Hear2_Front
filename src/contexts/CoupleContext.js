import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CoupleContext = createContext(null);

const SEED_ANNIVERSARIES = [
  {
    id: 'seed-1',
    type: '사귄 날',
    name: '사귄 날',
    date: '2024-12-20',
    icon: '💕',
    color: '#FC2648',
    auto: false,
  },
  {
    id: 'seed-2',
    type: '생일',
    name: '예진 생일',
    date: '2026-07-14',
    icon: '🎂',
    color: '#FFB05B',
    auto: false,
  },
];

const N_BAEKIL_STEPS = [100, 200, 300, 500, 1000];
const N_JUNYEON_STEPS = [1, 2, 3, 5, 10];

const pad = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};
const addYears = (date, n) => {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + n);
  return d;
};

// Korean convention: start day counts as 1일 → Nth day = start + (N-1) days
const expandSaguinNal = (entry) => {
  const start = new Date(entry.date);
  const baekil = N_BAEKIL_STEPS.map((n) => ({
    id: `${entry.id}:b${n}`,
    type: 'auto',
    name: `${n}일`,
    date: toISO(addDays(start, n - 1)),
    icon: '💯',
    color: '#FFB05B',
    auto: true,
    parentId: entry.id,
  }));
  const junyeon = N_JUNYEON_STEPS.map((y) => ({
    id: `${entry.id}:y${y}`,
    type: 'auto',
    name: `${y}주년`,
    date: toISO(addYears(start, y)),
    icon: '🎉',
    color: '#A78BFA',
    auto: true,
    parentId: entry.id,
  }));
  return [...baekil, ...junyeon];
};

const nextId = () => `a-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Expand any 사귄 날 entries in the seed at init time so the auto-derived
// N백일/N주년 are visible without the user re-saving.
const expandSeed = (list) => {
  const out = [];
  for (const entry of list) {
    out.push(entry);
    if (entry.type === '사귄 날') out.push(...expandSaguinNal(entry));
  }
  return out;
};

export const CoupleProvider = ({ children }) => {
  const [anniversaries, setAnniversaries] = useState(() =>
    expandSeed(SEED_ANNIVERSARIES),
  );

  const addAnniversary = useCallback((entry) => {
    const id = entry.id || nextId();
    const base = { ...entry, id, auto: false };
    const isSaguin = entry.type === '사귄 날';
    const extras = isSaguin ? expandSaguinNal(base) : [];
    setAnniversaries((prev) => {
      // For 사귄 날, only one is allowed per couple — drop prior 사귄 날
      // and all its auto-derived children before inserting the new one.
      const parentsToDrop = new Set();
      const filtered = prev.filter((a) => {
        if (isSaguin && a.type === '사귄 날') {
          parentsToDrop.add(a.id);
          return false;
        }
        if (a.auto && a.parentId === id) return false;
        return true;
      });
      const cleaned = filtered.filter(
        (a) => !(a.auto && parentsToDrop.has(a.parentId)),
      );
      return [base, ...extras, ...cleaned];
    });
    return id;
  }, []);

  const removeAnniversary = useCallback((id) => {
    setAnniversaries((prev) =>
      prev.filter((a) => a.id !== id && a.parentId !== id),
    );
  }, []);

  const value = useMemo(
    () => ({ anniversaries, addAnniversary, removeAnniversary }),
    [anniversaries, addAnniversary, removeAnniversary],
  );

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>;
};

export const useCouple = () => {
  const ctx = useContext(CoupleContext);
  if (!ctx) throw new Error('useCouple must be used within CoupleProvider');
  return ctx;
};

export default CoupleContext;
