import React, { useState, useCallback } from 'react';

export default function UpdateDigitalCertificate() {
    const [file, setFile] = useState<File | null>(null);
    const [clave, setClave] = useState("");
    const [repetirClave, setRepetirClave] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Manejador de archivo (input tradicional)
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    // Manejo de drag and drop
    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(false);
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            setFile(event.dataTransfer.files[0]);
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

    // Manejador de submit (simula la lectura y envío del certificado y la contraseña)
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!file) {
            alert("Debes subir el archivo .p12");
            return;
        }
        if (clave !== repetirClave) {
            alert("Las claves no coinciden");
            return;
        }

        // Crear objeto FormData para enviar al backend (simulado)
        const formData = new FormData();
        formData.append("certFile", file);
        formData.append("clave", clave);

        // Simulación de envío: se lee el archivo con FileReader
        const reader = new FileReader();
        reader.onload = () => {
            const fileContent = reader.result;
            console.log("Simulando envío del certificado y la contraseña:");
            console.log("Contenido del archivo:", fileContent);
            console.log("Contraseña:", clave);
            alert("Certificado enviado correctamente (simulación).");
        };
        reader.onerror = () => {
            alert("Error al leer el archivo.");
        };
        // Se lee el archivo como Data URL; puedes cambiar a readAsText si lo prefieres
        reader.readAsDataURL(file);
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-6">
            <h1 className="text-xl font-bold">Actualizar Certificado Digital</h1>
            <p className="text-sm text-gray-500">
                Archivo proporcionado por la Dirección General de Impuestos Internos (DGII) formato p12
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fileInput" className="block text-sm font-medium text-gray-700 mb-1">
                        Subir Archivo (Drag and Drop)
                    </label>
                    <div
                        className={`border-2 ${dragActive ? "border-blue-500" : "border-gray-300"} border-dashed p-4 rounded text-center`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <p className="text-sm text-gray-600">
                            {file ? file.name : "Arrastra y suelta el archivo aquí, o haz click para seleccionar"}
                        </p>
                        <input
                            id="fileInput"
                            type="file"
                            accept=".p12,.pfx"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label htmlFor="fileInput" className="cursor-pointer text-blue-500 underline">
                            Seleccionar archivo
                        </label>
                    </div>
                </div>

                {/* Campo de Clave */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clave</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={clave}
                            onChange={(e) => setClave(e.target.value)}
                            className="border p-2 w-full rounded pr-10"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Repetir Clave</label>
                    <div className="relative">
                        <input
                            type={showRepeatPassword ? "text" : "password"}
                            value={repetirClave}
                            onChange={(e) => setRepetirClave(e.target.value)}
                            className="border p-2 w-full rounded"
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

                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                    Guardar
                </button>
            </form>
        </div>
    );
}
