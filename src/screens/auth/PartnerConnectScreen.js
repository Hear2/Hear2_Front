import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import colors from '../../constants/colors';
import Heart from '../../components/common/Heart';
import LovelyBackground from '../../components/common/LovelyBackground';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

const { width } = Dimensions.get('window');

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

const INVITE_CODE = ['L', 'O', 'V', 'E', '7', '7'];

const PartnerConnectScreen = ({ navigation }) => {
  const [partnerCode, setPartnerCode] = useState('');

  const handleCopy = () => {
    // TODO: copy to clipboard
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Hear2에서 함께해요! 초대 코드: ${INVITE_CODE.join('')}`,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleConnect = () => {
    // TODO: validate and connect partner
    navigation.replace('Main');
  };

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
        title="연결하기"
        showBack
        onBack={() => navigation.goBack()}
        style={styles.header}
      />

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

        {/* Title */}
        <Text style={styles.title}>연인을 초대해주세요</Text>
        <Text style={styles.subtitle}>아래 코드를 공유하거나 직접 입력하세요</Text>

        {/* Invite code card */}
        <View style={styles.codeCard}>
          <LinearGradient
            colors={[colors.pinkTint, '#FFE8F0']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.codeRow}>
            {INVITE_CODE.map((char, index) => (
              <View key={index} style={styles.codeBox}>
                <Text style={styles.codeChar}>{char}</Text>
              </View>
            ))}
          </View>

          {/* Copy + Share buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              <CopyIcon />
              <Text style={styles.copyText}>복사하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              activeOpacity={0.7}
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
        </View>

        {/* Or section */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는 받은 코드 입력</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Partner code input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={partnerCode}
            onChangeText={setPartnerCode}
            placeholder="초대 코드 입력"
            placeholderTextColor={colors.inkMute}
            maxLength={6}
            autoCapitalize="characters"
          />
        </View>

        {partnerCode.length === 6 && (
          <Button
            title="연결하기"
            onPress={handleConnect}
            style={styles.connectBtn}
          />
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
  },
  codeCard: {
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  codeBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
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
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
    fontFamily: Platform?.OS === 'ios' ? 'Courier' : 'monospace',
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
    marginHorizontal: 14,
    fontSize: 13,
    color: colors.inkMute,
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
    letterSpacing: 8,
  },
  connectBtn: {
    marginTop: 16,
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
