import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import usePagination from "../../hooks/usePagination";
import Pagination from '../../components/ui/Pagination';
import Filters from "../../components/ui/Filters";
import ModalOpciones from "../../components/ModalOpciones";
import { tipoDocumentoOptions } from '../../utils/documentTypes'

interface RecepcionComprobante {
    id: number;
    emisor_rnc: string;
    emisor_razon_social: string;
    receptor_rnc: string;
    receptor_razon_social: string;
    numero_documento: string;
    tipo_documento: string;
    tipo_ecf: string;
    es_rfc: boolean;
    fecha_emision: string;
    subtotal_sin_impuestos: number;
    total_impuesto: number;
    itbis: number;
    importe_total: number;
    dgii_filename: string;
    dgii_estado: string;
    dgii_mensaje_respuesta: string;
    track_id: string;
    fecha_autorizacion: string;
    fecha_firma: string;
    codigo_seguridad: string;
    url_consulta_qr: string;
    document_xml: string;
    acuse_recibo_estado: number;
    acuse_recibo_json: number;
    aprobacion_comercial_estado: number;
    aprobacion_comercial_json: string;
    numero_documento_sustento: string;
    secuencial_erp: string;
    codigo_erp: string;
    usuario_erp: boolean;
    fecha_reproceso: string;
    destinatarios: number;
    created_at: number;
    rfc_xml: number;
}

