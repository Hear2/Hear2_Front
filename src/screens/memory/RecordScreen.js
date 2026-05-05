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
import Header from '../../components/common/Header';
import Chip from '../../components/common/Chip';

const AI_TAGS = ['#데이트', '#공원', '#봄'];
const MY_TAGS = ['#우리둘이', '#특별한날'];

export default function RecordScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Header title="3초 기록" showBack onBack={() => navigation?.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Photo Area */}
        <View style={styles.photoWrapper}>
          <LinearGradient
            colors={[colors.pinkSoft, colors.pinkTint]}
            style={styles.photoPlaceholder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.photoEmoji}>🌸</Text>
          </LinearGradient>
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoBtn} activeOpacity={0.7}>
              <Text style={styles.photoBtnText}>📷 다시 촬영</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} activeOpacity={0.7}>
              <Text style={styles.photoBtnText}>🖼 갤러리</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Auto-fill Card */}
        <View style={styles.aiCard}>
          <Text style={styles.aiCardTitle}>✨ AI가 자동으로 채워줬어요</Text>
          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>📍 장소</Text>
            <Text style={styles.aiValue}>서울 마포구 서울숲</Text>
          </View>
          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>🕒 시간</Text>
            <Text style={styles.aiValue}>2026.04.07 오후 3:22</Text>
          </View>
          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>🏷 AI 태그</Text>
            <View style={styles.tagRow}>
              {AI_TAGS.map((t) => (
                <View key={t} style={styles.aiTag}>
                  <Text style={styles.aiTagText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* My Hashtags */}
        <Text style={styles.sectionTitle}>나만의 해시태그</Text>
        <View style={styles.tagRow}>
          {MY_TAGS.map((t) => (
            <View key={t} style={styles.myTag}>
              <Text style={styles.myTagText}>{t}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.addTag} activeOpacity={0.7}>
            <Text style={styles.addTagText}>+ 추가</Text>
          </TouchableOpacity>
        </View>

        {/* Comment Input */}
        <Text style={styles.sectionTitle}>한마디 (선택)</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            placeholder="오늘도 행복한 하루 🌸"
            placeholderTextColor={colors.inkMute}
            multiline
          />
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.pink, colors.pinkDeep]}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaText}>저장하기 (3초 완료!) ✓</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp },
  scroll: { padding: 20, paddingBottom: 40 },

  photoWrapper: { marginBottom: 20 },
  photoPlaceholder: { height: 170, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  photoEmoji: { fontSize: 48 },
  photoButtons: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: -20 },
  photoBtn: { backgroundColor: colors.bgApp, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: colors.line, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  photoBtnText: { fontSize: 13, fontWeight: '600', color: colors.ink2 },

  aiCard: { backgroundColor: colors.greenTint, borderRadius: 16, padding: 18, marginBottom: 20 },
  aiCardTitle: { fontSize: 15, fontWeight: '700', color: colors.green, marginBottom: 14 },
  aiRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  aiLabel: { fontSize: 12, color: colors.ink3, width: 60 },
  aiValue: { fontSize: 14, color: colors.ink2, fontWeight: '500' },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  aiTag: { backgroundColor: colors.green + '20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  aiTagText: { fontSize: 12, color: colors.green, fontWeight: '600' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 10, marginTop: 12 },

  myTag: { backgroundColor: colors.blueTint, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  myTagText: { fontSize: 13, color: colors.blue, fontWeight: '600' },
  addTag: { borderRadius: 10, borderWidth: 1.5, borderColor: colors.line, borderStyle: 'dashed', paddingHorizontal: 12, paddingVertical: 6 },
  addTagText: { fontSize: 13, color: colors.inkMute, fontWeight: '600' },

  inputBox: { backgroundColor: colors.bgInput, borderRadius: 14, padding: 14, marginBottom: 24, minHeight: 52 },
  textInput: { fontSize: 14, color: colors.ink2, lineHeight: 20 },

  ctaButton: { borderRadius: 14, overflow: 'hidden' },
  ctaGradient: { paddingVertical: 16, alignItems: 'center' },
  ctaText: { fontSize: 16, fontWeight: '700', color: colors.bgApp },
});
