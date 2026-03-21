import { useTranslation } from "react-i18next";
import { useState } from "react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "jp", name: "日本語", flag: "🇯🇵" },
  ];

  const currentLanguage =
    languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = langCode => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-1.5 min-w-[108px] h-9 px-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
      >
        <span className="text-base">{currentLanguage.flag}</span>
        <span className="text-sm font-medium hidden sm:block whitespace-nowrap leading-none">
          {currentLanguage.name}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-md shadow-gray-200/40 border border-gray-200 py-1 z-[40] animate-fadeIn">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  currentLanguage.code === lang.code
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.name}</span>
                {currentLanguage.code === lang.code && (
                  <svg
                    className="w-4 h-4 ml-auto text-gray-800"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
