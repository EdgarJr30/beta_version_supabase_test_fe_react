import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/ui/Pagination";
import { format } from "date-fns";

interface Rol {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

const Roles: React.FC = () => {
    const { roles } = useAuth();
    const [role, setRole] = useState<Rol[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination
    const itemsPerPage = 10;
    const {
        paginatedData: paginatedAnulaciones,
        currentPage,
        setCurrentPage,
    } = usePagination({
        data: role,
        itemsPerPage,
    });

    // Fetch data on mount or when roles change
    useEffect(() => {
        if (roles === "admin" || roles === "user") {
            fetchRole();
        } else {
            setLoading(false);
        }
    }, [roles]);

    const fetchRole = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("roles")
                .select("*");
            if (error) {
                console.error("❌ Error fetching anulaciones:", error.message);
            } else {
                setRole(data || []);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleEmitir = () => {
        //TODO ... Logica para el submit ...
        console.log("Crear Rol con:", {});
        handleCloseModal();
    };

    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleOpenModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                    Crear Rol
                </button>
            </div>

            {loading ? (
                <div className="text-center text-gray-500">Cargando roles...</div>
            ) : (
                <>
                    <div className="bg-white shadow-md overflow-x-auto">
                        <table className="min-w-full text-xs border-collapse">
                            <thead className="bg-gray-200 text-gray-700">
                                <tr>
                                    <th className="p-2 border border-gray-700 min-w-[50px]">ID</th>
                                    <th className="p-2 border border-gray-700 min-w-[250px]">Nombre</th>
                                    <th className="p-2 border border-gray-700 min-w-[250px]">Descripcion</th>
                                    <th className="p-2 border border-gray-700 min-w-[150px]">Fecha de creacion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAnulaciones.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-100">
                                        <td className="p-2 border">{item.id}</td>
                                        <td className="p-2 border">{item.name}</td>
                                        <td className="p-2 border">{item.description}</td>
                                        <td className="p-2 border">
                                            {format(new Date(item.created_at), "dd/MM/yyyy HH:mm:ss")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalItems={role.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Crear Rol</h2>
                            <button onClick={handleCloseModal} className="text-gray-500">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">

                            </div>

                            <div className="flex items-center space-x-2">
                                <button className="bg-blue-500 text-white px-3 py-1 rounded">
                                    Agregar
                                </button>
                            </div>

                            <div className="overflow-x-auto border rounded">
                                <table className="min-w-full text-xs">
                                    <thead className="bg-gray-200 text-gray-700">
                                        <tr>
                                            <th className="p-2 border">Tipo de documento</th>
                                            <th className="p-2 border">Desde</th>
                                            <th className="p-2 border">Hasta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Si no hay data, se muestra esto: */}
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="text-center p-2 text-gray-500 border"
                                            >
                                                Ningún dato disponible en esta tabla
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modal actions */}
                        <div className="mt-6 flex justify-end space-x-2">
                            <button
                                onClick={handleCloseModal}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEmitir}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            >
                                Emitir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;
