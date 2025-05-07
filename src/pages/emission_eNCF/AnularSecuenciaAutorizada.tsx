import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import usePagination from "../../hooks/usePagination";
import { useNotification } from "../../context/NotificationProvider";
import Pagination from "../../components/ui/Pagination";
import { tipoDocumentoOptions } from "../../utils/documentTypes";

interface Anulacion {
    id: number;
    emisor_rnc: string;
    cantidad_ncf_anulados: number;
    fecha_hora_anulaciones_ncf: string;
    detalle_anulacion: string;
    tipo_documento: string;
    document_xml: string;
    secuencial_desde: string;
    secuencial_hasta: string;
    dgii_respuesta: string;
    dgii_estado: string;
    created_at: string;
}


// Mapeo de tipo de comprobante a su prefijo correspondiente
const comprobantePrefix: Record<string, string> = {
    "Factura de Crédito Fiscal Electrónica": "E31",
    "Factura de Consumo Electrónica": "E32",
    "Nota de Crédito Electrónica": "E34",
    "Nota de Débito Electrónica": "E33",
    "Compras Electrónico": "E41",
    "Gastos Menores Electrónicos": "E43",
    "Regímenes Especiales Electrónicos": "E44",
    "Comprobante Gubernamental Electrónico": "E45",
    "Comprobante de Exportaciones Electrónico": "E46",
    "Comprobante de Pagos al Exterior Electrónico": "E47",
};

