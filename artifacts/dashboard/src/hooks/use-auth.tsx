import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface AuthState {
  shopId: string;
  email: string;
  plan?: string;
}

interface AuthContextType {
  auth: AuthState | null;
  login: (state: AuthState) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  credentials: { shopId: string } | null;
}

interface MeResponse {
  shopId: string;
  email: string;
  plan: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  /*
   * On every mount, we validate the HttpOnly session cookie by calling /api/auth/me.
   * This is the single source of truth — we do not read from sessionStorage first.
   * If the server says the session is valid, we hydrate auth from its response.
   * This ensures new tabs, restored sessions, and page refreshes all work correctly.
   */
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json() as MeResponse;
          setAuth({ shopId: data.shopId, email: data.email, plan: data.plan });
        } else {
          setAuth(null);
        }
      })
      .catch(() => {
        setAuth(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (state: AuthState) => {
    setAuth(state);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
    }
    setAuth(null);
    setLocation("/");
  };

  const credentials = auth ? { shopId: auth.shopId } : null;

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated: !!auth, isLoading, credentials }}>
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
