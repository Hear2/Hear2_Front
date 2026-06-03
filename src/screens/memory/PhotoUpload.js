import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
// expo-file-system v19+ 에서 readAsStringAsync/EncodingType은 legacy 서브패스로 이동됨
import * as FileSystem from 'expo-file-system/legacy';
import piexif from 'piexifjs';
import colors from '../../constants/colors';
import { useMemories } from '../../contexts/MemoryContext';
import CalendarPicker from '../../components/common/CalendarPicker';
import LocationPicker from '../../components/common/LocationPicker';
import {
  createPresignedUrl,
  uploadToPresignedUrl,
  createQuickMemory,
  updateQuickMemory,
  deleteMemory as apiDeleteMemory,
} from '../../api/memoryAPI';
import { ApiError } from '../../api/client';

const DOW_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const formatDate = (d) =>
  `${d.getMonth() + 1}.${d.getDate()} (${DOW_LABELS[d.getDay()]})`;

const GRID_PAD = 16;
const GRID_GAP = 4;
const GRID_COLS = 3;

const MOOD_TO_GROUP = {
  love: 'love',
  happy: 'happy',
  peace: 'peace',
  calm: 'peace',
  flutter: 'love',
};

const SOURCES = [
  { key: 'gallery', label: '갤러리', icon: '🖼️' },
  { key: 'camera', label: '카메라', icon: '📷' },
  { key: 'drive', label: '드라이브', icon: '☁️' },
];

const TAG_OPTIONS = [
  { id: 'date', label: '데이트', defaultOn: true },
  { id: 'spring', label: '봄', defaultOn: true },
  { id: 'walk', label: '산책', defaultOn: true },
  { id: 'food', label: '음식' },
  { id: 'travel', label: '여행' },
];

const MOODS = [
  { id: 'love', emoji: '🥰', label: '사랑' },
  { id: 'happy', emoji: '😊', label: '행복' },
  { id: 'peace', emoji: '🌅', label: '평화' },
  { id: 'calm', emoji: '😌', label: '편안' },
  { id: 'flutter', emoji: '✨', label: '설렘' },
];

// 디자인 미리보기용 이모지 placeholder. 실제 갤러리에서 사진을 고르기 전까지 그리드를 채워둔다.
const PLACEHOLDER_LIBRARY = [
  { id: 'ph1', kind: 'mock', emoji: '🌸', tint: '#FFE4EE',         location: { icon: '🌸', name: '서울숲' } },
  { id: 'ph2', kind: 'mock', emoji: '☕', tint: '#FFE4EE',         location: { icon: '☕', name: '망원동 카페' } },
  { id: 'ph3', kind: 'mock', emoji: '🍜', tint: colors.yellowTint, location: { icon: '🍜', name: '신촌' } },
  { id: 'ph4', kind: 'mock', emoji: '🎂', tint: colors.yellowTint, location: { icon: '🏠', name: '집' } },
  { id: 'ph5', kind: 'mock', emoji: '🌅', tint: '#FFF0E5',         location: { icon: '🌊', name: '해운대' } },
  { id: 'ph6', kind: 'mock', emoji: '🎡', tint: '#FFE4EE',         location: { icon: '🎡', name: '롯데월드' } },
  { id: 'ph7', kind: 'mock', emoji: '🍰', tint: colors.yellowTint, location: { icon: '🍰', name: '연남동' } },
  { id: 'ph8', kind: 'mock', emoji: '🌺', tint: '#FFE4EE',         location: { icon: '🌴', name: '제주도' } },
  { id: 'ph9', kind: 'mock', emoji: '🍻', tint: '#FFF0E5',         location: { icon: '🍻', name: '강남역' } },
];

