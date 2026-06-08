// 1년 전 오늘 알림 — 매일 00:00에 발송되는 로컬 알림을 스케줄한다.
// 로컬 알림이므로 앱이 종료된 상태에서도 OS가 트리거를 띄운다.
// 알림 본문은 사용자가 탭한 시점에 fetchYearAgo()로 실데이터를 확인 → PhotoDetail로 라우팅.
//
// 한계:
// - 알림 본문 자체는 일반화된 문구("1년 전 오늘 추억이 있어요"). 실제 사진/장소는 탭 시점에 확정.
// - Expo Go에서는 iOS 원격 push가 막혀있지만 로컬 알림은 정상 동작.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const YEAR_AGO_NOTIFICATION_ID = 'year-ago-daily';
const YEAR_AGO_DATA_TYPE = 'year-ago';

let handlerSet = false;

// 포그라운드에서도 배너를 표시하도록 설정. 한 번만 호출.
export function setupNotificationHandler() {
  if (handlerSet) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  handlerSet = true;
}

export async function ensureNotificationPermission() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  if (
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }
  const req = await Notifications.requestPermissionsAsync();
  return !!req.granted;
}

// Android 채널 (8.0+에서는 채널 없으면 배너 미표시)
async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('year-ago', {
    name: '1년 전 오늘',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

// 매일 00:00에 한 번 발송되도록 스케줄. 이미 동일 ID로 잡혀있으면 갱신.
export async function scheduleDailyYearAgo() {
  if (!(await ensureNotificationPermission())) return false;
  await ensureAndroidChannel();

  // 동일 ID의 기존 스케줄 제거 (재시작 시 중복 방지)
  await Notifications.cancelScheduledNotificationAsync(YEAR_AGO_NOTIFICATION_ID).catch(
    () => {},
  );

  await Notifications.scheduleNotificationAsync({
    identifier: YEAR_AGO_NOTIFICATION_ID,
    content: {
      title: '✨ 1년 전 오늘',
      body: '1년 전 오늘의 추억이 도착했어요!',
      data: { type: YEAR_AGO_DATA_TYPE },
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: 'year-ago' } : {}),
    },
    trigger: {
      // 매일 00:00 (디바이스 로컬 타임)
      hour: 0,
      minute: 0,
      repeats: true,
      channelId: Platform.OS === 'android' ? 'year-ago' : undefined,
    },
  });

  return true;
}

export async function cancelDailyYearAgo() {
  await Notifications.cancelScheduledNotificationAsync(YEAR_AGO_NOTIFICATION_ID).catch(
    () => {},
  );
}

export function isYearAgoResponse(response) {
  return response?.notification?.request?.content?.data?.type === YEAR_AGO_DATA_TYPE;
}

export { YEAR_AGO_DATA_TYPE };
