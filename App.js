import React, { useEffect, useRef } from 'react';
import { LogBox, View } from 'react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import colors from './src/constants/colors';
import * as Notifications from 'expo-notifications';

// Expo Go SDK 53+에서 원격 push는 제거됨 — 로컬 알림은 정상이라 무시해도 안전한 워닝
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { MemoryProvider } from './src/contexts/MemoryContext';
import { EventProvider } from './src/contexts/EventContext';
import { CoupleProvider } from './src/contexts/CoupleContext';
import {
  setupNotificationHandler,
  scheduleDailyYearAgo,
  isYearAgoResponse,
} from './src/services/yearAgoNotifications';
import { fetchYearAgo } from './src/api/memoryAPI';

export const navigationRef = createNavigationContainerRef();

// 알림 응답 → 1년 전 오늘 메모리 조회 → PhotoDetail로 라우팅
async function handleYearAgoTap() {
  try {
    const res = await fetchYearAgo();
    // BE MemoryYearAgoResponse 모양 가정: { hasMemory, memory } 또는 단일 MemoryResponse
    const memory = res?.memory || (res?.id ? res : null);
    if (!memory || !navigationRef.isReady()) return;
    navigationRef.navigate('PhotoDetail', { memory });
  } catch (_) {
    // 인증 만료/네트워크 실패 등 — 무시 (사용자는 알림만 본 상태로 남음)
  }
}

// 안드로이드 edge-to-edge(Expo SDK 54 기본)에서 앱이 시스템 내비게이션 바 아래까지
// 그려져 모든 화면의 하단이 내비바에 가리는 문제가 있었다. 루트에서 하단 inset만큼
// 패딩을 줘서 전 화면 공통으로 내비바 영역을 확보한다.
// (탭바는 BottomTabNavigator에서 insets.bottom을 중복 적용하지 않도록 함)
function BottomInsetGate({ children }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
        backgroundColor: colors.bgApp,
      }}
    >
      {children}
    </View>
  );
}

export default function App() {
  const responseListenerRef = useRef(null);

  useEffect(() => {
    setupNotificationHandler();
    // 권한 요청 + 매일 00:00 스케줄 (best-effort)
    scheduleDailyYearAgo().catch(() => {});

    // 콜드 스타트로 알림 탭 → 앱 진입 케이스
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response && isYearAgoResponse(response)) {
          // navigationRef가 ready될 때까지 짧게 지연 후 라우팅
          setTimeout(handleYearAgoTap, 500);
        }
      })
      .catch(() => {});

    // 앱이 떠있는 상태에서 알림 탭
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (isYearAgoResponse(response)) {
          handleYearAgoTap();
        }
      },
    );

    return () => {
      if (responseListenerRef.current) {
        responseListenerRef.current.remove();
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MemoryProvider>
          <EventProvider>
            <CoupleProvider>
              <BottomInsetGate>
                <NavigationContainer ref={navigationRef}>
                  <RootNavigator />
                </NavigationContainer>
              </BottomInsetGate>
            </CoupleProvider>
          </EventProvider>
        </MemoryProvider>
      </AuthProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
