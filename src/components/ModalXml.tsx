import React, { useEffect, useRef } from "react";

interface ModalXmlProps {
  isOpen: boolean;
  onClose: () => void;
  xmlBase64: string | null;
}

const ModalXml: React.FC<ModalXmlProps> = ({ isOpen, onClose, xmlBase64 }) => {
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

  let decodedXml = "";
  if (xmlBase64) {
    try {
      decodedXml = atob(xmlBase64);
    } catch (err) {
      console.error("Error al decodificar el XML:", err);
      decodedXml = "Error al decodificar el XML";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 overflow-auto max-h-full"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Documento XML</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl leading-none">
            &times;
          </button>
        </div>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs whitespace-pre-wrap">
          {decodedXml}
        </pre>
      </div>
    </div>
  );
};

export default ModalXml;
