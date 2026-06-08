// 화면 캡처 → 공유/저장 유틸
// 사용법: 캡처할 최상위 View에 ref와 collapsable={false}를 달고,
//        shareOrSaveScreenshot(ref) 를 호출하면 끝.
// 의존성: react-native-view-shot, expo-sharing, expo-media-library(기존 설치됨)
import { Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

async function captureToFile(viewRef) {
  // 보이는 화면 그대로 PNG 임시파일로 캡처
  return captureRef(viewRef, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });
}

/** OS 공유 시트 열기 — 인스타그램(스토리/피드), 카톡 등으로 바로 공유 가능 */
export async function shareScreenshot(viewRef, { dialogTitle = 'Hear2 공유하기' } = {}) {
  try {
    const uri = await captureToFile(viewRef);
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('공유 불가', '이 기기에서는 공유 기능을 사용할 수 없어요.');
      return;
    }
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle,
      UTI: 'public.png',
    });
  } catch (err) {
    Alert.alert('공유 실패', err?.message ?? '잠시 후 다시 시도해주세요.');
  }
}

/** 갤러리에 이미지로 저장 (이미지 내보내기 폴백) */
export async function saveScreenshot(viewRef) {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 보관함 접근 권한을 허용해주세요.');
      return;
    }
    const uri = await captureToFile(viewRef);
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('저장 완료 💕', '이미지가 갤러리에 저장됐어요.\n인스타그램 스토리에 올려보세요!');
  } catch (err) {
    Alert.alert('저장 실패', err?.message ?? '잠시 후 다시 시도해주세요.');
  }
}

/** 공유 / 저장 선택지 다이얼로그 */
export function shareOrSaveScreenshot(viewRef) {
  Alert.alert('이 화면 공유하기', '현재 화면을 이미지로 내보낼까요?', [
    { text: '📤 인스타그램 등으로 공유', onPress: () => shareScreenshot(viewRef) },
    { text: '💾 갤러리에 저장', onPress: () => saveScreenshot(viewRef) },
    { text: '취소', style: 'cancel' },
  ]);
}
