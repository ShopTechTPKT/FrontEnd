import React from "react";

export default function ShipperInfoCard({ orderId }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm flex items-center justify-between gap-4 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            alt="Shipper Avatar"
            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500"
          />
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
        </div>
        <div>
          <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Nhân viên giao nhận
          </span>
          <h3 className="text-sm font-bold text-gray-900 mt-0.5">Nguyễn Văn Shipper</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            📞 090.123.4567
          </p>
        </div>
      </div>

      <a
        href="tel:0901234567"
        className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-1.5"
      >
        <span>Gọi điện trao đổi</span>
      </a>
    </div>
  );
}
