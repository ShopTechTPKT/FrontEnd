import { useEffect, useState } from "react";
import { getLoyaltyBalance, getLoyaltyHistory } from "../../apis/loyaltyApi";

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
};

export default function LoyaltyHistory({ userId }) {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([getLoyaltyBalance(userId), getLoyaltyHistory(userId)])
      .then(([b, h]) => {
        setBalance(Number(b) || 0);
        setHistory(h);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <p className="text-sm text-gray-500">Đang tải lịch sử điểm...</p>;
  }

  return (
    <div>
      <div className="mb-4 rounded-xl border border-violet-100 bg-violet-50 p-4">
        <p className="text-sm text-gray-600">Điểm hiện có</p>
        <p className="text-2xl font-bold text-violet-700">{balance}</p>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-gray-500">Bạn chưa có giao dịch điểm.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Loại</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Điểm</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(item.createdAt)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={item.type === "EARN" ? "text-emerald-600" : "text-amber-600"}>
                      {item.type === "EARN" ? "Tích điểm" : "Đổi điểm"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.points}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
