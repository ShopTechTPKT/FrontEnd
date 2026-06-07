import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../custom/axios";

export default function NewsletterCTA() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setStatus("");
    try {
      await axiosInstance.post("/newsletter/subscribe", { email, source: "home_cta" });
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("err");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative mx-4 mb-10 overflow-hidden rounded-3xl bg-indigo-600 px-6 py-12 text-center shadow-sm sm:mx-6 sm:px-10 dark:bg-indigo-900">
      <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative mx-auto max-w-lg">
        <h2 className="text-2xl font-bold text-white">{t("home.newsletterCtaTitle", { defaultValue: "Nhận ưu đãi mới nhất" })}</h2>
        <p className="mt-2 text-sm text-indigo-100">{t("home.newsletterCtaSub", { defaultValue: "Đăng ký email — không spam." })}</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("footer.newsletter.placeholder")}
            className="h-12 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-indigo-200 focus:ring-2 focus:ring-white/30"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-xl bg-white px-6 text-sm font-bold text-indigo-600 shadow-sm transition-all active:scale-[0.97] disabled:opacity-50"
          >
            {loading ? "…" : t("footer.newsletter.subscribe")}
          </button>
        </form>
        {status === "ok" && <p className="mt-3 text-xs text-emerald-200">{t("footer.newsletter.success")}</p>}
        {status === "err" && <p className="mt-3 text-xs text-red-200">{t("footer.newsletter.error")}</p>}
      </div>
    </section>
  );
}
