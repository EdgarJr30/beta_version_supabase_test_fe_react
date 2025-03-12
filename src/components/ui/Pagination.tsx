import React from "react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
      <span className="text-center sm:text-left">
        Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} -{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-md ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Pagination;
