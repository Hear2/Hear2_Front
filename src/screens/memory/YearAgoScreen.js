// 1년 전 오늘 화면. 자체 UI는 두지 않고 fetchYearAgo 결과를 PhotoDetail로 즉시 라우팅.
// 메모리가 없거나 API 실패 시에만 안내 카드를 보여준다.
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchYearAgo } from '../../api/memoryAPI';
import colors from '../../constants/colors';

export default function YearAgoScreen({ navigation }) {
  const [state, setState] = useState({ loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchYearAgo();
        const memory = res?.memory || (res?.id ? res : null);
        if (cancelled) return;
        if (memory) {
          // PhotoDetail로 교체하여 뒤로가기 스택을 깔끔하게 유지
          navigation.replace('PhotoDetail', { memory });
        } else {
          setState({ loading: false, error: null });
        }
      } catch (e) {
        if (!cancelled) setState({ loading: false, error: e });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigation]);

  if (state.loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.pink} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.center}>
        <Text style={styles.emoji}>📅</Text>
        <Text style={styles.title}>1년 전 오늘은 추억이 없어요</Text>
        <Text style={styles.sub}>
          {state.error
            ? '잠시 후 다시 시도해 주세요'
            : '오늘 새 추억을 만들어 보세요'}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.btn}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  sub: {
    fontSize: 14,
    color: colors.inkMute,
    marginBottom: 24,
    textAlign: 'center',
  },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FDF0F5',
  },
  btnText: { color: colors.pink, fontWeight: '700' },
});
