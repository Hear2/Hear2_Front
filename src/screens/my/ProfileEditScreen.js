import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import colors from '../../constants/colors';
import endpoints from '../../constants/endpoints';
import SettingsShell from './SettingsShell';
import CalendarPicker from '../../components/common/CalendarPicker';
import { useAuth } from '../../contexts/AuthContext';
import { givenName } from '../../utils/name';
import { createPresignedUrl, uploadToPresignedUrl } from '../../api/memoryAPI';
import { updateMyProfile } from '../../api/userAPI';

// BE enum ↔ 표시 라벨
const GENDER_OPTIONS = [
  { code: 'FEMALE', label: '여성' },
  { code: 'MALE', label: '남성' },
  { code: 'UNDISCLOSED', label: '비공개' },
];
const genderLabel = (code) =>
  GENDER_OPTIONS.find((g) => g.code === code)?.label ?? code ?? null;

const fmtDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

const ProfileEditScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();

  // 편집 가능한 프로필 필드 (초기값 = 서버 값)
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [birthday, setBirthday] = useState(user?.birthday || null); // 'yyyy-MM-dd'
  const [gender, setGender] = useState(user?.gender || null); // BE enum
  const [intro, setIntro] = useState(user?.intro || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // 편집 UI 상태
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  // 텍스트 입력 모달: { key, label, value, keyboardType? } | null
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');

  // 프로필 사진 (갤러리 업로드)
  const [photoUri, setPhotoUri] = useState(user?.profileImage || null);
  const [photoDirty, setPhotoDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const displayName = nickname || user?.nickname || '나';
  const initial = Array.from(givenName(displayName) || displayName)[0] || '나';

  const openTextEdit = (key, label, value, keyboardType) => {
    setEditField({ key, label, keyboardType });
    setEditValue(value || '');
  };

  const applyTextEdit = () => {
    if (!editField) return;
    const v = editValue.trim();
    if (editField.key === 'nickname') {
      if (!v) {
        Alert.alert('이름은 비울 수 없어요');
        return;
      }
      setNickname(v);
    } else if (editField.key === 'intro') setIntro(v);
    else if (editField.key === 'phone') setPhone(v);
    setEditField(null);
  };

  const FIELDS = [
    {
      key: 'nickname',
      label: '이름',
      value: nickname || '미설정',
      onPress: () => openTextEdit('nickname', '이름', nickname),
    },
    {
      key: 'birthday',
      label: '생년월일',
      value: birthday || '미설정',
      onPress: () => setCalendarOpen(true),
    },
    {
      key: 'gender',
      label: '성별',
      value: gender ? genderLabel(gender) : '미설정',
      onPress: () => setGenderOpen(true),
    },
    {
      key: 'intro',
      label: '한 줄 소개',
      value: intro || '미설정',
      onPress: () => openTextEdit('intro', '한 줄 소개', intro),
    },
    { key: 'email', label: '이메일', value: user?.email || '', locked: true },
    {
      key: 'phone',
      label: '전화번호',
      value: phone || '미설정',
      onPress: () => openTextEdit('phone', '전화번호', phone, 'phone-pad'),
    },
  ];

  const pickPhoto = useCallback(async () => {
    if (saving) return;
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('사진 접근 권한이 필요해요', '설정에서 권한을 허용해주세요.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (asset?.uri) {
        setPhotoUri(asset.uri);
        setPhotoDirty(true);
      }
    } catch (e) {
      Alert.alert('사진을 불러오지 못했어요', e?.message || '');
    }
  }, [saving]);

  const handleSave = useCallback(async () => {
    if (saving) return;

    // 변경된 필드만 PATCH (BE UserProfileUpdateRequest는 보낸 필드만 갱신)
    const payload = {};
    if (nickname.trim() && nickname.trim() !== (user?.nickname || ''))
      payload.nickname = nickname.trim();
    if (birthday && birthday !== (user?.birthday || null))
      payload.birthday = birthday;
    if (gender && gender !== (user?.gender || null)) payload.gender = gender;
    if (intro.trim() !== (user?.intro || '')) payload.intro = intro.trim();
    if (phone.trim() !== (user?.phone || '')) payload.phone = phone.trim();

    const photoChanged = photoDirty && photoUri && photoUri !== user?.profileImage;
    if (Object.keys(payload).length === 0 && !photoChanged) {
      navigation?.goBack();
      return;
    }

    setSaving(true);
    try {
      let localPhotoUri = null;
      if (photoChanged) {
        // HEIC 등 호환을 위해 JPEG 변환 후 presigned 업로드
        let uploadUri = photoUri;
        try {
          const jpeg = await manipulateAsync(photoUri, [], {
            compress: 0.85,
            format: SaveFormat.JPEG,
          });
          uploadUri = jpeg.uri;
        } catch (_) {}
        const presigned = await createPresignedUrl({
          mediaType: 'photo',
          contentType: 'image/jpeg',
          originalFileName: 'profile.jpg',
          purpose: 'profile',
        });
        await uploadToPresignedUrl({
          uploadUrl: presigned.uploadUrl,
          method: presigned.method,
          headers: presigned.headers,
          fileUri: uploadUri,
          contentType: 'image/jpeg',
        });
        payload.profileImage = presigned.objectKey;
        localPhotoUri = uploadUri;
      }

      let updated = null;
      if (endpoints.MOCK) {
        // mock 모드: BE 호출 없이 로컬만 갱신
        updated = payload;
      } else {
        updated = await updateMyProfile(payload);
      }

      // 로컬 즉시 반영. 사진은 서버 resolve URL이 아직 없을 수 있어 로컬 uri 우선.
      updateUser({
        ...(updated || payload),
        ...(localPhotoUri ? { profileImage: localPhotoUri } : {}),
      });
      navigation?.goBack();
    } catch (e) {
      Alert.alert('프로필 저장 실패', e?.message || '잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  }, [
    saving,
    nickname,
    birthday,
    gender,
    intro,
    phone,
    photoDirty,
    photoUri,
    user,
    updateUser,
    navigation,
  ]);

  return (
    <SettingsShell
      navigation={navigation}
      title="프로필 편집"
      rightLabel={saving ? '저장 중…' : '저장'}
      onRightPress={handleSave}
    >
      {/* avatar card */}
      <View style={styles.avatarCard}>
        <TouchableOpacity
          style={styles.avatarWrap}
          activeOpacity={0.85}
          onPress={pickPhoto}
          disabled={saving}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={['#FFE4EE', '#FFB590']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initial}</Text>
            </LinearGradient>
          )}
          <View style={styles.cameraBadge}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.cameraIcon}>📷</Text>
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.tapHint}>탭하여 변경</Text>
      </View>

      {/* fields */}
      <View style={styles.card}>
        {FIELDS.map((f, i, a) => {
          const Wrap = f.locked ? View : TouchableOpacity;
          return (
            <Wrap
              key={f.label}
              style={[styles.row, i < a.length - 1 && styles.divider]}
              activeOpacity={0.7}
              onPress={f.locked ? undefined : f.onPress}
            >
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <Text style={styles.fieldValue} numberOfLines={1}>
                {f.value}
              </Text>
              {f.locked ? (
                <Text style={styles.lockIcon}>🔒</Text>
              ) : (
                <Text style={styles.chevron}>›</Text>
              )}
            </Wrap>
          );
        })}
      </View>

      {/* privacy hint */}
      <View style={styles.hint}>
        <Text style={styles.hintIcon}>💡</Text>
        <Text style={styles.hintText}>
          연인에게는 이름·생일·소개만 보여요. 나머지는 비공개.
        </Text>
      </View>

      {/* 생년월일 달력 */}
      <CalendarPicker
        visible={calendarOpen}
        value={birthday ? new Date(birthday) : new Date(2000, 0, 1)}
        onClose={() => setCalendarOpen(false)}
        onSelect={(d) => {
          setBirthday(fmtDate(d));
          setCalendarOpen(false);
        }}
      />

      {/* 성별 선택 모달 */}
      <Modal
        visible={genderOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setGenderOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setGenderOpen(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>성별</Text>
            {GENDER_OPTIONS.map((g) => {
              const on = gender === g.code;
              return (
                <TouchableOpacity
                  key={g.code}
                  style={[styles.optionRow, on && styles.optionRowOn]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setGender(g.code);
                    setGenderOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, on && styles.optionTextOn]}>
                    {g.label}
                  </Text>
                  {on && <Text style={styles.optionCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 텍스트 입력 모달 (이름/소개/전화번호) */}
      <Modal
        visible={!!editField}
        transparent
        animationType="fade"
        onRequestClose={() => setEditField(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{editField?.label}</Text>
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`${editField?.label || ''} 입력`}
              placeholderTextColor={colors.inkMute}
              keyboardType={editField?.keyboardType || 'default'}
              autoFocus
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancel}
                activeOpacity={0.7}
                onPress={() => setEditField(null)}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmit}
                activeOpacity={0.85}
                onPress={applyTextEdit}
              >
                <Text style={styles.modalSubmitText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SettingsShell>
  );
};

const styles = StyleSheet.create({
  avatarCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4EEF1',
    alignItems: 'center',
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4EEF1',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.pinkDeep,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.heartRed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraIcon: { fontSize: 14 },
  tapHint: { marginTop: 8, fontSize: 11, color: '#888' },

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
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: '#F4EEF1' },
  fieldLabel: {
    width: 80,
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  fieldValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  lockIcon: { fontSize: 12, color: '#999' },
  chevron: { fontSize: 18, color: '#CCC', fontWeight: '600' },

  hint: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFF5F8',
    borderWidth: 1,
    borderColor: '#FFD0E0',
    flexDirection: 'row',
    gap: 8,
  },
  hintIcon: { fontSize: 12 },
  hintText: {
    flex: 1,
    fontSize: 11,
    color: colors.ink,
    lineHeight: 17,
  },

  // 모달 공통
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,33,82,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 14,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.bgInput,
  },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalCancel: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: colors.ink3 },
  modalSubmit: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: colors.pink,
    alignItems: 'center',
  },
  modalSubmitText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  optionRowOn: { backgroundColor: colors.pinkTint },
  optionText: { fontSize: 14, fontWeight: '600', color: colors.ink2 },
  optionTextOn: { color: colors.pinkDeep, fontWeight: '700' },
  optionCheck: { fontSize: 14, fontWeight: '800', color: colors.pinkDeep },
});

export default ProfileEditScreen;
