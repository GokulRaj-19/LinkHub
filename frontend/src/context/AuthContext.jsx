import React, { createContext, useContext, useState, useEffect } from "react";

import { authApi } from "../api/authApi";
import { useTheme } from "./ThemeContext";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const current = await authApi.getCurrentUser();

        if (!active) return;

        setUser(current);

        if (current?.theme) {
          setTheme(current.theme);
        }
      } catch (error) {
        console.error("Unable to restore session:", error.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [setTheme]);

  const login = async (email, password) => {
    const loggedUser = await authApi.login(email, password);

    setUser(loggedUser);

    if (loggedUser?.theme) {
      setTheme(loggedUser.theme);
    }

    return loggedUser;
  };

  const register = async (data) => {
    const newUser = await authApi.register(data);

    setUser(newUser);

    if (newUser?.theme) {
      setTheme(newUser.theme);
    }

    return newUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (data) => {
    const updated = await authApi.updateProfile(data);
    setUser(updated);
    return updated;
  };

  const updateUserTheme = async (newTheme) => {
    setTheme(newTheme);

    if (user) {
      await authApi.updateTheme(newTheme);
      setUser((prev) => (prev ? { ...prev, theme: newTheme } : null));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updateUserTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