const AnularSecuenciaAutorizada: React.FC = () => {
    const { roles } = useAuth();
    const [anulaciones, setAnulaciones] = useState<Anulacion[]>([]);
    const [loading, setLoading] = useState(true);
    const { notifyToast } = useNotification();

    // Filtros y búsqueda
    const [tipoDocumento, setTipoDocumento] = useState("");
    const [secuencialDesde, setSecuencialDesde] = useState("");
    const [secuencialHasta, setSecuencialHasta] = useState("");

    // Estado para las nuevas anulaciones ingresadas desde el modal
    const [nuevasAnulaciones, setNuevasAnulaciones] = useState<
        Array<{
            tipo_documento: string;
            secuencial_desde: string;
            secuencial_hasta: string;
        }>
    >([]);

    // Estados para edición de una línea
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<{
        tipo_documento: string;
        secuencial_desde: string;
        secuencial_hasta: string;
    }>({
        tipo_documento: "",
        secuencial_desde: "",
        secuencial_hasta: "",
    });

    // Estado del modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Paginación
    const itemsPerPage = 10;
    const { paginatedData: paginatedAnulaciones, currentPage, setCurrentPage } =
        usePagination({
            data: anulaciones,
            itemsPerPage,
        });

    // Fetch de datos al montar o cuando cambia el rol
    useEffect(() => {
        if (roles === "super_admin" || roles === "admin" || roles === "user") {
            fetchAnulaciones();
        } else {
            setLoading(false);
        }
    }, [roles]);

    const fetchAnulaciones = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from("ancef").select("*");
            if (error) {
                notifyToast(`❌ Error fetching anulaciones ${error.message}`, "error");
            } else {
                setAnulaciones(data || []);
            }
        } finally {
            setLoading(false);
        }
    };

    // Lógica de filtrado (placeholder)
    const filteredAnulaciones = anulaciones.filter((item) => {
        const matchesTipo = !tipoDocumento || item.tipo_documento === tipoDocumento;
        // Aquí podrías agregar lógica adicional para comparar secuenciales
        return matchesTipo;
    });

    // Abre el modal
    const handleOpenModal = () => setIsModalOpen(true);
    // Cierra el modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Limpiar modo edición si está activo
        setEditingIndex(null);
    };

    // Función para rellenar con ceros hasta 10 dígitos
    const padWithZeros = (numStr: string) => numStr.padStart(10, "0");

    // Handler para agregar un secuencial en el modal
    const handleAgregar = () => {
        // Validar que se haya seleccionado un tipo de documento y se hayan ingresado los secuenciales
        if (!tipoDocumento || !secuencialDesde.trim() || !secuencialHasta.trim()) {
            notifyToast(`Por favor ingresa todos los datos (tipo de documento, secuencial desde y secuencial hasta) para agregar.`, "error");
            return;
        }
        const prefix = comprobantePrefix[tipoDocumento];
        if (!prefix) {
            notifyToast(`Tipo de documento no válido`, "error");
            return;
        }
        const fullDesde = prefix + padWithZeros(secuencialDesde);
        const fullHasta = prefix + padWithZeros(secuencialHasta);
        const nuevaAnulacion = {
            tipo_documento: tipoDocumento,
            secuencial_desde: fullDesde,
            secuencial_hasta: fullHasta,
        };
        setNuevasAnulaciones([...nuevasAnulaciones, nuevaAnulacion]);
        // Limpiar campos
        setSecuencialDesde("");
        setSecuencialHasta("");
    };

    // Handler para eliminar una línea de nuevas anulaciones
    const handleEliminar = (index: number) => {
        const updated = nuevasAnulaciones.filter((_, i) => i !== index);
        setNuevasAnulaciones(updated);
        // Si se estaba editando esta línea, se cancela la edición
        if (editingIndex === index) {
            setEditingIndex(null);
        }
    };

    // Handler para iniciar la edición de una línea
    const handleEditar = (index: number) => {
        const item = nuevasAnulaciones[index];
        const prefix = comprobantePrefix[item.tipo_documento];
        // Extraer el valor sin el prefijo (suponiendo que el prefijo tiene longitud fija)
        const rawDesde = item.secuencial_desde.substring(prefix.length);
        const rawHasta = item.secuencial_hasta.substring(prefix.length);
        setEditingIndex(index);
        setEditValues({
            tipo_documento: item.tipo_documento,
            secuencial_desde: rawDesde,
            secuencial_hasta: rawHasta,
        });
    };

    // Handler para guardar la edición
    const handleGuardarEdit = () => {
        const prefix = comprobantePrefix[editValues.tipo_documento];
        if (!prefix) {
            notifyToast(`Tipo de documento no válido`, "error");
            return;
        }
        const fullDesde = prefix + padWithZeros(editValues.secuencial_desde);
        const fullHasta = prefix + padWithZeros(editValues.secuencial_hasta);
        const updated = nuevasAnulaciones.map((item, index) => {
            if (index === editingIndex) {
                return {
                    tipo_documento: editValues.tipo_documento,
                    secuencial_desde: fullDesde,
                    secuencial_hasta: fullHasta,
                };
            }
            return item;
        });
        setNuevasAnulaciones(updated);
        setEditingIndex(null);
    };

    // Handler para cancelar la edición
    const handleCancelarEdit = () => {
        setEditingIndex(null);
    };

    // Handler para emitir (enviar) las anulaciones al backend
    // Handler para emitir (enviar) las anulaciones al backend
    const handleEmitir = async () => {
        if (nuevasAnulaciones.length === 0) {
            notifyToast(`No hay datos agregados para emitir.`, "error");
            return;
        }
        try {
            // Preparamos los registros a insertar:
            // Solo se envían los campos:
            // - detalle_anulacion (un objeto que contiene:
            //      tipo_documento: solo el número (ej. "31", "32", etc.)
            //      secuencial_desde
            //      secuencial_hasta)
            // Los demás campos se envían como null.
            const records = nuevasAnulaciones.map((item) => {
                const prefix = comprobantePrefix[item.tipo_documento];
                // Extraer solo el número, eliminando la "E" inicial
                const tipoDocumentoNumero = prefix ? prefix.substring(1) : null;
                return {
                    emisor_rnc: null,
                    cantidad_ncf_anulados: null,
                    fecha_hora_anulaciones_ncf: null,
                    detalle_anulacion: {
                        tipo_documento: tipoDocumentoNumero,
                        secuencial_desde: item.secuencial_desde,
                        secuencial_hasta: item.secuencial_hasta,
                    },
                    document_xml: null,
                    dgii_respuesta: null,
                    dgii_estado: null,
                    created_at: null,
                };
            });

            const { data, error } = await supabase
                .from("ancef")
                .insert(records)
                .select(); // Devuelve las filas insertadas

            if (error) {
                notifyToast(`❌ Error al insertar anulación ${error.message}`, "error");
            } else {
                notifyToast(`Anulación insertada ${data}`, "success");

                // Actualiza la lista de anulaciones tras el insert
                await fetchAnulaciones();
                // Limpia las nuevas anulaciones y cierra el modal
                setNuevasAnulaciones([]);
                handleCloseModal();
            }
        } catch (e: unknown) {
            notifyToast(`❌ Error general al emitir anulación ${e}`, "error");
            // alert("Error general: " + String(e));
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleOpenModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                    Nueva anulación
                </button>
            </div>

            {loading ? (
                <div className="text-center text-gray-500">
                    Cargando anulaciones...
                </div>
            ) : (
                <>
                    <div className="bg-white shadow-md overflow-x-auto">
                        <table className="min-w-full text-xs border-collapse">
                            <thead className="bg-gray-200 text-gray-700">
                                <tr>
                                    <th className="p-2 border border-gray-700 min-w-[250px]">RNC Emisor</th>
                                    <th className="p-2 border border-gray-700 min-w-[150px]">Cantidad NCF Anulados</th>
                                    <th className="p-2 border border-gray-700 min-w-[250px]">Fecha/Hora Anulaciones NCF</th>
                                    <th className="p-2 border border-gray-700 min-w-[250px]">Detalle Anulación</th>
                                    <th className="p-2 border border-gray-700 min-w-[250px]">DGII Respuesta</th>
                                    <th className="p-2 border border-gray-700 min-w-[150px]">DGII Estado</th>
                                    <th className="p-2 border border-gray-700 min-w-[150px]">Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAnulaciones.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-100">
                                        <td className="p-2 border">{item.emisor_rnc}</td>
                                        <td className="p-2 border">{item.cantidad_ncf_anulados}</td>
                                        <td className="p-2 border">{item.fecha_hora_anulaciones_ncf}</td>
                                        <td className="p-2 border">{JSON.stringify(item.detalle_anulacion)}</td>
                                        <td className="p-2 border">{JSON.stringify(item.dgii_respuesta)}</td>
                                        <td className="p-2 border">{item.dgii_estado}</td>
                                        <td className="p-2 border">{item.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredAnulaciones.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Nueva anulación</h2>
                            <button onClick={handleCloseModal} className="text-gray-500">
                                ✕
                            </button>
                        </div>

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

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleAgregar}
                                    className="bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                    Agregar
                                </button>
                            </div>

                            {/* Tabla dentro del modal con las nuevas anulaciones y botones de editar/eliminar */}
                            <div className="overflow-x-auto border rounded">
                                <table className="min-w-full text-xs">
                                    <thead className="bg-gray-200 text-gray-700">
                                        <tr>
                                            <th className="p-2 border">Tipo de documento</th>
                                            <th className="p-2 border">Desde</th>
                                            <th className="p-2 border">Hasta</th>
                                            <th className="p-2 border">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {nuevasAnulaciones.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="text-center p-2 text-gray-500 border"
                                                >
                                                    Ningún dato disponible en esta tabla
                                                </td>
                                            </tr>
                                        ) : (
                                            nuevasAnulaciones.map((item, index) => {
                                                // Si este índice está en modo edición, mostrar inputs
                                                if (editingIndex === index) {
                                                    return (
                                                        <tr key={index} className="border-b hover:bg-gray-100">
                                                            <td className="p-2 border">
                                                                <select
                                                                    value={editValues.tipo_documento}
                                                                    onChange={(e) =>
                                                                        setEditValues({
                                                                            ...editValues,
                                                                            tipo_documento: e.target.value,
                                                                        })
                                                                    }
                                                                    className="border p-1 rounded w-full text-xs"
                                                                >
                                                                    {tipoDocumentoOptions.map((option) => (
                                                                        <option key={option} value={option}>
                                                                            {option}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="p-2 border">
                                                                <input
                                                                    type="text"
                                                                    value={editValues.secuencial_desde}
                                                                    onChange={(e) =>
                                                                        setEditValues({
                                                                            ...editValues,
                                                                            secuencial_desde: e.target.value,
                                                                        })
                                                                    }
                                                                    className="border p-1 rounded w-full text-xs"
                                                                />
                                                            </td>
                                                            <td className="p-2 border">
                                                                <input
                                                                    type="text"
                                                                    value={editValues.secuencial_hasta}
                                                                    onChange={(e) =>
                                                                        setEditValues({
                                                                            ...editValues,
                                                                            secuencial_hasta: e.target.value,
                                                                        })
                                                                    }
                                                                    className="border p-1 rounded w-full text-xs"
                                                                />
                                                            </td>
                                                            <td className="p-2 border flex space-x-1">
                                                                <button
                                                                    onClick={handleGuardarEdit}
                                                                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                                                                >
                                                                    Guardar
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelarEdit}
                                                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded text-xs"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                                // Modo visualización normal
                                                return (
                                                    <tr key={index} className="border-b hover:bg-gray-100">
                                                        <td className="p-2 border">{item.tipo_documento}</td>
                                                        <td className="p-2 border">{item.secuencial_desde}</td>
                                                        <td className="p-2 border">{item.secuencial_hasta}</td>
                                                        <td className="p-2 border flex space-x-1">
                                                            <button
                                                                onClick={() => handleEditar(index)}
                                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => handleEliminar(index)}
                                                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Acciones del modal */}
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
