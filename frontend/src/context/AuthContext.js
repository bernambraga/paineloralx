// AuthContext.js - Versão reconstruída simplificada e funcional

import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import axiosInstance from "../services/axiosInstance";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = (() => {
    const host = window.location.hostname;
    if (host.includes("localhost")) return "http://localhost:8000/api";
    if (host.includes("dev.")) return "https://dev.paineloralx.com.br/api";
    return "https://paineloralx.com.br/api";
  })();

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/login/`, {
        username,
        password,
      });
      console.info(response);
      const { access, refresh } = response.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      setUser(jwtDecode(access));

      await fetchUserInfo();

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const detail =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Erro inesperado";
      return {
        success: false,
        detail,
        error: error.response?.data || "Erro inesperado",
      };
    }
  };

  const logout = async () => {
    try {
      const refresh_token = localStorage.getItem("refresh_token");
      if (refresh_token) {
        await axiosInstance.post(`${BASE_URL}/logout/`, { refresh_token });
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      return true;
    } catch (error) {
      console.warn(
        "Falha ao invalidar refresh_token (pode já estar expirado):",
        error
      );
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      return true;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      const response = await axios.post(`${BASE_URL}/token/refresh/`, {
        refresh,
      });
      const access = response.data.access;

      localStorage.setItem("access_token", access);
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${access}`;
      setUser(jwtDecode(access));
    } catch (error) {
      console.error("Refresh error:", error);
      logout();
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/current-user/`);
      setUser(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const initializeUser = async () => {
      if (token) {
        try {
          jwtDecode(token); // Só valida se é decodificável
          await fetchUserInfo(); // Aqui puxa dados completos do backend
        } catch (e) {
          await refreshAccessToken(); // Token inválido? tenta refresh
        }
      } else {
        await refreshAccessToken();
      }
      setLoading(false);
    };

    initializeUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
