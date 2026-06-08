import endpoints from '../constants/endpoints';
import { get, patch } from './client';
import { stageInfo, imageForStage } from '../constants/characterStages';

// 커플 캐릭터(캐릭터 키우기) API.
//
// BE 계약 (생 DTO, ApiResponse 래핑 없음):
//   GET   /api/v1/character                   → { characterName, exp, stage }
//   GET   /api/v1/character/exp/history/today  → { totalExp, items:[{sourceType,expAmount,createdAt}] }
//   PATCH /api/v1/character/name { name }       → { characterName, exp, stage }
//
// stage/진행도/이미지는 총 EXP로 stageInfo(exp)에서 파생 계산한다(BE stage 임계값과 동일).
// 오늘 획득 EXP는 today 히스토리를 sourceType별로 집계해 breakdown/history로 변환한다.

// 전체 일일 EXP 캡 (BE CharacterService.DAILY_EXP_LIMIT 와 동일).
const DAILY_CAP = 150;

// 소스별 표기/일일 캡 메타. cap은 BE 각 서비스의 일일 소스 캡과 일치시킨다.
//   ATTENDANCE 10(+10 동반)=20 / DAILY_QNA 10(+30 동반)=40 / MEMORY 60 / CHAT 50
const SOURCE_META = {
  ATTENDANCE: { label: '출석', emoji: '📅', cap: 20, text: '커플 출석을 완료했어요' },
  DAILY_QNA: { label: '1일1답', emoji: '💌', cap: 40, text: '오늘의 1일1답을 완료했어요' },
  MEMORY: { label: '추억', emoji: '📸', cap: 60, text: '함께 추억을 기록했어요' },
  CHAT: { label: '채팅', emoji: '💬', cap: 50, text: '오늘 대화를 나눴어요' },
};
const SOURCE_ORDER = ['ATTENDANCE', 'DAILY_QNA', 'MEMORY', 'CHAT'];

// ── 목업 데이터 (MOCK 모드 / 실패 폴백) ─────────────────────
const MOCK_NAME = '해피';
const MOCK_EXP = 1240; // Stage 3 (말랑이) 구간

const MOCK_BREAKDOWN = [
  { source: 'ATTENDANCE', label: '출석', emoji: '📅', today: 20, cap: 20 },
  { source: 'DAILY_QNA', label: '1일1답', emoji: '💌', today: 40, cap: 40 },
  { source: 'MEMORY', label: '추억', emoji: '📸', today: 20, cap: 60 },
  { source: 'CHAT', label: '채팅', emoji: '💬', today: 12, cap: 50 },
];

const MOCK_HISTORY = [
  { icon: '💌', text: '둘 다 오늘의 1일1답을 완료했어요', xp: '+50 XP' },
  { icon: '📅', text: '커플 출석을 함께 완료했어요', xp: '+20 XP' },
  { icon: '📸', text: '함께 봄나들이 사진을 추가했어요', xp: '+20 XP' },
  { icon: '💬', text: '오늘 도란도란 대화를 나눴어요', xp: '+12 XP' },
];

function buildMock() {
  const info = stageInfo(MOCK_EXP);
  const todayExp = MOCK_BREAKDOWN.reduce((sum, b) => sum + b.today, 0);
  return {
    name: MOCK_NAME,
    exp: MOCK_EXP,
    ...info, // stage, stageTitle, stageMinExp, nextStageExp, remainingExp, progressPercent, image
    todayExp,
    dailyCap: DAILY_CAP,
    breakdown: MOCK_BREAKDOWN,
    history: MOCK_HISTORY,
  };
}

// today 히스토리 응답 → 화면용 breakdown/history/todayExp 로 변환.
function shapeTodayHistory(today) {
  const items = Array.isArray(today?.items) ? today.items : [];

  // sourceType별 오늘 합계
  const sums = {};
  for (const it of items) {
    const src = it?.sourceType;
    if (!src) continue;
    sums[src] = (sums[src] ?? 0) + (Number(it.expAmount) || 0);
  }

  const breakdown = SOURCE_ORDER.map((src) => {
    const meta = SOURCE_META[src];
    return {
      source: src,
      label: meta.label,
      emoji: meta.emoji,
      cap: meta.cap,
      today: sums[src] ?? 0,
    };
  });

  // 성장 일지: 최신순. createdAt 내림차순 정렬 후 표기 변환.
  const history = [...items]
    .sort((a, b) => String(b?.createdAt ?? '').localeCompare(String(a?.createdAt ?? '')))
    .map((it) => {
      const meta = SOURCE_META[it?.sourceType] ?? { emoji: '✨', text: 'EXP를 획득했어요' };
      return {
        icon: meta.emoji,
        text: meta.text,
        xp: `+${Number(it.expAmount) || 0} XP`,
      };
    });

  const todayExp =
    typeof today?.totalExp === 'number'
      ? today.totalExp
      : breakdown.reduce((sum, b) => sum + b.today, 0);

  return { breakdown, history, todayExp };
}

// 커플 캐릭터 조회 (기본 정보 + 오늘 EXP 히스토리 병합).
export function fetchCharacter() {
  if (endpoints.MOCK) return Promise.resolve(buildMock());

  const characterReq = get(endpoints.character.get);
  // 오늘 히스토리는 부가 정보 — 실패해도 캐릭터 본체는 보여준다.
  const todayReq = get(endpoints.character.expHistoryToday).catch(() => null);

  return Promise.all([characterReq, todayReq])
    .then(([res, today]) => {
      if (!res || res.exp == null) return buildMock();
      const exp = Number(res.exp) || 0;
      const info = stageInfo(exp);
      const { breakdown, history, todayExp } = shapeTodayHistory(today);
      return {
        name: res.characterName ?? MOCK_NAME,
        exp,
        ...info,
        image: imageForStage(res.stage ?? info.stage),
        todayExp,
        dailyCap: DAILY_CAP,
        breakdown,
        history,
      };
    })
    .catch(() => buildMock());
}

// 캐릭터 이름 변경. 성공 시 갱신된 기본 정보를 stageInfo와 합쳐 반환.
export function updateCharacterName(name) {
  const trimmed = String(name ?? '').trim();
  if (endpoints.MOCK) {
    const info = stageInfo(MOCK_EXP);
    return Promise.resolve({ name: trimmed || MOCK_NAME, exp: MOCK_EXP, ...info });
  }
  return patch(endpoints.character.name, { name: trimmed }).then((res) => {
    const exp = Number(res?.exp) || 0;
    const info = stageInfo(exp);
    return {
      name: res?.characterName ?? trimmed,
      exp,
      ...info,
      image: imageForStage(res?.stage ?? info.stage),
    };
  });
}
