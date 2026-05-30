import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../constants/colors';
import Header from '../../components/common/Header';
import { fetchQuestionHistory } from '../../api/qnaAPI';

// BE DailyQuestionStatus → 화면 표시 메타
const STATUS_META = {
  TODAY:               { label: '오늘의 질문',  color: '#FF6B9D' },
  UNANSWERED:          { label: '미답변',       color: '#AAAAAA' },
  MY_ANSWER_ONLY:      { label: '내 답변만',     color: '#4D96FF' },
  PARTNER_ANSWER_ONLY: { label: '파트너 답변만', color: '#FFB590' },
  BOTH_ANSWERED:       { label: '답변 완료',     color: '#6BCB77' },
};

const QuestionHistoryScreen = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          const items = await fetchQuestionHistory();
          if (alive) setRecords(Array.isArray(items) ? items : []);
        } catch (_) {
          if (alive) setRecords([]);
        } finally {
          if (alive) setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      <Header
        title="질문 기록"
        showBack
        onBack={() => navigation?.goBack()}
      />

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          총 {records.length}개의 질문
        </Text>
      </View>

      {loading && records.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.pink} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {records.length === 0 ? (
            <Text style={styles.empty}>아직 질문 기록이 없어요</Text>
          ) : (
            records.map((r) => {
              const meta = STATUS_META[r.status] ?? {
                label: '',
                color: colors.inkMute,
              };
              return (
                <TouchableOpacity
                  key={r.questionId ?? r.day}
                  style={styles.row}
                  activeOpacity={0.7}
                  onPress={() =>
                    r.questionId &&
                    navigation?.navigate('QuestionDetailScreen', {
                      questionId: r.questionId,
                    })
                  }
                >
                  <Text style={styles.dayNum}>#{r.day}</Text>
                  <View style={styles.body}>
                    <Text style={styles.question} numberOfLines={2}>
                      {r.question}
                    </Text>
                    <Text style={[styles.status, { color: meta.color }]}>
                      {meta.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  summaryBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  summaryText: {
    fontSize: 12,
    color: colors.inkMute,
    fontWeight: '600',
  },
  scroll: {
    paddingTop: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 13,
    color: colors.inkMute,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  dayNum: {
    width: 56,
    fontSize: 14,
    fontWeight: '700',
    color: colors.pink,
    fontStyle: 'italic',
    marginTop: 1,
  },
  body: {
    flex: 1,
  },
  question: {
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
  },
  status: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default QuestionHistoryScreen;
