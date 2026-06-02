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

// ── 목업 데이터 (endpoints.MOCK === true 일 때 사용) ──────────────
// 질문은 운영 Neon DB의 daily_question_template에 실제 등록된 세트를 그대로 사용.
// 실제 DB는 day_index ↔ 질문이 1:1로 매핑되므로(순환 없음), 목업도 day-1 인덱스로 그대로 매핑한다.
const REAL_QUESTIONS = [
  '처음 나를 설레게 했던 순간은 언제였어?',
  '요즘 나의 어떤 모습이 가장 좋아?',
  '우리 둘이 가장 잘 맞는다고 느끼는 순간은?',
  '함께 꼭 가보고 싶은 여행지는 어디야?',
  '내가 했던 말 중 기억에 남는 말이 있어?',
  '처음 만났을 때 내 첫인상은 어땠어?',
  '같이 있으면 가장 편안한 순간은 언제야?',
  '우리 둘이 닮아간다고 느끼는 부분은?',
  '나와 함께해서 가장 행복했던 순간은?',
  '나에게 가장 고마웠던 순간은 언제야?',
  '우리의 가장 웃긴 추억은 뭐야?',
  '같이 꼭 해보고 싶은 취미가 있어?',
  '내가 자주 하는 습관 중 귀여운 건 뭐야?',
  '요즘 나에게 가장 듣고 싶은 말은 뭐야?',
  '우리 둘이 가장 잘 통한다고 느낄 때는 언제야?',
  '내가 가장 든든해 보였던 순간은?',
  '같이 먹고 싶은 음식이 있어?',
  '우리 둘이 함께 있으면 가장 좋아지는 점은?',
  '나와 함께 보내고 싶은 하루를 상상해본다면?',
  '서로에게 가장 필요한 존재라고 느낀 순간은?',
  '나와 가장 잘 맞는 데이트 스타일은 뭐라고 생각해?',
  '함께 꼭 남기고 싶은 추억이 있어?',
  '내가 가장 귀여워 보이는 순간은 언제야?',
];

// 질문별 샘플 답변 쌍 (포스터/데모용) — REAL_QUESTIONS와 같은 순서로 1:1 대응
const ANSWER_SAMPLES = [
  { my: '카페에서 햇빛에 웃던 네 모습에 처음 설렜어 ☀️', partner: '비 오는 날 우산 씌워줬을 때 심쿵했잖아 ☔' },
  { my: '바쁜데도 나 먼저 챙기는 다정한 모습이 좋아 🤍', partner: '뭐든 열심히 하는 요즘 네가 제일 멋져 ✨' },
  { my: '말 안 해도 같은 생각 하고 있을 때 🫶', partner: '메뉴 고를 때 둘 다 같은 거 시킬 때 ㅋㅋ' },
  { my: '겨울에 홋카이도 가서 같이 눈 보고 싶어 ❄️', partner: '제주도에서 한 달 살기 꼭 해보자 🌊' },
  { my: '"네 옆이 제일 편해"라던 말이 계속 생각나 💭', partner: '"천천히 가도 돼"라고 해준 말 잊지 못해' },
  { my: '조용한데 웃을 때 눈 사라지는 게 귀여웠어 😄', partner: '생각보다 장난기 많아서 놀랐잖아 ㅋㅋ' },
  { my: '아무 말 없이 같이 누워서 쉴 때 🛋️', partner: '손잡고 산책할 때가 제일 편안해 🚶' },
  { my: '요즘 말투가 점점 비슷해지는 거 같아 ㅋㅋ', partner: '먹는 거 취향까지 똑같아진 게 신기해 🍜' },
  { my: '같이 처음 여행 갔던 그 밤이 제일 행복했어 🌙', partner: '평범한 저녁 산책도 너랑이면 다 행복해 💕' },
  { my: '내가 아플 때 밤새 곁에 있어줘서 고마웠어 🤒', partner: '힘든 날 묵묵히 들어줘서 진짜 고마워 🫂' },
  { my: '길 잃고 둘이 세 시간 헤맸던 거 ㅋㅋㅋ', partner: '같이 만든 케이크 폭삭 주저앉았을 때 🤣' },
  { my: '같이 클라이밍 배워보고 싶어 🧗', partner: '둘이 베이킹 클래스 다녀보자 🧁' },
  { my: '졸리면 콧소리 내는 거 너무 귀여워 😴', partner: '집중하면 입 살짝 벌리는 거 ㅋㅋ' },
  { my: '"오늘도 잘했어"라는 말이 제일 듣고 싶어 🙏', partner: '"내가 있잖아" 한마디면 다 풀려 💗' },
  { my: '눈빛만 봐도 뭘 원하는지 알 때 👀', partner: '같은 타이밍에 같은 농담 할 때 ㅋㅋ' },
  { my: '어려운 일 생겼을 때 먼저 나서줄 때 💪', partner: '내 편이라고 딱 말해줬을 때 든든했어' },
  { my: '비 오는 날 같이 뜨끈한 칼국수 먹고 싶어 🍲', partner: '주말에 둘이 마라탕 도전하자 🌶️' },
  { my: '혼자보다 같이 있으면 더 용감해지는 거 🦸', partner: '작은 일도 같이 웃을 수 있게 되는 거 😊' },
  { my: '늦잠 자고 브런치 먹고 영화 보는 하루 🎬', partner: '아무 계획 없이 종일 뒹굴뒹굴 하고 싶어 🛌' },
  { my: '힘든 하루 끝에 네 목소리 들었을 때 📞', partner: '아무 이유 없이 보고 싶어졌을 때 💞' },
  { my: '계획 빡빡한 것보다 즉흥 데이트가 우리답지 🚗', partner: '집에서 같이 요리하는 게 제일 우리 스타일 🍳' },
  { my: '둘이 같은 옷 입고 찍은 커플 사진 꼭 남기자 📸', partner: '여행지에서 영상 일기 남겨보고 싶어 🎥' },
  { my: '갓 자고 일어나서 머리 부스스할 때 ㅋㅋ', partner: '맛있는 거 먹고 볼 빵빵해질 때 🐹' },
];

