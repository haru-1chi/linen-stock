import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setAuthErrorInterceptor } from "../utils/axiosInstance";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const API_BASE =
    import.meta.env.VITE_REACT_APP_API || "http://localhost:3000/api";

  useEffect(() => {
    if (!user || !token) return;
  }, [user, token]);

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save token
      localStorage.setItem("token", data.token);
      setToken(data.token);

      const profileRes = await fetch(`${API_BASE}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
      const profile = await profileRes.json();
      setUser(profile.data);

      if (profile.data.verify === 0) {
        navigate("/profile");
      } else {
        navigate("/linen/dashboard");
      }
    } catch (err) {
      throw err;
    }
  };

  const logout = useCallback(async () => {
    try {
      if (token && "serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const sub = await registration.pushManager.getSubscription();
          console.log("sub", sub);

          if (sub) {
            await axios.post(
              `${API_BASE}/push/unsubscribe`,
              { endpoint: sub.endpoint },
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ Push unsubscribe failed", err);
      // ไม่ต้อง block logout
    } finally {
      // 🧹 Clear auth state
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      navigate("/login", { replace: true });
    }
  }, [API_BASE, token, navigate]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      // 1. cheap check (jwt)
      try {
        const decoded = jwtDecode(storedToken);
        const now = Date.now() / 1000;

        if (decoded.exp < now) {
          localStorage.removeItem("token");
          setUser(null);
          setLoading(false);
          return;
        }
      } catch {
        localStorage.removeItem("token");
        setUser(null);
        setLoading(false);
        return;
      }

      // 2. authoritative check (backend)
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!res.ok) throw new Error("unauthorized");

        const profile = await res.json();
        setToken(storedToken);
        setUser(profile.data);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const dummyToast = (severity, summary, detail) => {
      console.error("Interceptor Toast:", summary, detail);
    };

    setAuthErrorInterceptor(logout, dummyToast, navigate);
  }, [logout, navigate]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, token, setToken, login, logout, loading }}
    >
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
