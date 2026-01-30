import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "../Ecommerce/services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);

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

  const refreshWallet = async (overrideToken) => {
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
  };

  const validateToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const userData =
        localStorage.getItem("user") || sessionStorage.getItem("user");

      if (token && userData) {
        const isValid = await validateToken(token);

        if (isValid) {
          setToken(token);
          setUser(JSON.parse(userData));
          await refreshWallet(token);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setWallet(null);
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
