import React from "react";
import { useTranslation } from "react-i18next";

export default function BrandMarquee({ logos = [] }) {
  const { t } = useTranslation();
  if (!logos.length) return null;

  const track = [...logos, ...logos];

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {t("content.trusted_brands", { defaultValue: "Thương hiệu đối tác" })}
      </p>
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white py-7 dark:border-gray-800 dark:bg-gray-900">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-white to-transparent dark:from-gray-900" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-white to-transparent dark:from-gray-900" />
        <div
          className="marquee-track flex w-max gap-12 motion-safe:animate-[marqueeScroll_24s_linear_infinite]"
          style={{ animation: "marqueeScroll 24s linear infinite" }}
        >
          {track.map((logo, idx) => (
            <img
              key={idx}
              src={logo}
              alt=""
              className="h-8 cursor-pointer object-contain opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
