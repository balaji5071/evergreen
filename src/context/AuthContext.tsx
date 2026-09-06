"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "Customer" | "Admin" | "Staff";
  permissions?: string[];
  employeeId?: string;
  dutyStatus?: string;
  notificationEnabled: boolean;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string; user?: UserData }>;
  signup: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<{ success: boolean; message?: string; user?: UserData }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      // Increase timeout for mobile Wi-Fi IP connections (10 seconds)
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("/api/auth/me", { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || "Login failed" };
      }
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, message: error.message || "Network error" };
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || "Signup failed" };
      }
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, message: error.message || "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
