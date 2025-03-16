import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/ui/Pagination";

// Tip: Adjust this interface to match your “anulación” data fields
interface Anulacion {
    id: number;
    tipo_documento: string;
    secuencial_desde: string;
    secuencial_hasta: string;
    // Add other fields as necessary
}

const tipoDocumentoOptions = [
    "Factura de Crédito Fiscal Electrónica",
    "Factura de Consumo Electrónica",
    "Nota de Crédito Electrónica",
    "Nota de Débito Electrónica",
    // etc.
];

const AnularSecuenciaAutorizada: React.FC = () => {
    const { roles } = useAuth();
    const [anulaciones, setAnulaciones] = useState<Anulacion[]>([]);
    const [loading, setLoading] = useState(true);

    // For filters/search
    const [tipoDocumento, setTipoDocumento] = useState("Factura de Crédito Fiscal Electrónica");
    const [secuencialDesde, setSecuencialDesde] = useState("");
    const [secuencialHasta, setSecuencialHasta] = useState("");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination
    const itemsPerPage = 10;
    const {
        paginatedData: paginatedAnulaciones,
        currentPage,
        setCurrentPage,
    } = usePagination({
        data: anulaciones,
        itemsPerPage,
    });

    // Fetch data on mount or when roles change
    useEffect(() => {
        if (roles === "admin" || roles === "user") {
            fetchAnulaciones();
        } else {
            setLoading(false);
        }
    }, [roles]);

    // Example: fetch from Supabase or your API
    const fetchAnulaciones = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("anulaciones") // Example table name
                .select("*");
            if (error) {
                console.error("❌ Error fetching anulaciones:", error.message);
            } else {
                setAnulaciones(data || []);
            }
        } finally {
            setLoading(false);
        }
    };

    // Filter logic (placeholder)
    const filteredAnulaciones = anulaciones.filter((item) => {

        const matchesTipo =
            !tipoDocumento || item.tipo_documento === tipoDocumento;

        // Here you could also compare secuencial_desde / secuencial_hasta, etc.
        return matchesTipo;
    });

    // Handlers for the "Nueva anulación" modal
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    // Example: confirm or submit the anulación
    const handleEmitir = () => {
        // ... your submit logic here ...
        console.log("Emitir anulación con:", { tipoDocumento, secuencialDesde, secuencialHasta });
        handleCloseModal();
    };

    return (
        <div className="p-4">
            {/* "Nueva anulación" button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleOpenModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                    Nueva anulación
                </button>
            </div>

            {/* Table or "loading" */}
            {loading ? (
                <div className="text-center text-gray-500">Cargando anulaciones...</div>
            ) : (
                <>
                    <div className="bg-white shadow-md overflow-x-auto">
                        <table className="min-w-full text-xs border-collapse">
                            <thead className="bg-gray-200 text-gray-700">
                                <tr>
                                    <th className="p-2 border min-w-[150px]">ID</th>
                                    <th className="p-2 border min-w-[250px]">Tipo Documento</th>
                                    <th className="p-2 border min-w-[150px]">Secuencial Desde</th>
                                    <th className="p-2 border min-w-[150px]">Secuencial Hasta</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAnulaciones.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-100">
                                        <td className="p-2 border">{item.id}</td>
                                        <td className="p-2 border">{item.tipo_documento}</td>
                                        <td className="p-2 border">{item.secuencial_desde}</td>
                                        <td className="p-2 border">{item.secuencial_hasta}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredAnulaciones.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}

            {/* MODAL for "Nueva anulación" */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Nueva anulación</h2>
                            <button onClick={handleCloseModal} className="text-gray-500">
                                ✕
                            </button>
                        </div>

                        {/* Form fields: Tipo de documento, Secuencial desde/hasta */}
                        <div className="space-y-4">
                            <div>
                                <label className="block font-semibold mb-1">
                                    Tipo de documento
                                </label>
                                <select
                                    value={tipoDocumento}
                                    onChange={(e) => setTipoDocumento(e.target.value)}
                                    className="border p-2 rounded w-full"
                                >
                                    {tipoDocumentoOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold mb-1">
                                        Secuencial desde
                                    </label>
                                    <input
                                        type="text"
                                        value={secuencialDesde}
                                        onChange={(e) => setSecuencialDesde(e.target.value)}
                                        className="border p-2 rounded w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">
                                        Secuencial hasta
                                    </label>
                                    <input
                                        type="text"
                                        value={secuencialHasta}
                                        onChange={(e) => setSecuencialHasta(e.target.value)}
                                        className="border p-2 rounded w-full"
                                    />
                                </div>
                            </div>

                            {/* Example "Agregar" button + table (as in your screenshot) */}
                            <div className="flex items-center space-x-2">
                                <button className="bg-blue-500 text-white px-3 py-1 rounded">
                                    Agregar
                                </button>
                                <span className="text-sm text-gray-500">
                                    (Aquí podrías manejar la lógica de agregar filas)
                                </span>
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
                                        {/* If no data, show this row: */}
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

export default AnularSecuenciaAutorizada;
