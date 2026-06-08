import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import {
  fetchMonthEvents,
  createEvent as apiCreateEvent,
  updateEvent as apiUpdateEvent,
  deleteEvent as apiDeleteEvent,
} from '../api/calendarAPI';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const loadingMonths = useRef(new Set());

  // 월별 일정을 BE에서 불러와 병합. month는 1-based.
  const loadMonth = useCallback(async (year, month) => {
    const key = `${year}-${month}`;
    if (loadingMonths.current.has(key)) return;
    loadingMonths.current.add(key);
    try {
      const list = await fetchMonthEvents(year, month);
      setEvents((prev) => {
        const incomingIds = new Set(list.map((e) => e.id));
        const others = prev.filter((e) => !incomingIds.has(e.id));
        return [...list, ...others];
      });
    } finally {
      loadingMonths.current.delete(key);
    }
  }, []);

  // 일정 생성 → BE 저장 후 상태에 반영.
  const addEvent = useCallback(async (ev) => {
    const created = await apiCreateEvent(ev);
    setEvents((prev) => [created, ...prev]);
    return created;
  }, []);

  // 일정 수정 → BE 저장 후 상태 갱신. (patch는 전체 FE 일정 모양)
  const updateEvent = useCallback(async (id, patch) => {
    const updated = await apiUpdateEvent(id, patch);
    setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  }, []);

  // 일정 삭제.
  const removeEvent = useCallback(async (id) => {
    await apiDeleteEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <EventContext.Provider
      value={{ events, loadMonth, addEvent, updateEvent, removeEvent }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEvents must be used inside EventProvider');
  return ctx;
}
