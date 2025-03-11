import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
interface EmisionComprobante {
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
  url_consulta_qr: boolean;
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

const EmisionComprobantes: React.FC = () => {
  const { roles } = useAuth();
  const [comprobantes, setComprobantes] = useState<EmisionComprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [rncReceptor, setRncReceptor] = useState("");
  const [tipoEcf, setTipoEcf] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    if (roles === "admin" || roles === "user") {
      fetchComprobantes();
    } else {
      setLoading(false);
    }
  }, [roles]);

  const fetchComprobantes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("emision_comprobantes")
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

  const filteredComprobantes = comprobantes.filter((item) => {
    return (
      (!searchTerm || item.numero_documento.includes(searchTerm)) &&
      (!rncReceptor || item.receptor_rnc.includes(rncReceptor)) &&
      (tipoEcf === "Todos" || item.tipo_ecf === tipoEcf)
    );
  });

  const paginatedComprobantes = filteredComprobantes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="">
      {/* Filtros */}
      <div className="bg-white p-4 shadow-md rounded-lg mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Buscar por eNCF</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">RNC Receptor</label>
            <input
              type="text"
              value={rncReceptor}
              onChange={(e) => setRncReceptor(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo ECF</label>
            <select
              value={tipoEcf}
              onChange={(e) => setTipoEcf(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
            >
              <option>Todos</option>
              <option>Comprobante Electrónico de Compras</option>
              <option>Comprobante Electrónico para Gastos Menores</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => fetchComprobantes()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Mostrar Cargando */}
      {loading ? (
        <div className="text-center text-gray-500">Cargando comprobantes...</div>
      ) : (
        <>
          {/* Tabla */}
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-3 border">Acciones</th>
                  <th className="p-3 border">RNC Emisor</th>
                  <th className="p-3 border">Razón Social Emisor</th>
                  <th className="p-3 border">RNC Receptor</th>
                  <th className="p-3 border">Razón Social Receptor</th>
                  <th className="p-3 border">Num Documento</th>
                  <th className="p-3 border">Tipo Documento</th>
                  <th className="p-3 border">Tipo ECF</th>
                  <th className="p-3 border">Es RFC</th>
                  <th className="p-3 border">Fecha Emisión</th>
                  <th className="p-3 border">Subtotal Sin Impuestos</th>
                  <th className="p-3 border">Total Impuesto</th>
                  <th className="p-3 border">ITBIS</th>
                  <th className="p-3 border">Importe Total</th>
                  <th className="p-3 border">DGII Filename</th>
                  <th className="p-3 border">Estado Emisión</th>
                  <th className="p-3 border">Mensaje Respuesta DGII</th>
                  <th className="p-3 border">Track ID</th>
                  <th className="p-3 border">Fecha Autorización</th>
                  <th className="p-3 border">Fecha Firma</th>
                  <th className="p-3 border">Código Seguridad</th>
                  <th className="p-3 border">URL Consulta QR</th>
                  <th className="p-3 border">Documento XML</th>
                  <th className="p-3 border">Acuse Recibo Estado</th>
                  <th className="p-3 border">Acuse Recibo JSON</th>
                  <th className="p-3 border">Aprobación Comercial Estado</th>
                  <th className="p-3 border">Aprobación Comercial JSON</th>
                  <th className="p-3 border">Número Documento Sustento</th>
                  <th className="p-3 border">Secuencial ERP</th>
                  <th className="p-3 border">Código ERP</th>
                  <th className="p-3 border">Usuario ERP</th>
                  <th className="p-3 border">Fecha Reproceso</th>
                  <th className="p-3 border">Destinatarios</th>
                  <th className="p-3 border">Fecha Creación</th>
                  <th className="p-3 border">RFC XML</th>
                </tr>
              </thead>
              <tbody>
                {paginatedComprobantes.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100 border-b">
                    <td className="p-3 text-center">
                      <button onClick={() => handleToggleModal()} className="text-xl">...</button>
                    </td>
                    <td className="p-3">{item.emisor_rnc}</td>
                    <td className="p-3 truncate">{item.emisor_razon_social}</td>
                    <td className="p-3">{item.receptor_rnc}</td>
                    <td className="p-3 truncate">{item.receptor_razon_social}</td>
                    <td className="p-3">{item.numero_documento}</td>
                    <td className="p-3">{item.tipo_documento}</td>
                    <td className="p-3">{item.tipo_ecf}</td>
                    <td className="p-3">{item.es_rfc ? "Sí" : "No"}</td>
                    <td className="p-3">{item.fecha_emision}</td>
                    <td className="p-3">{item.subtotal_sin_impuestos.toFixed(2)}</td>
                    <td className="p-3">{item.total_impuesto.toFixed(2)}</td>
                    <td className="p-3">{item.itbis.toFixed(2)}</td>
                    <td className="p-3">{item.importe_total.toFixed(2)}</td>
                    <td className="p-3">{item.dgii_filename}</td>
                    <td className="p-3 text-green-600 font-bold">{item.dgii_estado}</td>
                    <td className="p-3 truncate">{item.dgii_mensaje_respuesta}</td>
                    <td className="p-3">{item.track_id}</td>
                    <td className="p-3">{item.fecha_autorizacion}</td>
                    <td className="p-3">{item.fecha_firma}</td>
                    <td className="p-3">{item.codigo_seguridad}</td>
                    <td className="p-3">{item.url_consulta_qr}</td>
                    <td className="p-3 truncate">{item.document_xml}</td>
                    <td className="p-3">{item.acuse_recibo_estado}</td>
                    <td className="p-3 truncate">{item.acuse_recibo_json}</td>
                    <td className="p-3">{item.aprobacion_comercial_estado}</td>
                    <td className="p-3 truncate">{item.aprobacion_comercial_json}</td>
                    <td className="p-3">{item.numero_documento_sustento}</td>
                    <td className="p-3">{item.secuencial_erp}</td>
                    <td className="p-3">{item.codigo_erp}</td>
                    <td className="p-3">{item.usuario_erp ? "Sí" : "No"}</td>
                    <td className="p-3">{item.fecha_reproceso}</td>
                    <td className="p-3">{item.destinatarios}</td>
                    <td className="p-3">{item.created_at}</td>
                    <td className="p-3">{item.rfc_xml}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
            <span className="text-center sm:text-left">
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredComprobantes.length)} -
              {Math.min(currentPage * itemsPerPage, filteredComprobantes.length)} de {filteredComprobantes.length}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className="px-4 py-2 bg-gray-300 rounded-md">Anterior</button>
              <button onClick={() => setCurrentPage((prev) => prev + 1)} className="px-4 py-2 bg-gray-300 rounded-md">Siguiente</button>
            </div>
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div
              className="absolute left-8 top-1 z-10 bg-white border rounded-lg shadow-lg w-48"
              onClick={handleToggleModal}
            >
              <div
                className="bg-white rounded-lg shadow-lg w-64 p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-3">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-blue-500">
                    Descargar PDF
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-green-500">
                    Descargar XML
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-orange-500">
                    Ver Request
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-yellow-500">
                    Ver Response
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500">
                    Reenviar
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-indigo-500">
                    Consultar en DGII
                  </li>
                </div>
                <div className="mt-3 text-center">
                  <button
                    onClick={handleToggleModal}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmisionComprobantes;
