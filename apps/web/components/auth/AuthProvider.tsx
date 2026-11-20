'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type DemoUser = {
  name: string;
  email: string;
  initials: string;
  plan: 'Free' | 'Pro';
};

type AuthContextValue = {
  user: DemoUser | null;
  ready: boolean;
  signIn: (profile?: Partial<DemoUser>) => void;
  signOut: () => void;
};

const STORAGE_KEY = 'shd-demo-user';
const defaultUser: DemoUser = {
  name: 'Nguyễn Minh Anh',
  email: 'minhanh@example.com',
  initials: 'MA',
  plan: 'Free',
};

const AuthContext = createContext<AuthContextValue | null>(null);

function makeUser(profile?: Partial<DemoUser>): DemoUser {
  const email = profile?.email || defaultUser.email;
  const name = profile?.name || defaultUser.name;
  const initials = profile?.initials || name.split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase();
  return { ...defaultUser, ...profile, name, email, initials };
}

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(makeUser(JSON.parse(stored) as Partial<DemoUser>));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    ready,
    signIn(profile) {
      const nextUser = makeUser(profile);
      setUser(nextUser);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    },
    signOut() {
      setUser(null);
      window.localStorage.removeItem(STORAGE_KEY);
    },
  }), [ready, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
