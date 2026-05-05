import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import colors from '../../constants/colors';
import Heart from '../../components/common/Heart';
import Button from '../../components/common/Button';

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

  const handleLogin = () => {
    // TODO: implement login logic
    navigation.replace('Main');
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

        {/* Login Button */}
        <Button title="로그인" onPress={handleLogin} style={styles.loginBtn} />

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <TouchableOpacity style={styles.socialBtnGoogle} activeOpacity={0.8}>
          <GoogleIcon />
          <Text style={styles.socialTextDark}>Google로 계속하기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtnApple} activeOpacity={0.8}>
          <AppleIcon />
          <Text style={styles.socialTextLight}>Apple로 계속하기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtnKakao} activeOpacity={0.8}>
          <KakaoIcon />
          <Text style={styles.socialTextDark}>카카오로 계속하기</Text>
        </TouchableOpacity>

        {/* Sign up link */}
        <View style={styles.signupRow}>
          <Text style={styles.signupLabel}>처음이신가요? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
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
  loginBtn: {
    marginBottom: 24,
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
