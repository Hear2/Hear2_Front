import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import colors from '../../constants/colors';
import Header from '../../components/common/Header';

const TOTAL_DAYS = 127;

const QUESTION_BANK = [
  '오늘 가장 행복했던 순간은?',
  '서로에게 가장 고마웠던 일은?',
  '상대방이 나를 가장 기쁘게 하는 순간은?',
  '가장 행복했던 데이트는?',
  '서로에게 처음으로 반한 순간은?',
  '꼭 함께 가보고 싶은 여행지는?',
  '상대방의 어떤 점이 가장 사랑스러운가요?',
  '함께 도전해보고 싶은 새로운 취미는?',
  '오늘 상대방에게 하고 싶은 말이 있다면?',
  '둘만의 비밀스러운 추억이 있다면?',
  '상대방을 한마디로 정의한다면?',
  '나에게 위로가 되는 그 사람의 말은?',
  '함께 듣고 싶은 노래가 있나요?',
  '상대방의 가장 매력적인 표정은?',
  '오늘 하루 가장 보고 싶었던 순간은?',
  '둘이서 가장 자주 가는 장소는?',
  '상대방에게 배우고 싶은 점은?',
  '함께 만들고 싶은 우리만의 전통이 있다면?',
  '상대방이 가장 잘하는 요리는?',
  '같이 봤던 영화 중 가장 인상 깊었던 것은?',
  '상대방의 어떤 습관이 사랑스러운가요?',
  '둘만의 별명이 있다면?',
  '함께 이루고 싶은 작은 목표가 있다면?',
  '상대방이 나에게 처음 해준 선물은?',
  '서로의 가족에게 가장 잘 보이고 싶은 순간은?',
  '상대방이 보여준 가장 따뜻한 행동은?',
  '함께 살게 된다면 가장 기대되는 점은?',
  '상대방이 울었을 때 어떻게 위로하나요?',
  '둘이서만 통하는 농담이 있다면?',
  '상대방의 어떤 점이 닮고 싶나요?',
  '오늘 상대방에게 묻고 싶은 질문이 있다면?',
  '함께 보낸 가장 평범했던 행복한 하루는?',
  '상대방이 잠들 때 어떤 생각을 할까요?',
  '나도 모르게 상대방을 떠올리는 순간은?',
  '상대방이 처음 했던 말 중 기억나는 건?',
  '함께 먹고 싶은 음식이 있다면?',
  '상대방의 어떤 모습이 가장 멋있나요?',
  '둘이서 가장 많이 웃었던 순간은?',
  '상대방에게 미처 말하지 못한 마음이 있다면?',
  '서로 닮아가고 있다고 느끼는 부분은?',
];

const getStatus = (day) => {
  if (day === TOTAL_DAYS) return 'today';
  if (day % 17 === 0) return 'none';
  if (day % 13 === 0) return 'mineOnly';
  if (day % 11 === 0) return 'partnerOnly';
  return 'both';
};

const STATUS_META = {
  today:       { label: '오늘의 질문',     color: '#FF6B9D' },
  none:        { label: '미답변',          color: '#AAAAAA' },
  mineOnly:    { label: '내 답변만',        color: '#4D96FF' },
  partnerOnly: { label: '파트너 답변만',    color: '#FFB590' },
  both:        { label: '답변 완료',        color: '#6BCB77' },
};

const QuestionHistoryScreen = ({ navigation }) => {
  const records = useMemo(() => {
    return Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const day = TOTAL_DAYS - i;
      return {
        day,
        question: QUESTION_BANK[(day - 1) % QUESTION_BANK.length],
        status: getStatus(day),
      };
    });
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="질문 기록"
        showBack
        onBack={() => navigation?.goBack()}
      />

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          Day 1 ~ Day {TOTAL_DAYS} · 총 {TOTAL_DAYS}개의 질문
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {records.map((r) => {
          const meta = STATUS_META[r.status];
          return (
            <TouchableOpacity
              key={r.day}
              style={styles.row}
              activeOpacity={0.7}
              onPress={() =>
                navigation?.navigate('QuestionDetailScreen', {
                  day: r.day,
                  question: r.question,
                  status: r.status,
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
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
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
