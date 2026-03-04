import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = "@crunchy_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(email: string, password: string, name: string) {
    // Mock auth: simulate network delay
    await new Promise((r) => setTimeout(r, 1000));

    // Simple mock validation
    if (!email.includes("@")) {
      throw new Error("Please enter a valid email address");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: email.toLowerCase().trim(),
      name: name.trim(),
    };

    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }

  async function signIn(email: string, password: string) {
    await new Promise((r) => setTimeout(r, 1000));

    if (!email.includes("@")) {
      throw new Error("Please enter a valid email address");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Mock: check if user exists in storage, otherwise create
    const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    let existingUser: User;

    if (stored) {
      existingUser = JSON.parse(stored);
      if (existingUser.email !== email.toLowerCase().trim()) {
        throw new Error("No account found with this email");
      }
    } else {
      // Auto-create for mock purposes
      existingUser = {
        id: Date.now().toString(),
        email: email.toLowerCase().trim(),
        name: email.split("@")[0],
      };
    }

    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(existingUser));
    setUser(existingUser);
  }

  async function signOut() {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut }}>
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
