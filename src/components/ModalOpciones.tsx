import React, { useEffect, useRef } from "react";

interface ModalOpcionesProps {
  isOpen: boolean;
  onClose: () => void;
  urlConsultaQR: string | null;
  position: { top: number; left: number };
  onShowXml?: () => void;
}

const ModalOpciones: React.FC<ModalOpcionesProps> = ({
  isOpen,
  onClose,
  urlConsultaQR,
  position,
  onShowXml,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute bg-white border rounded-lg shadow-lg w-64 z-50 p-4"
      style={{ top: position.top, left: position.left }}
    >
      <ul className="space-y-3">
        <li className="px-2 hover:bg-gray-100 cursor-pointer text-blue-500">
          Descargar PDF
        </li>
        <li
          className="px-2 hover:bg-gray-100 cursor-pointer text-green-500"
          onClick={() => {
            onClose();
            if (onShowXml) onShowXml();
          }}
        >
          Descargar XML
        </li>
        <li className="px-2 hover:bg-gray-100 cursor-pointer text-orange-500">
          Ver Request
        </li>
        <li className="px-2 hover:bg-gray-100 cursor-pointer text-yellow-500">
          Ver Response
        </li>
        <li className="px-2 hover:bg-gray-100 cursor-pointer text-red-500">
          Reenviar
        </li>
        <li
          className="px-2 hover:bg-gray-100 cursor-pointer text-indigo-500"
          onClick={() => urlConsultaQR && window.open(urlConsultaQR, "_blank")}
        >
          Consultar en DGII
        </li>
      </ul>
    </div>
  );
};

export default ModalOpciones;