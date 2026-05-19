import endpoints from '../constants/endpoints';
import { post } from './client';

// 백엔드 응답 스키마 (확정 전, 프론트가 기대하는 형태):
// {
//   participants: {
//     me:      { name, quote, moodLabel, moodPct },
//     partner: { name, quote, moodLabel, moodPct },
//   },
//   verdict: string,           // "AI 판결" 본문
//   suggestion: string,        // 화해 제안 문구
//   reconciliationAvailable?: boolean,
// }

const MOCK_JUDGE_RESPONSE = {
  participants: {
    me: {
      name: '예진',
      quote: '거기 웨이팅 길잖아',
      moodLabel: '중립',
      moodPct: 45,
    },
    partner: {
      name: '지호',
      quote: '왜 맨날 부정적이야?',
      moodLabel: '부정',
      moodPct: 72,
    },
  },
  verdict: '두 분 모두 피곤한 상태에서 의도와 다르게 표현됐어요.',
  suggestion:
    '서로의 하루를 먼저 물어봐 주세요. 작은 관심이 오해를 줄여줄 수 있어요.',
  reconciliationAvailable: true,
};

export async function requestJudge(
  { roomId, messages, signal } = {},
) {
  if (endpoints.MOCK) {
    await new Promise((r) => setTimeout(r, 900));
    return MOCK_JUDGE_RESPONSE;
  }
  return post(
    endpoints.ai.judge,
    {
      roomId: roomId ?? null,
      // 메시지 페이로드 스키마는 백엔드 확정 후 조정
      messages: messages ?? [],
    },
    { signal },
  );
}

export async function requestReconciliationMessage(
  { roomId, judgeId, signal } = {},
) {
  if (endpoints.MOCK) {
    await new Promise((r) => setTimeout(r, 700));
    return {
      message:
        '오늘 많이 피곤했지? 아까 말 세게 한 거 미안해. 내가 먼저 더 챙길게 💛',
    };
  }
  return post(
    endpoints.ai.reconciliation,
    { roomId: roomId ?? null, judgeId: judgeId ?? null },
    { signal },
  );
}

// 추후 감정 분석 / 리포트 / DNA / What-if도 같은 파일에서 export 예정
