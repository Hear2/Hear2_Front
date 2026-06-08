import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import colors from '../../constants/colors';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { verifyEmail, resendEmailVerification } from '../../api/authAPI';
import { useAuth } from '../../contexts/AuthContext';

const RESEND_COOLDOWN_SEC = 60;

export default function EmailVerifyScreen({ navigation, route }) {
  const email = route?.params?.email ?? '';
  const nickname = route?.params?.nickname ?? '';
  const accessToken = route?.params?.accessToken ?? null;
  const refreshToken = route?.params?.refreshToken ?? null;
  const signupUser = route?.params?.user ?? null;
  const profile = route?.params?.profile ?? null;

  const [token, setToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const inputRef = useRef(null);
  const { signIn } = useAuth();

  // 재발송 쿨다운 타이머
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const canVerify = token.trim().length > 0 && !verifying;

  const handleVerify = async () => {
    if (!canVerify) return;
    setError(null);
    setInfo(null);
    setVerifying(true);
    try {
      await verifyEmail({ token: token.trim() });
      // 이제 비로소 로그인 상태로 들어감
      await signIn({
        accessToken,
        refreshToken,
        user: signupUser ?? { email, nickname },
      });
      navigation.replace('PartnerConnect', { wizardMode: true, profile });
    } catch (err) {
      setError(err?.message || '인증 토큰이 올바르지 않아요.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      await resendEmailVerification({ email });
      setInfo('인증 메일을 다시 보냈어요. 메일함을 확인해주세요.');
      setCooldown(RESEND_COOLDOWN_SEC);
    } catch (err) {
      setError(err?.message || '메일을 다시 보내지 못했어요.');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="이메일 인증" showBack onBack={() => navigation.goBack()} />

      <View style={styles.progressWrap}>
        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, styles.progressFilled]} />
          <View style={[styles.progressSegment, styles.progressFilled]} />
          <View style={[styles.progressSegment, styles.progressFilled]} />
        </View>
        <Text style={styles.progressLabel}>3 / 3</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>메일함을 확인해주세요 📬</Text>
        <Text style={styles.subtitle}>
          <Text style={styles.emailEmphasis}>{email}</Text>
          {'\n'}으로 인증 토큰을 보냈어요. 메일 본문의 토큰을 그대로 복사해
          아래에 붙여넣어주세요.
        </Text>

        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>인증 토큰</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={token}
              onChangeText={setToken}
              placeholder="이메일에 적힌 인증 토큰을 입력하세요"
              placeholderTextColor={colors.inkMute}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              multiline
            />
          </View>
        </View>

        {!!info && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{info}</Text>
          </View>
        )}
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>메일이 안 왔나요?</Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={cooldown > 0 || resending}
            hitSlop={8}
          >
            <Text
              style={[
                styles.resendLink,
                (cooldown > 0 || resending) && styles.resendLinkDisabled,
              ]}
            >
              {resending
                ? '전송 중…'
                : cooldown > 0
                  ? `다시 받기 (${cooldown}s)`
                  : '다시 받기'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            메일이 보이지 않으면 스팸함도 확인해주세요. 토큰은 30분 후 만료돼요.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <View style={styles.btnWrap}>
          <Button
            title={verifying ? '확인 중…' : '인증 완료'}
            onPress={canVerify ? handleVerify : undefined}
            style={[!canVerify && styles.btnDisabled]}
          />
          {verifying && (
            <View style={styles.btnSpinner} pointerEvents="none">
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}
        </View>
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

  title: { fontSize: 22, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },
  subtitle: { marginTop: 8, fontSize: 13, color: colors.ink3, lineHeight: 20 },
  emailEmphasis: { fontWeight: '700', color: colors.ink },

  fieldSection: { marginTop: 28 },
  fieldLabel: { fontSize: 12, color: colors.ink3, fontWeight: '600', marginBottom: 8 },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 64,
  },
  input: {
    fontSize: 14,
    color: colors.ink,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    paddingVertical: 0,
  },

  infoBox: {
    marginTop: 12,
    backgroundColor: '#EFF7FF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  infoText: { fontSize: 12, color: '#1B4F8A' },
  errorBox: {
    marginTop: 12,
    backgroundColor: '#FFF0F2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  errorText: { fontSize: 12, color: colors.heartRed, fontWeight: '600' },

  resendRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resendLabel: { fontSize: 12, color: colors.ink3 },
  resendLink: { fontSize: 12, color: colors.heartRed, fontWeight: '700' },
  resendLinkDisabled: { color: colors.inkMute },

  tipCard: {
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
  tipIcon: { fontSize: 14, lineHeight: 18 },
  tipText: { flex: 1, fontSize: 11, color: colors.ink, lineHeight: 18 },

  bottomSection: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8 },
  btnWrap: { position: 'relative' },
  btnDisabled: { opacity: 0.5 },
  btnSpinner: {
    position: 'absolute',
    right: 18,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
