import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import colors from '../../constants/colors';
import SettingsShell from './SettingsShell';

const TABS = [
  { id: 'tos', label: '이용약관' },
  { id: 'privacy', label: '개인정보 처리방침' },
  { id: 'location', label: '위치정보 처리방침' },
  { id: 'oss', label: '오픈소스 라이선스' },
];

const SECTIONS = {
  tos: [
    {
      title: '제 1 조 (목적)',
      body: '본 약관은 Hear2(이하 "회사")가 제공하는 커플 커뮤니케이션 서비스의 이용 조건 및 절차, 이용자와 회사의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.',
    },
    {
      title: '제 2 조 (정의)',
      body: '① "서비스"란 회사가 제공하는 모바일 앱 및 관련 부가 서비스를 의미합니다.\n② "이용자"란 본 약관에 동의하고 서비스를 이용하는 개인을 말합니다.\n③ "커플"이란 상호 동의 하에 연결된 두 명의 이용자를 의미합니다.',
    },
    {
      title: '제 3 조 (약관의 효력 및 변경)',
      body: '본 약관은 서비스 화면 게시 또는 기타 방법으로 공지함으로써 효력을 발생합니다…',
    },
  ],
  privacy: [
    {
      title: '제 1 조 (개인정보 수집 항목)',
      body: '회사는 회원가입, 서비스 제공을 위해 필요한 최소한의 정보만을 수집합니다…',
    },
  ],
  location: [
    {
      title: '제 1 조 (위치정보의 이용 목적)',
      body: '회사는 이용자의 동의 하에 위치 공유 기능 제공을 위해서만 위치정보를 처리합니다…',
    },
  ],
  oss: [
    {
      title: 'Open Source Licenses',
      body: 'React Native (MIT)\nExpo (MIT)\nReact Navigation (MIT)\n…',
    },
  ],
};

const TermsScreen = ({ navigation }) => {
  const [tab, setTab] = useState('tos');
  const sections = SECTIONS[tab] ?? [];

  return (
    <SettingsShell navigation={navigation} title="이용약관">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {TABS.map((t) => {
          const on = t.id === tab;
          return (
            <TouchableOpacity
              key={t.id}
              activeOpacity={0.8}
              onPress={() => setTab(t.id)}
              style={[
                styles.tab,
                { backgroundColor: on ? colors.heartRed : '#F5F5F5' },
              ]}
            >
              <Text style={[styles.tabText, on && { color: '#FFFFFF' }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.docCard}>
        {sections.map((s, i) => (
          <View key={s.title} style={{ marginTop: i === 0 ? 0 : 14 }}>
            <Text style={styles.docTitle}>{s.title}</Text>
            <Text style={styles.docBody}>{s.body}</Text>
          </View>
        ))}
        <Text style={styles.docFooter}>최종 개정일 2026.04.01</Text>
      </View>
    </SettingsShell>
  );
};

const styles = StyleSheet.create({
  tabsRow: {
    paddingVertical: 8,
    gap: 6,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tabText: { fontSize: 11, fontWeight: '700', color: '#666' },

  docCard: {
    marginTop: 4,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
  },
  docTitle: { fontSize: 13, fontWeight: '800', color: colors.ink },
  docBody: {
    marginTop: 6,
    fontSize: 11,
    color: '#555',
    lineHeight: 19,
  },
  docFooter: {
    marginTop: 18,
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
});

export default TermsScreen;
