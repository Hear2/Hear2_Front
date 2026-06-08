import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import colors from '../../constants/colors';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;
// 영문 + 숫자 모두 포함, 8자 이상
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function SignupStep1Screen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const wiggle = useRef(new Animated.Value(0)).current;

  const emailValid = EMAIL_REGEX.test(email.trim());
  const passwordValid = PASSWORD_REGEX.test(password);
  const passwordsMatch = !!password && password === passwordConfirm;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: -1, duration: 220, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.delay(2200),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [wiggle]);

  const canProceed = emailValid && passwordValid && passwordsMatch;

  const handleNext = () => {
    if (!canProceed) return;
    // 인증 메일은 /signup 호출 시점에 백엔드가 자동 발송 → 다음 단계에서 토큰 검증
    navigation.navigate('Signup', {
      email: email.trim(),
      password,
    });
  };

  const wiggleRotate = wiggle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="회원가입" showBack onBack={() => navigation.goBack()} />

      <View style={styles.progressWrap}>
        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, styles.progressFilled]} />
          <View style={[styles.progressSegment, styles.progressEmpty]} />
          <View style={[styles.progressSegment, styles.progressEmpty]} />
        </View>
        <Text style={styles.progressLabel}>1 / 3</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>반가워요! </Text>
          <Animated.Text style={[styles.titleEmoji, { transform: [{ rotate: wiggleRotate }] }]}>
            💌
          </Animated.Text>
        </View>
        <Text style={styles.subtitle}>이메일과 비밀번호를 입력해주세요</Text>

        {/* 이메일 */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>이메일</Text>
          <View
            style={[
              styles.emailInputWrapper,
              emailValid && styles.emailInputWrapperFocused,
            ]}
          >
            <Text style={styles.emailIcon}>📧</Text>
            <TextInput
              style={styles.emailInput}
              value={email}
              onChangeText={setEmail}
              placeholder="name@email.com"
              placeholderTextColor={colors.inkMute}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          {!!email && !emailValid && (
            <Text style={styles.helperWarn}>올바른 이메일 형식이 아니에요</Text>
          )}
          {emailValid && (
            <Text style={styles.helperOk}>✓ 사용 가능한 형식이에요</Text>
          )}
        </View>

        {/* 비밀번호 */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>비밀번호</Text>
          <View
            style={[
              styles.passwordWrapper,
              passwordValid && styles.passwordWrapperFocused,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder={`영문+숫자 ${PASSWORD_MIN}자 이상`}
              placeholderTextColor={colors.inkMute}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={8}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
          {!!password && !passwordValid ? (
            <Text style={styles.helperWarn}>
              영문과 숫자를 모두 포함해서 {PASSWORD_MIN}자 이상 입력해주세요
            </Text>
          ) : (
            <Text style={styles.helperMutedTip}>
              영문/숫자를 조합한 {PASSWORD_MIN}자 이상 비밀번호
            </Text>
          )}

          {/* 비밀번호 확인 */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>비밀번호 확인</Text>
          <View
            style={[
              styles.passwordWrapper,
              passwordsMatch && styles.passwordWrapperFocused,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              placeholder="다시 한 번 입력"
              placeholderTextColor={colors.inkMute}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
            />
            <TouchableOpacity
              onPress={() => setShowConfirm((v) => !v)}
              hitSlop={8}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
          {!!passwordConfirm && !passwordsMatch && (
            <Text style={styles.helperWarn}>비밀번호가 일치하지 않아요</Text>
          )}
          {passwordsMatch && (
            <Text style={styles.helperOk}>✓ 비밀번호가 일치해요</Text>
          )}
        </View>

        {/* 안내 카드 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            가입 직후 입력하신 이메일로 인증 토큰을 보내드려요. 메일에서 토큰을
            확인해 다음 단계에서 입력해주세요.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <Button
          title="다음"
          onPress={canProceed ? handleNext : undefined}
          style={!canProceed && styles.nextDisabled}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp },
  progressWrap: { paddingHorizontal: 24, paddingTop: 8 },
  progressBar: { flexDirection: 'row', gap: 6 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  progressFilled: { backgroundColor: colors.pink },
  progressEmpty: { backgroundColor: colors.pinkTint },
  progressLabel: { marginTop: 6, fontSize: 12, color: colors.inkMute },

  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },

  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },
  titleEmoji: { fontSize: 22 },
  subtitle: { marginTop: 6, fontSize: 13, color: colors.ink3 },

  fieldSection: { marginTop: 24 },
  fieldLabel: { fontSize: 12, color: colors.ink3, fontWeight: '600', marginBottom: 8 },

  emailInputWrapper: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  emailInputWrapperFocused: { borderColor: colors.pink },
  emailIcon: { fontSize: 16 },
  emailInput: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 0 },

  helperWarn: { marginTop: 6, fontSize: 11, color: colors.heartRed, fontWeight: '600' },
  helperOk: { marginTop: 6, fontSize: 11, color: colors.green, fontWeight: '600' },
  helperMutedTip: { marginTop: 6, fontSize: 11, color: colors.inkMute },

  passwordWrapper: {
    marginTop: 8,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  passwordWrapperFocused: { borderColor: colors.pink },
  passwordInput: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 0 },
  eyeBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  eyeIcon: { fontSize: 16 },

  infoCard: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF5F8',
    borderWidth: 1,
    borderColor: '#FFD0E0',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoIcon: { fontSize: 14, lineHeight: 18 },
  infoText: { flex: 1, fontSize: 11, color: colors.ink, lineHeight: 18 },

  bottomSection: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8 },
  nextDisabled: { opacity: 0.5 },
});
