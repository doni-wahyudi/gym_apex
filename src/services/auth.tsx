import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from './supabaseClient';
import { gymStore } from './gymStore';

export type AuthMode = 'supabase' | 'demo' | 'none';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  authMode: AuthMode;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  authMode: 'none',
  isLoading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  enterDemoMode: () => {},
});

const DEMO_MODE_KEY = 'apexforge_demo_mode';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('none');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. If user previously chose demo mode, restore it
    const savedDemo = localStorage.getItem(DEMO_MODE_KEY);
    if (savedDemo === 'true') {
      setAuthMode('demo');
      setIsLoading(false);
      return;
    }

    const supabase = getSupabase();

    if (!supabase) {
      // No Supabase credentials — show login page (user can choose demo from there)
      setAuthMode('none');
      setIsLoading(false);
      return;
    }

    // 2. Supabase available — check for existing session (e.g., from previous login)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
        setUser(s.user);
        setAuthMode('supabase');
        gymStore.switchToLiveMode();
      } else {
        setAuthMode('none');
      }
      setIsLoading(false);
    });

    // 3. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s) {
        setSession(s);
        setUser(s.user);
        setAuthMode('supabase');
        gymStore.switchToLiveMode();
        localStorage.removeItem(DEMO_MODE_KEY);
      } else {
        setSession(null);
        setUser(null);
        // Only set to 'none' if not already in demo mode
        setAuthMode((prev) => prev === 'demo' ? 'demo' : 'none');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const supabase = getSupabase();
    if (!supabase) {
      return { error: 'Supabase belum dikonfigurasi. Gunakan mode demo atau atur URL & Anon Key di Pengaturan.' };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    setSession(data.session);
    setUser(data.user);
    setAuthMode('supabase');
    gymStore.switchToLiveMode();
    localStorage.removeItem(DEMO_MODE_KEY);
    return { error: null };
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setAuthMode('none');
    gymStore.switchToDemoMode();
    localStorage.removeItem(DEMO_MODE_KEY);
  };

  const enterDemoMode = () => {
    localStorage.setItem(DEMO_MODE_KEY, 'true');
    setAuthMode('demo');
    gymStore.switchToDemoMode();
  };

  return (
    <AuthContext.Provider value={{ session, user, authMode, isLoading, signIn, signOut, enterDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
