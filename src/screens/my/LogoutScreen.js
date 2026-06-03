import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';

const LogoutScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { signOut, user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const dismiss = () => {
    if (!signingOut) navigation?.goBack();
  };

  const handleConfirm = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      // signOut 실패해도 화면은 닫고 로그인으로 이동
    }
    // LogoutScreen은 RootNavigator 직속 modal이라 navigation === root.
    // getParent() 호출 시 undefined가 돼서 reset이 안 되므로 직접 호출.
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth', params: { screen: 'Login' } }],
    });
  };

  const accountLabel = user?.email
    ? `${user?.nickname ?? user.email} · ${user.email}`
    : (user?.nickname ?? '내 계정');

  return (
    <View style={styles.container}>
      <Pressable style={styles.scrim} onPress={dismiss} />

      <View style={[styles.sheet, { paddingBottom: 28 + insets.bottom }]}>
        <View style={styles.handle} />

        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Text style={{ fontSize: 28 }}>🚪</Text>
          </View>
          <Text style={styles.title}>로그아웃 하시겠어요?</Text>
          <Text style={styles.subtitle}>
            다시 로그인하면 그대로{'\n'}연인과의 추억을 만날 수 있어요 💕
          </Text>
        </View>

        <View style={styles.accountRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.nickname?.[0] ?? '나').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.accountText}>{accountLabel}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.cancelBtn]}
            activeOpacity={0.85}
            onPress={dismiss}
            disabled={signingOut}
          >
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.confirmBtn]}
            activeOpacity={0.85}
            onPress={handleConfirm}
            disabled={signingOut}
          >
            {signingOut ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmText}>로그아웃</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 18,
  },

  hero: { alignItems: 'center' },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },

  accountRow: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF5F8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.pinkDeep, fontWeight: '800', fontSize: 14 },
  accountText: { flex: 1, fontSize: 11, color: colors.ink },

  actions: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { backgroundColor: '#F5F5F5' },
  cancelText: { color: '#555', fontSize: 14, fontWeight: '800' },
  confirmBtn: { backgroundColor: colors.ink },
  confirmText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default LogoutScreen;
