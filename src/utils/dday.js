// 커플 시작일(ISO 'YYYY-MM-DD')로 함께한 일수(D+N)를 계산.
// 시작일이 없거나 잘못된 값이면 null을 반환 → 화면에서 D-day 표시를 숨긴다.
export function daysTogether(startISO) {
  if (!startISO) return null;
  const start = new Date(String(startISO).slice(0, 10));
  if (Number.isNaN(start.getTime())) return null;
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today - start) / 86400000);
}

// 'YYYY-MM-DD' → 'YYYY.MM.DD'. 없으면 빈 문자열.
export function formatStartDate(startISO) {
  if (!startISO) return '';
  return String(startISO).slice(0, 10).replace(/-/g, '.');
}
