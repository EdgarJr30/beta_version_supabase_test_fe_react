import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

const Navbar = () => {
  // Extraemos roles para condicionar el menú y signOut para cerrar sesión
  const { signOut, roles } = useAuth();

  // Nombre de la empresa
  const [companyName, setCompanyName] = useState<string | null>(null);
  // Nombre del usuario en public.users
  const [publicUserName, setPublicUserName] = useState<string | null>(null);

  // Control de dropdowns y menú móvil
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // 1) Obtener nombre de la empresa (tenant)
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenant")
        .select("fiscal_name")
        .single();

      if (tenantError) {
        console.error("Error al obtener el nombre de la empresa:", tenantError.message);
      } else if (tenantData) {
        setCompanyName(tenantData.fiscal_name);
      }

      // 2) Obtener nombre de usuario desde public.users
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (userId) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name")
          .eq("id", userId)
          .maybeSingle();

        if (userError) {
          console.error("Error al obtener el nombre del usuario:", userError.message);
        } else if (userData) {
          setPublicUserName(userData.name);
        }
      }
    };

    fetchData();
  }, []);

  // Manejo de dropdowns
  const handleMouseEnter = (menu: string) => {
    setOpenDropdown(menu);
  };

  const handleMouseLeaveNavbar = () => {
    setOpenDropdown(null);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <div className="font-roboto" onMouseLeave={handleMouseLeaveNavbar}>
      {/* Logo y botón de menú en móviles */}
      <div className="p-2 flex justify-between sm:justify-center items-center border-b border-gray-300">
        <img
          src="https://placehold.co/200x60?text=Company+Logo"
          alt="Company Logo"
          className="h-12"
        />
        {/* Botón de menú hamburguesa en móviles */}
        <button
          className="sm:hidden text-blue-600 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? "✖️" : "☰"}
        </button>
      </div>

      {/* Menú principal */}
      <div
        className={`bg-blue-600 p-2 ${
          isMobileMenuOpen ? "block" : "hidden"
        } sm:flex sm:items-center sm:justify-between`}
      >
        <nav className="relative w-full">
          <ul className="flex flex-col sm:flex-row sm:space-x-1 text-sm font-semibold">
            {/* INICIO */}
            <li>
              <Link
                to="/"
                className="text-white px-6 py-3 rounded-md hover:bg-teal-500 transition block"
                onMouseEnter={() => setOpenDropdown(null)}
                onClick={handleNavClick}
              >
                Inicio
              </Link>
            </li>

            {/* ADMINISTRACIÓN - solo admin */}
            {(roles === "super_admin" || roles === "admin") && (
              <li
                className="relative"
                onMouseEnter={() => handleMouseEnter("admin")}
                onMouseLeave={handleMouseLeaveNavbar}
              >
                <span className="text-white px-6 py-3 rounded-md cursor-pointer hover:bg-teal-500 transition block">
                  Administración
                </span>

                {openDropdown === "admin" && (
                  <ul className="absolute left-0 mt-0 w-64 bg-white text-gray-800 shadow-lg rounded-md overflow-hidden border border-gray-300 z-50">
                    <li className="hover:bg-gray-200 px-4 py-2" onClick={handleNavClick}>
                      <Link className="block w-full h-full" to="/admin">
                        Configuración
                      </Link>
                    </li>
                    <li className="hover:bg-gray-200 px-4 py-2" onClick={handleNavClick}>
                      <Link className="block w-full h-full" to="/AdmRol">
                        Roles
                      </Link>
                    </li>
                    <li className="hover:bg-gray-200 px-4 py-2" onClick={handleNavClick}>
                      <Link className="block w-full h-full" to="/AdmUsuarios">
                        Usuarios
                      </Link>
                    </li>
                    <li className="hover:bg-gray-200 px-4 py-2" onClick={handleNavClick}>
                      <Link className="block w-full h-full" to="/AdmCertificadoDigital">
                        Certificado Digital
                      </Link>
                    </li>
                    <li className="hover:bg-gray-200 px-4 py-2" onClick={handleNavClick}>
                      <Link className="block w-full h-full" to="/tenant">
                        Actualización Datos Empresa
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            )}

            {/* EMISIÓN DE COMPROBANTES - admin o user */}
            {(roles === "super_admin" || roles === "admin" || roles === "user") && (
              <li
                className="relative"
                onMouseEnter={() => handleMouseEnter("emision")}
                onMouseLeave={handleMouseLeaveNavbar}
              >
                <span className="text-white px-6 py-3 rounded-md cursor-pointer hover:bg-teal-500 transition block">
                  Emisión De Comprobantes
                </span>

                {openDropdown === "emision" && (
                  <ul className="absolute left-0 mt-0 w-64 bg-white text-gray-800 shadow-lg rounded-md border border-gray-300 z-50">
                    <li className="hover:bg-gray-200 px-4 py-2" onClick={handleNavClick}>
                      <Link className="block w-full h-full" to="/emision-eNCF">
                        Consulta General
                      </Link>
                    </li>
                    <li className="hover:bg-gray-200 px-4 py-2" onClick={handleNavClick}>
                      <Link className="block w-full h-full" to="/AnularSecuenciaAutorizada">
                        Anulación De Secuencias
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            )}

            {/* RECEPCIÓN DE COMPROBANTES - admin o testing */}
            {(roles === "super_admin" || roles === "admin" || roles === "testing") && (
              <li
                className="relative"
                onMouseEnter={() => handleMouseEnter("recepcion")}
                onMouseLeave={handleMouseLeaveNavbar}
              >
                <span className="text-white px-6 py-3 rounded-md cursor-pointer hover:bg-teal-500 transition block">
                  Recepción De Comprobantes
                </span>

                {openDropdown === "recepcion" && (
                  <ul className="absolute left-0 mt-0 w-64 bg-white text-gray-800 shadow-lg rounded-md overflow-hidden border border-gray-300 z-50">
                    <li className="hover:bg-gray-200 px-4 py-2" onClick={handleNavClick}>
                      <Link className="block w-full h-full" to="/aprobacion-eNCF">
                        Consulta General
                      </Link>
                    </li>
                    <li className="hover:bg-gray-200 px-4 py-2" onClick={handleNavClick}>
                      <Link className="block w-full h-full" to="/reportes-aprobacion">
                        Reportes De Aprobación Comercial
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            )}
          </ul>
        </nav>

        {/* Información de usuario */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm font-semibold">
          {/* Muestra el nombre del usuario de public.users */}
          <span className="text-white">
            {publicUserName ? publicUserName : "No autenticado"}
          </span>

          {/* Muestra el nombre de la empresa */}
          <span className="text-white flex-1 truncate">
            {companyName ? companyName : "Cargando..."}
          </span>

          <button
            onClick={signOut}
            className="text-white text-sm border border-white px-4 py-1 rounded hover:bg-white hover:text-blue-600 transition"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
