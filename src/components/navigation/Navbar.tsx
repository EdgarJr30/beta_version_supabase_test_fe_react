import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import AppVersion from "../AppVersion";

const Navbar = () => {
    const { signOut, roles } = useAuth();
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    // const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchCompanyName = async () => {
            const { data, error } = await supabase
                .from("tenant")
                .select("fiscal_name")
                .single();

            if (error) {
                console.error("Error al obtener el nombre de la empresa:", error.message);
            } else {
                setCompanyName(data.fiscal_name);
            }
        };

        fetchCompanyName();
    }, []);

    const handleMouseEnter = (menu: string) => {
        setOpenDropdown(menu);
        // setOpenSubmenu(null);
    };

    const handleMouseLeaveNavbar = () => {
        setOpenDropdown(null);
        // setOpenSubmenu(null);
    };

    const handleNavClick = () => {
        setIsMobileMenuOpen(false);
        setOpenDropdown(null);
        // setOpenSubmenu(null);
    };

    return (
        <div className="font-roboto" onMouseLeave={handleMouseLeaveNavbar}>
            {/* Logo y botón de menú en móviles */}
            <div className="bg-white p-2 flex justify-between sm:justify-center items-center border-b border-gray-300">
                <img src="https://placehold.co/200x60?text=Company+Logo" alt="Company Logo" className="h-12" />


                {/* Botón de menú hamburguesa en móviles */}
                <button
                    className="sm:hidden text-blue-600 p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? "✖️" : "☰"}
                </button>
            </div>
            <AppVersion />

            {/* Menú principal */}
            <div className={`bg-blue-600 p-2 ${isMobileMenuOpen ? "block" : "hidden"} sm:flex sm:items-center sm:justify-between`}>
                <nav className="relative w-full">
                    <ul className="flex flex-col sm:flex-row sm:space-x-1 text-sm font-semibold">
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

                        {/* ADMINISTRACIÓN */}
                        {roles === "admin" && (
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
                                            <Link className="block w-full h-full" to="/admin">Configuración</Link>
                                        </li>
                                        <li className="hover:bg-gray-200 px-4 py-2" onClick={handleNavClick}>
                                            <Link className="block w-full h-full" to="/user">Usuarios</Link>
                                        </li>
                                        <li className="hover:bg-gray-200 px-4 py-2" onClick={handleNavClick}>
                                            <Link className="block w-full h-full" to="/tenant">Actualización Datos Empresa</Link>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        )}

                        {/* EMISIÓN DE COMPROBANTES */}
                        {(roles === "admin" || roles === "user") && (
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
                                        <li
                                            className="relative group"
                                            // onMouseEnter={() => setOpenSubmenu("reportes")}
                                            // onMouseLeave={() => setOpenSubmenu(null)}
                                        >
                                            {/* Para poder abrir sub menus, aqui esta la logica */}
                                            {/* <span className="block px-4 py-2 cursor-pointer hover:bg-gray-200">
                                                Reportes De Documentos
                                            </span> */}
                                            {/* {openSubmenu === "reportes" && (
                                                <ul className="absolute left-full top-0 mt-0 w-64 bg-white text-gray-800 shadow-lg rounded-md border border-gray-300 z-50">
                                                    <li className="hover:bg-gray-200 px-4 py-2 flex justify-between" onClick={handleNavClick}>
                                                        <Link className="block w-full h-full" to="/emision-eNCF">Consulta General</Link>
                                                        <span className="text-red-600 text-sm font-semibold">(Nuevo)</span>
                                                    </li>
                                                </ul>
                                            )} */}

                                        </li>
                                        <li className="hover:bg-gray-200 px-4 py-2" onClick={handleNavClick}>
                                            <Link className="block w-full h-full" to="/emision-eNCF">Consulta General</Link>
                                        </li>
                                        <li className="hover:bg-gray-200 px-4 py-2" onClick={handleNavClick}>
                                            <Link className="block w-full h-full" to="/AnularSecuenciaAutorizada">Anulación De Secuencias</Link>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        )}

                        {/* RECEPCIÓN DE COMPROBANTES */}
                        {(roles === "admin" || roles === "testing") && (
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
                                            <Link className="block w-full h-full" to="/aprobacion-eNCF">Consulta General</Link>
                                        </li>
                                        <li className="hover:bg-gray-200 px-4 py-2" onClick={handleNavClick}>
                                            <Link className="block w-full h-full" to="/reportes-aprobacion">Reportes De Aprobación Comercial</Link>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        )}
                    </ul>
                </nav>

                {/* Información de usuario */}
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm font-semibold">
                    <span className="text-white">{roles ? roles.toUpperCase() : "No autenticado"}</span>
                    <span className="text-white flex-1 truncate">{companyName ? companyName : "Cargando..."}</span>
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
