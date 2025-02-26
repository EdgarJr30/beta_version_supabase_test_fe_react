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
import MainLayout from "./components/layouts/MainLayout";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rutas dentro de MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />

          {/* Rutas protegidas con RoleRoute */}
          <Route path="/admin" element={<PrivateRoute><RoleRoute><Admin /></RoleRoute></PrivateRoute>} />
          <Route path="/tenant" element={<PrivateRoute><RoleRoute><Tenant /></RoleRoute></PrivateRoute>} />
          <Route path="/user" element={<PrivateRoute><RoleRoute><User /></RoleRoute></PrivateRoute>} />
          <Route path="/testing" element={<PrivateRoute><RoleRoute><Testing /></RoleRoute></PrivateRoute>} />
          <Route path="/emision-eNCF" element={<PrivateRoute><RoleRoute><EmisionComprobantes /></RoleRoute></PrivateRoute>} />

          {/* Ruta para manejar páginas no encontradas */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
