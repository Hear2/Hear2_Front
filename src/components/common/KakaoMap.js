import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

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

  var sdkLoaded = false;
  var sdkTimer = setTimeout(function () {
    if (!sdkLoaded) {
      send({ type: 'error', message: 'Kakao SDK load timeout' });
    }
  }, 8000);

  var script = document.createElement('script');
  script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=${JS_KEY}&autoload=false&libraries=services';
  script.onerror = function () {
    clearTimeout(sdkTimer);
    send({ type: 'error', message: 'Kakao SDK script failed to load' });
  };
  script.onload = function () {
    sdkLoaded = true;
    clearTimeout(sdkTimer);
    if (!window.kakao || !window.kakao.maps) {
      send({ type: 'error', message: 'Kakao SDK unavailable after load' });
      return;
    }
    kakao.maps.load(function () {
      try {
        var map = new kakao.maps.Map(document.getElementById('map'), {
          center: new kakao.maps.LatLng(${centerLat}, ${centerLng}),
          level: ${level}
        });
        window.__map = map;

        var markerInfos = ${JSON.stringify(markers)};
        var overlays = [];
        markerInfos.forEach(function (m) {
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
          if (m.label) {
            var overlay = new kakao.maps.CustomOverlay({
              position: pos,
              yAnchor: 2.2,
              content: '<div class="label">' + m.labelHtml + '</div>'
            });
            overlay.setMap(map);
            overlays.push(overlay);
          }
        });

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

  const html = useMemo(
    () =>
      buildHtml({
        centerLat: center.lat,
        centerLng: center.lng,
        level,
        markers: markers.map((m) => ({
          ...m,
          labelHtml: escapeHtml(m.label),
        })),
      }),
    // Only rebuild HTML when markers change in identity; for live updates use ref methods
    [center.lat, center.lng, level, JSON.stringify(markers)],
  );

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
        source={{ html, baseUrl: 'http://localhost' }}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg.type === 'ready') onReady?.();
            else if (msg.type === 'marker') onMarkerPress?.(msg.id);
            else if (msg.type === 'idle') onIdle?.(msg);
            else if (msg.type === 'error') onError?.(msg.message);
          } catch {}
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
