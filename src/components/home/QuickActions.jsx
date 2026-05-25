import React from "react";
import { useNavigate } from "react-router-dom";
import { Gift, ShieldCheck, Ticket, Trophy } from "lucide-react";
import path from "../../constant/path";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      id: "lucky-wheel",
      label: "Vòng quay",
      desc: "Quay mỗi ngày",
      icon: Gift,
      color: "from-orange-400 to-amber-500",
      path: path.luckyWheel || "/lucky-wheel"
    },
    {
      id: "pc-builder",
      label: "PC Builder",
      desc: "Tự build cấu hình",
      icon: Trophy,
      color: "from-violet-500 to-purple-600",
      path: "/pc-builder"
    },
    {
      id: "warranty",
      label: "Bảo hành",
      desc: "Kiểm tra dễ dàng",
      icon: ShieldCheck,
      color: "from-emerald-400 to-teal-500",
      path: "/warranty-lookup"
    },
    {
      id: "deals",
      label: "Ưu đãi",
      desc: "Flash Sale & Coupon",
      icon: Ticket,
      color: "from-pink-500 to-rose-500",
      path: "/deals"
    }
  ];

  return (
    <section className="mx-auto max-w-screen-xl px-4 pt-6 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-white p-3 shadow-xs border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-md dark:bg-gray-900 dark:border-gray-800 text-left"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-sm transition-transform group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">{action.label}</p>
                <p className="truncate text-[11px] text-gray-500">{action.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
