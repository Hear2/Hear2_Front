import React, { useState, useEffect, useRef } from 'react';
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
import Svg, { Path } from 'react-native-svg';
import colors from '../../constants/colors';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

const CalendarIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5z"
      stroke={colors.ink3}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.695 13.7h.009M15.695 16.7h.009M11.995 13.7h.01M11.995 16.7h.01M8.295 13.7h.01M8.295 16.7h.01"
      stroke={colors.ink3}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SignupScreen = ({ navigation }) => {
  const [nickname, setNickname] = useState('예진');
  const [birthday] = useState('1998년 5월 12일');
  const [gender, setGender] = useState('여성');
  const wiggle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Wave emoji wiggle animation
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(wiggle, {
          toValue: -1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(wiggle, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const wiggleRotate = wiggle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const handleNext = () => {
    navigation.navigate('PartnerConnect');
  };

  const genderOptions = ['여성', '남성', '비공개'];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="회원가입"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.progressFilled]} />
            <View style={[styles.progressSegment, styles.progressFilled]} />
            <View style={[styles.progressSegment, styles.progressEmpty]} />
          </View>
          <Text style={styles.progressLabel}>2 / 3</Text>
        </View>

        {/* Title with wave emoji */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>당신을 어떻게 부를까요? </Text>
          <Animated.Text
            style={[
              styles.waveEmoji,
              { transform: [{ rotate: wiggleRotate }] },
            ]}
          >
            👋
          </Animated.Text>
        </View>
        <Text style={styles.subtitle}>연인에게 보일 닉네임이에요</Text>

        {/* Nickname input */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>닉네임</Text>
          <View style={styles.nicknameInputWrapper}>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor={colors.inkMute}
            />
          </View>
          <View style={styles.validationRow}>
            <Text style={styles.checkMark}>✓</Text>
            <Text style={styles.validText}> 사용 가능</Text>
          </View>
        </View>

        {/* Birthday input */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>생년월일</Text>
          <TouchableOpacity style={styles.birthdayInput} activeOpacity={0.7}>
            <Text style={styles.birthdayText}>{birthday}</Text>
            <CalendarIcon />
          </TouchableOpacity>
        </View>

        {/* Gender selector */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>성별</Text>
          <View style={styles.genderRow}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderBtn,
                  gender === option && styles.genderBtnActive,
                ]}
                onPress={() => setGender(option)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === option && styles.genderTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomSection}>
        <Button title="다음" onPress={handleNext} />
      </View>
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
    paddingTop: 8,
    paddingBottom: 24,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressFilled: {
    backgroundColor: colors.pink,
  },
  progressEmpty: {
    backgroundColor: colors.pinkTint,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
  },
  waveEmoji: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 14,
    color: colors.ink3,
    marginBottom: 32,
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
  nicknameInputWrapper: {
    backgroundColor: colors.bgInput,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.pink,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.ink,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  checkMark: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.green,
  },
  validText: {
    fontSize: 13,
    color: colors.green,
    fontWeight: '500',
  },
  birthdayInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    backgroundColor: colors.bgInput,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  birthdayText: {
    fontSize: 15,
    color: colors.ink,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgInput,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  genderBtnActive: {
    backgroundColor: colors.pinkTint,
    borderColor: colors.pink,
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink3,
  },
  genderTextActive: {
    color: colors.pink,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
});

export default SignupScreen;
