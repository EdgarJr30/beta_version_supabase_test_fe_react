import React from "react";

interface FiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  rncReceptor: string;
  setRncReceptor: (value: string) => void;
  tipoEcf: string;
  setTipoEcf: (value: string) => void;
  fetchComprobantes: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  searchTerm,
  setSearchTerm,
  rncReceptor,
  setRncReceptor,
  tipoEcf,
  setTipoEcf,
  fetchComprobantes,
}) => {
  return (
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
            onClick={fetchComprobantes}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
