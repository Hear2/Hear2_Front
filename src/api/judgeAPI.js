import endpoints from '../constants/endpoints';
import { get, post } from './client';

// 백엔드 JudgeResponse 모양:
// { cardType: 'AI_JUDGE', historyId, coupleId, triggerMessageId, triggerRiskLevel,
//   summaryA, summaryB, judgement, solution, reconciliationMessage,
//   conflictType, judgeTone, sameConflictCount, createdAt }
export function requestJudge({ triggerMessageId } = {}) {
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
