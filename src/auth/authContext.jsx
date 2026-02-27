import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { API_BASE } from "../Ecommerce/services/api";
import { notyf } from "../utils/notifications";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const sessionAlertLockRef = useRef(false);

  const extractWallet = (data) => {
    if (!data || typeof data !== "object") return null;
    const direct = data.wallet || data.billetera || data?.data?.wallet || data?.data?.billetera;
    if (direct) return direct;
    if (data.balance != null || data.amount != null || data.credits != null) return data;
    if (data.data && (data.data.balance != null || data.data.amount != null || data.data.credits != null)) {
      return data.data;
    }
    return null;
  };

  const clearStoredSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setToken(null);
    setUser(null);
    setWallet(null);
  }, [clearStoredSession]);

  const notifySessionExpired = useCallback(() => {
    if (sessionAlertLockRef.current) return;
    sessionAlertLockRef.current = true;
    notyf.error("Tu sesion expiro. Inicia sesion nuevamente.");
    setTimeout(() => {
      sessionAlertLockRef.current = false;
    }, 2500);
  }, []);

  const refreshWallet = useCallback(async (overrideToken) => {
    const currentToken =
      overrideToken ||
      token ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");
    if (!currentToken) return null;

    setWalletLoading(true);
    try {
      const response = await fetch(`${API_BASE}/wallet/me`, {
        headers: { "x-token": currentToken },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.msg || "Error al obtener wallet");

      const walletData = extractWallet(data);
      if (walletData) setWallet(walletData);
      return walletData;
    } catch {
      return null;
    } finally {
      setWalletLoading(false);
    }
  }, [token]);

  const safeParseUser = (raw) => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  };

  const mergeUserData = (storedUser, renewedUser) => {
    if (!storedUser && !renewedUser) return null;
    return {
      ...(storedUser || {}),
      ...(renewedUser || {}),
    };
  };

  const renewSession = useCallback(async (sessionToken) => {
    try {
      const response = await fetch(`${API_BASE}/auth/renew`, {
        headers: { "x-token": sessionToken },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.msg || data?.message || "Token inválido o expirado";
        throw new Error(message);
      }

      return {
        token: data?.token || sessionToken,
        user: data?.usuario || data?.user || data?.data?.usuario || data?.data || null,
      };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const storedUserData =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const storedUser = safeParseUser(storedUserData);

      if (storedToken) {
        const renewed = await renewSession(storedToken);
        if (renewed?.token) {
          const normalizedUser = mergeUserData(storedUser, renewed.user);

          const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
          storage.setItem("token", renewed.token);
          if (normalizedUser) {
            storage.setItem("user", JSON.stringify(normalizedUser));
          }

          setToken(renewed.token);
          setUser(normalizedUser);
          await refreshWallet(renewed.token);
        } else {
          notifySessionExpired();
          logout();
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, [logout, notifySessionExpired, renewSession, refreshWallet]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch.bind(window);

    const patchedFetch = async (input, init = {}) => {
      const requestUrl = typeof input === "string" ? input : input?.url || "";
      const isApiRequest = requestUrl.startsWith(API_BASE);
      const isPublicAuthRoute =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register") ||
        requestUrl.includes("/auth/renew");

      let nextInit = init;
      if (isApiRequest) {
        const activeToken =
          token ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (activeToken) {
          const headers = new Headers(init?.headers || {});
          if (!headers.has("x-token")) headers.set("x-token", activeToken);
          nextInit = { ...init, headers };
        }
      }

      const response = await originalFetch(input, nextInit);

      if (isApiRequest && !isPublicAuthRoute && response.status === 401) {
        notifySessionExpired();
        logout();
      }

      return response;
    };

    window.fetch = patchedFetch;
    return () => {
      window.fetch = originalFetch;
    };
  }, [logout, notifySessionExpired, token]);

  const login = async (email, password, remember = false) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.msg || "Error al iniciar sesión");

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", data.token);
    storage.setItem("user", JSON.stringify(data.usuario));
    setToken(data.token);
    setUser(data.usuario);
    await refreshWallet(data.token);

    return data.usuario;
  };

  const isAuthenticated = !!user;
  
  const register = async (userData) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data?.msg || "Error al registrarse");

  // Guardar el token y usuario en el almacenamiento y estado
  const storage = localStorage; // o sessionStorage según prefieras
  storage.setItem("token", data.token);
  storage.setItem("user", JSON.stringify(data.usuario));
  setToken(data.token);
  setUser(data.usuario);
  await refreshWallet(data.token);

  return data;
};

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        isAuthenticated,
        loading,
        wallet,
        walletLoading,
        refreshWallet,
        setWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
