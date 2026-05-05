import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';

const MOOD_CONFIG = {
  pos: { label: '긍정', bg: colors.greenTint, color: colors.green },
  neg: { label: '부정', bg: colors.pinkTint, color: colors.pink },
  neu: { label: '중립', bg: colors.yellowTint, color: colors.yellow },
};

export default function MessageBubble({ text, isMine, mood, score, time, avatar }) {
  const moodCfg = mood ? MOOD_CONFIG[mood] : null;

  if (isMine) {
    return (
      <View style={styles.mineWrapper}>
        {time ? <Text style={styles.time}>{time}</Text> : null}
        <LinearGradient
          colors={[colors.pink, colors.pinkDeep]}
          style={styles.mineBubble}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.mineText}>{text}</Text>
        </LinearGradient>
        {moodCfg && score != null ? (
          <View style={[styles.moodChip, { backgroundColor: moodCfg.bg }]}>
            <Text style={[styles.moodText, { color: moodCfg.color }]}>
              {moodCfg.label} {score}%
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.theirWrapper}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{avatar || '👤'}</Text>
      </View>
      <View style={styles.theirContent}>
        {time ? <Text style={styles.time}>{time}</Text> : null}
        <View style={styles.theirBubble}>
          <Text style={styles.theirText}>{text}</Text>
        </View>
        {moodCfg && score != null ? (
          <View style={[styles.moodChip, { backgroundColor: moodCfg.bg }]}>
            <Text style={[styles.moodText, { color: moodCfg.color }]}>
              {moodCfg.label} {score}%
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Mine */
  mineWrapper: { alignItems: 'flex-end', marginBottom: 12, paddingLeft: 48 },
  mineBubble: {
    borderRadius: 18,
    borderTopRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  mineText: { fontSize: 15, color: colors.bgApp, lineHeight: 22 },

  /* Theirs */
  theirWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, paddingRight: 48 },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.line2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 20,
  },
  avatarText: { fontSize: 16 },
  theirContent: { flex: 1 },
  theirBubble: {
    backgroundColor: colors.bgApp,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    borderTopLeftRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  theirText: { fontSize: 15, color: colors.ink, lineHeight: 22 },

  /* Shared */
  time: { fontSize: 10, color: colors.inkMute, marginBottom: 4 },
  moodChip: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  moodText: { fontSize: 11, fontWeight: '600' },
});
