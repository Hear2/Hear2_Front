import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import colors from '../../constants/colors';
import Header from '../../components/common/Header';

const MY_ANSWER_BANK = [
  '웃으면서 나한테 달려올 때! 그 순간이 제일 좋아 ♥',
  '같이 산책하면서 손 잡았을 때.',
  '바쁜 와중에도 잠깐 전화해줄 때 너무 고마워.',
  '내 얘기 끝까지 들어주고 공감해주는 모습.',
  '아침에 보낸 굿모닝 메시지가 매일 설렘이야.',
  '같이 음식 만들면서 웃었던 그 시간들.',
  '내가 아플 때 옆에서 챙겨준 것이 정말 큰 위로였어.',
  '서로 눈만 봐도 통하는 그 순간이 제일 좋아.',
  '평범한 일상을 특별하게 만들어주는 너의 작은 행동들.',
  '"사랑해" 한 마디에 모든 피로가 사라져.',
];

const PARTNER_ANSWER_BANK = [
  '예진이가 활짝 웃을 때가 제일 행복해.',
  '같이 카페에서 멍 때리며 보내는 시간.',
  '맛있는 거 먹고 같이 "맛있다!" 외칠 때.',
  '서툴지만 진심을 담아주는 모습이 가장 사랑스러워.',
  '나도 모르게 의지하게 되는 든든한 너의 말투.',
  '함께 영화 보면서 졸린 채로 기댄 어깨가 따뜻해.',
  '예진이의 그 특유의 깜찍한 표정.',
  '같이 새로운 곳을 탐험할 때의 두근거림.',
  '평소에 무심한 듯 챙겨주는 작은 배려들.',
  '내 손을 꼭 잡아줄 때 마음이 편안해져.',
];

const TODAY_DATE = new Date('2026-04-07');

const formatDate = (day) => {
  const baseDay = 127;
  const offset = day - baseDay;
  const d = new Date(TODAY_DATE);
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const QuestionDetailScreen = ({ navigation, route }) => {
  const { day = 1, question = '', status = 'both' } = route?.params ?? {};

  const myAnswer = MY_ANSWER_BANK[(day - 1) % MY_ANSWER_BANK.length];
  const partnerAnswer = PARTNER_ANSWER_BANK[(day - 1) % PARTNER_ANSWER_BANK.length];

  const showMine = status === 'both' || status === 'mineOnly';
  const showPartner = status === 'both' || status === 'partnerOnly';
  const isToday = status === 'today';

  return (
    <View style={styles.container}>
      <Header
        title={`Day ${day}`}
        showBack
        onBack={() => navigation?.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionMeta}>
            <Text style={styles.dayNum}>#{day}</Text>
            <Text style={styles.dateText}>{formatDate(day)}</Text>
          </View>
          <Text style={styles.questionText}>{question}</Text>
        </View>

        {/* My Answer */}
        <Text style={styles.label}>💗 내 답변</Text>
        {showMine ? (
          <View style={[styles.answerCard, styles.myAnswerCard]}>
            <Text style={styles.answerText}>{myAnswer}</Text>
          </View>
        ) : (
          <View style={[styles.answerCard, styles.placeholderCard]}>
            <Text style={styles.placeholderText}>
              {isToday ? '아직 답변하지 않았어요' : '이 날엔 답변을 남기지 못했어요'}
            </Text>
          </View>
        )}

        {/* Partner Answer */}
        <Text style={styles.label}>💙 지호의 답변</Text>
        {showPartner ? (
          <View style={[styles.answerCard, styles.partnerAnswerCard]}>
            <Text style={styles.answerText}>{partnerAnswer}</Text>
          </View>
        ) : (
          <View style={[styles.answerCard, styles.placeholderCard]}>
            <Text style={styles.placeholderText}>
              {isToday ? '지호도 아직 답변하지 않았어요' : '지호도 이 날엔 답변을 남기지 못했어요'}
            </Text>
          </View>
        )}

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
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
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
