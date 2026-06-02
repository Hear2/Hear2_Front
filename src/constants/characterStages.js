// 커플 캐릭터 성장 단계 정의.
// 정책(로직 문서) 기준 총 EXP로 stage를 계산한다. DB에 stage를 고정 저장하지 않는다.
//   Stage 1: 0 ~ 299      (솜털 알)
//   Stage 2: 300 ~ 899    (새싹 솜털)
//   Stage 3: 900 ~ 1999   (꽃 솜털)
//   Stage 4: 2000 ~ 3499  (날개 요정)
//   Stage 5: 3500 이상    (완전체 요정)
// 진화 순서대로의 이미지(assets/character/character_1~5.png)와 1:1로 대응한다.

const STAGE_IMAGES = {
  1: require('../../assets/character/character_1.png'),
  2: require('../../assets/character/character_2.png'),
  3: require('../../assets/character/character_3.png'),
  4: require('../../assets/character/character_4.png'),
  5: require('../../assets/character/character_5.png'),
};

// max는 "다음 단계 시작 EXP"(상한 미포함). 마지막 단계는 Infinity.
// title = 진화 단계별 캐릭터 이름.
export const STAGES = [
  { stage: 1, min: 0, max: 300, title: '꼬물이' },
  { stage: 2, min: 300, max: 900, title: '방긋이' },
  { stage: 3, min: 900, max: 2000, title: '말랑이' },
  { stage: 4, min: 2000, max: 3500, title: '빛나리' },
  { stage: 5, min: 3500, max: Infinity, title: '영롱이' },
];

export function imageForStage(stage) {
  return STAGE_IMAGES[stage] || STAGE_IMAGES[1];
}

// 총 EXP로 현재 단계 + 진행도를 계산한다.
export function stageInfo(exp) {
  const e = Math.max(0, Number(exp) || 0);
  const idx = STAGES.findIndex((st) => e < st.max);
  const s = idx === -1 ? STAGES[STAGES.length - 1] : STAGES[idx];
  const isMax = s.stage === STAGES.length;
  const span = isMax ? 0 : s.max - s.min;
  const into = e - s.min;
  const progressPercent = isMax
    ? 100
    : Math.min(100, Math.max(0, Math.round((into / span) * 100)));
  return {
    stage: s.stage,
    stageTitle: s.title,
    nextStageTitle: isMax ? null : STAGES[s.stage].title,
    stageMinExp: s.min,
    nextStageExp: isMax ? null : s.max,
    remainingExp: isMax ? 0 : Math.max(0, s.max - e),
    progressPercent,
    image: STAGE_IMAGES[s.stage],
  };
}

export default STAGE_IMAGES;
