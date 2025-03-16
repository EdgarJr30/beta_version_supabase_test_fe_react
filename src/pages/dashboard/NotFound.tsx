import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-red-600">404</h1>
      <p className="text-xl text-gray-700 mt-4">Página no encontrada</p>
      <p className="text-gray-500">La ruta que intentas acceder no existe.</p>
      <Link to="/" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        Volver al Inicio
      </Link>
    </div>
  );
}
