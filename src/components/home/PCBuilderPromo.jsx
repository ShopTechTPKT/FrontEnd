import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import customBuild from "../../assets/images/custom_buid.webp";

export default function PCBuilderPromo() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-indigo-600 px-6 py-10 text-white shadow-sm sm:px-10 sm:py-12 dark:bg-indigo-900">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-center">
          <div className="max-w-xl flex-1 text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">
              {t("home.pcBuilderKicker", { defaultValue: "Tự ráp máy" })}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("home.pcBuilderTitle", { defaultValue: "Build Your Dream PC" })}
            </h2>
            <p className="mt-3 text-indigo-100">
              {t("home.pcBuilderSub", { defaultValue: "Chọn linh kiện, tương thích tự động, giá minh bạch." })}
            </p>
            <Link
              to="/pc-builder"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-600 shadow-sm transition-all active:scale-[0.97]"
            >
              {t("nav.pcBuilder")}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="relative flex flex-1 justify-center">
            <div className="relative w-full max-w-md motion-safe:animate-floatY">
              <img src={customBuild} alt="" className="relative z-10 mx-auto max-h-56 object-contain drop-shadow-2xl sm:max-h-72" loading="lazy" />
              <div className="absolute inset-0 -z-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
