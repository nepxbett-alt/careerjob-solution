import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Role = 'candidate' | 'business' | 'owner' | 'admin' | 'recruiter' | 'staff' | 'accountant' | 'viewer';

interface Profile {
  id: string;
  role: Role;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, authUser?: User | null) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, full_name, phone, email, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      setProfile(null);
      return;
    }

    let p = data as Profile | null;

    // Sync role / name from auth metadata on first login (register chose candidate or business)
    if (p && authUser?.user_metadata) {
      const metaName = authUser.user_metadata.full_name as string | undefined;
      const metaPhone = authUser.user_metadata.phone as string | undefined;
      const updates: { full_name?: string; phone?: string } = {};

      // Public registration is candidate-only. Staff roles are assigned by admins in the database.
      if (metaName && !p.full_name) updates.full_name = metaName;
      if (metaPhone && !p.phone) updates.phone = metaPhone;

      if (Object.keys(updates).length > 0) {
        const { data: updated } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select('id, role, full_name, phone, email, avatar_url')
          .single();
        if (updated) p = updated as Profile;
      }
    }

    setProfile(p);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id, user);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/login',
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, signInWithMagicLink, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
