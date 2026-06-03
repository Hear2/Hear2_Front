import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import * as Location from 'expo-location';
import colors from '../../constants/colors';
import endpoints from '../../constants/endpoints';
import Header from '../../components/common/Header';
import KakaoMap from '../../components/common/KakaoMap';
import {
  uploadMyLocation,
  fetchCoupleLocation,
  setLocationSharing,
} from '../../api/locationAPI';
import { useAuth } from '../../contexts/AuthContext';
import { givenName } from '../../utils/name';
import { resolveCoupleGenders, genderColor } from '../../utils/gender';

const MyLocationIcon = ({ color = '#1E2152' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Line x1="12" y1="2" x2="12" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="19" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="2" y1="12" x2="5" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="19" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="12" r="7" stroke={color} strokeWidth="2" fill="none" />
    <Circle cx="12" cy="12" r="3" fill={color} />
  </Svg>
);

const FitBoundsIcon = ({ color = '#1E2152' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 9V5a1 1 0 0 1 1-1h4"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 9V5a1 1 0 0 0-1-1h-4"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 15v4a1 1 0 0 0 1 1h4"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 15v4a1 1 0 0 1-1 1h-4"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="9" cy="12" r="1.6" fill={color} />
    <Circle cx="15" cy="12" r="1.6" fill={color} />
  </Svg>
);

const RefreshIcon = ({ color = '#1E2152' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12a9 9 0 1 1-2.64-6.36"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M21 3v6h-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 핀 색상: 성별 기반 (여=핑크, 남=파랑). 성별을 모르면 나=핑크/상대=파랑 폴백.
const FEMALE_PIN = '#FF6B9D';
const MALE_PIN = '#4D96FF';

// mock 모드용 파트너 위치 (홍대입구역 부근). 실모드에선 BE에서 받아온다.
const MOCK_PARTNER_COORD = { lat: 37.5572, lng: 126.9244 };
// 내 위치 fallback (권한 거부 시): 연남동
const FALLBACK_MY_COORD = { lat: 37.5641, lng: 126.9244, label: '연남동' };

// 상대 위치 폴링 주기. 화면이 떠 있는 동안 주기적으로 내 위치 업로드 + 상대 위치 조회.
const SYNC_INTERVAL_MS = 10000;

const LocationShare = ({ navigation }) => {
  const { user, partner } = useAuth();
  const partnerName = givenName(partner?.nickname) || '연인';
  // 성별 기반 핀 색. 상대 성별은 BE에 없으면 내 성별의 반대로 추정.
  const { mine: myGender, partner: partnerGender } = resolveCoupleGenders(
    user?.gender,
    partner?.gender,
  );
  const myPin = genderColor(myGender, {
    male: MALE_PIN,
    female: FEMALE_PIN,
    fallback: FEMALE_PIN,
  });
  const partnerPin = genderColor(partnerGender, {
    male: MALE_PIN,
    female: FEMALE_PIN,
    fallback: MALE_PIN,
  });

  const mapRef = useRef(null);
  const [myCoord, setMyCoord] = useState(FALLBACK_MY_COORD);
  // 상대 위치: BE에서 받아온 실데이터. null이면 아직 상대 위치 없음(미공유/미업로드).
  const [partnerCoord, setPartnerCoord] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      // GPS 좌표는 소수점 끝자리가 계속 흔들린다(지터) — 6자리(≈10cm)로 라운딩하고,
      // 실질적으로 같은 위치면 상태 갱신을 건너뛰어 불필요한 리렌더/지도 갱신을 막는다.
      const round6 = (n) => Math.round(n * 1e6) / 1e6;
      const next = {
        lat: round6(loc.coords.latitude),
        lng: round6(loc.coords.longitude),
      };
      setMyCoord((prev) =>
        prev.lat === next.lat && prev.lng === next.lng ? prev : next,
      );
      return next;
    } catch {
      return null;
    }
  }, []);

  // 내 위치 업로드 + 상대 위치 조회 (커플 앱 취지: 자동 공유).
  // 내 공유가 OFF 상태(403)면 자동으로 켜고 재시도한다.
  const syncLocations = useCallback(async () => {
    if (endpoints.MOCK) {
      setPartnerCoord(MOCK_PARTNER_COORD);
      return;
    }
    const me = await loadMyLocation();
    if (me) {
      try {
        await uploadMyLocation({
          lat: me.lat,
          lng: me.lng,
          capturedAt: new Date().toISOString(),
        });
      } catch (err) {
        if (err?.status === 403) {
          try {
            await setLocationSharing(true);
            await uploadMyLocation({
              lat: me.lat,
              lng: me.lng,
              capturedAt: new Date().toISOString(),
            });
          } catch (_) {}
        }
      }
    }
    try {
      const res = await fetchCoupleLocation();
      setPartnerCoord(
        res?.partner?.lat != null && res?.partner?.lng != null
          ? { lat: res.partner.lat, lng: res.partner.lng }
          : null,
      );
    } catch (err) {
      if (err?.status === 403) {
        // 내 공유 OFF로 조회가 막힌 경우 → 켜고 한 번 재시도
        try {
          await setLocationSharing(true);
          const res = await fetchCoupleLocation();
          setPartnerCoord(
            res?.partner?.lat != null
              ? { lat: res.partner.lat, lng: res.partner.lng }
              : null,
          );
        } catch (_) {}
      }
    }
  }, [loadMyLocation]);

  // 진입 시 1회 + 주기 폴링
  useEffect(() => {
    syncLocations();
    const t = setInterval(syncLocations, SYNC_INTERVAL_MS);
    return () => clearInterval(t);
  }, [syncLocations]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await syncLocations();
    const points = [{ lat: myCoord.lat, lng: myCoord.lng }];
    if (partnerCoord) points.push(partnerCoord);
    mapRef.current?.fitBounds(points);
    setRefreshing(false);
  }, [syncLocations, myCoord, partnerCoord, refreshing]);

  const center = useMemo(() => {
    if (!partnerCoord) return { lat: myCoord.lat, lng: myCoord.lng };
    return {
      lat: (myCoord.lat + partnerCoord.lat) / 2,
      lng: (myCoord.lng + partnerCoord.lng) / 2,
    };
  }, [myCoord, partnerCoord]);

  const markers = useMemo(() => {
    const arr = [
      { id: 'me', lat: myCoord.lat, lng: myCoord.lng, label: '나', color: myPin },
    ];
    if (partnerCoord) {
      arr.push({
        id: 'partner',
        lat: partnerCoord.lat,
        lng: partnerCoord.lng,
        label: partnerName,
        color: partnerPin,
      });
    }
    return arr;
  }, [myCoord, partnerCoord, partnerName, myPin, partnerPin]);

  const handleFitBoth = () => {
    mapRef.current?.fitBounds(markers.map(({ lat, lng }) => ({ lat, lng })));
  };

  const handleCenterMe = () => {
    mapRef.current?.moveTo(myCoord.lat, myCoord.lng);
  };

  return (
    <View style={styles.container}>
      <Header
        title="위치 공유"
        showBack
        onBack={() => navigation?.goBack()}
        right={
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={refreshing}
            style={styles.refreshBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="위치 새로고침"
          >
            <RefreshIcon color={refreshing ? colors.ink3 : colors.ink} />
          </TouchableOpacity>
        }
      />

      {/* 카카오 지도 (서로의 위치만 핀으로 표시) */}
      <View style={styles.mapArea}>
        {mapError ? (
          <View style={styles.mapFallback}>
            <Text style={styles.mapFallbackEmoji}>🗺️</Text>
            <Text style={styles.mapFallbackTitle}>지도를 불러올 수 없어요</Text>
            <Text style={styles.mapFallbackDesc}>
              네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
            </Text>
          </View>
        ) : (
          <KakaoMap
            ref={mapRef}
            center={center}
            markers={markers}
            level={5}
            onError={(msg) => setMapError(msg || 'unknown')}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* 상대 위치가 아직 없을 때 안내 배너 */}
        {!mapError && !partnerCoord && !endpoints.MOCK && (
          <View style={styles.partnerBanner}>
            <Text style={styles.partnerBannerText}>
              아직 {partnerName}의 위치가 없어요 · 상대가 위치 공유 화면을 열면
              표시돼요
            </Text>
          </View>
        )}

        {/* 우측 컨트롤 */}
        {!mapError && (
          <View style={styles.zoomControls}>
            <TouchableOpacity
              style={styles.fab}
              activeOpacity={0.85}
              onPress={handleCenterMe}
              hitSlop={4}
            >
              <MyLocationIcon color={colors.heartRed} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fab}
              activeOpacity={0.85}
              onPress={handleFitBoth}
              hitSlop={4}
            >
              <FitBoundsIcon color={colors.ink} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp },
  refreshBtn: { padding: 4 },
  mapArea: { flex: 1, position: 'relative', overflow: 'hidden' },

  mapFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  mapFallbackEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  mapFallbackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
  },
  mapFallbackDesc: {
    fontSize: 13,
    color: colors.ink3,
    textAlign: 'center',
    lineHeight: 18,
  },

  partnerBanner: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(30,33,82,0.85)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  partnerBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 17,
  },

  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    gap: 10,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(30,33,82,0.06)',
    shadowColor: '#1E2152',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
});

export default LocationShare;
