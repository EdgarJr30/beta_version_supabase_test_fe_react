import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

interface Tenant {
  id: number;
  fiscal_number: string;
  fiscal_name: string;
  commercial_name: string;
  address: string;
  city: string;
  zipcode: string;
  phone: string;
  email: string;
  environment: string;
}

export default function Tenant() {
  const { roles } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (roles !== "admin") return;

    const fetchTenant = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tenant")
        .select("*")
        .single();

      if (error) {
        setError("Error al obtener los datos.");
        console.error("Error al obtener los datos del tenant:", error.message);
      } else {
        setTenant(data);
      }
      setLoading(false);
    };

    fetchTenant();
  }, [roles]);

  // Se actualiza para que acepte tanto inputs como selects
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (tenant) {
      setTenant({ ...tenant, [e.target.name]: e.target.value });
    }
  };

  const handleUpdate = async () => {
    if (!tenant) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("tenant")
      .update({
        fiscal_name: tenant.fiscal_name,
        commercial_name: tenant.commercial_name,
        address: tenant.address,
        city: tenant.city,
        zipcode: tenant.zipcode,
        phone: tenant.phone,
        email: tenant.email,
        environment: tenant.environment,
      })
      .eq("id", tenant.id);

    if (error) {
      setError("Error al actualizar la información.");
      console.error("Error al actualizar:", error.message);
    } else {
      setSuccess("✅ Información actualizada correctamente.");
    }

    setSaving(false);
  };

  if (roles !== "admin") {
    return (
      <p className="text-red-500 text-center">
        No tienes permisos para acceder a esta página.
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Identificación y Ubicación</h2>

      {loading ? (
        <p className="text-gray-500">Cargando datos...</p>
      ) : tenant ? (
        <>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="font-semibold">Identificación</label>
              <input
                type="text"
                value={tenant.fiscal_number}
                className="w-full p-2 border bg-gray-200 rounded"
                disabled
              />
            </div>
            <div>
              <label className="font-semibold">Razón Social *</label>
              <input
                type="text"
                name="fiscal_name"
                value={tenant.fiscal_name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold">Nombre Comercial *</label>
              <input
                type="text"
                name="commercial_name"
                value={tenant.commercial_name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold">Dirección *</label>
              <input
                type="text"
                name="address"
                value={tenant.address}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold">Teléfono *</label>
              <input
                type="text"
                name="phone"
                value={tenant.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold">Ciudad</label>
              <input
                type="text"
                name="city"
                value={tenant.city || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold">Código Postal</label>
              <input
                type="text"
                name="zipcode"
                value={tenant.zipcode || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold">Correo Electrónico</label>
              <input
                type="text"
                name="email"
                value={tenant.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold">Ambiente</label>
              <select
                name="environment"
                value={tenant.environment}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="testecf">testecf</option>
                <option value="certecf">certecf</option>
                <option value="ecf">ecf</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              {saving ? "Guardando..." : "Actualizar Información"}
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">No se encontraron datos.</p>
      )}
    </div>
  );
}
