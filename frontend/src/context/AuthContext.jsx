import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Load user from token on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (token) => {
    try {
      const res = await api.get("/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  //  LOGIN = token → fetch profile
  const login = async (token) => {
    localStorage.setItem("token", token);
    await loadUser(token);
    return user;
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser, // 🔥 expose setter
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
