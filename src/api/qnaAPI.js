import endpoints from '../constants/endpoints';
import { get, post } from './client';

// 데일리 Q&A (1일1답) API.
// BE는 ApiResponse 래핑 없이 생 DTO를 반환하므로 get/post(raw)를 사용한다.
//
// 응답 모양:
//   TodayQuestionResponse:
//     { day, questionId, question, myAnswer, myAnsweredAt,
//       partnerAnswered, partnerAnswer, bothAnswered, streak, rewardPoints }
//   DailyAnswerResponse:
//     { ok, bothAnswered, streak, earnedPoints }
//   DailyQuestionHistoryResponse:
//     { items: [{ day, questionId, question, status }] }
//       status: TODAY | BOTH_ANSWERED | MY_ANSWER_ONLY | PARTNER_ANSWER_ONLY | UNANSWERED
//   DailyQuestionDetailResponse:
//     { day, questionId, question, questionDate, myAnswer, partnerAnswer, bothAnswered }

// 오늘의 질문 + 내 답변/파트너 답변/스트릭 등 조회
export function fetchTodayQuestion() {
  return get(endpoints.qna.today);
}

// 오늘의 질문에 답변 등록 (answer는 # 없는 일반 문자열)
export function answerTodayQuestion(answer) {
  return post(endpoints.qna.answerToday, { answer });
}

// 지난 질문 히스토리 목록
export function fetchQuestionHistory() {
  return get(endpoints.qna.history).then((res) => res?.items ?? []);
}

// 특정 질문 상세 (내 답변 + 파트너 답변)
export function fetchQuestionDetail(questionId) {
  return get(endpoints.qna.detail(questionId));
}
