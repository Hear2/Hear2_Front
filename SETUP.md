# Hear2 Front — 팀 세팅 가이드

새 PC/팀원 환경에서 앱(에뮬레이터)을 띄우기 위한 세팅 정리.

> 💡 **먼저 알아둘 것**
> - 백엔드(Spring/FastAPI)는 이미 **Render에 배포**되어 있고 URL이 `app.json`에 포함되어 있어, 로컬 BE를 띄울 필요가 없습니다.
> - **카카오 지도 키·BE/WS URL**도 `app.json`에 들어있어 레포와 함께 받아집니다.
> - 이 앱은 `expo-dev-client` + 네이티브 모듈을 사용하므로 **Expo Go로는 실행할 수 없습니다.** Dev Client를 직접 빌드해야 합니다.

---

## 0. 사전 설치 (PC에 1회)

- **Node 20 LTS** — 최신 Node(25 등)는 전역 `expo-cli`가 깨지므로 반드시 `npx expo` 사용
- **Git**
- Dev Client 빌드 방법 중 **하나** 선택:
  - **A안 (권장·쉬움)** — Expo 계정 + `eas-cli` 클라우드 빌드 (Android Studio 불필요)
  - **B안** — Android Studio + Android SDK + 에뮬레이터(AVD) + **JDK 21** (Android Studio 내장 JBR)

---

## 1. 레포 받기

```bash
git clone https://github.com/Hear2/Hear2_Front.git
cd Hear2_Front
git checkout feat/initial-rn-app
npm install
```

---

## 2. `.env` 파일 만들기 ⚠️ (git에 없음 — 따로 공유받아야 함)

`hear2-app/.env`에 아래 3개를 채웁니다. **구글/카카오 로그인용**이며, 값은 팀에서 별도(슬랙/노션)로 공유받으세요.

```env
EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=...   # Web client
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=... # Android 빌드용
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...     # iOS 빌드용 (아이폰 시연 시 필요)
EXPO_PUBLIC_KAKAO_REST_API_KEY=...
```

> 없어도 앱은 켜지지만 **OAuth 로그인이 안 됩니다.** 로그인 없이 화면만 확인하려면 `app.json`의 `extra.mockApi`를 `true`로 바꾸고 Metro를 재시작하세요. (로그인 스킵 + 목업 데이터로 동작)

---

## 3. Dev Client 빌드 (필수)

`android/` 폴더는 git에 포함되지 않아 각자 빌드해야 합니다.

### A안 — EAS 클라우드 빌드 (Android Studio 불필요)

```bash
npm i -g eas-cli
eas login          # 프로젝트(projectId: 01a3255c-87da-4ac5-859f-d2e6f8b21595) 접근 권한이 있는 Expo 계정
eas build --profile development --platform android
# 빌드 완료 후 받은 APK를 에뮬레이터/실기기에 설치
adb install <다운로드한>.apk
```

### B안 — 로컬 네이티브 빌드

```bash
# 시스템 java가 23 이상이면 gradle이 깨지므로 JDK 21(Android Studio JBR)로 지정
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"

npx expo run:android   # android/ 자동 생성 + 빌드 + 설치 (첫 빌드 약 6분, 이후 캐시되면 수초)
```

---

## 4. 실행

```bash
npx expo start         # ⚠️ 전역 expo가 아니라 npx expo 사용
```

- 에뮬레이터에서 설치된 Dev Client 앱(`com.hear2.app`)을 엽니다.
- 딥링크 스킴은 `hear2://` 입니다. (수동 실행 시: `adb reverse tcp:8081 tcp:8081` 후
  `adb shell am start -a android.intent.action.VIEW -d "hear2://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"`)

---

## 따로 세팅하지 **않아도** 되는 것 ✅

| 항목 | 이유 |
|------|------|
| 백엔드 / FastAPI | 이미 Render 배포(`hear2-be.onrender.com`) — `app.json`에 URL 포함. 로컬 BE 불필요 |
| 카카오 지도 키 · BE/WS URL | `app.json`에 포함되어 레포와 함께 받아짐 |

---

## 자주 겪는 함정

- **Render 콜드스타트**: 무료 티어라 15분 유휴 후 잠듦. 첫 호출이 최대 ~4분 걸릴 수 있음(특히 채팅 감정분석). 시연 전 한 번 호출해 깨워두기.
- **에뮬레이터 DNS 깨짐**: 모든 BE 호출이 `Network request failed`로 실패하고 `adb shell ping hear2-be.onrender.com`이 `unknown host`면 DNS 문제. 에뮬레이터를 DNS 서버 지정으로 재시작:
  ```bash
  emulator -avd <AVD이름> -dns-server 8.8.8.8,8.8.4.4 -no-snapshot-load
  ```
- **전역 `expo` CLI 사용 금지**: 레거시라 Node 17+에서 깨짐. 항상 `npx expo`.
- **재설치 시 `INSTALL_FAILED_UPDATE_INCOMPATIBLE`**: 기존 앱 제거 후 재설치 — `adb uninstall com.hear2.app` (로그인/데이터 초기화됨).
- **푸시 알림(FCM)**: `google-services.json`이 레포에 없어 푸시는 동작하지 않음. **단, 빌드·실행에는 지장 없음.**

---

## 데모/목업 모드 (BE 없이 화면 채우기)

포스터/시연용으로 실제 데이터 없이 화면을 채우려면:

1. `app.json`의 `extra.mockApi`를 `true`로 변경
2. Metro 재시작: `npx expo start --dev-client --clear`
3. 끝나면 `false`로 되돌리고 재시작 → 실제 BE 연동 복귀
