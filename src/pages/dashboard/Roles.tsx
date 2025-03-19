import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/ui/Pagination";
import { format } from "date-fns";

interface Rol {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

const Roles: React.FC = () => {
  const { roles } = useAuth();
  const [rolesData, setRolesData] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal para CREAR
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createError, setCreateError] = useState("");

  // Modal para EDITAR
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRole, setEditRole] = useState<Rol | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editError, setEditError] = useState("");

  // Modal para ELIMINAR
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRole, setDeleteRole] = useState<Rol | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // Pagination
  const itemsPerPage = 10;
  const {
    paginatedData,
    currentPage,
    setCurrentPage,
  } = usePagination({
    data: rolesData,
    itemsPerPage,
  });

  // Al montar, o cuando cambie "roles", cargamos la lista si es "admin" o "user"
  useEffect(() => {
    if (roles === "admin" || roles === "user") {
      fetchRoles();
    } else {
      setLoading(false);
    }
  }, [roles]);

  // Función para obtener la lista de roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("*");
      if (error) {
        console.error("❌ Error fetching roles:", error.message);
      } else {
        setRolesData(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     CREAR
  ======================== */
  const openCreateModal = () => {
    setShowCreateModal(true);
    setCreateName("");
    setCreateDesc("");
    setCreateError("");
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateRole = async () => {
    if (roles !== "admin") {
      setCreateError("No tienes permisos para crear roles.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("roles")
        .insert([
          {
            name: createName,
            description: createDesc,
          },
        ])
        .select(); // Para que devuelva la fila insertada

      if (error) {
        setCreateError(error.message);
        console.error("❌ Error al insertar rol:", error.message);
      } else {
        console.log("✅ Rol creado:", data);
        await fetchRoles();
        closeCreateModal();
      }
    } catch (e: unknown) {
      console.error("❌ Error general al crear rol:", e);
      setCreateError(String(e));
    }
  };

  /* =======================
     EDITAR
  ======================== */
  const openEditModal = (role: Rol) => {
    if (roles !== "admin") {
      alert("No tienes permisos para editar roles.");
      return;
    }
    setEditRole(role);
    setEditName(role.name);
    setEditDesc(role.description);
    setEditError("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditRole(null);
  };

  const handleUpdateRole = async () => {
    if (roles !== "admin") {
      setEditError("No tienes permisos para editar roles.");
      return;
    }
    if (!editRole) {
      setEditError("No hay rol seleccionado para editar.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("roles")
        .update({
          name: editName,
          description: editDesc,
        })
        .eq("id", editRole.id)
        .select(); // Para que devuelva la fila actualizada

      if (error) {
        setEditError(error.message);
        console.error("❌ Error al editar rol:", error.message);
      } else {
        console.log("✅ Rol actualizado:", data);
        await fetchRoles();
        closeEditModal();
      }
    } catch (e: unknown) {
      console.error("❌ Error general al actualizar rol:", e);
      setEditError(String(e));
    }
  };

  /* =======================
     ELIMINAR
  ======================== */
  const openDeleteModal = (role: Rol) => {
    if (roles !== "admin") {
      alert("No tienes permisos para eliminar roles.");
      return;
    }
    setDeleteRole(role);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteRole(null);
  };

  const handleDeleteRole = async () => {
    if (roles !== "admin") {
      setDeleteError("No tienes permisos para eliminar roles.");
      return;
    }
    if (!deleteRole) {
      setDeleteError("No hay rol seleccionado para eliminar.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("roles")
        .delete()
        .eq("id", deleteRole.id)
        .select(); // Devuelve la fila eliminada

      if (error) {
        setDeleteError(error.message);
        console.error("❌ Error al eliminar rol:", error.message);
      } else {
        console.log("✅ Rol eliminado:", data);
        await fetchRoles();
        closeDeleteModal();
      }
    } catch (e: unknown) {
      console.error("❌ Error general al eliminar rol:", e);
      setDeleteError(String(e));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Crear Rol
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Cargando roles...</div>
      ) : (
        <>
          <div className="bg-white shadow-md overflow-x-auto">
            <table className="min-w-full text-xs border-collapse">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-2 border border-gray-700 min-w-[50px]">ID</th>
                  <th className="p-2 border border-gray-700 min-w-[250px]">Nombre</th>
                  <th className="p-2 border border-gray-700 min-w-[250px]">Descripción</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Creado</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-100">
                    <td className="p-2 border">{item.id}</td>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border">{item.description}</td>
                    <td className="p-2 border">
                      {format(new Date(item.created_at), "dd/MM/yyyy HH:mm:ss")}
                    </td>
                    <td className="p-2 border">
                      <button
                        onClick={() => openEditModal(item)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeleteModal(item)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={rolesData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Modal CREAR */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Crear Rol</h2>
              <button onClick={closeCreateModal} className="text-gray-500">
                ✕
              </button>
            </div>

            {createError && <p className="text-red-500 text-sm mb-2">{createError}</p>}

            <div className="space-y-4">
              <div>
                <label className="block font-semibold">Nombre del rol</label>
                <input
                  type="text"
                  className="w-full p-2 border"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold">Descripción</label>
                <input
                  type="text"
                  className="w-full p-2 border"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={closeCreateModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateRole}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal EDITAR */}
      {showEditModal && editRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Rol</h2>
              <button onClick={closeEditModal} className="text-gray-500">
                ✕
              </button>
            </div>

            {editError && <p className="text-red-500 text-sm mb-2">{editError}</p>}

            <div className="space-y-4">
              <div>
                <label className="block font-semibold">Nombre del rol</label>
                <input
                  type="text"
                  className="w-full p-2 border"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold">Descripción</label>
                <input
                  type="text"
                  className="w-full p-2 border"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={closeEditModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateRole}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ELIMINAR */}
      {showDeleteModal && deleteRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Eliminar Rol</h2>
              <button onClick={closeDeleteModal} className="text-gray-500">
                ✕
              </button>
            </div>

            {deleteError && <p className="text-red-500 text-sm mb-2">{deleteError}</p>}

            <p className="mb-4">
              ¿Estás seguro de que deseas eliminar el rol{" "}
              <span className="font-semibold">{deleteRole.name}</span>?
            </p>

            <div className="flex justify-end space-x-2">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteRole}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
