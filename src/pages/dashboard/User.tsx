import { useNavigate } from "react-router-dom";

export default function User() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full">
      <h1 className="text-3xl font-bold mb-6">Página de Usuario</h1>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <p className="text-gray-700 mb-4">Bienvenid@ a tu panel de usuario.</p>

        <button
          onClick={() => navigate("/emision-eNCF")}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
        >
          Ver Emisión eNCF
        </button>
      </div>
    </div>
  );
}