const TODAY_DAY = 23;
const qIndex = (day) => (day - 1) % REAL_QUESTIONS.length;
const questionForDay = (day) => REAL_QUESTIONS[qIndex(day)];
const qid = (day) => `q-${String(day).padStart(3, '0')}`;
// day → 날짜(오늘 기준 역산) 'YYYY-MM-DD'
const dateForDay = (day) => {
  const d = new Date();
  d.setDate(d.getDate() - (TODAY_DAY - day));
  return d.toISOString().slice(0, 10);
};
// 과거 일부 날짜만 한쪽 미답으로 변화를 줌 (나머지는 둘 다 답변)
const statusForDay = (day) => {
  if (day === 20) return 'MY_ANSWER_ONLY';
  if (day === 13) return 'PARTNER_ANSWER_ONLY';
  return 'BOTH_ANSWERED';
};

const MOCK_TODAY = {
  day: TODAY_DAY,
  questionId: qid(TODAY_DAY),
  question: questionForDay(TODAY_DAY),
  myAnswer: ANSWER_SAMPLES[qIndex(TODAY_DAY)].my,
  myAnsweredAt: new Date().toISOString(),
  partnerAnswered: true,
  partnerAnswer: ANSWER_SAMPLES[qIndex(TODAY_DAY)].partner,
  bothAnswered: true,
  streak: TODAY_DAY,
  rewardPoints: 20,
};

// 전체 히스토리 (오늘=23 제외, day 22 → 1)
const MOCK_HISTORY = Array.from({ length: TODAY_DAY - 1 }, (_, i) => {
  const day = TODAY_DAY - 1 - i;
  return {
    day,
    questionId: qid(day),
    question: questionForDay(day),
    status: statusForDay(day),
  };
});

// 특정 day 상세를 동적 생성 (실제 질문 + 샘플 답변)
const buildDetail = (questionId) => {
  const m = /q-(\d+)/.exec(questionId || '');
  const day = m ? Number(m[1]) : TODAY_DAY - 1;
  const idx = qIndex(day);
  const status = statusForDay(day);
  const samples = ANSWER_SAMPLES[idx];
  return {
    day,
    questionId,
    question: REAL_QUESTIONS[idx],
    questionDate: dateForDay(day),
    myAnswer: status === 'PARTNER_ANSWER_ONLY' ? null : samples.my,
    partnerAnswer: status === 'MY_ANSWER_ONLY' ? null : samples.partner,
    bothAnswered: status === 'BOTH_ANSWERED',
  };
};

// 오늘의 질문 + 내 답변/파트너 답변/스트릭 등 조회
export function fetchTodayQuestion() {
  if (endpoints.MOCK) return Promise.resolve(MOCK_TODAY);
  return get(endpoints.qna.today);
}

// 오늘의 질문에 답변 등록 (answer는 # 없는 일반 문자열)
export function answerTodayQuestion(answer) {
  if (endpoints.MOCK)
    return Promise.resolve({ ok: true, bothAnswered: true, streak: 24, earnedPoints: 20 });
  return post(endpoints.qna.answerToday, { answer });
}

// 지난 질문 히스토리 목록
export function fetchQuestionHistory() {
  if (endpoints.MOCK) return Promise.resolve(MOCK_HISTORY);
  return get(endpoints.qna.history).then((res) => res?.items ?? []);
}

// 특정 질문 상세 (내 답변 + 파트너 답변)
export function fetchQuestionDetail(questionId) {
  if (endpoints.MOCK) return Promise.resolve(buildDetail(questionId));
  return get(endpoints.qna.detail(questionId));
}
