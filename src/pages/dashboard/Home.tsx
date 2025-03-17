import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import { CursorArrowRaysIcon, EnvelopeOpenIcon, UsersIcon } from '@heroicons/react/24/outline'

const stats = [
  { id: 1, name: 'Total Subscribers', stat: '71,897', icon: UsersIcon, change: '122', changeType: 'increase' },
  { id: 2, name: 'Avg. Open Rate', stat: '58.16%', icon: EnvelopeOpenIcon, change: '5.4%', changeType: 'increase' },
  { id: 3, name: 'Avg. Click Rate', stat: '24.57%', icon: CursorArrowRaysIcon, change: '3.2%', changeType: 'decrease' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

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
    <>
      <div className="p-6 md:p-8 lg:p-10 space-y-6">
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
              <a href="/AdmCertificadoDigital" className="text-blue-500">Actualizar</a>
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

          {/* <div className="mt-4 h-72 bg-gray-200 rounded-md"> */}

          <div>
            <h3 className="text-base font-semibold text-gray-900">Métricas de hoy, {getFormattedDate()} </h3>

            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow-sm sm:px-6 sm:pt-6"
                >
                  <dt>
                    <div className="absolute rounded-md bg-indigo-500 p-3">
                      <item.icon aria-hidden="true" className="size-6 text-white" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                  </dt>
                  <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                    <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                    <p
                      className={classNames(
                        item.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
                        'ml-2 flex items-baseline text-sm font-semibold',
                      )}
                    >
                      {item.changeType === 'increase' ? (
                        <ArrowUpIcon aria-hidden="true" className="size-5 shrink-0 self-center text-green-500" />
                      ) : (
                        <ArrowDownIcon aria-hidden="true" className="size-5 shrink-0 self-center text-red-500" />
                      )}

                      <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                      {item.change}
                    </p>
                    <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                          View all<span className="sr-only"> {item.name} stats</span>
                        </a>
                      </div>
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          {/* </div> */}
        </div>
      </div>

    </>
  );
}
