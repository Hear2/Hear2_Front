import endpoints from '../constants/endpoints';
import { getUnwrapped, postUnwrapped, requestUnwrapped } from './client';

// 공유 캘린더(커플 캘린더) API.
//
// BE 계약 (모두 ApiResponse<T> 래핑):
//   POST   /api/v1/calendar/events             생성 → CalendarEventResponse
//   GET    /api/v1/calendar/month?year=&month=  월별 → { year, month, days:[{date, events:[summary], memoryMarker}], legend }
//   GET    /api/v1/calendar/dates/{date}        날짜 상세 → { date, events:[event], memories:[...] }
//   PATCH  /api/v1/calendar/events/{id}         수정
//   DELETE /api/v1/calendar/events/{id}         삭제
//
// FE 일정 모양: { id, title, owner('me'|'partner'|'couple'), startDate(Date), endDate(Date),
//                allDay, location:{name,address,lat,lng}, memo, tags, reminder, repeat, color }

// owner(FE) ↔ target/viewType(BE)
const TARGET_BY_OWNER = { me: 'MINE', partner: 'PARTNER', couple: 'SHARED' };
const OWNER_BY_VIEWTYPE = { OWNER: 'me', PARTNER: 'partner', SHARED: 'couple' };

// reminder(FE) ↔ remindBeforeMinutes(BE)
const MINUTES_BY_REMINDER = {
  none: null, start: 0, '5m': 5, '10m': 10, '15m': 15, '30m': 30, '1h': 60, '1d': 1440,
};
function reminderToMinutes(reminder) {
  return reminder in MINUTES_BY_REMINDER ? MINUTES_BY_REMINDER[reminder] : null;
}
function minutesToReminder(min) {
  if (min == null) return 'none';
  const found = Object.entries(MINUTES_BY_REMINDER).find(([, v]) => v === min);
  return found ? found[0] : 'none';
}

// repeat(FE) ↔ recurrenceRule(BE, RRULE)
const RRULE_BY_REPEAT = {
  none: null, daily: 'FREQ=DAILY', weekly: 'FREQ=WEEKLY', monthly: 'FREQ=MONTHLY', yearly: 'FREQ=YEARLY',
};
function repeatToRrule(repeat) {
  return RRULE_BY_REPEAT[repeat] ?? null;
}
function rruleToRepeat(rrule) {
  if (!rrule) return 'none';
  const m = /FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)/.exec(rrule);
  return m ? { DAILY: 'daily', WEEKLY: 'weekly', MONTHLY: 'monthly', YEARLY: 'yearly' }[m[1]] : 'none';
}

const toIso = (v) => (v instanceof Date ? v.toISOString() : v ? new Date(v).toISOString() : null);
const toDate = (iso) => (iso ? new Date(iso) : null);

// BE 일정(상세/요약) → FE 일정.
function fromBackendEvent(be) {
  if (!be) return null;
  return {
    id: be.id,
    title: be.title,
    owner: OWNER_BY_VIEWTYPE[be.viewType] || 'couple',
    startDate: toDate(be.startsAt),
    endDate: toDate(be.endsAt),
    allDay: !!be.allDay,
    location: be.locationName
      ? { name: be.locationName, address: be.addressName, lat: be.latitude, lng: be.longitude }
      : null,
    memo: be.memo || '',
    tags: be.tags || [],
    reminder: minutesToReminder(be.remindBeforeMinutes),
    repeat: rruleToRepeat(be.recurrenceRule),
    color: be.color?.hex,
    _backend: true,
  };
}

// FE 일정 → BE 생성/수정 요청 본문. (tags는 BE 생성 요청 미지원 → 전송 안 함)
function toBackendBody(fe) {
  return {
    title: fe.title,
    target: TARGET_BY_OWNER[fe.owner] || 'SHARED',
    startsAt: toIso(fe.startDate),
    endsAt: toIso(fe.endDate),
    allDay: !!fe.allDay,
    locationName: fe.location?.name || null,
    addressName: fe.location?.address || null,
    latitude: fe.location?.lat ?? null,
    longitude: fe.location?.lng ?? null,
    memo: fe.memo || null,
    recurrenceRule: repeatToRrule(fe.repeat),
    remindBeforeMinutes: reminderToMinutes(fe.reminder),
    memoryIds: [],
  };
}

// 월별 일정 조회 → FE 일정 배열(중복 제거). month는 1-based.
export function fetchMonthEvents(year, month) {
  if (endpoints.MOCK) return Promise.resolve([]);
  return getUnwrapped(endpoints.calendar.month(year, month))
    .then((res) => {
      const byId = new Map();
      (res?.days ?? []).forEach((day) => {
        (day.events ?? []).forEach((ev) => {
          if (!byId.has(ev.id)) byId.set(ev.id, fromBackendEvent(ev));
        });
      });
      return Array.from(byId.values());
    })
    .catch(() => []);
}

// 일정 생성 → 생성된 FE 일정.
export function createEvent(fe) {
  if (endpoints.MOCK) {
    return Promise.resolve({ ...fe, id: `mock-${Date.now()}`, _backend: false });
  }
  return postUnwrapped(endpoints.calendar.events, toBackendBody(fe)).then(fromBackendEvent);
}

// 일정 수정 → 수정된 FE 일정.
export function updateEvent(id, fe) {
  if (endpoints.MOCK) return Promise.resolve({ ...fe, id, _backend: false });
  return requestUnwrapped(endpoints.calendar.event(id), {
    method: 'PATCH',
    body: toBackendBody(fe),
  }).then(fromBackendEvent);
}

// 일정 삭제.
export function deleteEvent(id) {
  if (endpoints.MOCK) return Promise.resolve(true);
  return requestUnwrapped(endpoints.calendar.event(id), { method: 'DELETE' }).then(() => true);
}
