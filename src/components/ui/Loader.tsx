// src/components/Loader.jsx

export default function Loader() {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-white">
        <div className="flex flex-col items-center gap-6">
          
          {/* Spinner con una sección transparente en la parte superior */}
          <div className="w-16 h-16 border-4 border-indigo-500 border-solid rounded-full border-t-transparent animate-spin" />
  
          {/* Texto con animación pulso */}
          <p className="text-2xl font-bold text-indigo-700 animate-pulse">
            Cargando...
          </p>
        </div>
      </div>
    );
  }
  