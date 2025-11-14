import React, { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { API_BASE_URL } from "../config/api";

interface User {
  id: string;
  name: string;
  email: string;
  preferredUnit?: "km" | "mi";
  // Map Preferences
  mapStyle?:
    | "streets-v12"
    | "satellite-streets-v12"
    | "outdoors-v12"
    | "dark-v11";
  defaultZoom?: number;
  autoSaveRoutes?: boolean;
  // Display Preferences
  compactView?: boolean;
  showRoutePreview?: boolean;
  reduceAnimations?: boolean;
  fontSize?: "small" | "medium" | "large";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePreferredUnit: (unit: "km" | "mi") => Promise<void>;
  updatePreferences: (preferences: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/api`;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updatePreferredUnit = async (unit: "km" | "mi") => {
    try {
      const response = await fetch(`${API_URL}/auth/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferredUnit: unit }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update preferences");
      }

      // Update user in state and localStorage
      const updatedUser = { ...user!, preferredUnit: unit };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error updating preferences:", error);
      throw error;
    }
  };

  const updatePreferences = async (preferences: Partial<User>) => {
    try {
      const response = await fetch(`${API_URL}/auth/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update preferences");
      }

      // Update user in state and localStorage
      const updatedUser = { ...user!, ...preferences };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error updating preferences:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        updatePreferredUnit,
        updatePreferences,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
