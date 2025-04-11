import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
// ¡Ya no necesitamos 'usePagination', lo retiramos!
// import usePagination from "../../hooks/usePagination";
import Pagination from '../../components/ui/Pagination';
import Filters from "../../components/ui/Filters";
import ModalOpciones from "../../components/ModalOpciones";
import ModalXml from "../../components/ModalXml";
import { tipoDocumentoOptions } from '../../utils/documentTypes'

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

const EmisionComprobantes: React.FC = () => {
  const { roles } = useAuth();

  // Estado principal para guardar los comprobantes
  const [comprobantes, setComprobantes] = useState<EmisionComprobante[]>([]);
  const [loading, setLoading] = useState(true);

  // Paginación: página actual, total de items y items por página
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [rncReceptor, setRncReceptor] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("Todos");
  const [estado, setEstado] = useState("Todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Estados para modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<EmisionComprobante | null>(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);

  // Se cargan comprobantes cuando se tenga un rol válido
  useEffect(() => {
    if (roles === "super_admin" || roles === "admin" || roles === "user") {
      // Inicia en la página 1
      setCurrentPage(1);
      fetchComprobantes(1);
    } else {
      setLoading(false);
    }
  }, [roles]);

  // Cada vez que un filtro cambie, vuelve a la página 1 y recarga
  useEffect(() => {
    if (roles === "super_admin" || roles === "admin" || roles === "user") {
      setCurrentPage(1);
      fetchComprobantes(1);
    }
  }, [searchTerm, rncReceptor, tipoDocumento, estado, fechaDesde, fechaHasta]);

  /**
   * Trae los comprobantes desde Supabase, usando `.range(from, to)`
   * y `count: 'exact'` para saber el total.
   */
  const fetchComprobantes = async (page: number) => {
    setLoading(true);
    try {
      // Calculamos el rango de la página
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Construimos la query base
      let query = supabase
        .from("emision_comprobantes")
        .select(
          `
          id,
          emisor_rnc,
          emisor_razon_social,
          receptor_rnc,
          receptor_razon_social,
          numero_documento,
          tipo_documento,
          tipo_ecf,
          es_rfc,
          fecha_emision,
          subtotal_sin_impuestos,
          total_impuesto,
          itbis,
          importe_total,
          dgii_filename,
          dgii_estado,
          dgii_mensaje_respuesta,
          track_id,
          fecha_autorizacion,
          fecha_firma,
          codigo_seguridad,
          url_consulta_qr,
          document_xml,
          acuse_recibo_estado,
          acuse_recibo_json,
          aprobacion_comercial_estado,
          aprobacion_comercial_json,
          numero_documento_sustento,
          secuencial_erp,
          codigo_erp,
          usuario_erp,
          fecha_reproceso,
          destinatarios,
          created_at,
          rfc_xml
        `,
          { count: "exact" }
        );

      // Aplicar filtros:
      if (searchTerm) {
        query = query.ilike("numero_documento", `%${searchTerm}%`);
      }
      if (rncReceptor) {
        query = query.ilike("receptor_rnc", `%${rncReceptor}%`);
      }
      if (tipoDocumento !== "Todos") {
        query = query.eq("tipo_documento", tipoDocumento);
      }
      if (estado !== "Todos") {
        query = query.ilike("dgii_estado", estado.toLowerCase());
      }
      if (fechaDesde) {
        // Ejemplo: filtrar mayor/igual a
        query = query.gte("fecha_emision", fechaDesde);
      }
      if (fechaHasta) {
        // Ejemplo: filtrar menor/igual a
        query = query.lte("fecha_emision", fechaHasta);
      }

      // Definir el rango para la paginación
      const { data, count, error } = await query.range(from, to);

      if (error) {
        console.error("❌ Error al obtener los comprobantes:", error.message);
      } else {
        // Guardar los datos en el estado
        setComprobantes(data || []);

        // Guardar total de registros para calcular páginas
        if (count !== null) {
          setTotalItems(count);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Abre modal de opciones
  const handleToggleModal = (
    event: React.MouseEvent<HTMLButtonElement>,
    factura: EmisionComprobante
  ) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setSelectedFactura(factura);
    setModalPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX,
    });
    setIsModalOpen(true);
  };

  // Callback para abrir modal XML
  const handleShowXml = () => {
    setIsXmlModalOpen(true);
  };

  return (
    <div className="">
      {/* Filtros */}
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
        fetchComprobantes={() => fetchComprobantes(1)} // si deseas refrescar
      />

      {/* Modales */}
      <ModalOpciones
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        urlConsultaQR={selectedFactura?.url_consulta_qr ?? null}
        position={modalPosition}
        onShowXml={handleShowXml}
      />

      <ModalXml
        isOpen={isXmlModalOpen}
        onClose={() => setIsXmlModalOpen(false)}
        xmlBase64={selectedFactura?.document_xml ?? null}
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
                  <th className="p-2 border border-gray-700 min-w-[60px]">Acciones</th>
                  <th className="p-2 border border-gray-700 min-w-[120px]">RNC Emisor</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Razón Social Emisor</th>
                  <th className="p-2 border border-gray-700 min-w-[120px]">RNC Receptor</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Razón Social Receptor</th>
                  <th className="p-2 border border-gray-700 min-w-[120px]">Num Documento</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Tipo Documento</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Estado Emisión</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Fecha Emisión</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Fecha Autorización</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Subtotal Sin Impuestos</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Total Impuesto</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">ITBIS</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Importe Total</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Track ID</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Secuencial ERP</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Código ERP</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Usuario ERP</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Mensaje Respuesta DGII</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Fecha Reproceso</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Destinatarios</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Acuse Recibo Estado</th>
                  {/* Aquí los <th> comentados siguen, si deseas */}
                </tr>
              </thead>
              <tbody>
                {comprobantes.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100 border-b">
                    <td className="p-3 text-center">
                      <button
                        onClick={(event) => handleToggleModal(event, item)}
                        className="text-xl"
                      >
                        ...
                      </button>
                    </td>
                    <td className="p-2 border">{item.emisor_rnc}</td>
                    <td className="p-2 border truncate">{item.emisor_razon_social}</td>
                    <td className="p-2 border">{item.receptor_rnc}</td>
                    <td className="p-2 border truncate">{item.receptor_razon_social}</td>
                    <td className="p-2 border">{item.numero_documento}</td>
                    <td className="p-2 border">{item.tipo_documento}</td>
                    <td className="p-2 border text-green-600 font-bold">{item.dgii_estado}</td>
                    <td className="p-2 border">{item.fecha_emision}</td>
                    <td className="p-2 border">{item.fecha_autorizacion}</td>
                    <td className="p-2 border">{item.subtotal_sin_impuestos.toFixed(2)}</td>
                    <td className="p-2 border">{item.total_impuesto.toFixed(2)}</td>
                    <td className="p-2 border">{item.itbis.toFixed(2)}</td>
                    <td className="p-2 border">{item.importe_total.toFixed(2)}</td>
                    <td className="p-2 border">{item.track_id}</td>
                    <td className="p-2 border">{item.secuencial_erp}</td>
                    <td className="p-2 border">{item.codigo_erp}</td>
                    <td className="p-2 border">{String(item.usuario_erp)}</td>
                    <td className="p-2 border truncate">{item.dgii_mensaje_respuesta}</td>
                    <td className="p-2 border">{item.fecha_reproceso}</td>
                    <td className="p-2 border">{item.destinatarios}</td>
                    <td className="p-2 border">{item.acuse_recibo_estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Componente de Paginación */}
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems} // NUEVO: totalItems viene de la DB
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => {
              setCurrentPage(page);
              fetchComprobantes(page);
            }}
          />
        </>
      )}
    </div>
  );
};

export default EmisionComprobantes;
