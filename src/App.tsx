import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Home from "./pages/dashboard/Home";
import PrivateRoute from "./routes/PrivateRoute";
import Admin from "./pages/dashboard/Admin";
import User from "./pages/dashboard/User";
import Testing from "./pages/dashboard/Testing";
import RoleRoute from "./routes/RoleRoute";
import Tenant from "./pages/dashboard/Tenant";
import EmisionComprobantes from "./pages/emission_eNCF/EmisionComprobantes";
import AnularSecuenciaAutorizada from "./pages/emission_eNCF/AnularSecuenciaAutorizada";
import AprobacionComprobantes from "./pages/aprobacion_eNCF/AprobacionComprobantes";
import MainLayout from "./components/layouts/MainLayout";
import NotFound from "./pages/dashboard/NotFound";
import UpdateDigitalCertificate from "./pages/Certificate/UpdateCertificate";
import Roles from "./pages/dashboard/Roles";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rutas dentro de MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />

          {/* Rutas protegidas con RoleRoute */}
          {/* DASHBOARD PAGES */}
          <Route path="/admin" element={<PrivateRoute><RoleRoute><Admin /></RoleRoute></PrivateRoute>} />
          <Route path="/tenant" element={<PrivateRoute><RoleRoute><Tenant /></RoleRoute></PrivateRoute>} />
          <Route path="/user" element={<PrivateRoute><RoleRoute><User /></RoleRoute></PrivateRoute>} />
          <Route path="/testing" element={<PrivateRoute><RoleRoute><Testing /></RoleRoute></PrivateRoute>} />
          
          {/* CERTIFICADO PAGE */}
          <Route path="/AdmCertificadoDigital" element={<PrivateRoute><RoleRoute><UpdateDigitalCertificate /></RoleRoute></PrivateRoute>} />

           {/* ROLES PAGE */}
           <Route path="/AdmRol" element={<PrivateRoute><RoleRoute><Roles /></RoleRoute></PrivateRoute>} />

          {/* EMISION COMPROBANTES */}
          <Route path="/emision-eNCF" element={<PrivateRoute><RoleRoute><EmisionComprobantes /></RoleRoute></PrivateRoute>} />
          <Route path="/AnularSecuenciaAutorizada" element={<PrivateRoute><RoleRoute><AnularSecuenciaAutorizada /></RoleRoute></PrivateRoute>} />

          {/* APROBACION COMPROBANTES */}
          <Route path="/aprobacion-eNCF" element={<PrivateRoute><RoleRoute><AprobacionComprobantes /></RoleRoute></PrivateRoute>} />

          {/* Ruta para manejar páginas no encontradas */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
