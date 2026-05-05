import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PINK = '#FF6B9D';
const PINK_TINT = '#FDF0F5';
const INK = '#1E2152';
const INK_MUTE = '#AAAAAA';

export default function PhotoUpload({ navigation }) {
  const [caption, setCaption] = useState('');
  const [photoSelected, setPhotoSelected] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>사진 추가</Text>
        <TouchableOpacity
          style={[styles.saveBtn, !photoSelected && styles.saveBtnDisabled]}
          disabled={!photoSelected}
        >
          <Text
            style={[
              styles.saveText,
              !photoSelected && styles.saveTextDisabled,
            ]}
          >
            저장
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Photo placeholder */}
        <TouchableOpacity
          style={styles.photoArea}
          onPress={() => setPhotoSelected(true)}
          activeOpacity={0.7}
        >
          {photoSelected ? (
            <View style={styles.photoPreview}>
              <Text style={styles.previewIcon}>🖼️</Text>
              <Text style={styles.previewText}>사진이 선택되었습니다</Text>
            </View>
          ) : (
            <View style={styles.photoEmpty}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.photoEmptyText}>
                탭하여 사진을 추가하세요
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Camera / Gallery buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.pickButton}
            onPress={() => setPhotoSelected(true)}
          >
            <Text style={styles.pickIcon}>📸</Text>
            <Text style={styles.pickText}>카메라</Text>
          </TouchableOpacity>
          <View style={styles.buttonGap} />
          <TouchableOpacity
            style={styles.pickButton}
            onPress={() => setPhotoSelected(true)}
          >
            <Text style={styles.pickIcon}>🖼️</Text>
            <Text style={styles.pickText}>갤러리</Text>
          </TouchableOpacity>
        </View>

        {/* Caption input */}
        <View style={styles.captionContainer}>
          <Text style={styles.captionLabel}>한 줄 메모</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="이 순간을 기록해보세요..."
            placeholderTextColor={INK_MUTE}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={100}
          />
          <Text style={styles.charCount}>{caption.length}/100</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 28,
    color: INK,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: PINK,
  },
  saveBtnDisabled: {
    backgroundColor: '#F0F0F0',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveTextDisabled: {
    color: INK_MUTE,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  photoArea: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: PINK_TINT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0E0E8',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  photoEmpty: {
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  photoEmptyText: {
    fontSize: 15,
    color: INK_MUTE,
  },
  photoPreview: {
    alignItems: 'center',
  },
  previewIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  previewText: {
    fontSize: 15,
    color: PINK,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  pickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PINK_TINT,
    borderRadius: 14,
    paddingVertical: 14,
  },
  buttonGap: {
    width: 12,
  },
  pickIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  pickText: {
    fontSize: 15,
    fontWeight: '600',
    color: INK,
  },
  captionContainer: {
    marginBottom: 20,
  },
  captionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: INK,
    marginBottom: 10,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: INK,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: INK_MUTE,
    textAlign: 'right',
    marginTop: 6,
  },
});
