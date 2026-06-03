import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import colors from '../../constants/colors';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

// 소셜 로그인(구글/카카오)으로 처음 들어온 유저는 닉네임이 없거나
// 이메일로 채워진 채 생성된다. 이 화면에서 표시용 닉네임을 받는다.
// (현재 BE에 프로필 수정 API가 없어 로컬에만 저장 — BE 엔드포인트 추가 시 연동)
export default function NicknameSetupScreen({ navigation, route }) {
  const connected = !!route?.params?.connected;
  const { user, updateUser } = useAuth();
  const [nickname, setNickname] = useState('');
  const [focused, setFocused] = useState(false);

  const trimmed = nickname.trim();
  const canSubmit = trimmed.length >= 1 && trimmed.length <= 20;

  const proceed = () => {
    if (connected) {
      navigation
        .getParent()
        ?.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } else {
      navigation.replace('PartnerConnect');
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    updateUser({ nickname: trimmed });
    proceed();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="닉네임 설정" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.body}>
          <View style={styles.emojiWrap}>
            <Text style={styles.emoji}>💕</Text>
          </View>
          <Text style={styles.title}>어떻게 불러드릴까요?</Text>
          <Text style={styles.subtitle}>연인에게 보일 닉네임이에요</Text>

          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>닉네임</Text>
            <View
              style={[
                styles.inputWrapper,
                focused && styles.inputWrapperFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="닉네임을 입력하세요"
                placeholderTextColor={colors.inkMute}
                maxLength={20}
                autoFocus
                returnKeyType="done"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSubmitEditing={handleSubmit}
              />
            </View>
            <Text style={styles.helper}>
              {user?.email ? `${user.email} 계정` : '최대 20자'}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.bottomSection}>
        <Button
          title="시작하기"
          onPress={canSubmit ? handleSubmit : undefined}
          style={!canSubmit && styles.btnDisabled}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  emojiWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.ink3,
    textAlign: 'center',
    marginBottom: 36,
  },
  fieldSection: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink2,
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: colors.bgInput,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputWrapperFocused: {
    borderColor: colors.pink,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.ink,
  },
  helper: {
    fontSize: 12,
    color: colors.inkMute,
    marginTop: 6,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  btnDisabled: { opacity: 0.5 },
});