const AprobacionComprobantes: React.FC = () => {
    const { roles } = useAuth();
    const [comprobantes, setComprobantes] = useState<RecepcionComprobante[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [rncReceptor, setRncReceptor] = useState("");
    const [tipoDocumento, setTipoDocumento] = useState("Todos");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFactura, setSelectedFactura] = useState<RecepcionComprobante | null>(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [estado, setEstado] = useState("Todos");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const itemsPerPage = 10;

    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


    useEffect(() => {
        if (roles === "super_admin" || roles === "admin" || roles === "user") {
            fetchComprobantes();
        } else {
            setLoading(false);
        }
    }, [roles]);

    // TODO: Actualizar a la tabla de aprobacion comercial
    const fetchComprobantes = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("recepcion_comprobantes")
            .select(`
        "id","emisor_rnc", "emisor_razon_social", "receptor_rnc", "receptor_razon_social", 
        "numero_documento", "tipo_documento", "tipo_ecf", "es_rfc", "fecha_emision", 
        "subtotal_sin_impuestos", "total_impuesto", "itbis", "importe_total", 
        "dgii_filename", "dgii_estado", "dgii_mensaje_respuesta", "track_id", 
        "fecha_autorizacion", "fecha_firma", "codigo_seguridad", "url_consulta_qr", 
        "document_xml", "acuse_recibo_estado", "acuse_recibo_json", 
        "aprobacion_comercial_estado", "aprobacion_comercial_json", 
        "numero_documento_sustento", "secuencial_erp", "codigo_erp", "usuario_erp", 
        "fecha_reproceso", "destinatarios", "created_at", "rfc_xml"
      `);

        if (error) {
            console.error("❌ Error al obtener los comprobantes:", error.message);
        } else {
            setComprobantes(data);
        }
        setLoading(false);
    };

    {/* Filtros */ }
    const filteredComprobantes = comprobantes.filter((item) => {
        const fechaEmision = new Date(item.fecha_emision);
        const desde = fechaDesde ? new Date(fechaDesde) : null;
        const hasta = fechaHasta ? new Date(fechaHasta) : null;
        return (
            (!searchTerm || item.numero_documento.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (!rncReceptor || item.receptor_rnc.includes(rncReceptor)) &&
            (tipoDocumento === "Todos" || item.tipo_documento === tipoDocumento) &&
            (estado === "Todos" || item.dgii_estado.toLowerCase() === estado.toLowerCase()) &&
            (!desde || fechaEmision >= desde) &&
            (!hasta || fechaEmision <= hasta)
        );
    });

    const { paginatedData: paginatedComprobantes, currentPage, setCurrentPage } =
        usePagination({
            data: filteredComprobantes,
            itemsPerPage,
        });

    const handleToggleModal = (event: React.MouseEvent<HTMLButtonElement>, factura: RecepcionComprobante) => {
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();

        setSelectedFactura(factura);
        setModalPosition({ top: rect.bottom + window.scrollY + 5, left: rect.left + window.scrollX });
        setIsModalOpen(true);
    };

    // NUEVO: Botones de ejemplo (PDF, XML, Aprobación Comercial)
    // Estas funciones son de ejemplo; ajusta la lógica según tus necesidades.
    const handlePdfClick = (factura: RecepcionComprobante) => {
        console.log("PDF de:", factura.numero_documento);
        // Lógica para descargar/mostrar PDF
    };

    const handleXmlClick = async (factura: RecepcionComprobante) => {
        console.log("XML de:", factura.numero_documento);
        try {
            const response = await fetch("https://ztrmvfyqjcchmcmyitjg.supabase.co/functions/v1/get-xml", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Agrega el header de autorización si es necesario
                    "Authorization": `Bearer ${supabaseAnonKey}`
                },
                body: JSON.stringify({ id: factura.id })
            });
            if (!response.ok) {
                throw new Error("Error al obtener el XML")
            }
            const xml = await response.text();
            // Aquí actualizas el estado para mostrar el modal con el contenido XML
            // Por ejemplo, setModalContent(xml) y setIsModalOpen(true)
            console.log("XML decodificado:", xml);
        } catch (error) {
            console.error("Error en handleXmlClick:", error);
        }
    };


    const handleAprobacionClick = (factura: RecepcionComprobante) => {
        console.log("Aprobación Comercial de:", factura.numero_documento);
        // Lógica de aprobación comercial
    };

    return (
        <div className="">
            {/* Componente de Filtros */}
            <Filters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                rncReceptor={rncReceptor}
                setRncReceptor={setRncReceptor}
                tipoDocumento={tipoDocumento}
                setTipoDocumento={setTipoDocumento}
                tipoDocumentoOptions={tipoDocumentoOptions}
                estado={estado}
                setEstado={setEstado}
                fechaDesde={fechaDesde}
                setFechaDesde={setFechaDesde}
                fechaHasta={fechaHasta}
                setFechaHasta={setFechaHasta}
                fetchComprobantes={fetchComprobantes}
            />

            {/* Modal de opciones */}
            <ModalOpciones
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                urlConsultaQR={selectedFactura?.url_consulta_qr ?? null}
                position={modalPosition}
            />

            {/* Loader */}
            {loading ? (
                <div className="text-center text-gray-500">Cargando comprobantes...</div>
            ) : (
                <>
                    {/* Tabla */}
                    <div className="bg-white shadow-md overflow-x-auto">
                        <table className="min-w-full text-xs border-collapse ">
                            <thead className="bg-gray-200 text-gray-700">
                                <tr>
                                    {/* NUEVO: 3 columnas para PDF, XML y Aprobación Comercial */}
                                    <th className="p-2 border border-gray-700">PDF</th>
                                    <th className="p-2 border border-gray-700">XML</th>
                                    <th className="p-2 border border-gray-700">Aprob. Comercial</th>

                                    <th className="p-2 border border-gray-700 min-w-[60px]">Acciones</th>
                                    <th className="p-2 border border-gray-700 min-w-[120px]">RNC Emisor</th>
                                    <th className="p-2 border border-gray-700 min-w-[150px]">Razón Social Emisor</th>
                                    <th className="p-2 border border-gray-700 min-w-[120px]">RNC Receptor</th>
                                    <th className="p-2 border border-gray-700 min-w-[150px]">Razón Social Receptor</th>
                                    <th className="p-2 border border-gray-700 min-w-[120px]">Num Documento</th>
                                    <th className="p-2 border border-gray-700">Aprobación Comercial Estado</th>
                                    <th className="p-2 border border-gray-700 min-w-[150px]">Tipo Documento</th>
                                    <th className="p-2 border border-gray-700 min-w-[150px]">Estado Recepción</th>
                                    <th className="p-2 border border-gray-700 min-w-[150px]">Fecha Recepción</th>
                                    {/* <th className="p-2 border border-gray-700 min-w-[150px]">Fecha Autorización</th> */}
                                    <th className="p-2 border border-gray-700 min-w-[150px]">Subtotal Sin Impuestos</th>
                                    <th className="p-2 border border-gray-700 min-w-[150px]">Total Impuesto</th>
                                    <th className="p-2 border border-gray-700 min-w-[150px]">ITBIS</th>
                                    <th className="p-2 border border-gray-700 min-w-[150px]">Importe Total</th>
                                    {/* <th className="p-2 border border-gray-700 min-w-[150px]">Track ID</th> */}
                                    {/* <th className="p-2 border border-gray-700 min-w-[150px]">Secuencial ERP</th> */}
                                    {/* <th className="p-2 border border-gray-700 min-w-[150px]">Código ERP</th> */}
                                    {/* <th className="p-2 border border-gray-700 min-w-[150px]">Usuario ERP</th> */}
                                    <th className="p-2 border border-gray-700 min-w-[150px]">Mensaje Respuesta DGII</th>
                                    {/* <th className="p-2 border border-gray-700 min-w-[150px]">Fecha Reproceso</th> */}
                                    {/* <th className="p-2 border border-gray-700 min-w-[150px]">Destinatarios</th> */}
                                    {/* <th className="p-2 border border-gray-700 min-w-[150px]">Acuse Recibo Estado</th> */}
                                    {/* <th className="p-2 border border-gray-700 min-w-[150px]">Tipo ECF</th> */}
                                    {/* <th className="p-2 border border-gray-700 min-w-[150px]">Es RFC</th> */}
                                    {/* <th className="p-2 border border-gray-700 min-w-[150px]">DGII Filename</th> */}
                                    {/* <th className="p-2 border border-gray-700">Fecha Firma</th> */}
                                    {/* <th className="p-2 border border-gray-700">Código Seguridad</th> */}
                                    {/* <th className="p-2 border border-gray-700">URL Consulta QR</th> */}
                                    {/* <th className="p-2 border border-gray-700">Documento XML</th> */}
                                    {/* <th className="p-2 border border-gray-700">Acuse Recibo JSON</th> */}
                                    {/* <th className="p-2 border border-gray-700">Aprobación Comercial JSON</th> */}
                                    {/* <th className="p-2 border border-gray-700">Número Documento Sustento</th> */}
                                    {/* <th className="p-2 border border-gray-700">Fecha Creación</th> */}
                                    {/* <th className="p-2 border border-gray-700">RFC XML</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedComprobantes.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-100 border-b">
                                        {/* NUEVO: Botones PDF, XML y Aprobación Comercial */}
                                        <td className="p-2 border text-center">
                                            <button onClick={() => handlePdfClick(item)}>
                                                {/* <img src="/icons/pdf-icon.png" alt="PDF" className="w-6 h-6 mx-auto" /> */}
                                                PDF
                                            </button>
                                        </td>
                                        <td className="p-2 border text-center">
                                            <button onClick={() => handleXmlClick(item)}>
                                                {/* <img src="/icons/xml-icon.png" alt="XML" className="w-6 h-6 mx-auto" /> */}
                                                XML
                                            </button>
                                        </td>
                                        <td className="p-2 border text-center">
                                            <button onClick={() => handleAprobacionClick(item)}>
                                                {/* <img src="/icons/aprobacion-icon.png" alt="Aprobación" className="w-6 h-6 mx-auto" /> */}
                                                Aprobación
                                            </button>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button onClick={(event) => handleToggleModal(event, item)} className="text-xl">...</button>
                                        </td>
                                        <td className="p-2 border">{item.emisor_rnc}</td>
                                        <td className="p-2 border truncate">{item.emisor_razon_social}</td>
                                        <td className="p-2 border">{item.receptor_rnc}</td>
                                        <td className="p-2 border truncate">{item.receptor_razon_social}</td>
                                        <td className="p-2 border">{item.numero_documento}</td>
                                        <td className="p-2 border">{item.aprobacion_comercial_estado}</td>
                                        <td className="p-2 border">{item.tipo_documento}</td>
                                        <td className="p-2 border text-green-600 font-bold">{item.dgii_estado}</td>
                                        <td className="p-2 border">{item.fecha_emision}</td>
                                        {/* <td className="p-2 border">{item.fecha_autorizacion}</td> */}
                                        <td className="p-2 border">{item.subtotal_sin_impuestos.toFixed(2)}</td>
                                        <td className="p-2 border">{item.total_impuesto.toFixed(2)}</td>
                                        <td className="p-2 border">{item.itbis.toFixed(2)}</td>
                                        <td className="p-2 border">{item.importe_total.toFixed(2)}</td>
                                        {/* <td className="p-2 border">{item.track_id}</td> */}
                                        {/* <td className="p-2 border">{item.secuencial_erp}</td> */}
                                        {/* <td className="p-2 border">{item.codigo_erp}</td> */}
                                        {/* <td className="p-2 border">{item.usuario_erp}</td> */}
                                        <td className="p-2 border truncate">{item.dgii_mensaje_respuesta}</td>
                                        {/* <td className="p-2 border">{item.fecha_reproceso}</td> */}
                                        {/* <td className="p-2 border">{item.destinatarios}</td> */}
                                        {/* <td className="p-2 border">{item.acuse_recibo_estado}</td> */}
                                        {/* <td className="p-2 border">{item.tipo_ecf}</td> */}
                                        {/* <td className="p-2 border">{item.es_rfc }</td> */}
                                        {/* <td className="p-2 border">{item.dgii_filename}</td> */}
                                        {/* <td className="p-2 border">{item.fecha_firma}</td> */}
                                        {/* <td className="p-2 border">{item.codigo_seguridad}</td> */}
                                        {/* <td className="p-2 border">{item.url_consulta_qr}</td> */}
                                        {/* <td className="p-2 border truncate">{item.document_xml}</td> */}
                                        {/* <td className="p-2 border truncate">{item.acuse_recibo_json}</td> */}
                                        {/* <td className="p-2 border truncate">{item.aprobacion_comercial_json}</td> */}
                                        {/* <td className="p-2 border">{item.numero_documento_sustento}</td> */}
                                        {/* <td className="p-2 border">{item.created_at}</td> */}
                                        {/* <td className="p-2 border">{item.rfc_xml}</td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Componente de Paginación */}
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredComprobantes.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    );
};

export default AprobacionComprobantes;
