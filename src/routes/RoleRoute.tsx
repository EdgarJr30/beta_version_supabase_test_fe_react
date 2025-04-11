import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { rolePermissions } from "../routes/rolePermissions";

interface RoleRouteProps {
  children: ReactNode;
}

export default function RoleRoute({ children }: RoleRouteProps) {
  const { roles, loading } = useAuth();
  const location = useLocation();

  // ⏳ Si aún está cargando la autenticación, muestra un mensaje temporal.
  if (loading || roles === null) {
    return
  }

  // ✅ Verifica si el rol tiene permiso para acceder a esta ruta
  if (!rolePermissions[roles]?.includes(location.pathname)) {
    console.warn(`🔴 Acceso denegado: el rol "${roles}" no tiene permiso para acceder a "${location.pathname}".`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
