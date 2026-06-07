import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../custom/axios";
import { useTranslation } from "react-i18next";

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const IconYoutube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 001.95-1.97A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
    <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);

const FOOTER_COLUMNS = [
  {
    titleKey: "footer.information.title",
    links: [
      "aboutUs", "aboutZip", "privatePolicy", "search",
      "terms", "ordersReturns", "contactUs", "advancedSearch", "newsletter",
    ].map((k) => ({ labelKey: `footer.information.${k}`, to: "/" })),
  },
  {
    titleKey: "footer.pcParts.title",
    links: [
      "cpus", "addOnCards", "hardDrives", "graphicCards", "keyboardsMice",
      "casesPowerCooling", "ram", "software", "speakersHeadsets", "motherboards",
    ].map((k) => ({ labelKey: `footer.pcParts.${k}`, to: "/products" })),
  },
  {
    titleKey: "footer.desktopPCs.title",
    links: [
      "cpus", "customPCs", "servers", "msiAllInOne", "hpCompaq", "asusPCs", "tecsPCs",
    ].map((k) => ({ labelKey: `footer.desktopPCs.${k}`, to: "/products" })),
  },
  {
    titleKey: "footer.laptops.title",
    links: [
      "everydayUse", "msiWorkstation", "msiPrestige", "tabletsPads", "netbooks", "infinityGaming",
    ].map((k) => ({ labelKey: `footer.laptops.${k}`, to: "/products" })),
  },
];

const SOCIAL_LINKS = [
  { Icon: IconFacebook, label: "Facebook", href: "https://facebook.com" },
  { Icon: IconInstagram, label: "Instagram", href: "https://instagram.com" },
  { Icon: IconYoutube, label: "YouTube", href: "https://youtube.com" },
];

const PAYMENT_BADGES = [
  { label: "VISA", bg: "bg-[var(--color-pay-visa)]", text: "text-white", tracking: "tracking-widest" },
  { label: "MC", bg: "bg-[var(--color-pay-mc)]", text: "text-white", tracking: "tracking-wider" },
  { label: "PayPal", bg: "bg-[var(--color-pay-paypal)]", text: "text-white", tracking: "tracking-wide" },
  { label: "MoMo", bg: "bg-[var(--color-pay-momo)]", text: "text-white", tracking: "tracking-wide" },
  { label: "VNPay", bg: "bg-[var(--color-pay-vnpay)]", text: "text-white", tracking: "tracking-wide" },
  { label: "COD", bg: "bg-[var(--color-pay-cod)]", text: "text-white", tracking: "tracking-wide" },
];

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageKey, setMessageKey] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessageKey("footer.newsletter.emailRequired");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post("/newsletter/subscribe", {
        email: email,
        source: "footer",
      });
      setMessageKey("footer.newsletter.success");
      setMessageType("success");
      setEmail("");
    } catch (error) {
      setMessageKey("footer.newsletter.error");
      setMessageType("error");
      console.error("Newsletter subscription error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkClass =
    "text-sm text-slate-500 transition-colors duration-150 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400";
  const iconBtnClass =
    "flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition-all duration-150 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400";

  return (
    <footer className="relative border-t border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="relative mx-auto max-w-screen-xl px-4 py-14 sm:px-6">
        <div className="mb-12 rounded-2xl border border-indigo-100 bg-indigo-600 p-8 text-center shadow-sm sm:p-10 dark:border-indigo-900 dark:bg-indigo-900">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1">
            <span className="text-xs font-bold uppercase tracking-widest text-white">
              {t("footer.newsletter.badge", { defaultValue: "Giảm 10% — Ưu đãi độc quyền" })}
            </span>
          </div>
          <h3 className="mb-2 text-2xl font-bold tracking-tight text-white">{t("footer.newsletter.title")}</h3>
          <p className="mb-6 text-sm text-indigo-100">{t("footer.newsletter.subtitle")}</p>
          <form onSubmit={handleNewsletterSubmit} className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder={t("footer.newsletter.placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-indigo-200 focus:border-white/40 focus:ring-2 focus:ring-white/20"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 rounded-xl bg-white px-6 text-sm font-semibold text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "..." : t("footer.newsletter.subscribe")}
            </button>
          </form>
          {messageKey && (
            <p className={`mt-3 text-xs ${messageType === "success" ? "text-emerald-200" : "text-red-200"}`}>
              {t(messageKey)}
            </p>
          )}
        </div>

        <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-4">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.titleKey}>
              <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{t(col.titleKey)}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.labelKey}>
                    <Link to={link.to} className={linkClass}>
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{t("footer.address.title")}</h4>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
            <address className="flex-1 space-y-1.5 text-sm not-italic text-slate-500 dark:text-slate-400">
              <p className="flex items-start gap-2">
                <span className="mt-0.5 text-indigo-500" aria-hidden>
                  📍
                </span>
                {t("footer.address.street")}
              </p>
              <p>
                {t("footer.address.phone")}{" "}
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{t("footer.address.phoneNumber")}</span>
              </p>
              <p>
                {t("footer.address.email")}{" "}
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{t("footer.address.emailAddress")}</span>
              </p>
            </address>
            <div className="text-sm">
              <p className="mb-1.5 font-semibold text-slate-900 dark:text-slate-100">{t("footer.address.openHours")}</p>
              <ul className="space-y-0.5 text-slate-400">
                <li>{t("footer.address.mondayThursday")}</li>
                <li>{t("footer.address.friday")}</li>
                <li>{t("footer.address.saturday")}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 border-y border-slate-200 py-8 dark:border-slate-800">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t("footer.trust.title", { defaultValue: "Thanh toán & bảo mật" })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Payment methods">
            {PAYMENT_BADGES.map(({ label, bg, text, tracking }) => (
              <span
                key={label}
                className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-[10px] font-bold opacity-90 transition-opacity hover:opacity-100 ${bg} ${text} ${tracking}`}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              SSL
            </span>
            <span>{t("footer.trust.secure", { defaultValue: "Thanh toán an toàn" })}</span>
            <span>{t("footer.trust.shipping", { defaultValue: "Đối tác vận chuyển uy tín" })}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex gap-2">
            {SOCIAL_LINKS.map(({ Icon, label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={iconBtnClass} aria-label={label}>
                <Icon />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <Link to="/" className="hover:text-indigo-600">
              {t("footer.legal.privacy", { defaultValue: "Privacy" })}
            </Link>
            <span className="text-slate-200 dark:text-slate-800">|</span>
            <Link to="/" className="hover:text-indigo-600">
              {t("footer.legal.terms", { defaultValue: "Terms" })}
            </Link>
            <span className="text-slate-200 dark:text-slate-800">|</span>
            <Link to="/" className="hover:text-indigo-600">
              {t("footer.legal.cookies", { defaultValue: "Cookies" })}
            </Link>
          </div>

          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <p className="text-xs text-slate-400">{t("footer.copyright")}</p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="rounded-full border border-indigo-200 px-4 py-2 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
            >
              {t("footer.backToTop", { defaultValue: "Lên đầu trang" })}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
