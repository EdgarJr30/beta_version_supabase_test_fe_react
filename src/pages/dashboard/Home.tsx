export default function Home() {

  function getFormattedDate(date: Date = new Date()): string {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} de ${month} del ${year}`;
  }

  return (
    <div className="bg-white p-6 md:p-8 lg:p-10 space-y-6">
      {/* Contenedor principal*/}
      <div className="bg-white p-6 md:p-8 lg:p-10 rounded-lg shadow-md mx-auto w-full max-w-5xl">
        {/* Encabezado */}
        <div className="bg-blue-500 text-white p-4 rounded-t-lg text-center sm:text-left">
          <h2 className="text-lg font-bold">Configuración Principal</h2>
        </div>

        {/* Contenido */}
        <div className="border-t border-blue-500 mt-4 p-4 space-y-6">
          {/* Vigencia Certificado */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="font-semibold whitespace-nowrap">Vigencia Certificado Digital Hasta:</span>
            <span>12 de marzo de 2025</span>
            <a href="#" className="text-blue-500">Actualizar</a>
          </div>

          {/* Correo Electrónico */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="font-semibold whitespace-nowrap truncate overflow-hidden">Correo para emitir documentos electrónicos:</span>
            <span className="truncate overflow-hidden">no-reply@do.tejadatechgroup.com</span>
            <div className="flex gap-x-4">
              <a href="#" className="text-blue-500">Actualizar</a>
              <a href="#" className="text-blue-500">
                <i className="fas fa-question-circle"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* MÉTRICAS*/}
      <div className="mt-6 text-center sm:text-left w-full max-w-5xl mx-auto px-6 md:px-8 lg:px-10">
        <h3 className="font-semibold text-xl">Métricas de hoy, {getFormattedDate()} </h3>
        <div className="mt-4 h-72 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  );
}
