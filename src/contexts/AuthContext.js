import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  setAuthTokenProvider,
  setRefreshHandler,
  setAuthFailureHandler,
} from '../api/client';
import { setUploadTokenProvider } from '../api/chatAPI';
import {
  reissue as reissueRequest,
  fetchMe,
  logout as logoutRequest,
} from '../api/authAPI';
import {
  fetchCoupleStatus,
  connectCouple as connectCoupleRequest,
  setCoupleStartDate as setCoupleStartDateRequest,
} from '../api/coupleAPI';
import endpoints from '../constants/endpoints';

const ACCESS_KEY = 'hear2.accessToken';
const REFRESH_KEY = 'hear2.refreshToken';
const USER_KEY = 'hear2.user';
const COUPLE_KEY = 'hear2.coupleConnected';

async function readSecure(key) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}
async function writeSecure(key, value) {
  try {
    if (value == null) await SecureStore.deleteItemAsync(key);
    else await SecureStore.setItemAsync(key, value);
  } catch {}
}

const AuthContext = createContext({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  coupleConnected: false,
  coupleStartDate: null,
  partner: null,
  hydrating: true,
  signIn: () => {},
  signOut: () => {},
  confirmPartner: async () => ({ ok: false }),
  refreshSession: async () => null,
  refreshCoupleStatus: async () => null,
  loadMe: async () => null,
  updateUser: () => {},
  saveCoupleStartDate: async () => null,
});

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [coupleConnected, setCoupleConnected] = useState(false);
  // 커플 시작일(BE CoupleStatusResponse.startDate). 없으면 null → D-day 숨김.
  const [coupleStartDate, setCoupleStartDate] = useState(null);
  // 연결된 상대 정보(BE CoupleStatusResponse.partner). { userId, nickname, profileImage }
  const [partner, setPartner] = useState(null);
  const [hydrating, setHydrating] = useState(true);

  const accessRef = useRef(null);
  const refreshRef = useRef(null);
  const refreshInFlight = useRef(null);

  useEffect(() => {
    accessRef.current = accessToken;
  }, [accessToken]);
  useEffect(() => {
    refreshRef.current = refreshToken;
  }, [refreshToken]);

  // 부팅 시 토큰 복구. 토큰은 있는데 user가 비어 있으면 /auth/me로 보충.
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [at, rt, userJson, coupleJson] = await Promise.all([
        readSecure(ACCESS_KEY),
        readSecure(REFRESH_KEY),
        readSecure(USER_KEY),
        readSecure(COUPLE_KEY),
      ]);
      if (!mounted) return;
      if (at) {
        accessRef.current = at;
        setAccessToken(at);
      }
      if (rt) {
        refreshRef.current = rt;
        setRefreshToken(rt);
      }
      let restoredUser = null;
      if (userJson) {
        try {
          restoredUser = JSON.parse(userJson);
          setUser(restoredUser);
        } catch {}
      }
      if (coupleJson === '1') setCoupleConnected(true);
      setHydrating(false);

      // 토큰은 있지만 user 객체가 비어 있거나 userId가 없으면 /me로 채움.
      const hasId = restoredUser && (restoredUser.userId != null || restoredUser.id != null);
      if (at && !hasId) {
        try {
          const me = await fetchMe();
          if (mounted && me) {
            setUser(me);
            restoredUser = me;
            await writeSecure(USER_KEY, JSON.stringify(me));
          }
        } catch {
          // 401 등은 인터셉터/refreshHandler가 처리. 무시.
        }
      }

      // /me 응답에는 coupleId/partner/startDate가 없으므로 /couples/status로 따로 채움.
      // coupleId가 이미 있어도 partner·startDate 동기화를 위해 항상 조회한다.
      if (at && !endpoints.MOCK) {
        try {
          const status = await fetchCoupleStatus();
          if (!mounted) return;
          const cid = status?.coupleId ?? null;
          if (status?.startDate) setCoupleStartDate(status.startDate);
          if (status?.partner) setPartner(status.partner);
          if (status?.connected) {
            setCoupleConnected(true);
            await writeSecure(COUPLE_KEY, '1');
          }
          if (cid != null) {
            setUser((prev) => {
              const next = { ...(prev ?? {}), coupleId: cid };
              writeSecure(USER_KEY, JSON.stringify(next));
              return next;
            });
          }
        } catch {
          // 무시 — refreshCoupleStatus가 화면 진입 시 재시도
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persistTokens = useCallback(async (at, rt, u) => {
    await Promise.all([
      writeSecure(ACCESS_KEY, at ?? null),
      writeSecure(REFRESH_KEY, rt ?? null),
      writeSecure(USER_KEY, u ? JSON.stringify(u) : null),
    ]);
  }, []);

  const persistCoupleConnected = useCallback(async (v) => {
    await writeSecure(COUPLE_KEY, v ? '1' : null);
  }, []);

  const signIn = useCallback(
    async ({ accessToken: at, refreshToken: rt, user: u } = {}) => {
      setAccessToken(at ?? null);
      setRefreshToken(rt ?? null);
      if (u !== undefined) setUser(u ?? null);
      // user에 coupleId가 있으면 이미 연결된 계정
      const connected = !!(u && u.coupleId);
      setCoupleConnected(connected);
      await Promise.all([
        persistTokens(at, rt, u ?? null),
        persistCoupleConnected(connected),
      ]);
    },
    [persistTokens, persistCoupleConnected],
  );

  const signOut = useCallback(async () => {
    // 서버에 로그아웃 통보 (실패해도 로컬 토큰은 무조건 정리)
    if (!endpoints.MOCK && accessRef.current) {
      try {
        await logoutRequest();
      } catch {
        // ignore — 어차피 로그아웃이니까
      }
    }
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setCoupleConnected(false);
    setCoupleStartDate(null);
    setPartner(null);
    await Promise.all([
      persistTokens(null, null, null),
      persistCoupleConnected(false),
    ]);
  }, [persistTokens, persistCoupleConnected]);

  // 파트너 코드로 커플 연결 시도.
  // BE 정상 응답: CoupleStatusResponse { connected, coupleId, coupleCode, memberCount, ... }
  const confirmPartner = useCallback(
    async ({ code } = {}) => {
      if (endpoints.MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        if (!code || code.length < 6) {
          return { ok: false, message: '코드를 정확히 입력해주세요.' };
        }
        setCoupleConnected(true);
        await persistCoupleConnected(true);
        setUser((prev) => ({ ...(prev ?? {}), coupleId: 'mock-couple' }));
        return { ok: true };
      }

      const trimmed = (code ?? '').trim().toUpperCase();
      if (!trimmed) {
        return { ok: false, message: '코드를 입력해주세요.' };
      }

      try {
        const status = await connectCoupleRequest({ coupleCode: trimmed });
        const connected = !!status?.connected;
        const coupleId = status?.coupleId ?? null;
        if (status?.partner) setPartner(status.partner);
        if (status?.startDate) setCoupleStartDate(status.startDate);
        if (connected) {
          setCoupleConnected(true);
          await persistCoupleConnected(true);
        }
        if (coupleId) {
          setUser((prev) => ({ ...(prev ?? {}), coupleId }));
        }
        return { ok: connected, status };
      } catch (err) {
        return {
          ok: false,
          message: err?.message || '연결에 실패했어요. 코드를 확인해주세요.',
        };
      }
    },
    [persistCoupleConnected],
  );

  // 로그인된 사용자의 현재 커플 상태 동기화. 화면 진입/포커스 시 호출.
  const refreshCoupleStatus = useCallback(async () => {
    if (endpoints.MOCK) return null;
    try {
      const status = await fetchCoupleStatus();
      const connected = !!status?.connected;
      const coupleId = status?.coupleId ?? null;
      setCoupleConnected(connected);
      setCoupleStartDate(status?.startDate ?? null);
      setPartner(status?.partner ?? null);
      await persistCoupleConnected(connected);
      if (coupleId) {
        setUser((prev) => ({ ...(prev ?? {}), coupleId }));
      }
      return status;
    } catch {
      return null;
    }
  }, [persistCoupleConnected]);

  // 401 시 호출됨. 동시에 여러 호출이 들어와도 한 번만 실제 reissue 수행.
  const refreshSession = useCallback(async () => {
    if (!refreshRef.current) return null;
    if (refreshInFlight.current) return refreshInFlight.current;

    refreshInFlight.current = (async () => {
      try {
        const res = await reissueRequest({ refreshToken: refreshRef.current });
        const newAccess = res?.accessToken ?? null;
        const newRefresh = res?.refreshToken ?? refreshRef.current;
        if (!newAccess) return null;
        setAccessToken(newAccess);
        if (newRefresh !== refreshRef.current) setRefreshToken(newRefresh);
        await persistTokens(newAccess, newRefresh, null);
        return newAccess;
      } catch {
        return null;
      } finally {
        refreshInFlight.current = null;
      }
    })();
    return refreshInFlight.current;
  }, [persistTokens]);

  const loadMe = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me ?? null);
      await writeSecure(USER_KEY, me ? JSON.stringify(me) : null);
      return me;
    } catch {
      return null;
    }
  }, []);

  // 사귄 날(커플 시작일) 저장. BE에 PATCH 후 로컬 상태 갱신.
  // 성공 시 갱신된 startDate(ISO)를 반환, 실패 시 throw.
  const saveCoupleStartDate = useCallback(async (startDate) => {
    if (endpoints.MOCK) {
      setCoupleStartDate(startDate ?? null);
      return startDate ?? null;
    }
    const status = await setCoupleStartDateRequest({ startDate });
    const next = status?.startDate ?? startDate ?? null;
    setCoupleStartDate(next);
    if (status?.partner) setPartner(status.partner);
    return next;
  }, []);

  // user 객체에 부분 필드 병합 + 로컬 영속화.
  // 현재 BE에 프로필 수정 엔드포인트가 없어 로컬 저장만 수행한다.
  // (BE에 PATCH 프로필 API가 생기면 여기서 함께 호출하도록 확장)
  const updateUser = useCallback((partial) => {
    if (!partial) return;
    setUser((prev) => {
      const next = { ...(prev ?? {}), ...partial };
      writeSecure(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // client.js + chatAPI(multipart 업로드)에 토큰 주입
  useEffect(() => {
    setAuthTokenProvider(() => accessRef.current);
    setUploadTokenProvider(() => accessRef.current);
    setRefreshHandler(() => refreshSession());
    setAuthFailureHandler(() => {
      signOut();
    });
    return () => {
      setAuthTokenProvider(() => null);
      setUploadTokenProvider(() => null);
      setRefreshHandler(null);
      setAuthFailureHandler(null);
    };
  }, [refreshSession, signOut]);

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      user,
      coupleConnected,
      coupleStartDate,
      partner,
      hydrating,
      isAuthenticated: !!accessToken,
      signIn,
      signOut,
      confirmPartner,
      refreshSession,
      refreshCoupleStatus,
      loadMe,
      updateUser,
      saveCoupleStartDate,
    }),
    [
      accessToken,
      refreshToken,
      user,
      coupleConnected,
      coupleStartDate,
      partner,
      hydrating,
      signIn,
      signOut,
      confirmPartner,
      refreshSession,
      refreshCoupleStatus,
      loadMe,
      updateUser,
      saveCoupleStartDate,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
