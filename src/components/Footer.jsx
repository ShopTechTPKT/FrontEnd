import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { SiPaypal, SiVisa, SiMastercard, SiDiscover } from "react-icons/si";
import { FaCcAmex } from "react-icons/fa";

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
      // Gửi email đăng ký newsletter
      await axios.post('/api/newsletter/subscribe', {
        email: email,
        source: 'footer'
      });
      
      setMessage("Đăng ký thành công! Bạn sẽ nhận được thông tin sản phẩm mới.");
      setEmail("");
    } catch (error) {
      setMessage("Có lỗi xảy ra. Vui lòng thử lại sau.");
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-white text-gray-700 py-12 px-4 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* Newsletter Section */}
        <div className="mb-12 text-center">
          <div className="mb-6">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {t('footer.newsletter.title')}
            </h3>
            <p className="mb-6 text-gray-500">
              {t('footer.newsletter.subtitle')}
            </p>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="flex justify-center gap-4 h-12">
            <input
              type="email"
              placeholder={t('footer.newsletter.placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 w-80 rounded-xl focus:outline-none text-gray-900 bg-gray-50/60 border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder-gray-400"
              required
            />
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-violet-600 hover:bg-violet-700 px-6 py-2 rounded-xl text-white font-medium cursor-pointer transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang gửi..." : t('footer.newsletter.subscribe')}
            </button>
          </form>
          {message && (
            <p className={`mt-4 text-sm ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 text-lg">{t('footer.information.title')}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.information.aboutUs')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.information.aboutZip')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.information.privatePolicy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.information.search')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.information.terms')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.information.ordersReturns')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.information.contactUs')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.information.advancedSearch')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.information.newsletter')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 text-lg">{t('footer.pcParts.title')}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.pcParts.cpus')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.pcParts.addOnCards')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.pcParts.hardDrives')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.pcParts.graphicCards')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.pcParts.keyboardsMice')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.pcParts.casesPowerCooling')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.pcParts.ram')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.pcParts.software')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.pcParts.speakersHeadsets')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.pcParts.motherboards')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-semibold mb-4 text-lg">{t('footer.desktopPCs.title')}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.desktopPCs.cpus')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.desktopPCs.customPCs')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.desktopPCs.servers')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.desktopPCs.msiAllInOne')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.desktopPCs.hpCompaq')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.desktopPCs.asusPCs')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.desktopPCs.tecsPCs')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 text-lg">{t('footer.laptops.title')}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.laptops.everydayUse')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.laptops.msiWorkstation')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.laptops.msiPrestige')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.laptops.tabletsPads')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.laptops.netbooks')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-700 transition-colors duration-200">
                  {t('footer.laptops.infinityGaming')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact Info */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 text-lg">{t('footer.address.title')}</h4>
            <address className="not-italic">
              <p className="mb-2">
                {t('footer.address.street')}
              </p>
              <p className="mb-2">
                {t('footer.address.phone')} <span className="text-violet-700 font-semibold">{t('footer.address.phoneNumber')}</span>
              </p>
              <p className="mb-2">{t('footer.address.openHours')}</p>
              <ul
                className="list-disc list-inside mb-4"
                style={{ listStyleType: "none" }}
              >
                <li>{t('footer.address.mondayThursday')}</li>
                <li>{t('footer.address.friday')}</li>
                <li>{t('footer.address.saturday')}</li>
              </ul>
              <p>
                {t('footer.address.email')} <span className="text-violet-700 font-semibold">{t('footer.address.emailAddress')}</span>
              </p>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Social Icons */}
            <div className="flex gap-4">
              <a 
                href="#" 
                className="p-2 rounded-xl transition-colors duration-200 flex items-center justify-center text-violet-700 bg-violet-50 hover:bg-violet-100"
                aria-label={t('remaining.facebook')}
              >
                <FaFacebook />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-xl transition-colors duration-200 flex items-center justify-center text-violet-700 bg-violet-50 hover:bg-violet-100"
                aria-label={t('remaining.instagram')}
              >
                <FaInstagram />
              </a>
            </div>

            {/* Payment Icons */}
            <div className="flex gap-4 flex-wrap justify-center">
              <a 
                href="#" 
                className="p-2 rounded-xl transition-colors duration-200 flex items-center justify-center text-violet-700 bg-violet-50 hover:bg-violet-100"
                aria-label={t('remaining.paypal')}
              >
                <SiPaypal />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-xl transition-colors duration-200 flex items-center justify-center text-violet-700 bg-violet-50 hover:bg-violet-100"
                aria-label={t('remaining.visa')}
              >
                <SiVisa />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-xl transition-colors duration-200 flex items-center justify-center text-violet-700 bg-violet-50 hover:bg-violet-100"
                aria-label={t('remaining.maestro')}
              >
                <SiMastercard />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-xl transition-colors duration-200 flex items-center justify-center text-violet-700 bg-violet-50 hover:bg-violet-100"
                aria-label={t('remaining.discover')}
              >
                <SiDiscover />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-xl transition-colors duration-200 flex items-center justify-center text-violet-700 bg-violet-50 hover:bg-violet-100"
                aria-label={t('remaining.american_express')}
              >
                <FaCcAmex />
              </a>
            </div>

            {/* Copyright Text */}
            <div>
              <p className="text-gray-500 text-sm">{t('footer.copyright')}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

