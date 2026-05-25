import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Cpu, ShieldCheck, Truck, Headphones } from "lucide-react";
import AnimatedCounter from "../ui/AnimatedCounter";

const FEATURES = [
  { icon: Cpu, titleKey: "home.why.f1Title", descKey: "home.why.f1Desc", stat: 1200, suffix: "+" },
  { icon: ShieldCheck, titleKey: "home.why.f2Title", descKey: "home.why.f2Desc", stat: 50, suffix: "k+" },
  { icon: Truck, titleKey: "home.why.f3Title", descKey: "home.why.f3Desc", stat: 24, suffix: "/7" },
  { icon: Headphones, titleKey: "home.why.f4Title", descKey: "home.why.f4Desc", stat: 8, suffix: "+" },
];

export default function WhyChooseUs() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t("home.whyTitle", { defaultValue: "Vì sao chọn chúng tôi" })}
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {t("home.whySub", { defaultValue: "Cam kết chất lượng và trải nghiệm mua sắm tốt nhất" })}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.titleKey}
              className="motion-safe:animate-fadeInUp rounded-2xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur-md dark:border-violet-500/20 dark:bg-gray-900/70"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md">
                <Icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{t(f.titleKey, { defaultValue: "Ưu điểm" })}</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {t(f.descKey, { defaultValue: "Mô tả ngắn về dịch vụ." })}
              </p>
              <p className="mt-4 text-2xl font-bold tabular-nums text-violet-700 dark:text-violet-400">
                <AnimatedCounter value={f.stat} suffix={f.suffix} duration={1400} />
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
