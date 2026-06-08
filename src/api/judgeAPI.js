import endpoints from '../constants/endpoints';
import { get, post } from './client';

// 백엔드 JudgeResponse 모양:
// { cardType: 'AI_JUDGE', historyId, coupleId, triggerMessageId, triggerRiskLevel,
//   summaryA, summaryB, judgement, solution, reconciliationMessage,
//   conflictType, judgeTone, sameConflictCount, createdAt }
// 데모/포스터용 목업 판결 (mockApi:true일 때 BE 없이 결과 화면을 띄움).
// AIJudgeModal이 렌더하는 필드(summaryA/summaryB/judgement/solution/
// reconciliationMessage/sameConflictCount)에 맞춰 둔다.
const MOCK_JUDGE = {
  cardType: 'AI_JUDGE',
  triggerRiskLevel: 'WARNING',
  summaryA:
    '지친 하루 끝에 위로받고 싶었는데 상대의 날선 말에 서운함을 느꼈어요. 관계를 끝내려는 게 아니라 이해받고 싶은 마음이에요.',
  summaryB:
    '일이 너무 바빠 여유가 없던 상태에서 내 힘듦을 몰라준다고 느껴 예민하게 반응했어요. 사실은 더 기대고 싶었던 거예요.',
  judgement:
    '두 분 모두 상대를 미워해서가 아니라, 각자 지친 상태에서 표현이 어긋났을 뿐이에요. "나만 이래"는 외로움의 표현이고 "속상해"는 관심의 표현이라, 향하는 방향은 같습니다.',
  solution:
    '비난("너는~") 대신 감정("나는 ~해서 속상했어")으로 말해보세요. 오늘 밤 통화는 누가 옳은지가 아니라 "오늘 많이 힘들었지?"로 시작해보는 걸 추천해요.',
  reconciliationMessage:
    '아까 내가 예민하게 말해서 미안해. 사실 너한테 더 기대고 싶었나 봐. 오늘 밤 목소리 들으면서 풀자 💛',
  conflictType: 'EMOTIONAL_MISMATCH',
  judgeTone: 'WARM',
  sameConflictCount: 2,
};

export function requestJudge({ triggerMessageId } = {}) {
  if (endpoints.MOCK) {
    // 분석 중 애니메이션을 잠깐 보여준 뒤 목업 판결 반환
    return new Promise((resolve) =>
      setTimeout(() => resolve({ ...MOCK_JUDGE, triggerMessageId }), 1200),
    );
  }
  return post(endpoints.judge.invoke, { triggerMessageId });
}

// 판결 이력. 최신순 List<JudgeHistoryResponse>.
export function fetchJudgeHistories() {
  return get(endpoints.judge.histories);
}

// 반복 갈등 패턴 집계 (Stage 3.5).
export function fetchConflictPatterns() {
  return get(endpoints.judge.patterns);
}

// 판결문 피드백. satisfied=true(네)/false(아니요), feedbackText는 선택.
// 한 번만 제출, 재제출은 update 개념.
// 반환(예시): { feedbackSubmitted: boolean, satisfied: boolean }
export function sendJudgeFeedback({ judgeHistoryId, satisfied, feedbackText } = {}) {
  if (endpoints.MOCK) {
    return new Promise((resolve) =>
      setTimeout(
        () => resolve({ feedbackSubmitted: true, satisfied, feedbackText }),
        300,
      ),
    );
  }
  return post(endpoints.judge.feedback(judgeHistoryId), {
    satisfied,
    feedbackText,
  });
}
