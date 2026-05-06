import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import Chip from '../../components/common/Chip';

const VOICE_BAR_HEIGHTS = [
  6, 14, 10, 18, 22, 14, 8, 16, 20, 24, 18, 12,
  8, 14, 22, 18,
];

const messages = [
  {
    id: 1,
    from: 'them',
    text: '오늘 뭐 먹을까요? 🍕',
    mood: 'pos',
    moodPct: 82,
    moodColor: colors.green,
    moodLabel: '긍정 82%',
  },
  {
    id: 2,
    from: 'me',
    text: '파스타 어때? 맛집 찾았어!',
    mood: 'pos',
    moodPct: 91,
    moodColor: colors.green,
    moodLabel: '긍정 91%',
  },
  {
    id: 3,
    from: 'them',
    text: '거기 웨이팅 길잖아',
    mood: 'neutral',
    moodPct: 45,
    moodColor: colors.yellow,
    moodLabel: '중립 45%',
  },
  {
    id: 4,
    from: 'me',
    text: '예약하면 되잖아.\n왜 맨날 부정적이야?',
    mood: 'neg',
    moodPct: 72,
    moodColor: colors.pink,
    moodLabel: '부정 72%',
  },
];

const ChatScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Chat Header */}
      <View style={styles.header}>
        <View style={styles.headerProfile}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>예</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>지호</Text>
            <Text style={styles.headerStatus}>온라인</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation?.navigate('AIJudgeModal')}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Chip label="AI판사" variant="pink" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.chatBody} contentContainerStyle={styles.chatContent}>
        {/* Date Divider */}
        <View style={styles.dateDivider}>
          <View style={styles.dateLine} />
          <Text style={styles.dateText}>오늘</Text>
          <View style={styles.dateLine} />
        </View>

        {/* Messages */}
        {messages.map((msg) => {
          const isMe = msg.from === 'me';
          return (
            <View
              key={msg.id}
              style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}
            >
              {!isMe && (
                <View style={styles.msgAvatar}>
                  <Text style={styles.msgAvatarText}>예</Text>
                </View>
              )}
              <View style={styles.msgGroup}>
                {isMe ? (
                  <LinearGradient
                    colors={[colors.pink, colors.pinkSoft]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.bubble, styles.bubbleMe]}
                  >
                    <Text style={[styles.bubbleText, styles.bubbleTextMe]}>
                      {msg.text}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.bubble, styles.bubbleThem]}>
                    <Text style={styles.bubbleText}>{msg.text}</Text>
                  </View>
                )}
                <View style={[styles.moodChipWrap, isMe && { alignSelf: 'flex-end' }]}>
                  <View style={[styles.moodChip, { backgroundColor: msg.moodColor + '20' }]}>
                    <View style={[styles.moodDot, { backgroundColor: msg.moodColor }]} />
                    <Text style={[styles.moodChipText, { color: msg.moodColor }]}>
                      {msg.moodLabel}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>⚠ 부정 감정이 증가 중이에요</Text>
          <TouchableOpacity
            style={styles.warningBtn}
            onPress={() => navigation?.navigate('AIJudgeModal')}
            activeOpacity={0.8}
          >
            <Text style={styles.warningBtnText}>AI 판사 호출</Text>
          </TouchableOpacity>
        </View>

        {/* Voice Message */}
        <View style={[styles.msgRow, styles.msgRowMe]}>
          <View style={styles.msgGroup}>
            <LinearGradient
              colors={[colors.pink, colors.pinkSoft]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.voiceBubble}
            >
              <TouchableOpacity hitSlop={6} style={styles.voicePlayBtn}>
                <Text style={styles.voicePlayIcon}>▶</Text>
              </TouchableOpacity>
              <View style={styles.voiceWaveform}>
                {VOICE_BAR_HEIGHTS.map((h, i) => (
                  <View
                    key={i}
                    style={[styles.voiceWaveBar, { height: h }]}
                  />
                ))}
              </View>
              <Text style={styles.voiceDuration}>0:08</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.plusBtn}>
          <Text style={styles.plusBtnText}>+</Text>
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.textInput}
            placeholder="메시지 입력..."
            placeholderTextColor={colors.inkMute}
          />
          <TouchableOpacity style={styles.inputIcon}>
            <Text style={styles.inputIconText}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputIcon}>
            <Text style={styles.inputIconText}>🎤</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.sendBtn}>
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
    backgroundColor: colors.bgApp,
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.bgApp,
  },
  headerInfo: {
    marginLeft: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  headerStatus: {
    fontSize: 12,
    color: colors.green,
    fontWeight: '500',
  },
  // Chat Body
  chatBody: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dateText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: colors.inkMute,
    fontWeight: '500',
  },
  // Messages
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowThem: {
    justifyContent: 'flex-start',
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  msgAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  msgGroup: {
    maxWidth: '72%',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleThem: {
    backgroundColor: colors.bgSoft,
    borderTopLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: colors.pink,
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
  },
  bubbleTextMe: {
    color: '#FFFFFF',
  },
  moodChipWrap: {
    marginTop: 4,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  moodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  moodChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.pinkTint,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.pinkSoft,
  },
  warningText: {
    fontSize: 13,
    color: colors.pinkDeep,
    fontWeight: '600',
    flex: 1,
  },
  warningBtn: {
    backgroundColor: colors.pink,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  warningBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Voice Message
  voiceBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderTopRightRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 200,
  },
  voicePlayBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  voicePlayIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 2,
  },
  voiceWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    marginRight: 10,
    overflow: 'hidden',
  },
  voiceWaveBar: {
    width: 2.5,
    marginHorizontal: 1.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  voiceDuration: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'right',
  },
  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line2,
    backgroundColor: colors.bgApp,
  },
  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  plusBtnText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '300',
    marginTop: -1,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 0,
  },
  inputIcon: {
    marginLeft: 6,
  },
  inputIconText: {
    fontSize: 18,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -1,
  },
});

export default ChatScreen;
