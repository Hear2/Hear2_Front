import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';
import Heart from '../../components/common/Heart';
import { useCouple } from '../../contexts/CoupleContext';

const Toggle = ({ on, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[
      styles.toggle,
      { backgroundColor: on ? colors.pink : '#E0E0E0' },
    ]}
  >
    <View style={[styles.toggleKnob, on ? { right: 2 } : { left: 2 }]} />
  </TouchableOpacity>
);

const SectionLabel = ({ children }) => (
  <Text style={styles.sectionLabel}>{children}</Text>
);

const Card = ({ children }) => <View style={styles.card}>{children}</View>;

const Row = ({
  icon,
  label,
  value,
  toggle,
  onToggle,
  onPress,
  danger,
  last,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={[styles.row, !last && styles.rowDivider]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: danger ? '#FFF0F0' : colors.pinkTint },
        ]}
      >
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text
        style={[
          styles.label,
          danger && { color: colors.heartRed, fontWeight: '600' },
        ]}
      >
        {label}
      </Text>
      {toggle !== undefined ? (
        <Toggle on={toggle} onPress={onToggle} />
      ) : value ? (
        <Text style={styles.value}>{value}</Text>
      ) : !danger ? (
        <Text style={styles.chevron}>›</Text>
      ) : null}
    </Wrapper>
  );
};

const SettingsScreen = ({ navigation }) => {
  const { anniversaries } = useCouple();
  const annCount = anniversaries.length;
  const [toggles, setToggles] = useState({
    chat: true,
    qa: true,
    yearAgo: true,
    location: false,
    appLock: true,
    locationShare: true,
  });

  const flip = (key) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFAFC', '#FFF5F8']}
        style={StyleSheet.absoluteFill}
      />
      <LovelyBackground intensity={0.4} hearts={false} sparkles={false} />

      <Header
        title="설정"
        showBack
        onBack={() => navigation?.goBack()}
        right={
          <TouchableOpacity hitSlop={8}>
            <Text style={styles.moreIcon}>⋯</Text>
          </TouchableOpacity>
        }
        style={{ backgroundColor: 'transparent' }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* profile card */}
        <LinearGradient
          colors={['#FFF5F8', '#FFE4EE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>예</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>예진</Text>
            <Text style={styles.profileSub}>
              yejin@hear2.app · ♥ 지호와 485일
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editPill}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate('ProfileEditScreen')}
          >
            <Text style={styles.editPillText}>프로필 편집</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* couple */}
        <SectionLabel>연인</SectionLabel>
        <Card>
          <Row
            icon="💞"
            label="커플 관리"
            value={`지호 · ${annCount}개 기념일`}
            onPress={() => navigation?.navigate('CoupleManageScreen')}
            last
          />
        </Card>

        {/* notifications */}
        <SectionLabel>알림</SectionLabel>
        <Card>
          <Row
            icon="💬"
            label="채팅 알림"
            toggle={toggles.chat}
            onToggle={() => flip('chat')}
          />
          <Row
            icon="❓"
            label="데일리 Q&A 알림"
            toggle={toggles.qa}
            onToggle={() => flip('qa')}
          />
          <Row
            icon="🌸"
            label="1년 전 오늘 알림"
            toggle={toggles.yearAgo}
            onToggle={() => flip('yearAgo')}
          />
          <Row
            icon="📍"
            label="위치 공유 알림"
            toggle={toggles.location}
            onToggle={() => flip('location')}
          />
          <Row
            icon="🌙"
            label="방해금지 시간"
            value="23:00~07:00"
            onPress={() => {}}
            last
          />
        </Card>

        {/* privacy & security */}
        <SectionLabel>개인정보·보안</SectionLabel>
        <Card>
          <Row
            icon="🔒"
            label="앱 잠금 (Face ID)"
            toggle={toggles.appLock}
            onToggle={() => flip('appLock')}
          />
          <Row
            icon="📍"
            label="위치 공유"
            toggle={toggles.locationShare}
            onToggle={() => flip('locationShare')}
          />
          <Row
            icon="🔐"
            label="비밀번호 변경"
            onPress={() => navigation?.navigate('PasswordChangeScreen')}
          />
          <Row
            icon="📋"
            label="데이터 다운로드"
            onPress={() => navigation?.navigate('DataDownloadScreen')}
            last
          />
        </Card>

        {/* general */}
        <SectionLabel>일반</SectionLabel>
        <Card>
          <Row icon="🎨" label="테마" value="라이트" onPress={() => {}} />
          <Row icon="🌐" label="언어" value="한국어" onPress={() => {}} />
          <Row
            icon="❓"
            label="도움말·문의"
            onPress={() => navigation?.navigate('HelpScreen')}
          />
          <Row
            icon="📜"
            label="이용약관"
            onPress={() => navigation?.navigate('TermsScreen')}
          />
          <Row
            icon="ℹ️"
            label="버전 정보"
            value="1.0.0"
            onPress={() => navigation?.navigate('VersionScreen')}
            last
          />
        </Card>

        {/* danger zone */}
        <View style={{ marginTop: 18 }}>
          <Card>
            <Row
              icon="🚪"
              label="로그아웃"
              danger
              onPress={() => navigation?.navigate('LogoutScreen')}
            />
            <Row
              icon="💔"
              label="연인 연결 해제"
              danger
              onPress={() => navigation?.navigate('UnlinkScreen')}
            />
            <Row
              icon="🗑️"
              label="계정 삭제"
              danger
              onPress={() => navigation?.navigate('DeleteAccountScreen')}
              last
            />
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>made with </Text>
          <Heart size={11} color={colors.heartRed} />
          <Text style={styles.footerText}> for couples</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFAFC' },
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  moreIcon: {
    fontSize: 22,
    color: colors.ink,
    fontWeight: '700',
    lineHeight: 22,
  },

  profileCard: {
    marginTop: 6,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD0E0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.pinkDeep, fontWeight: '800', fontSize: 18 },
  profileName: { fontSize: 14, fontWeight: '800', color: colors.ink },
  profileSub: { fontSize: 11, color: '#888', marginTop: 2 },
  editPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  editPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.heartRed,
  },

  sectionLabel: {
    marginTop: 18,
    paddingHorizontal: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  card: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F4EEF1',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 16 },
  label: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
    fontWeight: '500',
  },
  value: { fontSize: 12, color: '#999' },
  chevron: { fontSize: 18, color: '#CCC', fontWeight: '600' },

  toggle: {
    width: 36,
    height: 20,
    borderRadius: 999,
    justifyContent: 'center',
  },
  toggleKnob: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },

  footer: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: { fontSize: 11, color: '#BBB' },
});

export default SettingsScreen;
