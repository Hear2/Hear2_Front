import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import endpoints from '../constants/endpoints';
import { fetchMessages } from '../api/chatAPI';
import { fetchCapsules } from '../api/timeCapsuleAPI';

// 부정 계열 감정 타입 (FastAPI emotionType 기준)
const NEGATIVE_TYPES = ['SAD', 'ANGRY', 'ANXIOUS'];

// 홈/하트탭 통계 카드용 커플 활동 집계.
// 화면 포커스마다 갱신: 대화 수, 감정 기록 수(분석된 메시지), 긍/부/중 비율, (옵션) 캡슐 수.
export function useCoupleStats({ withCapsules = false } = {}) {
  const [stats, setStats] = useState({
    chatCount: 0,
    emotionCount: 0,
    capsuleCount: 0,
    posPct: 0,
    negPct: 0,
    neuPct: 0,
  });

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          let chatCount = 0;
          let emotionCount = 0;
          let posPct = 0;
          let negPct = 0;
          let neuPct = 0;
          if (!endpoints.MOCK) {
            const list = await fetchMessages();
            const msgs = Array.isArray(list) ? list : [];
            chatCount = msgs.length;
            const emo = msgs.filter((m) => m?.emotionType);
            emotionCount = emo.length;
            if (emo.length > 0) {
              const pos = emo.filter((m) => m.emotionType === 'HAPPY').length;
              const neg = emo.filter((m) =>
                NEGATIVE_TYPES.includes(m.emotionType),
              ).length;
              posPct = Math.round((pos / emo.length) * 100);
              negPct = Math.round((neg / emo.length) * 100);
              neuPct = Math.max(0, 100 - posPct - negPct);
            }
          }

          let capsuleCount = 0;
          if (withCapsules) {
            const caps = await fetchCapsules();
            capsuleCount =
              (caps?.sealed?.length || 0) + (caps?.open?.length || 0);
          }

          if (alive) {
            setStats({
              chatCount,
              emotionCount,
              capsuleCount,
              posPct,
              negPct,
              neuPct,
            });
          }
        } catch (_) {
          // 네트워크 실패 시 기존 값 유지
        }
      })();
      return () => {
        alive = false;
      };
    }, [withCapsules]),
  );

  return stats;
}
