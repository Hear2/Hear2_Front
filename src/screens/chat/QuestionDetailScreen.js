import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../constants/colors';
import Header from '../../components/common/Header';
import { fetchQuestionDetail } from '../../api/qnaAPI';

const QuestionDetailScreen = ({ navigation, route }) => {
  const { questionId } = route?.params ?? {};
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        if (!questionId) {
          setLoading(false);
          return;
        }
        try {
          const d = await fetchQuestionDetail(questionId);
          if (alive) setDetail(d);
        } catch (_) {
          if (alive) setDetail(null);
        } finally {
          if (alive) setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, [questionId]),
  );

  const day = detail?.day;
  const showMine = !!detail?.myAnswer;
  // 파트너 답변은 둘 다 답했을 때만 공개
  const showPartner = !!(detail?.bothAnswered && detail?.partnerAnswer);

  return (
    <View style={styles.container}>
      <Header
        title={day != null ? `Day ${day}` : '질문'}
        showBack
        onBack={() => navigation?.goBack()}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.pink} />
        </View>
      ) : !detail ? (
        <View style={styles.center}>
          <Text style={styles.placeholderText}>질문을 불러오지 못했어요</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Question Card */}
          <View style={styles.questionCard}>
            <View style={styles.questionMeta}>
              <Text style={styles.dayNum}>#{detail.day}</Text>
              <Text style={styles.dateText}>{detail.questionDate ?? ''}</Text>
            </View>
            <Text style={styles.questionText}>{detail.question}</Text>
          </View>

          {/* My Answer */}
          <Text style={styles.label}>💗 내 답변</Text>
          {showMine ? (
            <View style={[styles.answerCard, styles.myAnswerCard]}>
              <Text style={styles.answerText}>{detail.myAnswer}</Text>
            </View>
          ) : (
            <View style={[styles.answerCard, styles.placeholderCard]}>
              <Text style={styles.placeholderText}>아직 답변하지 않았어요</Text>
            </View>
          )}

          {/* Partner Answer */}
          <Text style={styles.label}>💙 파트너 답변</Text>
          {showPartner ? (
            <View style={[styles.answerCard, styles.partnerAnswerCard]}>
              <Text style={styles.answerText}>{detail.partnerAnswer}</Text>
            </View>
          ) : (
            <View style={[styles.answerCard, styles.placeholderCard]}>
              <Text style={styles.placeholderText}>
                {detail.myAnswer
                  ? '파트너가 답하면 공개돼요'
                  : '둘 다 답하면 서로의 답이 공개돼요'}
              </Text>
            </View>
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
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionCard: {
    backgroundColor: colors.pinkTint,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  questionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.pink,
    fontStyle: 'italic',
  },
  dateText: {
    fontSize: 11,
    color: colors.inkMute,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 26,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 8,
    marginTop: 4,
  },
  answerCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  myAnswerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.pinkTint,
  },
  partnerAnswerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.blueTint,
  },
  placeholderCard: {
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.line2,
    alignItems: 'center',
  },
  answerText: {
    fontSize: 14,
    color: colors.ink,
    lineHeight: 21,
  },
  placeholderText: {
    fontSize: 13,
    color: colors.inkMute,
    fontStyle: 'italic',
  },
});

export default QuestionDetailScreen;
