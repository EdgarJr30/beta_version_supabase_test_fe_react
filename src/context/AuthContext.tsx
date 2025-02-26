import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  roles: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetchedRole = useRef(false);
  const logoutTimeout = useRef<NodeJS.Timeout | null>(null);

  const scheduleAutoLogout = (expiresAt?: number) => {
    if (!expiresAt) return;

    if (logoutTimeout.current) {
      clearTimeout(logoutTimeout.current);
    }

    const now = Math.floor(Date.now() / 1000);
    const timeout = (expiresAt - now) * 1000;

    if (timeout > 0) {
      logoutTimeout.current = setTimeout(() => {
        handleLogout();
      }, timeout);
    }
  };

  useEffect(() => {
    const fetchSessionAndRole = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setSession(data.session);
        scheduleAutoLogout(data.session.expires_at);

        if (!hasFetchedRole.current) {
          await fetchUserRole(data.session.user.id);
        }
      }
      setLoading(false);
    };

    fetchSessionAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        handleLogout();
      } else {
        setSession(session);
        scheduleAutoLogout(session.expires_at);
        fetchUserRole(session.user.id);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      if (logoutTimeout.current) {
        clearTimeout(logoutTimeout.current);
      }
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    if (hasFetchedRole.current) return;
    hasFetchedRole.current = true;

    const { data, error } = await supabase
      .from('users')
      .select('rol_id')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      setRoles(null);
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', data.rol_id)
      .maybeSingle();

    if (roleError || !roleData) {
      setRoles(null);
    } else {
      setRoles(roleData.name);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRoles(null);
    hasFetchedRole.current = false;

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  };

  const handleLogout = async () => {
    if (!session) return;

    await supabase.auth.signOut();
    setSession(null);
    setRoles(null);

    if (logoutTimeout.current) {
      clearTimeout(logoutTimeout.current);
    }

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user || null, roles, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}