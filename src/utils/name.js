// 한글 이름에서 성을 떼고 이름만 반환한다.
// - 한 글자 성(김/이/박/황 등): 첫 글자 제거
// - 두 글자 복성(남궁/황보 등): 앞 두 글자 제거
// - 길이가 1 이하이거나 이름이 없으면 원본 그대로
const TWO_CHAR_SURNAMES = [
  '남궁', '황보', '제갈', '사공', '선우', '서문', '독고', '동방', '어금', '망절',
];

export function givenName(name) {
  if (!name) return name;
  const n = String(name).trim();
  if (n.length <= 1) return n;
  if (n.length >= 3 && TWO_CHAR_SURNAMES.includes(n.slice(0, 2))) {
    return n.slice(2);
  }
  return n.slice(1);
}

// 텍스트 안의 토큰 'A'/'B'(독립 단어)를 각각 주어진 이름으로 치환.
// AI 판결문이 "A는 ~, B는 ~" 형태로 와도 실제 이름으로 보이게 한다.
// \bA\b 형태라 'AI', 'Apple' 같은 단어의 A/B는 건드리지 않는다.
export function replaceABWithNames(text, nameA, nameB) {
  if (!text) return text;
  let out = String(text);
  if (nameA) out = out.replace(/\bA\b/g, nameA);
  if (nameB) out = out.replace(/\bB\b/g, nameB);
  return out;
}
