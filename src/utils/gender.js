import colors from '../constants/colors';

// 성별 문자열 정규화. BE enum(MALE/FEMALE/UNDISCLOSED)과 한국어 라벨('남성'/'여성') 모두 흡수.
// 알 수 없으면(비공개 포함) null.
export function normalizeGender(g) {
  if (!g) return null;
  const s = String(g).trim().toLowerCase();
  if (['male', 'm', '남', '남성', '남자'].includes(s)) return 'male';
  if (['female', 'f', '여', '여성', '여자'].includes(s)) return 'female';
  return null;
}

export function oppositeGender(g) {
  const n = normalizeGender(g);
  if (n === 'male') return 'female';
  if (n === 'female') return 'male';
  return null;
}

// 커플 두 사람의 성별 결정. BE partner 응답엔 gender가 없으므로,
// 한쪽만 알면 반대쪽은 이성 커플로 추정한다(데모 정책). 둘 다 모르면 null 유지.
export function resolveCoupleGenders(myGender, partnerGender) {
  let mine = normalizeGender(myGender);
  let partner = normalizeGender(partnerGender);
  if (!mine && partner) mine = oppositeGender(partner);
  if (!partner && mine) partner = oppositeGender(mine);
  return { mine, partner };
}

// 성별 → 대표색. 남=블루, 여=핑크. 모르면 fallback(미지정 시 male색).
export function genderColor(g, { male = colors.blue, female = colors.pink, fallback } = {}) {
  const n = normalizeGender(g);
  if (n === 'male') return male;
  if (n === 'female') return female;
  return fallback ?? male;
}
