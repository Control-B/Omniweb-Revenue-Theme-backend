import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface AuthCredentials {
  shopId: string;
  apiKey: string;
}

interface AuthContextType {
  credentials: AuthCredentials | null;
  login: (creds: AuthCredentials) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<AuthCredentials | null>(() => {
    try {
      const stored = localStorage.getItem("ow_merchant_auth");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [, setLocation] = useLocation();

  const login = (creds: AuthCredentials) => {
    setCredentials(creds);
    localStorage.setItem("ow_merchant_auth", JSON.stringify(creds));
  };

  const logout = () => {
    setCredentials(null);
    localStorage.removeItem("ow_merchant_auth");
    setLocation("/");
  };

  return (
    <AuthContext.Provider value={{ credentials, login, logout, isAuthenticated: !!credentials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