// label("#봄") → 슬러그("봄"). BE는 # 없이 받음.
const stripHash = (s) => (s || '').replace(/^#+/, '').trim();

// expo-media-library asset → 우리 library 아이템.
// MediaLibrary.Asset에는 EXIF GPS가 location.{latitude,longitude}로 노출됨 (권한 있을 때).
function mediaAssetToPhotoItem(asset, fullInfo = null) {
  const filename = asset.filename || `${asset.id}.jpg`;
  const ext = filename.split('.').pop().toLowerCase();
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const location = fullInfo?.location ?? asset.location ?? null;
  const exif = fullInfo?.exif ?? null;
  return {
    id: `ml-${asset.id}`,
    kind: 'photo',
    // 안드로이드는 content:// uri, iOS는 ph:// uri를 줄 수 있음.
    // FileSystem/fetch가 content:// 는 가능하지만 ph:// 는 안 되므로 localUri 우선 사용.
    uri: fullInfo?.localUri || asset.uri,
    width: asset.width,
    height: asset.height,
    mimeType: mime,
    fileName: filename,
    // GPS/촬영시각은 EXIF에 의존하지 않고 media-library 메타데이터 우선 사용
    location, // { latitude, longitude }
    creationTime: asset.creationTime, // ms epoch
    exif,
  };
}

// expo-image-picker asset → 우리 library 아이템
function assetToPhotoItem(asset, idx = 0) {
  const ext = (asset.fileName || asset.uri || '').split('.').pop() || 'jpg';
  const mime =
    asset.mimeType || (ext.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg');
  return {
    id: `photo-${Date.now()}-${idx}`,
    kind: 'photo',
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    mimeType: mime,
    fileName: asset.fileName || `memory-${Date.now()}-${idx}.${ext}`,
    exif: asset.exif || null,
  };
}

// piexifjs의 GPSIFD 키들로 EXIF GPS를 decimal degrees로 변환.
function piexifGpsToDecimal(gpsIfd) {
  if (!gpsIfd) return { lat: null, lng: null };
  const latArr = gpsIfd[piexif.GPSIFD.GPSLatitude];
  const lngArr = gpsIfd[piexif.GPSIFD.GPSLongitude];
  const latRef = gpsIfd[piexif.GPSIFD.GPSLatitudeRef];
  const lngRef = gpsIfd[piexif.GPSIFD.GPSLongitudeRef];
  if (!latArr || !lngArr) return { lat: null, lng: null };
  // 각 원소가 [num, den] 형태의 rational.
  const ratToDeg = (arr, ref) => {
    const [d, m, s] = arr.map(([n, dn]) => (dn === 0 ? 0 : n / dn));
    let val = d + m / 60 + s / 3600;
    if (ref === 'S' || ref === 'W') val = -val;
    return val;
  };
  return {
    lat: ratToDeg(latArr, latRef),
    lng: ratToDeg(lngArr, lngRef),
  };
}

// exifr는 HEIC/HEIF/JPEG/PNG/TIFF/AVIF 등 다양한 컨테이너의 EXIF/GPS를 읽는 순수 JS 파서로,
// piexifjs(JPEG/TIFF 전용)가 HEIC를 거부하는 문제를 메운다. 단, exifr는 모듈 로드 시
// navigator.userAgent.includes(...)로 브라우저(Safari) 환경을 탐지하는데, RN/Hermes에는
// navigator.userAgent가 없어 import 시점에 "Cannot read property 'includes' of undefined"로
// 앱 전체가 크래시한다. 그래서 (1) userAgent를 빈 문자열로 폴리필하고 (2) 정적 import 대신
// 폴리필 이후 lazy require로 로드한다.
if (typeof navigator !== 'undefined' && navigator.userAgent == null) {
  try {
    navigator.userAgent = '';
  } catch (_) {
    // navigator가 확장 불가하면 무시 — exifr 미사용, piexifjs 폴백으로 동작.
  }
}
let _exifr = null; // null=미로드, false=로드실패, object=모듈
function loadExifr() {
  if (_exifr === null) {
    try {
      _exifr = require('exifr');
    } catch (e) {
      _exifr = false;
      if (__DEV__) console.log('[PhotoUpload] exifr load failed:', e?.message);
    }
  }
  return _exifr || null;
}

// base64 → Uint8Array (Hermes-safe, atob 비의존). exifr가 typed array를 직접 파싱.
const B64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function base64ToUint8Array(base64) {
  const clean = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const len = clean.length;
  const bytes = new Uint8Array((len * 3) >> 2);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const e0 = B64_CHARS.indexOf(clean[i]);
    const e1 = B64_CHARS.indexOf(clean[i + 1]);
    const e2 = i + 2 < len ? B64_CHARS.indexOf(clean[i + 2]) : -1;
    const e3 = i + 3 < len ? B64_CHARS.indexOf(clean[i + 3]) : -1;
    bytes[p++] = (e0 << 2) | (e1 >> 4);
    if (e2 !== -1) bytes[p++] = ((e1 & 15) << 4) | (e2 >> 2);
    if (e3 !== -1) bytes[p++] = ((e2 & 3) << 6) | e3;
  }
  return p === bytes.length ? bytes : bytes.subarray(0, p);
}

// EXIF 날짜("yyyy:MM:dd HH:mm:ss" 문자열) 또는 Date → ISO 문자열.
function exifDateToIso(value) {
  if (!value) return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  const iso = String(value).replace(/^(\d{4}):(\d{2}):(\d{2}) /, '$1-$2-$3T');
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// exifr 병합 출력에서 lat/lng/촬영시각 정규화.
function normalizeExifrOutput(out) {
  let lat = Number.isFinite(out?.latitude) ? out.latitude : null;
  let lng = Number.isFinite(out?.longitude) ? out.longitude : null;
  // 좌표가 모두 0이면 GPS 없는 사진. null로 처리.
  if (lat === 0 && lng === 0) {
    lat = null;
    lng = null;
  }
  const capturedAt = exifDateToIso(
    out?.DateTimeOriginal ||
      out?.CreateDate ||
      out?.DateTimeDigitized ||
      out?.ModifyDate,
  );
  return { lat, lng, capturedAt };
}

// 파일 URI에서 EXIF GPS/촬영시각을 직접 읽음.
// Android 13+ 시스템 PhotoPicker가 picker 응답에서 GPS를 제거하므로,
// 파일 바이트를 직접 읽어서 EXIF 헤더를 파싱하는 게 핵심.
// 1차: exifr — HEIC/HEIF/JPEG/PNG/TIFF/AVIF 등 다양한 포맷 지원.
// 2차: piexifjs — JPEG/TIFF 전용 폴백.
async function readExifFromFile(uri) {
  let base64;
  try {
    // expo-file-system은 file:// / content:// URI 모두 base64로 읽을 수 있음
    base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (e) {
    if (__DEV__)
      console.log('[PhotoUpload] readAsStringAsync failed:', e?.message);
    return { lat: null, lng: null, capturedAt: null };
  }

  // 1차: exifr (다양한 포맷). typed array를 직접 넘겨 컨테이너 자동 판별.
  try {
    const exifr = loadExifr();
    if (exifr) {
      const bytes = base64ToUint8Array(base64);
      const out = await exifr.parse(bytes, {
        tiff: true,
        exif: true,
        gps: true,
        // 문자열 디코딩(TextDecoder)이 필요한 블록은 끄고 GPS/날짜만 파싱
        xmp: false,
        icc: false,
        iptc: false,
        jfif: false,
        ihdr: false,
        mergeOutput: true,
      });
      const meta = normalizeExifrOutput(out);
      if (meta.lat != null || meta.lng != null || meta.capturedAt) {
        if (__DEV__) console.log('[PhotoUpload] EXIF via exifr:', meta);
        return meta;
      }
      if (__DEV__) console.log('[PhotoUpload] exifr: no gps/date found');
    }
  } catch (e) {
    if (__DEV__) console.log('[PhotoUpload] exifr parse failed:', e?.message);
  }

  // 2차: piexifjs 폴백 (JPEG/TIFF 전용)
  try {
    // piexif는 jpeg 헤더를 포함한 binary string 또는 data URL을 받음
    const exif = piexif.load('data:image/jpeg;base64,' + base64);
    const { lat, lng } = piexifGpsToDecimal(exif?.GPS);
    let finalLat = Number.isFinite(lat) ? lat : null;
    let finalLng = Number.isFinite(lng) ? lng : null;
    if (finalLat === 0 && finalLng === 0) {
      finalLat = null;
      finalLng = null;
    }
    const capturedAt = exifDateToIso(
      exif?.Exif?.[piexif.ExifIFD.DateTimeOriginal] ||
        exif?.['0th']?.[piexif.ImageIFD.DateTime],
    );
    if (__DEV__) {
      console.log('[PhotoUpload] EXIF via piexifjs:', {
        lat: finalLat,
        lng: finalLng,
        capturedAt,
      });
    }
    return { lat: finalLat, lng: finalLng, capturedAt };
  } catch (e) {
    if (__DEV__)
      console.log('[PhotoUpload] readExifFromFile failed:', e?.message);
    return { lat: null, lng: null, capturedAt: null };
  }
}

// BE MemoryQuickResponse.aiTime: "2026-05-12 14:00" → Date
function parseAiTime(aiTime) {
  if (!aiTime) return null;
  // "yyyy-MM-dd HH:mm" → ISO 보정
  const iso = aiTime.includes('T') ? aiTime : aiTime.replace(' ', 'T') + ':00';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

// EXIF GPS를 decimal degrees로 변환.
// iOS: number(decimal). Android: 문자열 "37/1,13/1,21500/1000" (DMS as rational fractions).
function parseGpsCoord(value) {
  if (value == null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const s = value.trim();
  if (!s) return null;
  // 이미 decimal 문자열인 경우
  const asNum = Number(s);
  if (Number.isFinite(asNum) && !s.includes(',') && !s.includes('/')) {
    return asNum;
  }
  // "37/1,13/1,21500/1000" 형태 — degrees, minutes, seconds (rational)
  const parts = s.split(',').map((p) => p.trim());
  if (parts.length < 2) return null;
  const toDecimal = (frac) => {
    if (!frac) return 0;
    if (frac.includes('/')) {
      const [num, den] = frac.split('/').map(Number);
      if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return 0;
      return num / den;
    }
    const n = Number(frac);
    return Number.isFinite(n) ? n : 0;
  };
  const deg = toDecimal(parts[0]);
  const min = toDecimal(parts[1]);
  const sec = parts[2] ? toDecimal(parts[2]) : 0;
  const dec = deg + min / 60 + sec / 3600;
  return Number.isFinite(dec) ? dec : null;
}

// EXIF에서 lat/lng/촬영시각 추출. 없으면 null.
function exifToMeta(exif) {
  if (!exif) return { lat: null, lng: null, capturedAt: null };

  // expo-image-picker는 플랫폼/버전마다 키 이름·형식이 다르다.
  // iOS:    { GPSLatitude(number), GPSLatitudeRef:"N|S", GPSLongitude(number), GPSLongitudeRef:"E|W", DateTimeOriginal }
  // Android: GPSLatitude/Longitude가 "deg/1,min/1,sec/1000" 문자열일 수 있음. 또 일부 빌드는 latitude/longitude 키로 내려줌.
  const rawLat = exif.GPSLatitude ?? exif.latitude ?? exif.Latitude;
  const rawLng = exif.GPSLongitude ?? exif.longitude ?? exif.Longitude;
  const latRef = exif.GPSLatitudeRef ?? exif.latitudeRef ?? 'N';
  const lngRef = exif.GPSLongitudeRef ?? exif.longitudeRef ?? 'E';

  let lat = parseGpsCoord(rawLat);
  let lng = parseGpsCoord(rawLng);
  if (lat != null && (latRef === 'S' || latRef === 's')) lat = -lat;
  if (lng != null && (lngRef === 'W' || lngRef === 'w')) lng = -lng;
  // 좌표가 모두 0이면 GPS 없는 사진. null로 처리해서 BE가 reverse geocoding 시도하지 않게.
  if (lat === 0 && lng === 0) {
    lat = null;
    lng = null;
  }

  const dto = exif.DateTimeOriginal || exif.DateTime || null;
  let capturedAt = null;
  if (dto) {
    // "2024:05:12 14:00:00" → ISO
    const iso = String(dto).replace(/^(\d{4}):(\d{2}):(\d{2}) /, '$1-$2-$3T');
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) capturedAt = d.toISOString();
  }

  // 디버그: picker가 EXIF 어떻게 주는지 한 번에 보기 (운영에선 콘솔만)
  if (__DEV__) {
    console.log('[PhotoUpload] EXIF parsed:', {
      lat,
      lng,
      capturedAt,
      rawLat,
      rawLng,
      latRef,
      lngRef,
    });
  }

  return { lat, lng, capturedAt };
}

export default function PhotoUpload({ navigation }) {
  const { addMemory, refresh } = useMemories();
  const { width: winWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const cellSize = Math.floor(
    (winWidth - GRID_PAD * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS,
  );

  const [source, setSource] = useState('gallery');
  const [library, setLibrary] = useState(PLACEHOLDER_LIBRARY);
  const [selected, setSelected] = useState([]);
  const [title, setTitle] = useState('');
  const [pickedDate, setPickedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [place, setPlace] = useState('');
  const [placeOpen, setPlaceOpen] = useState(false);
  const [memo, setMemo] = useState('');
  // 칩으로 표시할 태그 목록 (slug, # 없이). 초기엔 정적 기본 5개 — AI 도착 시 통째로 교체.
  const [tagSlugs, setTagSlugs] = useState(
    TAG_OPTIONS.map((t) => t.label),
  );
  // 활성화(선택)된 태그 — 초기엔 defaultOn 3개. AI 도착 시 AI 태그로 교체.
  const [activeTagSlugs, setActiveTagSlugs] = useState(
    TAG_OPTIONS.filter((t) => t.defaultOn).map((t) => t.label),
  );
  const [mood, setMood] = useState('love');
  const [shareWithPartner, setShareWithPartner] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  // photoId → BE MemoryQuickResponse 캐시
  const [drafts, setDrafts] = useState({});
  // unmount 시 cleanup용 동기화 ref
  const draftsRef = useRef({});
  // 저장 성공 시 true — cleanup 단계에서 미삭제로 처리
  const savedRef = useRef(false);
  // 사용자가 위치명을 직접 수정했는지. true면 AI 자동 위치명으로 덮어쓰지 않는다.
  const placeEditedRef = useRef(false);
  // place의 최신값을 콜백(stale 클로저)에서 읽기 위한 mirror ref.
  const placeRef = useRef('');
  useEffect(() => {
    placeRef.current = place;
  }, [place]);

  // 표시할 칩 목록 = tagSlugs 그대로 (AI 도착 시 통째로 교체되므로 추가 머지 불필요)
  const allTagSlugs = tagSlugs;

  const selectedItems = useMemo(
    () =>
      selected
        .map((id) => library.find((p) => p.id === id))
        .filter(Boolean),
    [selected, library],
  );

  const placeOptions = useMemo(
    () => selectedItems.map((p) => p.location).filter(Boolean),
    [selectedItems],
  );

  // 첫 사진 미리보기 draft 응답으로 UI(날짜·위치·태그 칩) 자동 채우기
  const applyAutoFillFromDraft = useCallback((draft) => {
    if (!draft) return;
    const d = parseAiTime(draft.aiTime);
    if (d) setPickedDate(d);
    // 사용자가 이미 위치명을 직접 고쳤다면 자동 위치명으로 덮어쓰지 않는다.
    // 자동 위치명 우선순위: aiPlace > metadata.locationName > placeName > addressName.
    if (!placeEditedRef.current) {
      const autoPlace =
        draft.aiPlace ||
        draft.metadata?.locationName ||
        draft.metadata?.placeName ||
        draft.metadata?.addressName;
      if (autoPlace) setPlace(autoPlace);
    }
    const aiTagSlugs = Array.isArray(draft.aiTags)
      ? draft.aiTags.map(stripHash).filter(Boolean)
      : [];
    // AI 결과로 통째 교체. 빈 결과(인식 실패/없음)도 그대로 적용해서
    // 정적 기본 태그가 무관한 사진에 선택된 채 남지 않도록.
    setTagSlugs(aiTagSlugs);
    setActiveTagSlugs(aiTagSlugs);
  }, []);

  // 사용자가 LocationPicker(검색/직접입력)로 위치명을 고르면 호출.
  // 이후 AI 자동 위치명이 덮어쓰지 않도록 placeEditedRef를 세운다.
  const handleSelectPlace = useCallback((name) => {
    placeEditedRef.current = true;
    setPlace(name);
  }, []);

  // 한 사진을 presigned upload → POST /memory/quick으로 draft 생성.
  // 응답값을 drafts 캐시에 보관 + 첫 사진이면 UI 자동 채움.
  const createDraftForPhoto = useCallback(
    async (photo, isFirst) => {
      if (!photo) return null;
      if (isFirst) setAnalyzing(true);
      try {
        // 1차: media-library가 직접 노출하는 location/creationTime (가장 신뢰도 높음)
        let exifMeta = {
          lat: photo.location?.latitude ?? null,
          lng: photo.location?.longitude ?? null,
          capturedAt: photo.creationTime
            ? new Date(photo.creationTime).toISOString()
            : null,
        };
        // 2차: picker가 준 exif에서 추출 (image-picker 경로)
        if (exifMeta.lat == null || exifMeta.lng == null) {
          const fromPicker = exifToMeta(photo.exif);
          exifMeta = {
            lat: fromPicker.lat ?? exifMeta.lat,
            lng: fromPicker.lng ?? exifMeta.lng,
            capturedAt: fromPicker.capturedAt ?? exifMeta.capturedAt,
          };
        }
        // 3차: 파일 바이트에서 직접 EXIF 헤더 파싱 (최후 fallback)
        if (exifMeta.lat == null || exifMeta.lng == null) {
          const fileMeta = await readExifFromFile(photo.uri);
          exifMeta = {
            lat: fileMeta.lat ?? exifMeta.lat,
            lng: fileMeta.lng ?? exifMeta.lng,
            capturedAt: fileMeta.capturedAt ?? exifMeta.capturedAt,
          };
        }
        if (__DEV__) {
          console.log('[PhotoUpload] final meta for BE:', exifMeta);
        }
        // BE 콘텐츠 태깅은 R2에 저장된 사진을 OpenAI 비전에 넘기는데, OpenAI는 HEIC를
        // 지원하지 않는다(JPEG/PNG/WebP/GIF만). 그래서 업로드 전에 JPEG로 변환한다.
        // EXIF(GPS/시각)는 위에서 원본 photo.uri로 이미 읽었으므로 변환으로 메타가 빠져도 무방.
        let uploadUri = photo.uri;
        let uploadMime = photo.mimeType;
        let uploadName = photo.fileName;
        try {
          const jpeg = await manipulateAsync(photo.uri, [], {
            compress: 0.9,
            format: SaveFormat.JPEG,
          });
          uploadUri = jpeg.uri;
          uploadMime = 'image/jpeg';
          uploadName =
            (photo.fileName || `memory-${photo.id}`).replace(/\.[^.]+$/, '') +
            '.jpg';
          if (__DEV__) console.log('[PhotoUpload] converted to JPEG for upload');
        } catch (e) {
          // 변환 실패 시 원본 업로드로 폴백 (최소한 저장/표시는 되게)
          if (__DEV__)
            console.log('[PhotoUpload] JPEG convert failed:', e?.message);
        }
        const presigned = await createPresignedUrl({
          mediaType: 'photo',
          contentType: uploadMime,
          originalFileName: uploadName,
          purpose: 'memory',
        });
        await uploadToPresignedUrl({
          uploadUrl: presigned.uploadUrl,
          method: presigned.method,
          headers: presigned.headers,
          fileUri: uploadUri,
          contentType: uploadMime,
        });
        // 미리보기/자동채움용으로 사진 1장당 메모리를 만들어 AI 태그·위치를 받아둔다.
        // 저장 시엔 이 draft들의 objectKey를 모아 묶음 메모리 1개를 새로 만들고, 이 draft들은 삭제한다.
        const created = await createQuickMemory({
          objectKey: presigned.objectKey,
          lat: exifMeta.lat,
          lng: exifMeta.lng,
          // EXIF에 촬영시각이 없으면 현재 시각으로 — capturedAt이 빠지면 BE가 createdAt 사용
          capturedAt: exifMeta.capturedAt || new Date().toISOString(),
          userTags: [],
          // 사용자가 이미 위치명을 직접 골랐으면 그 값을 전달. 안 골랐으면 undefined → BE 자동 계산.
          locationName: placeEditedRef.current
            ? placeRef.current.trim() || undefined
            : undefined,
          // 동기 AI 분석이 30초 근처로 느릴 때 대비해 여유 부여.
          timeoutMs: 60000,
        });
        // draft = 생성 응답(자동채움용 aiTags/aiPlace/aiTime 포함) + 묶음 생성에 필요한 EXIF/미리보기 uri.
        // 저장 시 미리보기 메모리를 삭제하면 그 objectKey의 R2 객체도 함께 지워지므로(BE deleteMemory),
        // 묶음 메모리엔 이 objectKey를 재사용하지 않고 jpeg를 새 키로 다시 올린다. → 재업로드용 jpeg 정보 보관.
        const draft = {
          ...created,
          objectKey: presigned.objectKey,
          uri: photo.uri,
          jpegUri: uploadUri,
          jpegMime: uploadMime,
          jpegName: uploadName,
          lat: exifMeta.lat,
          lng: exifMeta.lng,
          capturedAt: exifMeta.capturedAt || new Date().toISOString(),
        };
        // drafts 상태 + ref 동기화
        setDrafts((prev) => {
          const next = { ...prev, [photo.id]: draft };
          draftsRef.current = next;
          return next;
        });
        if (isFirst) applyAutoFillFromDraft(draft);
        return draft;
      } catch (e) {
        // 개별 draft 실패는 사용자에게 별도 안내 안 함 (저장 시점에 재시도됨)
        return null;
      } finally {
        if (isFirst) setAnalyzing(false);
      }
    },
    [applyAutoFillFromDraft],
  );

  // 갤러리/카메라 결과를 공통으로 흡수
  const ingestAssets = useCallback(
    (assets) => {
      if (!assets?.length) return;
      const photos = assets.map((a, i) => assetToPhotoItem(a, i));
      setLibrary((prev) => {
        const keptPhotos = prev.filter((p) => p.kind === 'photo');
        return [...keptPhotos, ...photos];
      });
      setSelected((prev) => {
        const photoIdsNow = new Set(photos.map((p) => p.id));
        // 카메라(1장)는 기존 선택에 누적, 갤러리(여러 장)는 새 묶음으로 교체
        if (photos.length === 1) {
          return [...prev.filter((id) => !photoIdsNow.has(id)), photos[0].id];
        }
        return photos.map((p) => p.id);
      });
      // 모든 사진에 대해 draft 생성 병렬. 첫 번째 사진의 분석 결과로 UI 자동 채움.
      photos.forEach((p, i) => {
        createDraftForPhoto(p, i === 0).catch(() => {});
      });
    },
    [createDraftForPhoto],
  );

  const launchPicker = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('사진 접근 권한이 필요해요', '설정에서 권한을 허용해주세요.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        // quality<1은 Android에서 재인코딩 → EXIF 손실. 1로 두면 파일 원본 그대로.
        quality: 1,
        // exif 옵션은 picker가 마스킹할 수 있어서 그대로 신뢰하지 않음.
        // 백업으로 readExifFromFile()가 파일 바이트에서 직접 EXIF를 읽음.
        exif: true,
        selectionLimit: 9,
      });
      if (result.canceled) return;
      ingestAssets(result.assets);
    } catch (e) {
      Alert.alert('사진을 불러오지 못했어요', e?.message || '');
    }
  }, [ingestAssets]);

  const launchCamera = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('카메라 권한이 필요해요', '설정에서 카메라 권한을 허용해주세요.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        // quality<1은 Android에서 재인코딩 → EXIF/GPS 손실
        quality: 1,
        exif: true,
        // 기본 카메라 UI 사용. 편집은 false (편집 켜면 EXIF가 손상되는 케이스가 있음)
        allowsEditing: false,
      });
      if (result.canceled) return;
      ingestAssets(result.assets);
    } catch (e) {
      Alert.alert('카메라를 열지 못했어요', e?.message || '');
    }
  }, [ingestAssets]);


  const handleSave = async () => {
    if (saving) return;
    const photos = selectedItems.filter((p) => p.kind === 'photo');

    // 사진을 한 장도 안 골랐으면 mock placeholder만 있는 상태 → 로컬에만 추가하고 종료 (디자인 모드)
    if (photos.length === 0) {
      const mockItems = selectedItems.filter((p) => p.kind === 'mock');
      if (mockItems.length === 0) {
        navigation?.goBack?.();
        return;
      }
      const first = mockItems[0];
      addMemory({
        emoji: first.emoji,
        tag: activeTagSlugs[0] ? `#${activeTagSlugs[0]}` : '#기록',
        place: place.trim() || '미지정',
        date: formatDate(pickedDate),
        tint: first.tint,
        mood: MOOD_TO_GROUP[mood] ?? 'love',
        title: title.trim(),
        memo: memo.trim(),
        shared: shareWithPartner,
        createdAt: Date.now(),
      });
      navigation?.goBack?.();
      return;
    }

    setSaving(true);
    try {
      const noteParts = [title.trim(), memo.trim()].filter(Boolean);
      const note = noteParts.length > 0 ? noteParts.join('\n') : null;

      // 모든 사진을 R2에 업로드해 objectKey 확보(고를 때 만들어둔 draft 재사용, 없으면 지금 업로드).
      const uploaded = await Promise.all(
        photos.map(async (photo) => {
          let draft = drafts[photo.id];
          if (!draft) {
            draft = await createDraftForPhoto(photo, false);
          }
          if (!draft?.objectKey) throw new Error('사진 업로드 실패');
          return draft;
        }),
      );

      // 미리보기 메모리의 objectKey를 묶음 메모리가 그대로 참조하면, 저장 후 미리보기 메모리를
      // 삭제할 때 BE가 그 R2 객체까지 지워 묶음 메모리 사진이 깨진다(404). 그래서 묶음 메모리엔
      // jpeg를 fresh 키로 다시 올려서 쓴다(미리보기와 R2 객체를 분리).
      const objectKeys = await Promise.all(
        uploaded.map(async (d) => {
          const presigned = await createPresignedUrl({
            mediaType: 'photo',
            contentType: d.jpegMime || 'image/jpeg',
            originalFileName: d.jpegName || 'memory.jpg',
            purpose: 'memory',
          });
          await uploadToPresignedUrl({
            uploadUrl: presigned.uploadUrl,
            method: presigned.method,
            headers: presigned.headers,
            fileUri: d.jpegUri || d.uri,
            contentType: d.jpegMime || 'image/jpeg',
          });
          return presigned.objectKey;
        }),
      );

      // 첫 사진 = 커버. 좌표/촬영시각은 커버 기준. 여러 장을 한 게시물(photos[])로 묶어 메모리 1개 생성.
      const cover = uploaded[0];
      const created = await createQuickMemory({
        objectKeys,
        lat: cover.lat,
        lng: cover.lng,
        capturedAt: cover.capturedAt || new Date().toISOString(),
        userTags: activeTagSlugs,
        // 표시·수정된 위치명 최종 저장. 비어있으면 undefined → BE가 좌표로 자동 계산.
        locationName: place.trim() || undefined,
        // BE가 사진별 AI 분석을 동기로 돌아 장수만큼 오래 걸린다 → 장수 비례 타임아웃.
        timeoutMs: Math.min(180000, 60000 + objectKeys.length * 30000),
      });

      // 노트(제목+메모)는 quick create 본문에 없으므로 생성 후 PATCH로 채운다.
      if (note && created?.id != null) {
        try {
          await updateQuickMemory(created.id, { note });
        } catch (_) {
          // 노트 저장 실패해도 사진/메모리는 이미 저장됨 — 다음 새로고침에서 보정.
        }
      }

      // 미리보기용으로 만든 개별 draft 메모리는 삭제(앨범엔 묶음 메모리 1개만 남긴다).
      const draftIds = uploaded.map((d) => d.id).filter((id) => id != null);
      await Promise.allSettled(
        draftIds.map((id) => apiDeleteMemory(id).catch(() => {})),
      );

      savedRef.current = true;

      // 로컬 컨텍스트에도 즉시 반영 (앨범 화면이 BE refresh되기 전까지 임시 표시)
      addMemory({
        emoji: '📸',
        photoUri: cover.uri,
        photoCount: objectKeys.length,
        tag: activeTagSlugs[0] ? `#${activeTagSlugs[0]}` : '#기록',
        tags: activeTagSlugs,
        place: place.trim() || '미지정',
        date: formatDate(pickedDate),
        tint: '#FFE4EE',
        mood: MOOD_TO_GROUP[mood] ?? 'love',
        title: title.trim(),
        memo: memo.trim(),
        shared: shareWithPartner,
        createdAt: Date.now(),
        backendId: created?.id,
      });

      // BE에서 최신 앨범 동기화 (best-effort)
      refresh?.().catch(() => {});

      navigation?.goBack?.();
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e?.message || '추억 저장에 실패했어요';
      Alert.alert('저장 실패', msg);
    } finally {
      setSaving(false);
    }
  };

  const togglePhoto = useCallback(
    async (id) => {
      const isSelecting = !selected.includes(id);
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
      );
      if (!isSelecting) return;

      // media-library 아이템(`ml-` 접두사)이면 full info 가져와서 location/exif 보강 후 draft 생성
      const item = library.find((p) => p.id === id);
      if (!item || item.kind !== 'photo') return;
      // 이미 draft가 있으면 재요청하지 않음
      if (draftsRef.current[id]) return;

      let enriched = item;
      if (id.startsWith('ml-')) {
        try {
          const assetId = id.slice(3);
          const info = await MediaLibrary.getAssetInfoAsync(assetId, {
            shouldDownloadFromNetwork: false,
          });
          enriched = mediaAssetToPhotoItem({ ...item, id: assetId }, info);
          enriched.id = id; // 우리 내부 id는 유지
          setLibrary((prev) => prev.map((p) => (p.id === id ? enriched : p)));
        } catch (e) {
          if (__DEV__)
            console.log('[PhotoUpload] getAssetInfoAsync failed:', e?.message);
        }
      }

      // 첫 번째로 선택된 사진이면 UI 자동 채움 트리거
      const isFirst = selected.length === 0;
      createDraftForPhoto(enriched, isFirst).catch(() => {});
    },
    [selected, library, createDraftForPhoto],
  );

  const toggleTag = (slug) => {
    setActiveTagSlugs((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug],
    );
  };

  // 마운트 시 디바이스 갤러리에서 최근 사진들을 가져와 그리드에 표시
  const loadDeviceGallery = useCallback(async () => {
    try {
      // writeOnly=false (읽기), Android 13+ 의 'photo' granular 권한 요청
      const perm = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
      const ok =
        perm?.granted ||
        perm?.accessPrivileges === 'all' ||
        perm?.accessPrivileges === 'limited';
      if (__DEV__) console.log('[PhotoUpload] media perm:', perm);
      if (!ok) {
        // 권한 거부 — placeholder 유지, 사용자가 "갤러리" 탭으로 picker 띄울 수 있게
        return;
      }
      const page = await MediaLibrary.getAssetsAsync({
        // 3x3 그리드용 최근 9장. "더 추가" 누르면 시스템 picker로 더 가져올 수 있음.
        first: 9,
        mediaType: 'photo',
        sortBy: [['creationTime', false]],
      });
      if (!page?.assets?.length) return;

      const photoItems = page.assets.map((a) => mediaAssetToPhotoItem(a, null));
      setLibrary(photoItems);
      if (__DEV__) console.log('[PhotoUpload] gallery loaded:', photoItems.length);
    } catch (e) {
      if (__DEV__) console.log('[PhotoUpload] loadDeviceGallery failed:', e?.message);
    }
  }, []);

  useEffect(() => {
    loadDeviceGallery();
  }, [loadDeviceGallery]);

  // 저장하지 않은 미리보기 draft 메모리 정리 (취소/뒤로/unmount 시 orphan 방지).
  const cleanupUnsavedDrafts = useCallback(() => {
    if (savedRef.current) return; // 저장 완료 → 정리 안 함
    const ids = Object.values(draftsRef.current).map((d) => d?.id).filter(Boolean);
    if (ids.length === 0) return;
    // best-effort, 결과 무시
    ids.forEach((id) => {
      apiDeleteMemory(id).catch(() => {});
    });
    // 호출 후 클리어해서 중복 호출 방지
    draftsRef.current = {};
    savedRef.current = true;
  }, []);

  // unmount 시 정리
  useEffect(() => {
    return () => {
      cleanupUnsavedDrafts();
    };
  }, [cleanupUnsavedDrafts]);

  // 명시적 취소 → 정리 후 뒤로
  const handleCancel = useCallback(() => {
    cleanupUnsavedDrafts();
    navigation?.goBack?.();
  }, [cleanupUnsavedDrafts, navigation]);

  const handleSourceTap = (key) => {
    setSource(key);
    if (key === 'gallery') {
      launchPicker();
    } else if (key === 'camera') {
      launchCamera();
    } else if (key === 'drive') {
      Alert.alert('알림', '드라이브 연동은 다음 스프린트에 추가됩니다.');
    }
  };

  // 앱바의 ‹ 버튼과 취소 버튼 모두 같은 cleanup 경유
  const goBack = handleCancel;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* App bar */}
      <View style={styles.appbar}>
        <View style={styles.appbarLeft}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={8}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.appbarTitle}>새 추억 추가</Text>
        </View>
        <Text style={styles.appbarCount}>{selected.length}장 선택</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Selected preview row */}
          <Text style={styles.sectionLabel}>선택한 사진</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedRow}
          >
            {selectedItems.map((p, i) => (
              <View
                key={p.id}
                style={[
                  styles.selectedThumb,
                  { backgroundColor: p.tint || '#F5F5F5' },
                ]}
              >
                {p.kind === 'photo' ? (
                  <Image source={{ uri: p.uri }} style={styles.selectedImage} />
                ) : (
                  <Text style={styles.selectedEmoji}>{p.emoji}</Text>
                )}
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>{i + 1}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addMoreBtn}
              activeOpacity={0.8}
              onPress={launchPicker}
            >
              <Text style={styles.addMoreIcon}>＋</Text>
              <Text style={styles.addMoreText}>더 추가</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Source tabs */}
          <View style={styles.sourceRow}>
            {SOURCES.map((s) => {
              const on = s.key === source;
              return on ? (
                <TouchableOpacity
                  key={s.key}
                  activeOpacity={0.85}
                  onPress={() => handleSourceTap(s.key)}
                  style={styles.sourceTabActiveWrap}
                >
                  <LinearGradient
                    colors={[colors.pink, colors.heartRed]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sourceTabActive}
                  >
                    <Text style={styles.sourceIconActive}>{s.icon}</Text>
                    <Text style={styles.sourceLabelActive}>{s.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  key={s.key}
                  activeOpacity={0.7}
                  onPress={() => handleSourceTap(s.key)}
                  style={styles.sourceTab}
                >
                  <Text style={styles.sourceIcon}>{s.icon}</Text>
                  <Text style={styles.sourceLabel}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Gallery grid */}
          <View style={styles.gridWrap}>
            {library.map((p, i) => {
              const idx = selected.indexOf(p.id);
              const isOn = idx >= 0;
              const isLastCol = (i + 1) % GRID_COLS === 0;
              return (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.85}
                  onPress={() => togglePhoto(p.id)}
                  style={[
                    styles.gridCell,
                    {
                      backgroundColor: p.tint || '#F5F5F5',
                      width: cellSize,
                      height: cellSize,
                      marginRight: isLastCol ? 0 : GRID_GAP,
                      marginBottom: GRID_GAP,
                    },
                  ]}
                >
                  {p.kind === 'photo' ? (
                    <Image source={{ uri: p.uri }} style={styles.gridImage} />
                  ) : (
                    <Text style={styles.gridEmoji}>{p.emoji}</Text>
                  )}
                  {isOn ? (
                    <>
                      <View style={styles.gridSelectedBorder} />
                      <View style={styles.gridSelectedBadge}>
                        <Text style={styles.gridSelectedBadgeText}>{idx + 1}</Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.gridUnselectedDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Memory info card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>추억 정보</Text>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldIcon}>✏️</Text>
              <TextInput
                style={styles.fieldInput}
                value={title}
                onChangeText={setTitle}
                placeholder="추억 제목"
                placeholderTextColor={colors.inkMute}
              />
            </View>

            <View style={styles.fieldGridRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setCalendarOpen(true)}
                style={[styles.fieldRow, styles.fieldHalf]}
              >
                <Text style={styles.fieldIconSm}>📅</Text>
                <Text style={styles.fieldStaticValue}>{formatDate(pickedDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setPlaceOpen(true)}
                style={[styles.fieldRow, styles.fieldHalf]}
              >
                <Text style={styles.fieldIconSm}>📍</Text>
                <Text
                  style={styles.fieldStaticValue}
                  numberOfLines={1}
                >
                  {place || '위치 선택'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tagWrap}>
              {allTagSlugs.map((slug) => {
                const on = activeTagSlugs.includes(slug);
                return (
                  <TouchableOpacity
                    key={slug}
                    activeOpacity={0.7}
                    onPress={() => toggleTag(slug)}
                    style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                  >
                    <Text style={[styles.chipText, on ? styles.chipTextOn : styles.chipTextOff]}>
                      #{slug}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {analyzing && (
                <View style={[styles.chip, styles.chipOff]}>
                  <ActivityIndicator size="small" color={colors.pink} />
                </View>
              )}
              <TouchableOpacity activeOpacity={0.7} style={[styles.chip, styles.chipOff]}>
                <Text style={[styles.chipText, styles.chipTextOff]}>+ 태그</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.memoBox}>
              <Text style={styles.memoIcon}>💭</Text>
              <TextInput
                style={styles.memoInput}
                value={memo}
                onChangeText={setMemo}
                multiline
                placeholder="이 순간을 기록해보세요..."
                placeholderTextColor={colors.inkMute}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Mood pick */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>오늘의 감정</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m) => {
                const on = m.id === mood;
                return (
                  <TouchableOpacity
                    key={m.id}
                    activeOpacity={0.8}
                    onPress={() => setMood(m.id)}
                    style={styles.moodItem}
                  >
                    {on ? (
                      <LinearGradient
                        colors={['#FFE4EE', colors.pinkSoft]}
                        style={[styles.moodCircle, styles.moodCircleOn]}
                      >
                        <Text style={styles.moodEmoji}>{m.emoji}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.moodCircle}>
                        <Text style={styles.moodEmoji}>{m.emoji}</Text>
                      </View>
                    )}
                    <Text style={[styles.moodLabel, on && styles.moodLabelOn]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Share with partner */}
          <View style={styles.shareCard}>
            <Text style={styles.shareHeart}>♥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.shareTitle}>
                <Text style={{ fontWeight: '800' }}>지호</Text>에게 공유하기
              </Text>
              <Text style={styles.shareSub}>저장하면 우리 둘 모두의 앨범에 추가돼요</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShareWithPartner((v) => !v)}
              style={[
                styles.toggle,
                shareWithPartner ? styles.toggleOn : styles.toggleOff,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  shareWithPartner ? styles.toggleKnobOn : styles.toggleKnobOff,
                ]}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Save bar */}
        <View
          style={[
            styles.saveBar,
            { paddingBottom: 12 + Math.max(insets.bottom, 0) },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={goBack}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveBtnWrap}
          >
            <LinearGradient
              colors={[colors.pink, colors.heartRed]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveBtn}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.saveHeart}>♥</Text>
                  <Text style={styles.saveText}>추억 저장하기</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CalendarPicker
        visible={calendarOpen}
        value={pickedDate}
        onClose={() => setCalendarOpen(false)}
        onSelect={setPickedDate}
      />
      <LocationPicker
        visible={placeOpen}
        value={place}
        options={placeOptions}
        onClose={() => setPlaceOpen(false)}
        onSelect={handleSelectPlace}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },

  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  appbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 26, color: colors.ink, fontWeight: '300', lineHeight: 28 },
  appbarTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  appbarCount: { fontSize: 13, color: colors.pink, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },

  sectionLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedRow: { gap: 8, paddingBottom: 4 },
  selectedThumb: {
    position: 'relative',
    width: 84,
    height: 84,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedEmoji: { fontSize: 36, opacity: 0.75 },
  selectedImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  selectedBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.heartRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  selectedBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  addMoreBtn: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.pinkSoft,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addMoreIcon: { fontSize: 22, color: colors.pink, fontWeight: '600', lineHeight: 24 },
  addMoreText: { fontSize: 10, color: colors.pink, fontWeight: '600' },

  sourceRow: { flexDirection: 'row', gap: 6, marginTop: 16 },
  sourceTab: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sourceIcon: { fontSize: 14 },
  sourceLabel: { fontSize: 12, fontWeight: '700', color: colors.ink3 },
  sourceTabActiveWrap: { flex: 1 },
  sourceTabActive: {
    height: 40,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.heartRed,
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  sourceIconActive: { fontSize: 14 },
  sourceLabelActive: { fontSize: 12, fontWeight: '700', color: '#fff' },

  gridWrap: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gridEmoji: { fontSize: 36, opacity: 0.7 },
  gridImage: {
    ...StyleSheet.absoluteFillObject,
  },
  gridSelectedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: colors.heartRed,
    backgroundColor: 'rgba(252,38,72,0.08)',
  },
  gridSelectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.heartRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridSelectedBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  gridUnselectedDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  card: {
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line2,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 10 },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    marginBottom: 8,
  },
  fieldIcon: { fontSize: 16 },
  fieldIconSm: { fontSize: 12 },
  fieldInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    padding: 0,
  },
  fieldStaticValue: { fontSize: 12, color: colors.ink, fontWeight: '600' },
  fieldInputSm: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
    padding: 0,
  },
  fieldGridRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  fieldHalf: { flex: 1, marginBottom: 0 },

  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 11 },
  chipOn: { backgroundColor: '#FFE4EE' },
  chipOff: { backgroundColor: '#F0F0F0' },
  chipText: { fontSize: 11 },
  chipTextOn: { color: colors.pinkDeep, fontWeight: '700' },
  chipTextOff: { color: '#888', fontWeight: '500' },

  memoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    minHeight: 56,
  },
  memoIcon: { fontSize: 14, marginTop: 1 },
  memoInput: {
    flex: 1,
    fontSize: 12,
    color: colors.ink,
    lineHeight: 18,
    padding: 0,
    minHeight: 32,
  },

  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodItem: { alignItems: 'center', gap: 4 },
  moodCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: colors.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCircleOn: { borderWidth: 2, borderColor: colors.heartRed },
  moodEmoji: { fontSize: 22 },
  moodLabel: { fontSize: 10, color: '#888', fontWeight: '500' },
  moodLabelOn: { color: colors.pinkDeep, fontWeight: '700' },

  shareCard: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFF5F8',
    borderWidth: 1,
    borderColor: '#FFD0E0',
  },
  shareHeart: { fontSize: 18, color: colors.heartRed },
  shareTitle: { fontSize: 12, color: colors.ink },
  shareSub: { fontSize: 10, color: '#888', marginTop: 2 },
  toggle: {
    width: 36,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: colors.heartRed },
  toggleOff: { backgroundColor: '#E0E0E0' },
  toggleKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff' },
  toggleKnobOn: { alignSelf: 'flex-end' },
  toggleKnobOff: { alignSelf: 'flex-start' },

  saveBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.line2,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.ink3 },
  saveBtnWrap: { flex: 2 },
  saveBtn: {
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.heartRed,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
  },
  saveHeart: { color: '#fff', fontSize: 14 },
  saveText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
