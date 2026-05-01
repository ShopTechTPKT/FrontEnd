import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../custom/axios";
import { useTranslation } from "react-i18next";

/* ── SVG Icons ───────────────────────────────────────────── */
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const IconYoutube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 001.95-1.97A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
    <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);

/* ── Footer Link Columns (data-driven) ── */
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
  { label: "VISA",   bg: "bg-blue-600",   text: "text-white",  tracking: "tracking-widest" },
  { label: "MC",     bg: "bg-red-500",    text: "text-white",  tracking: "tracking-wider" },
  { label: "PayPal", bg: "bg-blue-500",   text: "text-white",  tracking: "tracking-wide" },
  { label: "MoMo",   bg: "bg-pink-600",   text: "text-white",  tracking: "tracking-wide" },
  { label: "VNPay",  bg: "bg-blue-800",   text: "text-white",  tracking: "tracking-wide" },
  { label: "COD",    bg: "bg-emerald-600",text: "text-white",  tracking: "tracking-wide" },
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

  const linkClass = "text-sm text-gray-500 hover:text-violet-700 transition-colors duration-200";
  const iconBtnClass =
    "w-9 h-9 rounded-xl flex items-center justify-center text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-100 hover:border-violet-200 transition-all duration-200";

  return (
    <footer className="bg-gray-50 text-gray-600 border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-14">

        {/* Newsletter */}
        <div className="mb-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-xs font-semibold text-violet-600 uppercase tracking-widest">Newsletter</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
            {t("footer.newsletter.title")}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {t("footer.newsletter.subtitle")}
          </p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex items-center gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder={t("footer.newsletter.placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-11 px-4 rounded-xl text-sm text-gray-900 bg-gray-50 border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder-gray-400 outline-none"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-900/30"
            >
              {isSubmitting ? "..." : t("footer.newsletter.subscribe")}
            </button>
          </form>
          {messageKey && (
            <p className={`mt-3 text-xs ${ messageType === "success" ? "text-emerald-600" : "text-red-600" }`}>
              {t(messageKey)}
            </p>
          )}
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.titleKey}>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                {t(col.titleKey)}
              </h4>
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

        {/* Contact Info */}
        <div className="mb-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            {t("footer.address.title")}
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
            <address className="not-italic text-sm space-y-1.5 flex-1">
              <p>{t("footer.address.street")}</p>
              <p>
                {t("footer.address.phone")}{" "}
                <span className="text-violet-700 font-medium">{t("footer.address.phoneNumber")}</span>
              </p>
              <p>
                {t("footer.address.email")}{" "}
                <span className="text-violet-700 font-medium">{t("footer.address.emailAddress")}</span>
              </p>
            </address>
            <div className="text-sm">
              <p className="font-semibold text-gray-900 mb-1.5">{t("footer.address.openHours")}</p>
              <ul className="space-y-0.5 text-gray-500">
                <li>{t("footer.address.mondayThursday")}</li>
                <li>{t("footer.address.friday")}</li>
                <li>{t("footer.address.saturday")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Social */}
            <div className="flex gap-2">
              {SOCIAL_LINKS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={iconBtnClass}
                  aria-label={label}
                >
                  <Icon />
                </a>
              ))}
            </div>

            {/* Payment badges */}
            <div className="flex gap-1.5 flex-wrap justify-center" aria-label="Payment methods">
              {PAYMENT_BADGES.map(({ label, bg, text, tracking }) => (
                <span
                  key={label}
                  className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[10px] font-bold ${bg} ${text} ${tracking} opacity-80 hover:opacity-100 transition-opacity`}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-xs text-gray-400">{t("footer.copyright")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
