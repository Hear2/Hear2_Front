import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

// 페이지 origin 스킴이 SDK 서브리소스 프로토콜을 결정한다.
// iOS는 ATS가 웹 콘텐츠의 http 로드를 차단하므로 https origin이어야
// kakao.maps.load()가 내부 리소스를 https로 받아 초기화가 완료된다.
// Android는 기존 http://localhost로 검증돼 있어 그대로 둔다.
const BASE_URL = Platform.OS === 'ios' ? 'https://localhost' : 'http://localhost';

const JS_KEY =
  Constants.expoConfig?.extra?.kakaoJsKey ??
  Constants.manifest?.extra?.kakaoJsKey;

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

const buildHtml = ({ centerLat, centerLng, level, markers }) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
  body { background: #F0F4FF; }
  .label {
    position: absolute;
    transform: translate(-50%, -100%);
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    color: #1E2152;
    background: rgba(255,255,255,0.9);
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    white-space: nowrap;
    pointer-events: none;
  }
</style>
</head>
<body>
<div id="map"></div>
<script>
  function send(payload) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
  }

  window.onerror = function (msg) {
    send({ type: 'error', message: String(msg) });
  };

  // 진단: 페이지 스크립트가 실행되는지 + 브리지가 사는지 확인용 핑
  send({ type: 'debug', message: 'page script started, origin=' + location.origin });

  var sdkLoaded = false;
  var sdkTimer = setTimeout(function () {
    if (!sdkLoaded) {
      send({ type: 'error', message: 'Kakao SDK load timeout' });
      probe('kakao', script.src);
      probe('apple', 'https://www.apple.com/favicon.ico');
    }
  }, 8000);

  var script = document.createElement('script');
  script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=${JS_KEY}&autoload=false&libraries=services';
  // 진단 프로브: 5초 타임아웃 포함, 결과는 debug 타입으로 로그에만 표시
  function probe(name, url) {
    var done = false;
    var t = setTimeout(function () {
      if (!done) { done = true; send({ type: 'debug', message: 'probe ' + name + ': TIMEOUT(5s)' }); }
    }, 5000);
    try {
      fetch(url, { mode: 'no-cors' })
        .then(function (r) {
          if (!done) { done = true; clearTimeout(t); send({ type: 'debug', message: 'probe ' + name + ': ok type=' + r.type }); }
        })
        .catch(function (e) {
          if (!done) { done = true; clearTimeout(t); send({ type: 'debug', message: 'probe ' + name + ': FAILED ' + e }); }
        });
    } catch (e) {
      if (!done) { done = true; clearTimeout(t); send({ type: 'debug', message: 'probe ' + name + ': THREW ' + e }); }
    }
  }

  script.onerror = function () {
    clearTimeout(sdkTimer);
    // 에러는 즉시 보내고, 프로브는 비동기로 따로 보고
    send({ type: 'error', message: 'Kakao SDK script failed to load' });
    probe('kakao', script.src);
    probe('apple', 'https://www.apple.com/favicon.ico');
  };
  script.onload = function () {
    sdkLoaded = true;
    clearTimeout(sdkTimer);
    if (!window.kakao || !window.kakao.maps) {
      send({ type: 'error', message: 'Kakao SDK unavailable after load' });
      return;
    }
    // kakao.maps.load()가 내부 리소스를 못 받아 영영 안 끝나는 경우 감지 (ATS 등)
    var initDone = false;
    var initTimer = setTimeout(function () {
      if (!initDone) {
        send({ type: 'error', message: 'kakao.maps.load timeout (origin=' + location.origin + ')' });
        probe('kakao', script.src);
        probe('apple', 'https://www.apple.com/favicon.ico');
      }
    }, 8000);
    kakao.maps.load(function () {
      initDone = true;
      clearTimeout(initTimer);
      try {
        var map = new kakao.maps.Map(document.getElementById('map'), {
          center: new kakao.maps.LatLng(${centerLat}, ${centerLng}),
          level: ${level}
        });
        window.__map = map;

        // 마커는 라이브 갱신 가능하도록 함수화 — RN 쪽에서 window.updateMarkers로
        // 리로드 없이 교체한다 (html 재생성 → WebView 리로드 루프 방지).
        var liveMarkers = [];
        var liveOverlays = [];
        function renderMarkers(markerInfos) {
          liveMarkers.forEach(function (mk) { mk.setMap(null); });
          liveOverlays.forEach(function (ov) { ov.setMap(null); });
          liveMarkers = [];
          liveOverlays = [];
          (markerInfos || []).forEach(function (m) {
            var pos = new kakao.maps.LatLng(m.lat, m.lng);
            var markerOpts = { position: pos, map: map, title: m.label || '' };
            if (m.color) {
              var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">'
                + '<path d="M15 0C7 0 0 6 0 14c0 10 15 26 15 26s15-16 15-26C30 6 23 0 15 0z" fill="' + m.color + '" stroke="#ffffff" stroke-width="2.5"/>'
                + '<circle cx="15" cy="14" r="5" fill="#ffffff"/></svg>';
              markerOpts.image = new kakao.maps.MarkerImage(
                'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg),
                new kakao.maps.Size(30, 40),
                { offset: new kakao.maps.Point(15, 40) }
              );
            }
            var marker = new kakao.maps.Marker(markerOpts);
            kakao.maps.event.addListener(marker, 'click', function () {
              send({ type: 'marker', id: m.id });
            });
            liveMarkers.push(marker);
            if (m.label) {
              var overlay = new kakao.maps.CustomOverlay({
                position: pos,
                yAnchor: 2.2,
                content: '<div class="label">' + m.labelHtml + '</div>'
              });
              overlay.setMap(map);
              liveOverlays.push(overlay);
            }
          });
        }
        window.updateMarkers = renderMarkers;
        renderMarkers(${JSON.stringify(markers)});

        kakao.maps.event.addListener(map, 'idle', function () {
          var c = map.getCenter();
          send({ type: 'idle', lat: c.getLat(), lng: c.getLng(), level: map.getLevel() });
        });

        window.setCenter = function (lat, lng) {
          map.setCenter(new kakao.maps.LatLng(lat, lng));
        };
        window.setLevel = function (level) {
          map.setLevel(level);
        };
        window.fitBounds = function (points) {
          if (!points || points.length === 0) return;
          var bounds = new kakao.maps.LatLngBounds();
          points.forEach(function (p) {
            bounds.extend(new kakao.maps.LatLng(p.lat, p.lng));
          });
          map.setBounds(bounds);
        };

        send({ type: 'ready' });
      } catch (err) {
        send({ type: 'error', message: 'Kakao map init failed: ' + (err && err.message ? err.message : String(err)) });
      }
    });
  };
  document.head.appendChild(script);
