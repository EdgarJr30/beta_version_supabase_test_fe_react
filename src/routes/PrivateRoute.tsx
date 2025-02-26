import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JSX } from "react";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { session, loading } = useAuth();

    if (loading) {
        return <div className="text-center text-white">Cargando sesión...</div>;
    }

    if (!session) {
        console.log("🔒 Usuario no autenticado, redirigiendo...");
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;
