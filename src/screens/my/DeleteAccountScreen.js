import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import SettingsShell from './SettingsShell';

const STEP_LABELS = ['안내', '동의', '확인'];

const IMPACTS = [
  { icon: '💬', label: '대화 12,847건' },
  { icon: '📷', label: '사진 283장' },
  { icon: '📅', label: '일정·기념일 42개' },
  { icon: '💌', label: '미오픈 캡슐 3개' },
  { icon: '🐣', label: '캐릭터 Lv.13' },
];

const AGREES = [
  '계정의 모든 데이터가 30일 후 영구 삭제됩니다.',
  '지호와의 채팅·앨범·캘린더 등 모든 공유 기록이 사라집니다.',
  '미오픈 타임캡슐 3개가 함께 삭제됩니다.',
  '동일한 이메일로 30일간 재가입할 수 없습니다.',
  '결제·구독 내역은 별도 보관됩니다 (5년).',
];

const Stepper = ({ step }) => (
  <View style={styles.stepper}>
    {STEP_LABELS.map((label, i) => {
      const n = i + 1;
      const done = step > n;
      const on = step === n;
      return (
        <React.Fragment key={label}>
          <View style={styles.stepCol}>
            <View
              style={[
                styles.stepDot,
                done && { backgroundColor: '#1F8A5B' },
                on && { backgroundColor: colors.heartRed },
              ]}
            >
              <Text
                style={[
                  styles.stepDotText,
                  (done || on) && { color: '#FFFFFF' },
                ]}
              >
                {done ? '✓' : n}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                on && { color: colors.heartRed },
                done && { color: '#1F8A5B' },
              ]}
            >
              {label}
            </Text>
          </View>
          {n < 3 && (
            <View
              style={[
                styles.stepLine,
                step > n && { backgroundColor: '#1F8A5B' },
                step === n && {
                  backgroundColor: '#FC2648',
                  opacity: 0.4,
                },
              ]}
            />
          )}
        </React.Fragment>
      );
    })}
  </View>
);

const HeroCard = ({ emoji, title, sub }) => (
  <LinearGradient
    colors={['#FFF5F8', '#FFFFFF']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.heroCard}
  >
    <Text style={styles.heroEmoji}>{emoji}</Text>
    <Text style={styles.heroTitle}>{title}</Text>
    <Text style={styles.heroSub}>{sub}</Text>
  </LinearGradient>
);

const DeleteAccountScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [agrees, setAgrees] = useState(AGREES.map(() => false));
  const [password, setPassword] = useState('');
  const [finalText, setFinalText] = useState('');

  const allAgreed = agrees.every(Boolean);
  const canFinalize = password.length >= 4 && finalText.trim() === '계정 삭제';

  const goNext = () => {
    if (step < 3) setStep(step + 1);
  };
  const goPrev = () => {
    if (step > 1) setStep(step - 1);
    else navigation?.goBack();
  };

  const renderStep1 = () => (
    <>
      <HeroCard
        emoji="⚠️"
        title="STEP 1 · 안내"
        sub={'계정을 삭제하기 전에 알아두세요'}
      />
      <Text style={styles.sectionLabel}>잃게 되는 것들</Text>
      <View style={styles.card}>
        {IMPACTS.map((it, i, a) => (
          <View
            key={it.label}
            style={[styles.impactRow, i < a.length - 1 && styles.divider]}
          >
            <Text style={styles.impactIcon}>{it.icon}</Text>
            <Text style={styles.impactText}>{it.label}</Text>
            <Text style={styles.removedTag}>삭제됨</Text>
          </View>
        ))}
      </View>
      <View style={styles.altBox}>
        <Text style={styles.altText}>
          💡 <Text style={styles.altBold}>대안</Text> · 데이터를 보관하고 싶다면{' '}
          <Text style={styles.altAccent}>먼저 다운로드</Text> 후 진행하세요.
        </Text>
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <HeroCard
        emoji="⚠️"
        title="STEP 2 · 동의"
        sub="아래 항목을 모두 확인해주세요"
      />
      <View style={[styles.card, { marginTop: 12 }]}>
        {AGREES.map((line, i, a) => {
          const on = agrees[i];
          return (
            <TouchableOpacity
              key={i}
              activeOpacity={0.7}
              onPress={() =>
                setAgrees((prev) => {
                  const next = [...prev];
                  next[i] = !next[i];
                  return next;
                })
              }
              style={[styles.agreeRow, i < a.length - 1 && styles.divider]}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: on ? colors.heartRed : '#DDD',
                    backgroundColor: on ? colors.heartRed : '#FFFFFF',
                  },
                ]}
              >
                {on && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.agreeText}>{line}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.lastWarn}>
        <Text style={styles.lastWarnTitle}>🛑 마지막 확인</Text>
        <Text style={styles.lastWarnBody}>
          다음 단계에서 비밀번호를 입력하면{' '}
          <Text style={styles.lastWarnAccent}>되돌릴 수 없어요</Text>. 추억을
          보관하고 싶다면 <Text style={styles.lastWarnBold}>먼저 다운로드</Text>를
          권장해요.
        </Text>
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <HeroCard
        emoji="🛑"
        title="STEP 3 · 확인"
        sub="비밀번호와 확인 문구를 입력하세요"
      />
      <View style={[styles.card, { marginTop: 12 }]}>
        <View style={[styles.fieldRow, styles.divider]}>
          <Text style={styles.fieldLabel}>비밀번호</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="현재 비밀번호"
            placeholderTextColor="#CCC"
            style={styles.input}
          />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>확인</Text>
          <TextInput
            value={finalText}
            onChangeText={setFinalText}
            placeholder="계정 삭제 입력"
            placeholderTextColor="#CCC"
            style={styles.input}
          />
        </View>
      </View>
      <View style={[styles.lastWarn, { backgroundColor: '#FFF0F0' }]}>
        <Text style={styles.lastWarnTitle}>한 번 더 안내</Text>
        <Text style={styles.lastWarnBody}>
          삭제 요청 후{' '}
          <Text style={styles.lastWarnAccent}>30일</Text>까지 다시 로그인하면
          취소할 수 있어요. 이후로는 모든 데이터가 영구 삭제됩니다.
        </Text>
      </View>
    </>
  );

  const nextDisabled =
    (step === 2 && !allAgreed) || (step === 3 && !canFinalize);

  const nextLabel =
    step === 1 ? '다음 (2/3 동의)' : step === 2 ? '다음 (3/3 확인)' : '계정 삭제';

  return (
    <SettingsShell navigation={navigation} title="계정 삭제">
      <Stepper step={step} />
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      <View style={styles.ctaRow}>
        <TouchableOpacity
          style={styles.prevBtn}
          activeOpacity={0.85}
          onPress={goPrev}
        >
          <Text style={styles.prevText}>
            {step === 1 ? '취소' : '이전'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            nextDisabled && { opacity: 0.45 },
            step === 3 && !nextDisabled && { backgroundColor: colors.heartRed },
          ]}
          activeOpacity={0.85}
          disabled={nextDisabled}
          onPress={() => (step === 3 ? navigation?.goBack() : goNext())}
        >
          <Text style={styles.nextText}>{nextLabel}</Text>
        </TouchableOpacity>
      </View>
    </SettingsShell>
  );
};

const styles = StyleSheet.create({
  stepper: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepCol: { alignItems: 'center', gap: 4, width: 56 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: { color: '#888', fontSize: 11, fontWeight: '800' },
  stepLabel: { fontSize: 9, color: '#888', fontWeight: '700' },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#F0F0F0',
    marginTop: 13,
    marginHorizontal: -8,
  },

  heroCard: {
    marginTop: 14,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFD0E0',
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 36 },
  heroTitle: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  heroSub: { marginTop: 4, fontSize: 11, color: '#888' },

  sectionLabel: {
    marginTop: 14,
    paddingHorizontal: 4,
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 0.5,
  },
  card: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
    overflow: 'hidden',
  },
  divider: { borderBottomWidth: 1, borderBottomColor: '#F4EEF1' },

  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  impactIcon: { fontSize: 18 },
  impactText: { flex: 1, fontSize: 12, fontWeight: '700', color: colors.ink },
  removedTag: { fontSize: 11, color: colors.heartRed, fontWeight: '700' },

  altBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF5F8',
    borderWidth: 1,
    borderColor: '#FFD0E0',
  },
  altText: { fontSize: 11, color: colors.ink, lineHeight: 17 },
  altBold: { fontWeight: '800', color: colors.ink },
  altAccent: { color: colors.heartRed, fontWeight: '800' },

  agreeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkMark: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  agreeText: { flex: 1, fontSize: 12, color: colors.ink, lineHeight: 18 },

  lastWarn: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFCFCF',
  },
  lastWarnTitle: {
    fontSize: 11,
    color: colors.heartRed,
    fontWeight: '800',
    marginBottom: 6,
  },
  lastWarnBody: { fontSize: 11, color: colors.ink, lineHeight: 18 },
  lastWarnBold: { fontWeight: '800' },
  lastWarnAccent: { color: colors.heartRed, fontWeight: '800' },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  fieldLabel: { width: 64, fontSize: 12, color: '#888', fontWeight: '700' },
  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    padding: 0,
  },

  ctaRow: { marginTop: 14, flexDirection: 'row', gap: 8 },
  prevBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  nextBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.heartRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
});

export default DeleteAccountScreen;
