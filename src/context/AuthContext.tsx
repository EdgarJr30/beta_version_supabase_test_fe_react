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
  const [session, setSession] = useState<Session | null>(() => {
    const storedSession = localStorage.getItem("session");
    return storedSession ? JSON.parse(storedSession) : null;
  });

  const [roles, setRoles] = useState<string | null>(() => {
    return localStorage.getItem("roles") || null;
  });

  const [loading, setLoading] = useState(true);
  const hasFetchedRole = useRef(false);

  useEffect(() => {
    const fetchSessionAndRole = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();

      setSession(data.session);
      localStorage.setItem("session", JSON.stringify(data.session));

      if (data.session?.user && !hasFetchedRole.current) {
        await fetchUserRole(data.session.user.id);
      }

      setLoading(false);
    };

    fetchSessionAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {

      if (!session) {
        setSession(null);
        setRoles(null);
        localStorage.removeItem("session");
        localStorage.removeItem("roles");
      } else {
        setSession(session);
        fetchUserRole(session.user.id);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
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
      console.warn("⚠️ Usuario no encontrado en 'users'.");
      setRoles(null);
      localStorage.removeItem("roles");
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', data.rol_id)
      .maybeSingle();

    if (roleError || !roleData) {
      console.warn("⚠️ Rol no encontrado en 'roles'.");
      setRoles(null);
      localStorage.removeItem("roles");
    } else {
      setRoles(roleData.name);
      localStorage.setItem("roles", roleData.name);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();

    setSession(null);
    setRoles(null);
    hasFetchedRole.current = false;

    localStorage.removeItem("session");
    localStorage.removeItem("roles");


    // ✅ Forzar redirección al login después de cerrar sesión
    window.location.href = "/login";
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
