import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

interface EmisionComprobante {
  id: number;
  root_tag: string;
  rnc_emisor: string;
  rnc_comprador: string;
  fecha_emision: string;
  tipo_ecf: string;
  es_rfc: boolean;
  encf: string;
  monto_total: number;
  fecha_firma: string;
  codigo_seguridad: string;
  dgii_filename: string;
  created_at: string;
}

// interface EmisionComprobante {
//   id: number;
//   emisor_rnc: string;
//   emisor_razon_social: string;
//   receptor_rnc: string;
//   receptor_razon_social: string;
//   numero_documento: string;
//   tipo_documento: string;
//   tipo_ecf: string;
//   es_rfc: boolean;
//   fecha_emision: string;
//   subtotal_sin_impuestos: number;
//   total_impuesto: number;
//   itbis: number;
//   importe_total: number;
//   dgii_filename: string;
//   dgii_estado: string;
//   dgii_mensaje_respuesta: string;
//   track_id: string;
//   fecha_autorizacion: string;
//   fecha_firma: string;
//   codigo_seguridad: string;
//   url_consulta_qr: boolean;
//   document_xml: string;
//   acuse_recibo_estado: number;
//   acuse_recibo_json: number;
//   aprobacion_comercial_estado: number;
//   aprobacion_comercial_json: string;
//   numero_documento_sustento: string;
//   secuencial_erp: string;
//   codigo_erp: string;
//   usuario_erp: boolean;
//   fecha_reproceso: string;
//   destinatarios: number;
//   created_at: number;
//   rfc_xml: number;
// }

const EmisionComprobantes: React.FC = () => {
  const { roles } = useAuth();
  const [comprobantes, setComprobantes] = useState<EmisionComprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [rncComprador, setRncComprador] = useState("");
  const [tipoEcf, setTipoEcf] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
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
        id, root_tag, rnc_emisor, rnc_comprador, fecha_emision,
        tipo_ecf, es_rfc, encf, monto_total, fecha_firma,
        codigo_seguridad, dgii_filename, created_at
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
      (!searchTerm || item.encf.includes(searchTerm)) &&
      (!rncComprador || item.rnc_comprador.includes(rncComprador)) &&
      (tipoEcf === "Todos" || item.tipo_ecf === tipoEcf)
    );
  });

  const paginatedComprobantes = filteredComprobantes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-gray-100 p-4 sm:p-6 md:p-8">
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
            <label className="block text-sm font-medium text-gray-700">RNC Comprador</label>
            <input
              type="text"
              value={rncComprador}
              onChange={(e) => setRncComprador(e.target.value)}
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
          {/* Tabla - Ahora con scroll en móviles */}
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
                  <th className="p-3 border">Estado Emisión</th>
                  <th className="p-3 border">Fecha Emisión</th>
                  <th className="p-3 border">Fecha Auto</th>
                </tr>
              </thead>
              <tbody>
                {paginatedComprobantes.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100 border-b">
                    <td className="p-3 text-center">
                      <button className="text-xl">⋮</button>
                    </td>
                    <td className="p-3">{item.rnc_emisor}</td>
                    <td className="p-3 truncate">Operadora de Servicios Alimenticios LM, SRL</td>
                    <td className="p-3">{item.rnc_comprador}</td>
                    <td className="p-3 truncate">Proveedor Esporádico</td>
                    <td className="p-3">{item.encf}</td>
                    <td className="p-3">{item.tipo_ecf}</td>
                    <td className="p-3 text-green-600 font-bold">Autorizado</td>
                    <td className="p-3">{item.fecha_emision}</td>
                    <td className="p-3">{item.fecha_firma}</td>
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
        </>
      )}
    </div>
  );
};

export default EmisionComprobantes;
