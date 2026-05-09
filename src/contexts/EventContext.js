import React, { createContext, useCallback, useContext, useState } from 'react';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);

  const addEvent = useCallback((ev) => {
    setEvents((prev) => [
      {
        id:
          ev.id ??
          `e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...ev,
      },
      ...prev,
    ]);
  }, []);

  const updateEvent = useCallback((id, patch) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  }, []);

  const removeEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <EventContext.Provider value={{ events, addEvent, updateEvent, removeEvent }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEvents must be used inside EventProvider');
  return ctx;
}
