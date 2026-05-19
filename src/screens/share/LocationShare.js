import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

// 파트너 위치는 임시 하드코딩 (백엔드 연결 전): 홍대입구역 부근
const PARTNER_COORD = { lat: 37.5572, lng: 126.9244, label: '홍대입구' };
// 내 위치 fallback (권한 거부 시): 연남동
const FALLBACK_MY_COORD = { lat: 37.5641, lng: 126.9244, label: '연남동' };

const haversineKm = (a, b) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(s));
};

const LocationShare = ({ navigation }) => {
  const mapRef = useRef(null);
  const [myCoord, setMyCoord] = useState(FALLBACK_MY_COORD);
  const [myArea, setMyArea] = useState('연남동');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        if (!mounted) return;
        setPermissionGranted(true);
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!mounted) return;
        const next = {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        };
        setMyCoord(next);
        try {
          const places = await Location.reverseGeocodeAsync({
            latitude: next.lat,
            longitude: next.lng,
          });
          const p = places?.[0];
          if (p && mounted) {
            const region = p.district || p.subregion || p.city || '';
            if (region) setMyArea(region);
          }
        } catch (err) {
          if (__DEV__) console.warn('reverseGeocodeAsync failed', err);
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const center = useMemo(
    () => ({
      lat: (myCoord.lat + PARTNER_COORD.lat) / 2,
      lng: (myCoord.lng + PARTNER_COORD.lng) / 2,
    }),
    [myCoord],
  );

  const markers = useMemo(
    () => [
      { id: 'me', lat: myCoord.lat, lng: myCoord.lng, label: '예진' },
      {
        id: 'partner',
        lat: PARTNER_COORD.lat,
        lng: PARTNER_COORD.lng,
        label: '지호',
      },
    ],
    [myCoord],
  );

  const distanceKm = useMemo(
    () => haversineKm(myCoord, PARTNER_COORD).toFixed(1),
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
      />

      {/* 카카오 지도 */}
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

      {/* 바닥 시트 */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        <Text style={styles.distanceText}>
          {distanceKm}km{' '}
          <Text style={styles.distanceHeart}>♥</Text> 가까워지는 중
        </Text>

        <TouchableOpacity
          style={styles.midpointBtn}
          activeOpacity={0.85}
          onPress={() =>
            mapRef.current?.moveTo(center.lat, center.lng)
          }
        >
          <LinearGradient
            colors={[colors.pink, colors.pinkDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.midpointGradient}
          >
            <Text style={styles.midpointBtnText}>중간 지점 찾기</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.locationInfoCard}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationDetail}>
              <Text style={styles.locationName}>
                예진 - 서울 마포구 {myArea}
              </Text>
              <Text style={styles.locationTime}>
                {permissionGranted ? '방금 업데이트' : '위치 권한 필요'}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationDetail}>
              <Text style={styles.locationName}>
                지호 - 서울 마포구 {PARTNER_COORD.label}
              </Text>
              <Text style={styles.locationTime}>1분 전 업데이트</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp },
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

  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.line,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  distanceText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 16,
  },
  distanceHeart: { color: colors.heartRed },
  midpointBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  midpointGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
  },
  midpointBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  locationInfoCard: {
    backgroundColor: colors.bgSoft,
    borderRadius: 16,
    padding: 16,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { fontSize: 18, marginRight: 12 },
  locationDetail: { flex: 1 },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink2,
  },
  locationTime: {
    fontSize: 12,
    color: colors.inkMute,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line2,
    marginVertical: 12,
  },
});

export default LocationShare;
