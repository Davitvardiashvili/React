import { createContext, useContext, useState } from "react";
import axiosInstance from "../axiosInstance/axiosInstance";
import axios from "axios";

const AuthContext = createContext();

const baseURL = "http://localhost:8000/";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true");
  const [credential, setCredential] = useState({
    username: null,
    password: null,
  });

  const login = async () => {
    try {
      const res = await axiosInstance.post(`/api-token-auth/`, credential);
      const token = res.data.token;
      if (token) {
        setAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        console.log("-----------------------------------LOGIIINN");
        localStorage.setItem("token", "Token " + token);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/logout/");
      console.log("-----------------------------------LOGOOOOUT");
      setAuthenticated(false);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, credential, setCredential, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};