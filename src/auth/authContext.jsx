// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "../Ecommerce/services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos de autenticación al iniciar
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
        } else {
          // Token inválido, limpiar almacenamiento
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

    // Devuelve el usuario autenticado
    return data.usuario;
  };

  const logout = () => {
    // Eliminar de todos los almacenamientos
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
