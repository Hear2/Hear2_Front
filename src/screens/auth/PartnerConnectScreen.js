import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Dimensions,
  Platform,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import Svg, { Path } from 'react-native-svg';
import colors from '../../constants/colors';
import Heart from '../../components/common/Heart';
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import {
  createCoupleCode,
  fetchCoupleStatus,
} from '../../api/coupleAPI';
import endpoints from '../../constants/endpoints';

// 백엔드 커플 코드: 8자, [A-HJ-NP-Z2-9] (O/0/I/1 제외)
const CODE_LENGTH = 8;
const STATUS_POLL_INTERVAL_MS = 5000;

const { width } = Dimensions.get('window');

// 모드: 'select' (어떤 방식으로 진행할지 선택), 'create' (내 코드 발급), 'join' (받은 코드 입력)
const MODE_SELECT = 'select';
const MODE_CREATE = 'create';
const MODE_JOIN = 'join';

const CopyIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 12.9v4.2c0 3.5-1.4 4.9-4.9 4.9H6.9C3.4 22 2 20.6 2 17.1v-4.2C2 9.4 3.4 8 6.9 8h4.2c3.5 0 4.9 1.4 4.9 4.9z"
      stroke={colors.pink}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 6.9v4.2c0 3.5-1.4 4.9-4.9 4.9H16v-3.1C16 9.4 14.6 8 11.1 8H8V6.9C8 3.4 9.4 2 12.9 2h4.2C20.6 2 22 3.4 22 6.9z"
      stroke={colors.pink}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShareIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
      stroke="#FFFFFF"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const padCode = (code) => {
  const chars = (code ?? '').toUpperCase().split('');
  while (chars.length < CODE_LENGTH) chars.push('');
  return chars.slice(0, CODE_LENGTH);
};

const sanitizeInput = (raw) =>
  (raw ?? '')
    .toUpperCase()
    .replace(/[^A-HJ-NP-Z2-9]/g, '')
    .slice(0, CODE_LENGTH);

