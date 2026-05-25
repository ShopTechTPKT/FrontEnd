import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { changePassword } from "../../../apis/userApi";
import notify from "../../../utils/notify";

const AccountInfoTab = ({ accountInfo, editAccountInfo, setEditAccountInfo, onSave, resolvedUserId }) => {
  const { t } = useTranslation();
  const [showPwForm, setShowPwForm] = useState(false);
  const [pw, setPw] = useState({ current: "", new: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setEditAccountInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePwSubmit = async () => {
    setPwError("");
    if (pw.new !== pw.confirm) { setPwError("Mật khẩu mới và xác nhận không khớp"); return; }
    if (pw.new.length < 6) { setPwError("Mật khẩu mới phải có ít nhất 6 ký tự"); return; }
    try {
      setPwLoading(true);
      await changePassword(resolvedUserId, { currentPassword: pw.current, newPassword: pw.new });
      notify.success("Đổi mật khẩu thành công!");
      setShowPwForm(false);
      setPw({ current: "", new: "", confirm: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || err.message || "Lỗi đổi mật khẩu");
    } finally { setPwLoading(false); }
  };

  return (
    <div className="profile-card animate-fadeInUp">
      <div className="profile-card-header">
        <h2 className="profile-card-title">{t("account.account_information")}</h2>
        <button onClick={onSave} disabled={!resolvedUserId} className="btn-primary text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t("common.save")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {[
          { name: "fullName", label: t("account.full_name"), type: "text" },
          { name: "email", label: t("cart.email"), type: "email", disabled: true },
          { name: "phoneNumber", label: t("account.phone_number"), type: "text" },
          { name: "address", label: t("account.address"), type: "text" },
        ].map((f) => (
          <div key={f.name}>
            <label htmlFor={f.name} className="profile-label">{f.label}</label>
            <input type={f.type} id={f.name} name={f.name} value={editAccountInfo[f.name] || ""} onChange={handleInput} disabled={f.disabled} className="profile-input" />
          </div>
        ))}
        <div>
          <label htmlFor="gender" className="profile-label">{t("account.gender", { defaultValue: "Giới tính" })}</label>
          <select id="gender" name="gender" value={editAccountInfo.gender || ""} onChange={(e) => setEditAccountInfo((p) => ({ ...p, gender: e.target.value }))} className="profile-input">
            <option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option>
          </select>
        </div>
        <div>
          <label htmlFor="birthDate" className="profile-label">{t("account.birth_date", { defaultValue: "Ngày sinh" })}</label>
          <input type="date" id="birthDate" name="birthDate" value={(editAccountInfo.birthDate || "").slice(0, 10)} onChange={handleInput} className="profile-input" />
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] pt-5">
        <button type="button" onClick={() => setShowPwForm(!showPwForm)} disabled={!resolvedUserId} className={`flex items-center gap-2 text-sm font-semibold ${resolvedUserId ? "text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]" : "text-[var(--color-text-muted)] cursor-not-allowed"}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          {t("account.change_password")}
          <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showPwForm ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {showPwForm && resolvedUserId && (
          <div className="mt-4 p-5 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-xl animate-fadeInUp">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[{ key: "current", label: "Mật khẩu hiện tại" }, { key: "new", label: "Mật khẩu mới" }, { key: "confirm", label: "Xác nhận" }].map((f) => (
                <div key={f.key}>
                  <label className="profile-label">{f.label}</label>
                  <input type="password" value={pw[f.key]} onChange={(e) => setPw((p) => ({ ...p, [f.key]: e.target.value }))} className="profile-input" placeholder="••••••" />
                </div>
              ))}
            </div>
            {pwError && <div className="mb-4 p-3 rounded-lg bg-[var(--color-danger-light)] text-sm text-red-700 dark:text-red-400">{pwError}</div>}
            <div className="flex gap-3">
              <button onClick={handlePwSubmit} disabled={pwLoading} className="btn-primary text-sm">{pwLoading ? "..." : "Lưu thay đổi"}</button>
              <button onClick={() => { setShowPwForm(false); setPwError(""); }} className="btn-outline text-sm">{t("common.cancel")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountInfoTab;
