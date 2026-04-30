import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const NotFound = () => {
  const { t } = useTranslation();
  const quickLinks = [
    { to: "/", label: t("notfound.links.home") },
    { to: "/products", label: t("notfound.links.products") },
    { to: "/deals", label: t("notfound.links.deals") },
  ];

  return (
    <>
      <Header />
      <main className="pt-36 min-h-screen bg-gradient-to-b from-violet-50/40 to-white">
        <section className="max-w-5xl mx-auto px-6 py-14">
          <div className="relative overflow-hidden rounded-3xl border border-violet-100 bg-white p-8 md:p-12 shadow-sm text-center">
            <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-violet-100/60 blur-2xl" />
            <div className="absolute -bottom-16 -left-10 w-44 h-44 rounded-full bg-pink-100/50 blur-2xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-violet-100 text-violet-700 text-4xl font-black mb-4 animate-pulse">
                404
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                {t("notfound.title")}
              </h1>
              <p className="mt-2 text-sm md:text-base text-gray-500">
                {t("notfound.message")}
              </p>
              <p className="mt-4 text-gray-600 md:text-lg">
                {t("notfound.submessage")}
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-lg font-semibold text-gray-900 text-center">
              {t("notfound.popular_links")}
            </h2>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-2 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-sm font-medium hover:bg-violet-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="mt-6 text-xs text-gray-500 text-center">
              {t("notfound.help_text")}
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-violet-700 to-violet-600 hover:opacity-90 transition-opacity"
              >
                {t("notfound.go_back")}
              </button>
              <Link
                to="/"
                className="px-6 py-3 rounded-lg font-medium text-violet-700 border border-violet-200 hover:bg-violet-50 transition-colors"
              >
                {t("notfound.go_home")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;

