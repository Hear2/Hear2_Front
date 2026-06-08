# Hear2 — 개발 현황 (페이지 & 기능 정리)

> 2030세대 커플을 위한 LLM 기반 AI 관계 관리 모바일 앱
> 스택: React Native (Expo SDK 52) + React Navigation 7

---

## 네비게이션 구조

```
RootStack
├── Splash
├── Auth (Stack)
│   ├── Login
│   ├── Signup
│   ├── Onboarding
│   └── PartnerConnect
├── MainTabs (Bottom Tab × 5)
│   ├── 홈      → HomeScreen
│   ├── 채팅    → ChatScreen
│   ├── 앨범    → AlbumScreen
│   ├── 캘린더  → SharedCalendar
│   └── 하트    → MoreScreen
└── Modal/Detail Stack
    ├── ReportView, AIJudgeModal(modal)
    ├── RecordScreen, YearAgoScreen, MemoryCalendar, PhotoUpload
    ├── DailyQAScreen, QuestionHistoryScreen, QuestionDetailScreen
    ├── LocationShare, TimeCapsuleScreen, AnniversaryScreen, SearchScreen
    ├── CoupleDNA, WhatIfScreen, CharacterScreen
    └── NotificationsScreen, SettingsScreen
```

---

## 화면 (총 33개)

### auth/ (5)
| 파일 | 설명 |
|------|------|
| `LoginScreen.js` | 이메일/비밀번호 + 소셜(구글/애플/카카오) 로그인 |
| `SignupScreen.js` | 닉네임/생년월일/성별 입력 후 파트너 연결로 진행 |
| `OnboardingScreen.js` | 앱 소개 (AI 감정 분석, 추억 기록 설명) |
| `PartnerConnectScreen.js` | 초대 코드 공유/입력으로 연인 연결 |
| `SplashScreen.js` | 스플래시 — 자동 로그인 여부에 따라 분기 |

### home/ (5)
| 파일 | 설명 |
|------|------|
| `HomeScreen.js` | 홈 탭: D-day, 오늘 감정 분석, 빠른 액션, 1년 전 오늘, 최근 추억 |
| `MoreScreen.js` | 하트 탭: 프로필, 프리미엄 배너, AI 분석/활동/유틸리티 메뉴 |
| `CharacterScreen.js` | 함께 키우는 캐릭터, 경험치 바, 성장 기록 |
| `CharacterWidget.js` | 캐릭터 위젯 컴포넌트 |
| `DdayCard.js` | D-day 카드 컴포넌트 |

### chat/ (6)
| 파일 | 설명 |
|------|------|
| `ChatScreen.js` | 채팅 탭: 대화 목록, 감정 배지, AI 판사 호출, 음성 메시지 |
| `DailyQAScreen.js` | 매일 1개 질문, 7일 연속 스트릭, 파트너 답변 열기 |
| `AIJudgeModal.js` | AI가 대화 분석해 중립 판결 및 해결 방법 제시 |
| `QuestionHistoryScreen.js` | 데일리 Q&A 기록 (미답변/내답변만/양쪽답변 상태) |
| `QuestionDetailScreen.js` | 특정 날짜 질문 + 양쪽 답변 상세 |
| `MessageBubble.js` | 채팅 메시지 버블 컴포넌트 |

### memory/ (6)
| 파일 | 설명 |
|------|------|
| `AlbumScreen.js` | 앨범 탭: 카테고리 필터, 검색, 피드/감정별 뷰 모드 |
| `RecordScreen.js` | 3초 기록 — 사진 촬영/선택, AI 자동 태그, 댓글 |
| `MemoryCalendar.js` | 캘린더 뷰로 특정 날짜 추억 조회 |
| `PhotoUpload.js` | 사진 추가 화면 |
| `YearAgoScreen.js` | 1년 전 오늘의 추억 상세 (통계, AI 회상) |
| `MemoryScreen.js` | (스텁) "추억 기능 준비 중" |

### share/ (5)
| 파일 | 설명 |
|------|------|
| `SharedCalendar.js` | 공동 캘린더 — 일정 표시, 이벤트 상세 |
| `AnniversaryScreen.js` | 기념일 관리 (생성/수정/삭제) |
| `LocationShare.js` | 실시간 위치 공유 맵, 거리 표시 |
| `TimeCapsuleScreen.js` | 타임캡슐 — 미래 날짜 설정/채우기/개봉 |
| `SearchScreen.js` | 전역 검색 (최근어, 태그/위치) |

### my/ (6)
| 파일 | 설명 |
|------|------|
| `ReportView.js` | AI 감정 리포트 — 시간대별 그래프, 주요 순간, 감정 분포 |
| `CoupleDNA.js` | 커플 성향 분석 (MBTI, 강점, 개선 영역) |
| `WhatIfScreen.js` | AI 시나리오 — 갈등 예측, 선물 추천, 여행 시뮬, 대화 코칭 |
| `NotificationsScreen.js` | 알림 목록 (사랑/일정/AI/시스템) |
| `SettingsScreen.js` | 앱 설정 (알림, 보안, 계정, 개인정보) |
| `MyPageScreen.js` | (스텁) |

---

## 공용 컴포넌트 (`src/components/common/`)

`Button`, `Chip`, `Header`, `Heart`, `Loading`, `LovelyBackground`

---

## API / Context / Service 레이어 (모두 스텁 상태)

### API (`src/api/`)
- `client.js` — HTTP 클라이언트 베이스
- `authAPI.js` / `chatAPI.js` / `aiAPI.js` / `memoryAPI.js`

### Context (`src/contexts/`)
- `AuthContext.js` — 인증 상태
- `ChatContext.js` — 채팅 상태
- `CoupleContext.js` — 커플 정보

### Service (`src/services/`)
- `firebaseAuth.js` — Firebase 인증
- `firebaseStorage.js` — Firebase 스토리지
- `pushNotification.js` — 푸시 알림(FCM)

### Hooks (`src/hooks/`)
- `useAuth.js` / `useChat.js` / `useLocation.js` / `useWebSocket.js`

---

## 진행 상태 요약

**구현 완료 (UI/프로토타입)**
- 인증 흐름 5개 화면
- 5개 메인 탭 + 28개 디테일/모달 화면
- 로컬 mock 데이터 기반으로 모든 주요 기능 화면이 동작

**미구현 (백엔드 연동 전)**
- API 모듈 4종 — 함수 시그니처만, 실제 호출 없음
- Context/Service/Hooks — 상태 보일러플레이트만
- `MemoryScreen`, `MyPageScreen` — 자리만 잡은 플레이스홀더

**다음 단계 후보**
1. `client.js`에 baseURL/인터셉터 채우고 실제 백엔드 연동 시작
2. AuthContext + Firebase 인증 실제 연결 → 자동 로그인 분기 활성화
3. ChatScreen ↔ WebSocket 실시간 메시지 연결
4. 추억/사진 업로드 → Firebase Storage 연결
