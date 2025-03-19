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

interface AuthUser {
  id: string;         // uuid en auth.users
  email: string;
  // Ajusta o agrega más campos si deseas
}

const Users: React.FC = () => {
  const { roles } = useAuth(); // "admin" | "user" | etc.
  const [usersData, setUsersData] = useState<User[]>([]);
  const [rolesData, setRolesData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal para CREAR en public.users
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createRoleId, setCreateRoleId] = useState<number | null>(null);
  const [createError, setCreateError] = useState("");
  // Al crear desde un usuario de auth, fijamos su ID y email
  const [selectedAuthUser, setSelectedAuthUser] = useState<AuthUser | null>(null);

  // Modal para INVITAR usuario (esto crea en auth.users)
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

  // Listado de auth.users (para mapearlos a public.users)
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);

  // Modal para EDITAR
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editRoleId, setEditRoleId] = useState<number | null>(null);
  const [editError, setEditError] = useState("");

  // Modal para ELIMINAR
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // Paginación (para public.users)
  const itemsPerPage = 10;
  const { paginatedData, currentPage, setCurrentPage } = usePagination({
    data: usersData,
    itemsPerPage,
  });

  useEffect(() => {
    // Si el rol es "admin" o "user", cargamos la lista de usuarios y roles
    if (roles === "admin" || roles === "user") {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [roles]);

  // Carga usuarios (public.users) y roles
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

  // ======================================
  // (1) INVITAR USUARIO (auth.users)
  // ======================================
  const openInviteModal = () => {
    setInviteEmail("");
    setInviteError("");
    setShowInviteModal(true);
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
  };

  const handleInviteUser = async () => {
    if (roles !== "admin") {
      setInviteError("No tienes permisos para invitar usuarios.");
      return;
    }
    if (!inviteEmail) {
      setInviteError("Falta el email.");
      return;
    }

    try {
      // Usando supabase.auth.admin.inviteUserByEmail
      // Requiere credenciales de servicio
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail);
      if (error) {
        console.error("❌ Error al invitar usuario:", error.message);
        setInviteError(error.message);
      } else {
        console.log("✅ Usuario invitado en auth.users:", data);
        closeInviteModal();
        // Opcional: fetchAuthUsers() para recargar la lista
      }
    } catch (e: unknown) {
      console.error("❌ Error general al invitar usuario:", e);
      setInviteError(String(e));
    }
  };

  // ======================================
  // (2) Cargar auth.users y crear en public.users
  // ======================================
  const fetchAuthUsers = async () => {
    try {
      // Listar usuarios de auth
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) {
        console.error("❌ Error al listar auth.users:", error.message);
      } else {
        // Ajusta la forma de parsear data según la versión
        const list = data.users || [];
        setAuthUsers(list as AuthUser[]);
      }
    } catch (e) {
      console.error("❌ Error al listar auth.users:", e);
    }
  };

  // Abre el modal "crear usuario en public" pero partiendo de un usuario ya invitado (authUser)
  const openCreateModalFromAuthUser = (authUser: AuthUser) => {
    setSelectedAuthUser(authUser);
    setCreateName("");
    setCreateRoleId(null);
    setCreateError("");
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setSelectedAuthUser(null);
  };

  // Insertar en public.users usando ID/email del authUser
  const handleCreateUser = async () => {
    if (roles !== "admin") {
      setCreateError("No tienes permisos para crear usuarios.");
      return;
    }
    if (!selectedAuthUser) {
      setCreateError("No hay usuario de auth seleccionado.");
      return;
    }
    if (!createName || !createRoleId) {
      setCreateError("Faltan campos obligatorios (nombre, rol).");
      return;
    }

    try {
      // Insertar en public.users
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            id: selectedAuthUser.id, // El ID del authUser
            email: selectedAuthUser.email,
            name: createName,
            rol_id: createRoleId,
          },
        ])
        .select();

      if (error) {
        setCreateError(error.message);
        console.error("❌ Error al insertar usuario en public.users:", error.message);
      } else {
        console.log("✅ Usuario creado en public.users:", data);
        await fetchAllData();
        closeCreateModal();
      }
    } catch (e: unknown) {
      console.error("❌ Error general al crear usuario:", e);
      setCreateError(String(e));
    }
  };

  // ======================================
  // (3) EDITAR USUARIO (public.users)
  // ======================================
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

  // ======================================
  // (4) ELIMINAR USUARIO (public.users)
  // ======================================
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

  // PINTA
  return (
    <div className="p-4">
      {/* BOTONES DE INVITAR Y CARGAR AUTH USERS */}
      <div className="flex justify-end space-x-2 mb-4">
        <button
          onClick={openInviteModal}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
        >
          Invitar Usuario (auth)
        </button>

        <button
          onClick={fetchAuthUsers}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
        >
          Cargar auth.users
        </button>
      </div>

      {/* Tabla con authUsers para crear en public */}
      {authUsers.length > 0 && (
        <div className="bg-white shadow-md overflow-x-auto mb-6">
          <h3 className="font-bold text-lg p-2">Usuarios en auth.users (no en public.users)</h3>
          <table className="min-w-full text-xs border-collapse">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-2 border border-gray-700 min-w-[220px]">Auth ID</th>
                <th className="p-2 border border-gray-700 min-w-[220px]">Email</th>
                <th className="p-2 border border-gray-700 min-w-[150px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {authUsers.map((authU) => (
                <tr key={authU.id} className="border-b hover:bg-gray-100">
                  <td className="p-2 border">{authU.id}</td>
                  <td className="p-2 border">{authU.email}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => openCreateModalFromAuthUser(authU)}
                      className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                    >
                      Crear en public.users
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500">Cargando usuarios...</div>
      ) : (
        <>
          <div className="bg-white shadow-md overflow-x-auto">
            <table className="min-w-full text-xs border-collapse">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-2 border border-gray-700 min-w-[180px]">
                    ID (uuid)
                  </th>
                  <th className="p-2 border border-gray-700 min-w-[220px]">
                    Email
                  </th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">
                    Nombre
                  </th>
                  <th className="p-2 border border-gray-700 min-w-[100px]">
                    Rol
                  </th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">
                    Creado
                  </th>
                  <th className="p-2 border border-gray-700 min-w-[150px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-100">
                    <td className="p-2 border">{item.id}</td>
                    <td className="p-2 border">{item.email}</td>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border">
                      {rolesData.find((r) => r.id === item.rol_id)?.name ||
                        "Sin rol"}
                    </td>
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
            totalItems={usersData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Modal INVITAR (auth.users) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Invitar Usuario (auth.users)</h2>
              <button onClick={closeInviteModal} className="text-gray-500">✕</button>
            </div>

            {inviteError && (
              <p className="text-red-500 text-sm mb-2">{inviteError}</p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-semibold">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={closeInviteModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleInviteUser}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Enviar Invitación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal CREAR en public.users (usando un authUser) */}
      {showCreateModal && selectedAuthUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Crear en public.users</h2>
              <button onClick={closeCreateModal} className="text-gray-500">
                ✕
              </button>
            </div>

            {createError && (
              <p className="text-red-500 text-sm mb-2">{createError}</p>
            )}

            <div className="space-y-4">
              <p className="text-sm">
                ID: <span className="font-mono">{selectedAuthUser.id}</span>
                <br />
                Email: <span className="font-mono">{selectedAuthUser.email}</span>
              </p>

              <div>
                <label className="block font-semibold">Nombre</label>
                <input
                  type="text"
                  className="w-full p-2 border"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold">Rol</label>
                <select
                  className="w-full p-2 border"
                  value={createRoleId ?? ""}
                  onChange={(e) => setCreateRoleId(Number(e.target.value))}
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
                onClick={closeCreateModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal EDITAR */}
      {showEditModal && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Usuario</h2>
              <button onClick={closeEditModal} className="text-gray-500">
                ✕
              </button>
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

      {/* Modal ELIMINAR */}
      {showDeleteModal && deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Eliminar Usuario</h2>
              <button onClick={closeDeleteModal} className="text-gray-500">
                ✕
              </button>
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
