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
import Header from '../../components/common/Header';
import KakaoMap from '../../components/common/KakaoMap';

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

// 핀 색상: 예진(여) 핑크 / 지호(남) 파랑
const FEMALE_PIN = '#FF6B9D';
const MALE_PIN = '#4D96FF';

// 파트너 위치는 임시 하드코딩 (백엔드 연결 전): 홍대입구역 부근
const PARTNER_COORD = { lat: 37.5572, lng: 126.9244, label: '홍대입구' };
// 내 위치 fallback (권한 거부 시): 연남동
const FALLBACK_MY_COORD = { lat: 37.5641, lng: 126.9244, label: '연남동' };

const LocationShare = ({ navigation }) => {
  const mapRef = useRef(null);
  const [myCoord, setMyCoord] = useState(FALLBACK_MY_COORD);
  const [mapError, setMapError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setMyCoord(next);
      return next;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    loadMyLocation();
  }, [loadMyLocation]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    const next = await loadMyLocation();
    const me = next || myCoord;
    mapRef.current?.fitBounds([
      { lat: me.lat, lng: me.lng },
      { lat: PARTNER_COORD.lat, lng: PARTNER_COORD.lng },
    ]);
    setRefreshing(false);
  }, [loadMyLocation, myCoord, refreshing]);

  const center = useMemo(
    () => ({
      lat: (myCoord.lat + PARTNER_COORD.lat) / 2,
      lng: (myCoord.lng + PARTNER_COORD.lng) / 2,
    }),
    [myCoord],
  );

  const markers = useMemo(
    () => [
      { id: 'me', lat: myCoord.lat, lng: myCoord.lng, label: '나', color: FEMALE_PIN },
      {
        id: 'partner',
        lat: PARTNER_COORD.lat,
        lng: PARTNER_COORD.lng,
        label: '연인',
        color: MALE_PIN,
      },
    ],
    [myCoord],
  );

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
