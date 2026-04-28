import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { SiPaypal, SiVisa, SiMastercard, SiDiscover } from "react-icons/si";
import { FaCcAmex } from "react-icons/fa";

/* ── Footer Link Columns (data-driven) ── */
const FOOTER_COLUMNS = [
  {
    titleKey: "footer.information.title",
    links: [
      "aboutUs", "aboutZip", "privatePolicy", "search",
      "terms", "ordersReturns", "contactUs", "advancedSearch", "newsletter",
    ].map((k) => ({ labelKey: `footer.information.${k}`, href: "#" })),
  },
  {
    titleKey: "footer.pcParts.title",
    links: [
      "cpus", "addOnCards", "hardDrives", "graphicCards", "keyboardsMice",
      "casesPowerCooling", "ram", "software", "speakersHeadsets", "motherboards",
    ].map((k) => ({ labelKey: `footer.pcParts.${k}`, href: "#" })),
  },
  {
    titleKey: "footer.desktopPCs.title",
    links: [
      "cpus", "customPCs", "servers", "msiAllInOne", "hpCompaq", "asusPCs", "tecsPCs",
    ].map((k) => ({ labelKey: `footer.desktopPCs.${k}`, href: "#" })),
  },
  {
    titleKey: "footer.laptops.title",
    links: [
      "everydayUse", "msiWorkstation", "msiPrestige", "tabletsPads", "netbooks", "infinityGaming",
    ].map((k) => ({ labelKey: `footer.laptops.${k}`, href: "#" })),
  },
];

const SOCIAL_ICONS = [
  { Icon: FaFacebook, label: "Facebook" },
  { Icon: FaInstagram, label: "Instagram" },
];

const PAYMENT_ICONS = [
  { Icon: SiPaypal, label: "PayPal" },
  { Icon: SiVisa, label: "Visa" },
  { Icon: SiMastercard, label: "Mastercard" },
  { Icon: SiDiscover, label: "Discover" },
  { Icon: FaCcAmex, label: "American Express" },
];

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Vui lòng nhập email");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/newsletter/subscribe", {
        email: email,
        source: "footer",
      });
      setMessage("Đăng ký thành công! Bạn sẽ nhận được thông tin sản phẩm mới.");
      setEmail("");
    } catch (error) {
      setMessage("Có lỗi xảy ra. Vui lòng thử lại sau.");
      console.error("Newsletter subscription error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkClass = "text-sm hover:text-violet-700 transition-colors duration-200";
  const iconBtnClass =
    "p-2 rounded-lg flex items-center justify-center text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors duration-200";

  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        {/* ── Newsletter ── */}
        <div className="mb-10 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            {t("footer.newsletter.title")}
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            {t("footer.newsletter.subtitle")}
          </p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex items-center justify-center gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder={t("footer.newsletter.placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-10 px-4 rounded-lg text-sm text-gray-900 bg-gray-50 border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder-gray-400 outline-none"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 rounded-lg text-sm font-medium text-white bg-violet-700 hover:bg-violet-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "..." : t("footer.newsletter.subscribe")}
            </button>
          </form>
          {message && (
            <p
              className={`mt-3 text-xs ${
                message.includes("thành công") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        {/* ── Link Columns ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.titleKey}>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                {t(col.titleKey)}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.labelKey}>
                    <a href={link.href} className={linkClass}>
                      {t(link.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              {t("footer.address.title")}
            </h4>
            <address className="not-italic text-sm space-y-2">
              <p>{t("footer.address.street")}</p>
              <p>
                {t("footer.address.phone")}{" "}
                <span className="text-violet-700 font-medium">
                  {t("footer.address.phoneNumber")}
                </span>
              </p>
              <p className="font-medium">{t("footer.address.openHours")}</p>
              <ul className="space-y-0.5 text-gray-500">
                <li>{t("footer.address.mondayThursday")}</li>
                <li>{t("footer.address.friday")}</li>
                <li>{t("footer.address.saturday")}</li>
              </ul>
              <p>
                {t("footer.address.email")}{" "}
                <span className="text-violet-700 font-medium">
                  {t("footer.address.emailAddress")}
                </span>
              </p>
            </address>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Social */}
            <div className="flex gap-2">
              {SOCIAL_ICONS.map(({ Icon, label }) => (
                <a key={label} href="#" className={iconBtnClass} aria-label={label}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Payment */}
            <div className="flex gap-2 flex-wrap justify-center">
              {PAYMENT_ICONS.map(({ Icon, label }) => (
                <span key={label} className={iconBtnClass} aria-label={label}>
                  <Icon className="w-4 h-4" />
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
