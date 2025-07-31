'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, AuthError } from '@supabase/supabase-js';
import type { SignInWithPasswordCredentials } from '@supabase/supabase-js';

// Extend the signup credentials to include the full name
interface SignUpCredentials extends SignInWithPasswordCredentials {
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithPassword: (credentials: SignInWithPasswordCredentials) => Promise<{ error: AuthError | null }>;
  signUp: (credentials: SignUpCredentials) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithPassword: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);
    }
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (credentials: SignInWithPasswordCredentials) => {
    const { error } = await supabase.auth.signInWithPassword(credentials);
    return { error };
  };

  const signUp = async ({ email, password, fullName }: SignUpCredentials) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    loading,
    signInWithPassword,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
