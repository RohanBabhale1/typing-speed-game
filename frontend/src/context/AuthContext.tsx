import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { gqlClient, setAuthToken } from "../graphql/client";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "../graphql/operations";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "typing-game:token";
const USER_KEY = "typing-game:user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  });

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  function persist(newToken: string, newUser: User) {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  async function login(email: string, password: string) {
    const data = await gqlClient.request<{ login: { token: string; user: User } }>(
      LOGIN_MUTATION,
      { email, password }
    );
    persist(data.login.token, data.login.user);
  }

  async function register(email: string, username: string, password: string) {
    const data = await gqlClient.request<{ register: { token: string; user: User } }>(
      REGISTER_MUTATION,
      { email, username, password }
    );
    persist(data.register.token, data.register.user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}