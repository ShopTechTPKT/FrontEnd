import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../../custom/axios";
import notify from "../../../utils/notify";

const AddressBookTab = ({ userId }) => {
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ recipientName: "", phone: "", address: "", city: "", district: "", ward: "", isDefault: false });

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/addresses/user/${userId}`);
        setAddresses(Array.isArray(data) ? data : []);
      } catch { setAddresses([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, [userId]);

  const resetForm = () => { setForm({ recipientName: "", phone: "", address: "", city: "", district: "", ward: "", isDefault: false }); setEditId(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.recipientName || !form.phone || !form.address) { notify.error("Vui lòng điền đầy đủ thông tin"); return; }
    try {
      const payload = { ...form, userId };
      if (editId) {
        await axiosInstance.put(`/addresses/${editId}`, payload);
        notify.success("Cập nhật địa chỉ thành công");
      } else {
        await axiosInstance.post("/addresses", payload);
        notify.success("Thêm địa chỉ thành công");
      }
      const { data } = await axiosInstance.get(`/addresses/user/${userId}`);
      setAddresses(Array.isArray(data) ? data : []);
      resetForm();
    } catch (err) { notify.error(err.response?.data?.message || "Lỗi lưu địa chỉ"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa địa chỉ này?")) return;
    try {
      await axiosInstance.delete(`/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      notify.success("Đã xóa địa chỉ");
    } catch { notify.error("Lỗi xóa địa chỉ"); }
  };

  const handleSetDefault = async (id) => {
    try {
      await axiosInstance.put(`/addresses/${id}/default`);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      notify.success("Đã đặt làm mặc định");
    } catch { notify.error("Lỗi cập nhật"); }
  };

  const startEdit = (addr) => { setForm({ recipientName: addr.recipientName || "", phone: addr.phone || "", address: addr.address || "", city: addr.city || "", district: addr.district || "", ward: addr.ward || "", isDefault: addr.isDefault || false }); setEditId(addr.id); setShowForm(true); };

  if (loading) return <div className="profile-card p-8 text-center"><div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="profile-card animate-fadeInUp">
      <div className="profile-card-header">
        <h2 className="profile-card-title">{t("account.address_book")}</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Thêm địa chỉ
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-5 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-xl animate-fadeInUp">
          <h3 className="font-semibold text-sm text-[var(--color-text)] mb-4">{editId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className="profile-label">Người nhận</label><input value={form.recipientName} onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))} className="profile-input" /></div>
            <div><label className="profile-label">Số điện thoại</label><input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="profile-input" /></div>
            <div className="md:col-span-2"><label className="profile-label">Địa chỉ</label><input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="profile-input" /></div>
            <div><label className="profile-label">Tỉnh/Thành phố</label><input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className="profile-input" /></div>
            <div><label className="profile-label">Quận/Huyện</label><input value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))} className="profile-input" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-4 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))} className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)]" />
            Đặt làm địa chỉ mặc định
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} className="btn-primary text-sm">Lưu</button>
            <button onClick={resetForm} className="btn-outline text-sm">Hủy</button>
          </div>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-bg-muted)] flex items-center justify-center text-3xl">📍</div>
          <p className="text-[var(--color-text-secondary)] text-sm mb-3">Bạn chưa có địa chỉ nào</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Thêm địa chỉ đầu tiên</button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className={`p-4 rounded-xl border transition-all ${addr.isDefault ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]" : "border-[var(--color-border)] hover:border-[var(--color-primary-300)]"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-[var(--color-text)]">{addr.recipientName}</p>
                    <span className="text-xs text-[var(--color-text-muted)]">|</span>
                    <p className="text-sm text-[var(--color-text-secondary)]">{addr.phone}</p>
                    {addr.isDefault && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white">Mặc định</span>}
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">{[addr.address, addr.ward, addr.district, addr.city].filter(Boolean).join(", ")}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!addr.isDefault && <button onClick={() => handleSetDefault(addr.id)} className="text-xs px-2 py-1 rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] transition-colors">Mặc định</button>}
                  <button onClick={() => startEdit(addr)} className="text-xs px-2 py-1 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors">Sửa</button>
                  <button onClick={() => handleDelete(addr.id)} className="text-xs px-2 py-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">Xóa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressBookTab;
