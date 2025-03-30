import React, { useState, useCallback, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

interface Certificate {
  id: number;
  name: string;
  pkcs12_data: string | null;
  password: string | null;
  expiration_date: string | null;
  created_at: string;
}

export default function UpdateDigitalCertificate() {
  const [currentCert, setCurrentCert] = useState<Certificate | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [clave, setClave] = useState("");
  const [repetirClave, setRepetirClave] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentCertificate();
    fetchCompanyName();
  }, []);

  const fetchCurrentCertificate = async () => {
    try {
      const { data, error } = await supabase
        .from("certificate")
        .select("*")
        .single(); // Toma el primero que encuentre

      if (error) {
        console.error("Error al obtener el certificado actual:", error);
      } else {
        setCurrentCert(data);
      }
    } catch (err) {
      console.error("Error al obtener el certificado actual:", err);
    }
  };

  const fetchCompanyName = async () => {
    try {
      const { data, error } = await supabase
        .from("tenant")
        .select("fiscal_name")
        .single();

      if (error) {
        console.error("Error al obtener el nombre de la empresa:", error.message);
      } else if (data) {
        setCompanyName(data.fiscal_name);
      }
    } catch (err) {
      console.error("Error al obtener el nombre de la empresa:", err);
    }
  };

  // Función para validar que el archivo tenga extensión .p12
  const isValidFile = (file: File) => {
    return file.name.toLowerCase().endsWith(".p12");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!isValidFile(selectedFile)) {
        alert("Solo se permiten archivos de tipo .p12");
        return;
      }
      setFile(selectedFile);
    }
  };

  // Manejo de drag and drop
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const droppedFile = event.dataTransfer.files[0];
      if (!isValidFile(droppedFile)) {
        alert("Solo se permiten archivos de tipo .p12");
        return;
      }
      setFile(droppedFile);
    }
  }, []);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const clearFile = () => {
    setFile(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      alert("Debes subir el archivo .p12");
      return;
    }
    if (!clave || !repetirClave) {
      alert("Todos los campos son obligatorios");
      return;
    }
    if (clave !== repetirClave) {
      alert("Las claves no coinciden");
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Content = reader.result as string;

        const { data, error } = await supabase
          .from("certificate")
          .insert([
            {
              pkcs12_data: base64Content,
              password: clave,
              name: file.name,
            },
          ])
          .select("*");

        if (error) {
          alert("Error al guardar el certificado en la base de datos.");
          console.error(error);
        } else if (data && data.length > 0) {
          alert("Certificado guardado exitosamente.");
          setFile(null);
          setClave("");
          setRepetirClave("");

          fetchCurrentCertificate();
        }
      } catch (err) {
        console.error("Error al insertar el certificado:", err);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      alert("Error al leer el archivo.");
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 p-6 bg-white rounded shadow space-y-4">
          <h1 className="text-xl font-bold">Firma Digital Actual</h1>

          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa:
            </label>
            <input
              type="text"
              readOnly
              className="border p-2 w-full rounded bg-gray-100"
              value={companyName ?? ""}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Caducidad:
            </label>
            <input
              type="text"
              readOnly
              className="border p-2 w-full rounded bg-gray-100"
              value={
                currentCert?.expiration_date
                  ? new Date(currentCert.expiration_date).toLocaleString()
                  : ""
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clave:
            </label>
            <input
              type="text"
              readOnly
              className="border p-2 w-full rounded bg-gray-100"
              value="-----"
            />
          </div>
        </div>

        <div className="flex-1 p-6 bg-white rounded shadow space-y-6">
          <h1 className="text-xl font-bold">Nueva Firma Digital</h1>
          <p className="text-sm text-gray-500">
            Archivo proporcionado por la Dirección General de Impuestos Internos
            (DGII) formato p12
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fileInput"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subir Archivo (Drag and Drop)
              </label>
              <div
                className={`border-2 ${dragActive ? "border-blue-500" : "border-gray-300"
                  } border-dashed p-4 rounded text-center`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <p className="text-sm text-gray-600">
                  {file
                    ? file.name
                    : "Arrastra y suelta el archivo aquí, o haz click para seleccionar"}
                </p>
                <input
                  id="fileInput"
                  type="file"
                  accept=".p12,.pfx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer text-blue-500 underline"
                >
                  Seleccionar archivo
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={clearFile}
                    className="mt-2 text-red-500 underline"
                  >
                    Borrar archivo
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clave
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  className="border p-2 w-full rounded pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223C5.25 6.06 8.157 3 12 3c3.843 0 6.75 3.06 8.02 5.223M4.264 19.736C5.53 21.935 8.283 24 12 24c3.717 0 6.47-2.065 7.736-4.264M4.264 19.736l14.472-14.472"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223C5.25 6.06 8.157 3 12 3c3.843 0 6.75 3.06 8.02 5.223M3.98 8.223c-1.076 1.72-1.076 4.28 0 6 1.27 2.163 4.177 5.223 8.02 5.223 3.843 0 6.75-3.06 8.02-5.223 1.076-1.72 1.076-4.28 0-6"
                      />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repetir Clave
              </label>
              <div className="relative">
                <input
                  type={showRepeatPassword ? "text" : "password"}
                  value={repetirClave}
                  onChange={(e) => setRepetirClave(e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                  tabIndex={-1}
                >
                  {showRepeatPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223C5.25 6.06 8.157 3 12 3c3.843 0 6.75 3.06 8.02 5.223M3.98 8.223c-1.076 1.72-1.076 4.28 0 6 1.27 2.163 4.177 5.223 8.02 5.223 3.843 0 6.75-3.06 8.02-5.223 1.076-1.72 1.076-4.28 0-6"
                      />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223C5.25 6.06 8.157 3 12 3c3.843 0 6.75 3.06 8.02 5.223M3.98 8.223c-1.076 1.72-1.076 4.28 0 6 1.27 2.163 4.177 5.223 8.02 5.223 3.843 0 6.75-3.06 8.02-5.223 1.076-1.72 1.076-4.28 0-6"
                      />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Guardar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
