import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import customBuild from "../../assets/images/custom_buid.webp";

export default function PCBuilderPromo() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-800 to-violet-900 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl motion-safe:animate-floatY" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-2xl motion-safe:animate-floatY delay-300" />

        <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-center">
          <div className="max-w-xl flex-1 text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-200">
              {t("home.pcBuilderKicker", { defaultValue: "Tự ráp máy" })}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("home.pcBuilderTitle", { defaultValue: "Build Your Dream PC" })}
            </h2>
            <p className="mt-3 text-violet-100/90">
              {t("home.pcBuilderSub", { defaultValue: "Chọn linh kiện, tương thích tự động, giá minh bạch." })}
            </p>
            <Link
              to="/pc-builder"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-violet-800 shadow-lg transition-transform hover:scale-[1.02]"
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