</script>
</body>
</html>
`;

const KakaoMap = forwardRef(function KakaoMap(
  {
    center = { lat: 37.5563, lng: 126.923 },
    markers = [],
    level = 4,
    onMarkerPress,
    onReady,
    onIdle,
    onError,
    style,
  },
  ref,
) {
  const webRef = useRef(null);
  const readyRef = useRef(false);

  // ⚠️ html은 마운트 시 1회만 생성한다. 좌표/마커가 바뀔 때마다 html을 재생성하면
  // WebView가 통째로 리로드되는데, 실기기 GPS는 좌표가 미세하게 계속 흔들려서
  // 지도가 SDK를 로드할 틈도 없이 무한 리로드 루프에 빠진다(iOS에서 빈 화면의 원인).
  // 이후 변경은 window.setCenter / window.updateMarkers 주입으로 리로드 없이 반영.
  const htmlRef = useRef(null);
  if (htmlRef.current == null) {
    htmlRef.current = buildHtml({
      centerLat: center.lat,
      centerLng: center.lng,
      level,
      markers: markers.map((m) => ({
        ...m,
        labelHtml: escapeHtml(m.label),
      })),
    });
  }
  const html = htmlRef.current;

  // 최신 center/markers를 지도에 주입 (ready 이후에만)
  const markersJson = useMemo(
    () =>
      JSON.stringify(
        markers.map((m) => ({ ...m, labelHtml: escapeHtml(m.label) })),
      ),
    [JSON.stringify(markers)], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const pushLiveState = () => {
    if (!readyRef.current) return;
    webRef.current?.injectJavaScript(
      `window.setCenter && window.setCenter(${center.lat}, ${center.lng});` +
        `window.updateMarkers && window.updateMarkers(${markersJson}); true;`,
    );
  };
  const pushRef = useRef(pushLiveState);
  pushRef.current = pushLiveState;
  useEffect(() => {
    pushRef.current();
  }, [center.lat, center.lng, markersJson]);

  useImperativeHandle(ref, () => ({
    moveTo: (lat, lng) => {
      webRef.current?.injectJavaScript(
        `window.setCenter && window.setCenter(${lat}, ${lng}); true;`,
      );
    },
    setLevel: (lv) => {
      webRef.current?.injectJavaScript(
        `window.setLevel && window.setLevel(${lv}); true;`,
      );
    },
    fitBounds: (points) => {
      webRef.current?.injectJavaScript(
        `window.fitBounds && window.fitBounds(${JSON.stringify(points)}); true;`,
      );
    },
  }));

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html, baseUrl: BASE_URL }}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        onMessage={(e) => {
          if (__DEV__) console.log('[KakaoMap] msg:', e.nativeEvent.data);
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg.type === 'ready') {
              readyRef.current = true;
              pushRef.current(); // 로딩 중 쌓인 최신 좌표/마커 반영
              onReady?.();
            } else if (msg.type === 'marker') onMarkerPress?.(msg.id);
            else if (msg.type === 'idle') onIdle?.(msg);
            else if (msg.type === 'error') onError?.(msg.message);
          } catch {}
        }}
        onLoadEnd={(e) => {
          if (__DEV__)
            console.log(
              '[KakaoMap] loadEnd url=',
              e.nativeEvent?.url,
              'loading=',
              e.nativeEvent?.loading,
            );
        }}
        onContentProcessDidTerminate={() => {
          if (__DEV__) console.log('[KakaoMap] ⚠️ content process TERMINATED');
        }}
        onError={(e) => {
          if (__DEV__) console.log('[KakaoMap] webview error:', e.nativeEvent?.description);
        }}
        onHttpError={(e) => {
          if (__DEV__)
            console.log(
              '[KakaoMap] http error:',
              e.nativeEvent?.statusCode,
              e.nativeEvent?.url,
            );
        }}
        style={styles.web}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  web: { flex: 1, backgroundColor: 'transparent' },
});

export default KakaoMap;
