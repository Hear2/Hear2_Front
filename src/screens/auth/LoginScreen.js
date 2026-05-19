import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import colors from '../../constants/colors';
import Heart from '../../components/common/Heart';
import Button from '../../components/common/Button';
import {
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  loginWithKakao as loginWithKakaoRequest,
} from '../../api/authAPI';
import { useAuth } from '../../contexts/AuthContext';
import endpoints from '../../constants/endpoints';

// OAuth 결과를 받기 위해 웹 브라우저 세션을 마무리.
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_OAUTH_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
const KAKAO_AUTH_URL = 'https://kauth.kakao.com/oauth/authorize';
const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';

// Expo Go에서 OAuth 동작을 위한 프록시 URL.
// Google/Kakao 콘솔 모두에 이 URL을 redirect URI로 등록해야 함.
// 프로덕션(dev client 또는 standalone)에서는 scheme=hear2 기반 URL 사용 권장.
const EXPO_AUTH_PROXY_URL = 'https://auth.expo.io/@anonymous/hear2-app';

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

const AppleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="#FFFFFF">
    <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </Svg>
);

const KakaoIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M12 3C6.48 3 2 6.36 2 10.5c0 2.67 1.74 5.01 4.36 6.37-.14.51-.91 3.3-.94 3.52 0 0-.02.16.08.22.1.06.22.01.22.01.29-.04 3.38-2.22 3.92-2.6.76.11 1.55.17 2.36.17 5.52 0 10-3.36 10-7.5S17.52 3 12 3z"
      fill="#3C1E1E"
    />
  </Svg>
);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' | 'kakao' | null
  const [error, setError] = useState(null);
  const { signIn, loadMe } = useAuth();

  // Google OAuth: id_token 흐름 (백엔드 GoogleOAuthLoginRequest에 idToken 필드)
  // Expo Go에서는 프록시 URL을 redirectUri로 사용
  const [googleRequest, googleResponse, promptGoogle] = Google.useAuthRequest({
    clientId: GOOGLE_OAUTH_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: EXPO_AUTH_PROXY_URL,
  });

  // Kakao OAuth: REST 흐름. 프록시 URL 사용 (Kakao 콘솔에 등록 필요).
  const kakaoRedirectUri = EXPO_AUTH_PROXY_URL;

  const routeAfterSignIn = (connected) => {
    if (connected) {
      navigation
        .getParent()
        ?.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } else {
      // 같은 Auth 스택 안에서 연결 화면으로 이동 — 연결 성공 전엔 이탈 불가
      navigation.replace('PartnerConnect');
    }
  };

  // Google 응답 처리: id_token이 들어오면 백엔드로 전달
  useEffect(() => {
    if (!googleResponse) return;
    if (googleResponse.type !== 'success') {
      if (googleResponse.type === 'error') {
        setError(googleResponse.error?.message || 'Google 로그인이 실패했어요.');
      }
      setOauthLoading(null);
      return;
    }
    const idToken =
      googleResponse.authentication?.idToken ?? googleResponse.params?.id_token;
    if (!idToken) {
      setError('Google ID 토큰을 받지 못했어요.');
      setOauthLoading(null);
      return;
    }
    (async () => {
      try {
        const res = await loginWithGoogleRequest({ idToken });
        await signIn({
          accessToken: res?.accessToken,
          refreshToken: res?.refreshToken,
          user: res?.user,
        });
        const me = await loadMe?.();
        routeAfterSignIn(!!me?.coupleId || !!res?.user?.coupleId);
      } catch (err) {
        setError(err?.message || 'Google 로그인이 실패했어요.');
      } finally {
        setOauthLoading(null);
      }
    })();
  }, [googleResponse]);

  const handleGoogleLogin = async () => {
    if (oauthLoading) return;
    setError(null);
    if (!googleRequest) {
      setError('Google 로그인을 준비 중이에요. 잠시 후 다시 시도해주세요.');
      return;
    }
    setOauthLoading('google');
    await promptGoogle();
  };

  const handleKakaoLogin = async () => {
    if (oauthLoading) return;
    setError(null);
    if (!KAKAO_REST_API_KEY) {
      setError('Kakao 설정이 누락됐어요.');
      return;
    }
    setOauthLoading('kakao');
    try {
      // 1) authorize → code
      const authUrl =
        `${KAKAO_AUTH_URL}?response_type=code` +
        `&client_id=${encodeURIComponent(KAKAO_REST_API_KEY)}` +
        `&redirect_uri=${encodeURIComponent(kakaoRedirectUri)}`;
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        kakaoRedirectUri,
      );
      if (result.type !== 'success' || !result.url) {
        if (result.type === 'cancel' || result.type === 'dismiss') {
          // 사용자 취소 — 에러 표기 안 함
        } else {
          setError('카카오 로그인이 실패했어요.');
        }
        return;
      }
      const codeMatch = result.url.match(/[?&]code=([^&]+)/);
      const code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;
      if (!code) {
        setError('카카오 인가 코드를 받지 못했어요.');
        return;
      }
      // 2) code → access_token (Kakao token endpoint 직접 호출)
      const body =
        `grant_type=authorization_code` +
        `&client_id=${encodeURIComponent(KAKAO_REST_API_KEY)}` +
        `&redirect_uri=${encodeURIComponent(kakaoRedirectUri)}` +
        `&code=${encodeURIComponent(code)}`;
      const tokenRes = await fetch(KAKAO_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        body,
      });
      const tokenJson = await tokenRes.json();
      if (!tokenRes.ok || !tokenJson?.access_token) {
        setError(
          tokenJson?.error_description ||
            '카카오 토큰을 받지 못했어요.',
        );
        return;
      }
      // 3) 백엔드에 access_token 전달
      const res = await loginWithKakaoRequest({
        accessToken: tokenJson.access_token,
      });
      await signIn({
        accessToken: res?.accessToken,
        refreshToken: res?.refreshToken,
        user: res?.user,
      });
      const me = await loadMe?.();
      routeAfterSignIn(!!me?.coupleId || !!res?.user?.coupleId);
    } catch (err) {
      setError(err?.message || '카카오 로그인이 실패했어요.');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleLogin = async () => {
    if (loading) return;
    setError(null);

    // MOCK 모드면 즉시 통과 (백엔드 실서버 전 임시)
    if (endpoints.MOCK) {
      // MOCK 로그인은 항상 "미연결" 상태로 시작 — 연결 흐름 테스트 가능
      await signIn({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { email, nickname: '예진' /* coupleId 없음 → 미연결 */ },
      });
      routeAfterSignIn(false);
      return;
    }

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginRequest({ email, password });
      await signIn({
        accessToken: res?.accessToken,
        refreshToken: res?.refreshToken,
      });
      // 토큰 저장 후 /me로 프로필 동기화 — coupleId 여부로 분기
      const me = await loadMe?.();
      routeAfterSignIn(!!me?.coupleId);
    } catch (err) {
      setError(err?.message || '로그인에 실패했어요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <Heart size={48} color={colors.rose} />
          <View style={styles.logoTextRow}>
            <Text style={styles.logoText}>Hear</Text>
            <Text style={styles.logoText2}>2</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{'안녕하세요,\n오늘도 좋은 하루 보내세요'}</Text>
        <Text style={styles.subtitle}>로그인하고 우리의 이야기를 시작해요 🌸</Text>

        {/* Inputs */}
        <View style={styles.inputSection}>
          <View
            style={[
              styles.inputWrapper,
              emailFocused && styles.inputWrapperFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="name@email.com"
              placeholderTextColor={colors.inkMute}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          <View
            style={[
              styles.inputWrapper,
              passwordFocused && styles.inputWrapperFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor={colors.inkMute}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>
        </View>

        {/* Error */}
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Login Button */}
        <View style={styles.loginBtnWrap}>
          <Button
            title={loading ? '로그인 중…' : '로그인'}
            onPress={loading ? undefined : handleLogin}
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          />
          {loading && (
            <View style={styles.loginSpinner} pointerEvents="none">
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <TouchableOpacity
          style={[
            styles.socialBtnGoogle,
            oauthLoading === 'google' && styles.socialBtnLoading,
          ]}
          activeOpacity={0.8}
          onPress={oauthLoading ? undefined : handleGoogleLogin}
          disabled={!!oauthLoading}
        >
          {oauthLoading === 'google' ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <>
              <GoogleIcon />
              <Text style={styles.socialTextDark}>Google로 계속하기</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtnApple} activeOpacity={0.8} disabled>
          <AppleIcon />
          <Text style={styles.socialTextLight}>Apple로 계속하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.socialBtnKakao,
            oauthLoading === 'kakao' && styles.socialBtnLoading,
          ]}
          activeOpacity={0.8}
          onPress={oauthLoading ? undefined : handleKakaoLogin}
          disabled={!!oauthLoading}
        >
          {oauthLoading === 'kakao' ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <>
              <KakaoIcon />
              <Text style={styles.socialTextDark}>카카오로 계속하기</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Sign up link */}
        <View style={styles.signupRow}>
          <Text style={styles.signupLabel}>처음이신가요? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignupStep1')}>
            <Text style={styles.signupLink}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
  },
  logoText2: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.rose,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.ink3,
    marginBottom: 28,
  },
  inputSection: {
    gap: 12,
    marginBottom: 20,
  },
  inputWrapper: {
    backgroundColor: colors.bgInput,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputWrapperFocused: {
    borderColor: colors.pink,
    backgroundColor: '#FFF',
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.ink,
  },
  loginBtnWrap: {
    position: 'relative',
    marginBottom: 24,
  },
  loginBtn: {
    marginBottom: 0,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginSpinner: {
    position: 'absolute',
    right: 18,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorBox: {
    backgroundColor: '#FFF0F2',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: colors.heartRed,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: colors.inkMute,
  },
  socialBtnGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
    gap: 10,
  },
  socialBtnApple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1E2152',
    marginBottom: 10,
    gap: 10,
  },
  socialBtnKakao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FEE500',
    marginBottom: 24,
    gap: 10,
  },
  socialBtnLoading: {
    opacity: 0.7,
  },
  socialTextDark: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  socialTextLight: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLabel: {
    fontSize: 14,
    color: colors.ink3,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.pink,
  },
});

export default LoginScreen;
