import React, { useEffect, useState } from "react";
import { FaUserShield, FaPlus, FaEdit, FaTrash, FaSearch, FaCheck } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import axiosInstance from "../../custom/axios";
import ConfirmModal from "../../components/ConfirmModal";

const PermissionsPage = () => {
  const { t } = useTranslation();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackPermissions = [
    { id: "create", name: "Create", description: "Create new records" },
    { id: "read", name: "Read", description: "View records" },
    { id: "update", name: "Update", description: "Edit existing records" },
    { id: "delete", name: "Delete", description: "Remove records" },
    { id: "manage_users", name: "Manage Users", description: "User management" },
    { id: "manage_products", name: "Manage Products", description: "Product management" },
    { id: "view_reports", name: "View Reports", description: "Access to reports" },
    { id: "manage_orders", name: "Manage Orders", description: "Order management" },
  ];

  const [allPermissions, setAllPermissions] = useState(fallbackPermissions);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, permissionsRes] = await Promise.allSettled([
          axiosInstance.get("/roles"),
          axiosInstance.get("/permissions"),
        ]);

        if (rolesRes.status === "fulfilled") {
          setRoles(Array.isArray(rolesRes.value.data) ? rolesRes.value.data : []);
        }
        if (permissionsRes.status === "fulfilled") {
          setAllPermissions(
            Array.isArray(permissionsRes.value.data)
              ? permissionsRes.value.data
              : fallbackPermissions,
          );
        }
      } catch (error) {
        console.error("Failed to fetch permissions data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRoleColor = (roleName) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'from-red-600 to-pink-600';
      case 'manager':
        return 'from-[var(--color-primary-)] to-[var(--color-primary-)]';
      case 'staff':
        return 'from-[var(--color-primary-)] to-cyan-600';
      case 'customer':
        return 'from-green-600 to-teal-600';
      default:
        return "from-gray-600 to-gray-800";
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setSelectedRole(null);
    setRoleForm({ name: "", description: "", permissions: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setRoleForm({
      name: role?.name || "",
      description: role?.description || "",
      permissions: Array.isArray(role?.permissions) ? role.permissions : [],
    });
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((id) => id !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const fetchRoles = async () => {
    const { data } = await axiosInstance.get("/roles");
    setRoles(Array.isArray(data) ? data : []);
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim()) {
      toast.error(t("common.role_name_required", "Role name is required"));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: roleForm.name.trim(),
        description: roleForm.description.trim(),
        permissions: roleForm.permissions,
      };
      if (selectedRole?.id) {
        await axiosInstance.put(`/roles/${selectedRole.id}`, payload);
        toast.success(t("common.updated_successfully", "Updated successfully!"));
      } else {
        await axiosInstance.post("/roles", payload);
        toast.success(t("common.created_successfully", "Created successfully!"));
      }
      await fetchRoles();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save role:", error);
      toast.error(t("common.action_failed", "Action failed. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (role) => {
    try {
      await axiosInstance.delete(`/roles/${role.id}`);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      toast.success(t("common.deleted_successfully", "Deleted successfully!"));
    } catch (error) {
      console.error("Failed to delete role:", error);
      toast.error(t("common.action_failed", "Action failed. Please try again."));
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-pageIn">
      {loading ? (
        <div className="space-y-3 py-2" aria-busy="true">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="admin-skeleton h-16 rounded-xl border border-[var(--color-border)]" />
          ))}
        </div>
      ) : (
        <>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--color-bg)] p-6 rounded-2xl shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary-)] to-purple-600 flex items-center justify-center text-white shadow-lg shadow-[var(--color-primary-)]/50">
              <FaUserShield size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("common.roles_permissions")}</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">{t("common.manage_user_roles_and")}</p>
            </div>
          </div>
            <button
              onClick={openCreateModal}
            className="btn-admin-primary px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold"
            >
              <FaPlus />
              Create Role
            </button>
          </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="admin-card p-5 border-l-4 border-[var(--color-primary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--color-text-secondary)] text-sm">{t("common.total_roles")}</p>
                <p className="text-3xl font-bold text-[var(--color-text)]">{roles.length}</p>
              </div>
              <div className="w-12 h-12 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center">
                <FaUserShield className="text-[var(--color-primary)] text-xl" />
              </div>
            </div>
          </div>

          <div className="admin-card p-5 border-l-4 border-[var(--color-primary-)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--color-text-secondary)] text-sm">{t("common.total_users")}</p>
                <p className="text-3xl font-bold text-[var(--color-text)]">
                  {roles.reduce((sum, r) => sum + r.userCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-[var(--color-primary-)] rounded-full flex items-center justify-center">
                <FaUserShield className="text-[var(--color-primary-)] text-xl" />
              </div>
            </div>
          </div>

          <div className="admin-card p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--color-text-secondary)] text-sm">{t("common.permissions")}</p>
                <p className="text-3xl font-bold text-[var(--color-text)]">{allPermissions.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheck className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="admin-card p-5 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--color-text-secondary)] text-sm">{t("common.admin_roles")}</p>
                <p className="text-3xl font-bold text-[var(--color-text)]">
                  {roles.filter((r) => r.name?.toLowerCase() === "admin").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaUserShield className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="admin-card p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder={t('common.search_roles')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input w-full pl-10"
            />
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRoles.map((role) => (
            <div key={role.id} className="admin-card overflow-hidden hover:shadow-md transition-all">
              <div className={`bg-gradient-to-r ${getRoleColor(role.name)} p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <FaUserShield className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xl">{role.name}</h3>
                      <p className="text-white/80 text-sm">{role.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full font-semibold">
                    {role.userCount} users
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full font-semibold">
                    {role.permissions.length} permissions
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h4 className="font-semibold text-[var(--color-text)] mb-3">{t("remaining.permissions")}</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {role.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2.5 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full text-xs font-medium flex items-center gap-1"
                    >
                      <FaCheck className="text-[8px]" />
                      {perm.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      openEditModal(role);
                    }}
                    className="flex-1 btn-admin-primary py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                  >
                    <FaEdit />{t('account.edit')}</button>
                  <button
                    onClick={() => setDeleteTarget(role)}
                    className="flex-1 py-2 bg-[var(--color-bg-muted)] hover:bg-[var(--color-danger-light)] text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRoles.length === 0 && (
          <div className="admin-card p-12 text-center">
            <div className="w-24 h-24 bg-[var(--color-bg-muted)] rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserShield className="text-[var(--color-text-muted)] text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">{t("common.no_roles_found")}</h3>
            <p className="text-[var(--color-text-secondary)]">{t("common.try_adjusting_your_search")}</p>
          </div>
        )}

        {/* Edit/Create Modal */}
        {isModalOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-panel w-full max-w-3xl max-h-[85vh] overflow-y-auto">
              <div className="p-6 border-b border-[var(--color-border)]">
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                  {selectedRole ? 'Edit Role' : 'Create New Role'}
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">{t("common.role_name")}</label>
                    <input
                      type="text"
                      placeholder={t('common.eg_manager')}
                      value={roleForm.name}
                      onChange={(e) => setRoleForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">{t("remaining.description")}</label>
                    <textarea
                      placeholder={t('common.describe_the_role')}
                      value={roleForm.description}
                      onChange={(e) => setRoleForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="admin-input"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">{t("common.permissions")}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {allPermissions.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={roleForm.permissions.includes(perm.id)}
                            onChange={() => handleTogglePermission(perm.id)}
                            className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          />
                          <div>
                            <p className="font-semibold text-[var(--color-text)] text-sm">{perm.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{perm.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 border-t border-[var(--color-border)] pt-6">
                  <button
                    onClick={handleSaveRole}
                    disabled={saving}
                    className="flex-1 btn-admin-primary py-2.5 rounded-lg font-semibold"
                  >
                    {saving ? t("common.saving", "Saving...") : selectedRole ? 'Update Role' : 'Create Role'}
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 bg-[var(--color-bg-muted)] text-[var(--color-text)] rounded-lg font-semibold hover:bg-[var(--color-bg-subtle)] transition-colors"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {deleteTarget ? (
          <ConfirmModal
            isOpen={Boolean(deleteTarget)}
            title={t("common.confirm_delete", "Xác nhận xóa")}
            message={t("common.delete_role_confirm", {
              defaultValue: `Bạn có chắc muốn xóa "${deleteTarget.name}"? Hành động này không thể hoàn tác.`,
            })}
            onConfirm={() => {
              handleDeleteRole(deleteTarget);
              setDeleteTarget(null);
            }}
            onCancel={() => setDeleteTarget(null)}
          />
        ) : null}
      </>
      )}
    </div>
  );
};

export default PermissionsPage;
