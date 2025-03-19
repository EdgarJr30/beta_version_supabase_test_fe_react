import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/ui/Pagination";
import { format } from "date-fns";

// =====================
// Tipos
// =====================
interface Role {
  id: number;
  name: string;
}

interface User {
  id: string;         // uuid (public.users)
  email: string;
  name: string;
  rol_id: number;
  created_at: string;
}

const Users: React.FC = () => {
  const { roles } = useAuth(); // "admin" | "user" | etc.
  const [usersData, setUsersData] = useState<User[]>([]);
  const [rolesData, setRolesData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Paginación
  const itemsPerPage = 10;
  const { paginatedData, currentPage, setCurrentPage } = usePagination({
    data: usersData,
    itemsPerPage,
  });

  // =========================
  // ESTADOS PARA MODAL "REGISTER"
  // =========================
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  // =========================
  // ESTADOS PARA EDITAR
  // =========================
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editRoleId, setEditRoleId] = useState<number | null>(null);
  const [editError, setEditError] = useState("");

  // =========================
  // ESTADOS PARA ELIMINAR
  // =========================
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // =========================
  // Cargar usuarios y roles
  // =========================
  useEffect(() => {
    if (roles === "admin" || roles === "user") {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [roles]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Cargar usuarios de public.users
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*");
      if (usersError) {
        console.error("❌ Error fetching users:", usersError.message);
      } else {
        setUsersData(users || []);
      }

      // Cargar roles
      const { data: rolesResult, error: rolesError } = await supabase
        .from("roles")
        .select("*");
      if (rolesError) {
        console.error("❌ Error fetching roles:", rolesError.message);
      } else {
        setRolesData(rolesResult || []);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ABRIR/CERRAR MODAL "REGISTER"
  // =========================
  const openRegisterModal = () => {
    setShowRegisterModal(true);
    setRegisterEmail("");
    setRegisterPassword("");
    setRegisterName("");
    setRegisterError("");
    setRegisterLoading(false);
  };

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
  };

  // =========================
  // FUNCIÓN: REGISTRAR USUARIO
  // =========================
  const signUpUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError("");

    try {
      // 1) Crear usuario en auth.users
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: { name: registerName }, // Guardar 'name' en la metadata
        },
      });

      if (signUpError) {
        setRegisterError(signUpError.message);
        setRegisterLoading(false);
        return;
      }
      console.log("✅ Usuario creado en auth.users:", data);

      // 2) Llamar a la función con SECURITY DEFINER para insertar en public.users
      const { user } = data;
      if (user) {
        const { error: rpcError } = await supabase.rpc("create_user_in_public", {
          p_id: user.id,
          p_email: registerEmail,
          p_name: registerName,
          p_rol_id: 2, // rol "user" por defecto, ajusta según necesites
        });

        if (rpcError) {
          console.error("❌ Error al ejecutar create_user_in_public:", rpcError.message);
          setRegisterError("Error al completar el registro en public.users (RPC falló).");
        } else {
          console.log("✅ Usuario agregado a public.users vía SECURITY DEFINER function");
          await fetchAllData();
          closeRegisterModal();
        }
      }
    } catch (err: unknown) {
      console.error("❌ Error general al registrar usuario:", err);
      setRegisterError(String(err));
    } finally {
      setRegisterLoading(false);
    }
  };

  // =========================
  // EDITAR USUARIO
  // =========================
  const openEditModal = (user: User) => {
    if (roles !== "admin") {
      alert("No tienes permisos para editar usuarios.");
      return;
    }
    setEditUser(user);
    setEditEmail(user.email);
    setEditName(user.name);
    setEditRoleId(user.rol_id);
    setEditError("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditUser(null);
  };

  const handleUpdateUser = async () => {
    if (roles !== "admin") {
      setEditError("No tienes permisos para editar usuarios.");
      return;
    }
    if (!editUser) {
      setEditError("No hay usuario seleccionado para editar.");
      return;
    }
    if (!editEmail || !editName || !editRoleId) {
      setEditError("Faltan campos obligatorios (email, nombre, rol).");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          email: editEmail,
          name: editName,
          rol_id: editRoleId,
        })
        .eq("id", editUser.id)
        .select();

      if (error) {
        setEditError(error.message);
        console.error("❌ Error al editar usuario en public.users:", error.message);
      } else {
        console.log("✅ Usuario actualizado en public.users:", data);
        await fetchAllData();
        closeEditModal();
      }
    } catch (e: unknown) {
      console.error("❌ Error general al actualizar usuario:", e);
      setEditError(String(e));
    }
  };

  // =========================
  // ELIMINAR USUARIO
  // =========================
  const openDeleteModal = (user: User) => {
    if (roles !== "admin") {
      alert("No tienes permisos para eliminar usuarios.");
      return;
    }
    setDeleteUser(user);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteUser(null);
  };

  const handleDeleteUser = async () => {
    if (roles !== "admin") {
      setDeleteError("No tienes permisos para eliminar usuarios.");
      return;
    }
    if (!deleteUser) {
      setDeleteError("No hay usuario seleccionado para eliminar.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .delete()
        .eq("id", deleteUser.id)
        .select();

      if (error) {
        setDeleteError(error.message);
        console.error("❌ Error al eliminar usuario en public.users:", error.message);
      } else {
        console.log("✅ Usuario eliminado en public.users:", data);
        await fetchAllData();
        closeDeleteModal();
      }
    } catch (e: unknown) {
      console.error("❌ Error general al eliminar usuario:", e);
      setDeleteError(String(e));
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="p-4">
      {/* BOTÓN PARA CREAR USUARIO (abre modal Register) */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openRegisterModal}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Crear Usuario
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Cargando usuarios...</div>
      ) : (
        <>
          <div className="bg-white shadow-md overflow-x-auto">
            <table className="min-w-full text-xs border-collapse">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-2 border border-gray-700 min-w-[180px]">ID (uuid)</th>
                  <th className="p-2 border border-gray-700 min-w-[220px]">Email</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Nombre</th>
                  <th className="p-2 border border-gray-700 min-w-[100px]">Rol</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Creado</th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-100">
                    <td className="p-2 border">{item.id}</td>
                    <td className="p-2 border">{item.email}</td>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border">
                      {rolesData.find((r) => r.id === item.rol_id)?.name || "Sin rol"}
                    </td>
                    <td className="p-2 border">
                      {format(new Date(item.created_at), "dd/MM/yyyy HH:mm:ss")}
                    </td>
                    <td className="p-2 border">
                      {/* Botón EDITAR */}
                      <button
                        onClick={() => openEditModal(item)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2"
                      >
                        Editar
                      </button>
                      {/* Botón ELIMINAR */}
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
            totalItems={usersData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* MODAL REGISTER */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Registrar Usuario</h2>
              <button onClick={closeRegisterModal} className="text-gray-500">✕</button>
            </div>

            {registerError && (
              <p className="text-red-500 text-sm mb-4">{registerError}</p>
            )}

            <form onSubmit={signUpUser} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
              >
                {registerLoading ? "Registrando..." : "Registrarse"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEditModal && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Usuario</h2>
              <button onClick={closeEditModal} className="text-gray-500">✕</button>
            </div>

            {editError && (
              <p className="text-red-500 text-sm mb-2">{editError}</p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-semibold">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold">Nombre</label>
                <input
                  type="text"
                  className="w-full p-2 border"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold">Rol</label>
                <select
                  className="w-full p-2 border"
                  value={editRoleId ?? ""}
                  onChange={(e) => setEditRoleId(Number(e.target.value))}
                >
                  <option value="">Selecciona un rol...</option>
                  {rolesData.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
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
                onClick={handleUpdateUser}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {showDeleteModal && deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Eliminar Usuario</h2>
              <button onClick={closeDeleteModal} className="text-gray-500">✕</button>
            </div>

            {deleteError && (
              <p className="text-red-500 text-sm mb-2">{deleteError}</p>
            )}

            <p className="mb-4">
              ¿Estás seguro de que deseas eliminar al usuario{" "}
              <span className="font-semibold">{deleteUser.name}</span>?
            </p>

            <div className="flex justify-end space-x-2">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
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

export default Users;