const PartnerConnectScreen = ({ navigation, route }) => {
  const wizardMode = !!route?.params?.wizardMode;
  const [mode, setMode] = useState(MODE_SELECT);
  const [partnerCode, setPartnerCode] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  // 본인 코드 (OWNER일 때) — BE에서 받아옴
  const [myCode, setMyCode] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [creatingCode, setCreatingCode] = useState(false);
  const [codeError, setCodeError] = useState(null);

  const { confirmPartner, refreshCoupleStatus, signOut } = useAuth();

  // 커플 연결을 못 한 채 막혀버리는 경우를 위한 비상구.
  // signOut으로 토큰을 비우고, AuthStack의 첫 화면(Onboarding)으로 리셋한다.
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } finally {
      navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    }
  }, [signOut, navigation]);
  const pollRef = useRef(null);

  // 커플 연결 직후엔 바로 "사귄 날" 입력 화면(기념일 추가, 사귄날 프리셋)을 띄운다.
  // MainTabs(홈)를 베이스로 깔고 그 위에 모달로 올려서, 입력/취소하면 홈으로 돌아오게 한다.
  const goToCoupleStart = useCallback(() => {
    navigation.getParent()?.reset({
      index: 1,
      routes: [
        { name: 'MainTabs' },
        { name: 'AnniversaryAddScreen', params: { onboarding: true } },
      ],
    });
  }, [navigation]);

  // 화면 진입 시: 연결 상태만 확인. 자동 코드 발급은 하지 않는다.
  // - connected → 메인 탭으로
  // - 이미 발급해둔 본인 코드가 있으면 → 발급 모드로 복원
  // - 그 외 → 선택 모드 유지
  const checkStatus = useCallback(async () => {
    setCodeError(null);
    if (endpoints.MOCK) {
      setInitializing(false);
      return;
    }
    setInitializing(true);
    try {
      const status = await fetchCoupleStatus();
      if (status?.connected) {
        navigation
          .getParent()
          ?.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        return;
      }
      if (status?.coupleCode) {
        setMyCode(status.coupleCode);
        setMode(MODE_CREATE);
      }
    } catch (err) {
      setCodeError(err?.message || '상태를 확인하지 못했어요.');
    } finally {
      setInitializing(false);
    }
  }, [navigation]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // 본인 코드 발급 후, 파트너가 합류했는지 주기적으로 확인 (5초)
  useEffect(() => {
    if (endpoints.MOCK || !myCode) return undefined;
    pollRef.current = setInterval(async () => {
      const status = await refreshCoupleStatus();
      if (status?.connected) {
        clearInterval(pollRef.current);
        pollRef.current = null;
        goToCoupleStart();
      }
    }, STATUS_POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [myCode, refreshCoupleStatus, navigation, goToCoupleStart]);

  // 회원가입 마지막 단계에선 back 허용. 로그인 후 미연결 진입(잠금 모드)에선 차단.
  useEffect(() => {
    if (wizardMode) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [wizardMode]);

  useEffect(() => {
    if (wizardMode) {
      navigation.setOptions?.({ gestureEnabled: true });
    } else {
      navigation.setOptions?.({ gestureEnabled: false, headerLeft: () => null });
    }
  }, [navigation, wizardMode]);

  const handleSelectCreate = useCallback(async () => {
    setCodeError(null);
    if (endpoints.MOCK) {
      setMyCode('LOVE7777');
      setMode(MODE_CREATE);
      return;
    }
    setCreatingCode(true);
    try {
      const created = await createCoupleCode();
      setMyCode(created?.coupleCode ?? null);
      setMode(MODE_CREATE);
    } catch (err) {
      setCodeError(err?.message || '초대 코드를 발급하지 못했어요.');
    } finally {
      setCreatingCode(false);
    }
  }, []);

  const handleSelectJoin = useCallback(() => {
    setError(null);
    setMode(MODE_JOIN);
  }, []);

  const handleBackToSelect = useCallback(() => {
    setError(null);
    setPartnerCode('');
    setMode(MODE_SELECT);
  }, []);

  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!myCode) return;
    try {
      await Clipboard.setStringAsync(myCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      // 실패해도 사용자 흐름은 막지 않음
    }
  };

  const handleShare = async () => {
    if (!myCode) return;
    try {
      await Share.share({
        message: `Hear2에서 함께해요! 초대 코드: ${myCode}`,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleConnect = async () => {
    if (connecting) return;
    setError(null);
    setConnecting(true);
    try {
      const res = await confirmPartner({ code: partnerCode });
      if (!res?.ok) {
        setError(res?.message || '연결에 실패했어요. 코드를 확인해주세요.');
        return;
      }
      // 성공 — Auth 스택 제거하고, 홈 위에 "사귄 날 입력" 화면을 띄운다.
      goToCoupleStart();
    } catch (err) {
      setError(err?.message || '연결 중 오류가 발생했어요.');
    } finally {
      setConnecting(false);
    }
  };

  const codeDisplay = padCode(myCode);
  const canConnect = partnerCode.length === CODE_LENGTH;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFAFC', '#FFF0F6']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <LovelyBackground intensity={0.6} hearts sparkles blobs />

      <Header
        title={wizardMode ? '회원가입' : '연결하기'}
        showBack={wizardMode}
        onBack={wizardMode ? () => navigation.goBack() : undefined}
        right={
          wizardMode ? undefined : (
            <TouchableOpacity onPress={handleSignOut} hitSlop={10}>
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          )
        }
        style={styles.header}
      />

      {wizardMode && (
        <View style={styles.progressWrap}>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.progressFilled]} />
            <View style={[styles.progressSegment, styles.progressFilled]} />
            <View style={[styles.progressSegment, styles.progressFilled]} />
          </View>
          <Text style={styles.progressLabel}>3 / 3 · 마지막 단계</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatars section */}
        <View style={styles.avatarsSection}>
          {/* Aurora glow */}
          <View style={styles.auroraGlow}>
            <LinearGradient
              colors={['rgba(255,107,157,0.15)', 'rgba(77,150,255,0.1)', 'transparent']}
              style={styles.auroraGradient}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            />
          </View>

          {/* My avatar */}
          <View style={styles.avatarMine}>
            <Text style={styles.avatarText}>예</Text>
          </View>

          {/* Pulsing heart between */}
          <View style={styles.heartBetween}>
            <Heart size={32} color={colors.rose} pulse />
            <Text style={[styles.sparkleSmall, { position: 'absolute', top: -8, right: -6 }]}>✦</Text>
            <Text style={[styles.sparkleSmall, { position: 'absolute', bottom: -6, left: -4 }]}>✧</Text>
          </View>

          {/* Partner avatar */}
          <View style={styles.avatarPartner}>
            <Text style={styles.avatarTextPartner}>?</Text>
          </View>
        </View>

        {initializing ? (
          <View style={styles.initLoading}>
            <ActivityIndicator color={colors.pink} />
            <Text style={styles.initLoadingText}>잠시만요…</Text>
          </View>
        ) : mode === MODE_SELECT ? (
          <>
            <Text style={styles.title}>연인과 어떻게 연결할까요?</Text>
            <Text style={styles.subtitle}>
              둘 중 한 명이 코드를 발급하고, 다른 한 명이 그 코드로 연결합니다
            </Text>

            <TouchableOpacity
              style={[styles.choiceCard, creatingCode && styles.choiceCardDisabled]}
              onPress={creatingCode ? undefined : handleSelectCreate}
              activeOpacity={0.85}
              disabled={creatingCode}
            >
              <LinearGradient
                colors={[colors.pinkTint, '#FFE8F0']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.choiceIconWrap}>
                <Text style={styles.choiceIcon}>💌</Text>
              </View>
              <View style={styles.choiceTextWrap}>
                <Text style={styles.choiceTitle}>커플 코드 발급하기</Text>
                <Text style={styles.choiceDesc}>
                  내가 코드를 만들어 연인에게 공유할게요
                </Text>
              </View>
              {creatingCode && (
                <ActivityIndicator color={colors.pink} style={styles.choiceSpinner} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.choiceCard}
              onPress={handleSelectJoin}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#EAF3FF', '#F5F9FF']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={[styles.choiceIconWrap, styles.choiceIconWrapBlue]}>
                <Text style={styles.choiceIcon}>🔑</Text>
              </View>
              <View style={styles.choiceTextWrap}>
                <Text style={styles.choiceTitle}>받은 코드 입력하기</Text>
                <Text style={styles.choiceDesc}>
                  연인이 보내준 코드로 연결할게요
                </Text>
              </View>
            </TouchableOpacity>

            {!!codeError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{codeError}</Text>
              </View>
            )}
          </>
        ) : mode === MODE_CREATE ? (
          <>
            <Text style={styles.title}>연인을 초대해주세요</Text>
            <Text style={styles.subtitle}>
              아래 코드를 연인에게 공유해주세요
            </Text>

            <View style={styles.codeCard}>
              <LinearGradient
                colors={[colors.pinkTint, '#FFE8F0']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              {!myCode ? (
                <View style={styles.codeLoading}>
                  <ActivityIndicator color={colors.pink} />
                  <Text style={styles.codeLoadingText}>초대 코드를 발급 중…</Text>
                </View>
              ) : codeError ? (
                <View style={styles.codeErrorBox}>
                  <Text style={styles.codeErrorText}>{codeError}</Text>
                  <TouchableOpacity onPress={handleSelectCreate} hitSlop={8}>
                    <Text style={styles.codeRetry}>다시 시도</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.codeRow}>
                    {codeDisplay.map((char, index) => (
                      <View key={index} style={styles.codeBox}>
                        <Text style={styles.codeChar}>{char || ' '}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Copy + Share buttons */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.copyBtn, !myCode && styles.btnDisabled]}
                      onPress={myCode ? handleCopy : undefined}
                      activeOpacity={0.7}
                      disabled={!myCode}
                    >
                      <CopyIcon />
                      <Text style={styles.copyText}>
                        {copied ? '복사됨 ✓' : '복사하기'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.shareBtn, !myCode && styles.btnDisabled]}
                      onPress={myCode ? handleShare : undefined}
                      activeOpacity={0.7}
                      disabled={!myCode}
                    >
                      <LinearGradient
                        colors={[colors.pink, colors.rose]}
                        style={styles.shareBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <ShareIcon />
                        <Text style={styles.shareText}>공유하기</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            <Text style={styles.waitingHint}>
              연인이 코드를 입력하면 자동으로 연결돼요
            </Text>

            <TouchableOpacity
              style={styles.altModeBtn}
              onPress={handleBackToSelect}
              hitSlop={8}
            >
              <Text style={styles.altModeText}>
                다른 방법으로 연결하기
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>받은 코드를 입력해주세요</Text>
            <Text style={styles.subtitle}>
              연인이 발급한 8자리 코드를 입력하세요
            </Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={partnerCode}
                onChangeText={(v) => setPartnerCode(sanitizeInput(v))}
                placeholder="초대 코드 8자리"
                placeholderTextColor={colors.inkMute}
                maxLength={CODE_LENGTH}
                autoCapitalize="characters"
                autoCorrect={false}
                autoFocus
              />
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.connectBtnWrap}>
              <Button
                title={connecting ? '연결 중…' : '연결하기'}
                onPress={connecting || !canConnect ? undefined : handleConnect}
                style={[
                  styles.connectBtn,
                  (!canConnect || connecting) && styles.connectBtnDisabled,
                ]}
              />
              {connecting && (
                <View style={styles.connectSpinner} pointerEvents="none">
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.altModeBtn}
              onPress={handleBackToSelect}
              hitSlop={8}
            >
              <Text style={styles.altModeText}>
                다른 방법으로 연결하기
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Bottom security note */}
      <View style={styles.bottomNote}>
        <Text style={styles.noteText}>
          🔒 두 사람만 연결되며, 모든 대화는 암호화됩니다
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink3 ?? '#888',
  },
  progressWrap: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 4 },
  progressBar: { flexDirection: 'row', gap: 6 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  progressFilled: { backgroundColor: colors.pink },
  progressLabel: { marginTop: 6, fontSize: 12, color: colors.inkMute },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },
  avatarsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    marginTop: 12,
    gap: 16,
  },
  auroraGlow: {
    position: 'absolute',
    width: 240,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  auroraGradient: {
    flex: 1,
  },
  avatarMine: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.pinkTint,
    borderWidth: 3,
    borderColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.pink,
  },
  heartBetween: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleSmall: {
    fontSize: 10,
    color: colors.pinkSoft,
  },
  avatarPartner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.blueTint,
    borderWidth: 3,
    borderColor: colors.blue,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextPartner: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.blue,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.ink3,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  initLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  initLoadingText: {
    fontSize: 13,
    color: colors.ink3,
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    marginBottom: 14,
    minHeight: 96,
  },
  choiceCardDisabled: {
    opacity: 0.65,
  },
  choiceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: colors.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  choiceIconWrapBlue: {
    shadowColor: colors.blue,
  },
  choiceIcon: {
    fontSize: 28,
  },
  choiceTextWrap: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 4,
  },
  choiceDesc: {
    fontSize: 13,
    color: colors.ink3,
    lineHeight: 18,
  },
  choiceSpinner: {
    marginLeft: 8,
  },
  codeCard: {
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
    marginBottom: 16,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  codeBox: {
    width: 36,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  codeChar: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    fontFamily: Platform?.OS === 'ios' ? 'Courier' : 'monospace',
  },
  codeLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 10,
  },
  codeLoadingText: {
    fontSize: 13,
    color: colors.ink3,
  },
  codeErrorBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  codeErrorText: {
    fontSize: 13,
    color: colors.heartRed,
    fontWeight: '600',
    textAlign: 'center',
  },
  codeRetry: {
    fontSize: 13,
    color: colors.pink,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.pink,
    gap: 6,
  },
  copyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.pink,
  },
  shareBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shareBtnGradient: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  waitingHint: {
    fontSize: 13,
    color: colors.ink3,
    textAlign: 'center',
    marginBottom: 8,
  },
  altModeBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  altModeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.pink,
    textDecorationLine: 'underline',
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: 6,
    fontFamily: Platform?.OS === 'ios' ? 'Courier' : 'monospace',
  },
  connectBtnWrap: {
    position: 'relative',
    marginTop: 16,
  },
  connectBtn: {
    marginTop: 0,
  },
  connectBtnDisabled: {
    opacity: 0.7,
  },
  connectSpinner: {
    position: 'absolute',
    right: 18,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorBox: {
    marginTop: 12,
    backgroundColor: '#FFF0F2',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  errorText: {
    fontSize: 13,
    color: colors.heartRed,
    textAlign: 'center',
  },
  bottomNote: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255,250,252,0.95)',
  },
  noteText: {
    fontSize: 12,
    color: colors.ink3,
    textAlign: 'center',
  },
});

export default PartnerConnectScreen;
